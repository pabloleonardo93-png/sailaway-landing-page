import { readFileSync } from 'node:fs'
import { test, expect, abrir } from '../e2e/apoio'

const dominio = 'https://sailaway.example.com/'
for (const [nome, publica, noindex] of [['local', false, false], ['preview', false, true], ['producao-sem-dominio', false, false], ['producao-com-dominio', true, false]] as const) {
  test(`Artefatos isolados: ${nome}`, async ({ page, context }) => {
    await context.setExtraHTTPHeaders({ 'X-Cenario-SEO': nome })
    await abrir(page)
    const canonical = page.locator('head link[rel="canonical"]')
    await expect(canonical).toHaveCount(publica ? 1 : 0)
    await expect(page.locator('head meta[name="robots"]')).toHaveCount(noindex ? 1 : 0)
    if (noindex) await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.locator('head meta[property="og:image"], head meta[name="twitter:image"]')).toHaveCount(publica ? 2 : 0)
    const caminhoImagem = '/images/social/sailaway-og-1200x630.jpg'
    expect(await page.evaluate(caminho => performance.getEntriesByType('resource').some(e => new URL(e.name).pathname === caminho), caminhoImagem)).toBe(false)
    const imagem = await page.request.get(caminhoImagem)
    expect(imagem.status()).toBe(200)
    expect(imagem.headers()['content-type']).toContain('image/jpeg')
    expect((await imagem.body()).equals(readFileSync('public' + caminhoImagem))).toBe(true)
    const dimensoes = await page.evaluate(async caminho => {
      const imagem = new Image()
      imagem.src = caminho
      await imagem.decode()
      return { largura: imagem.naturalWidth, altura: imagem.naturalHeight }
    }, caminhoImagem)
    expect(dimensoes).toEqual({ largura: 1200, altura: 630 })
    expect(readFileSync(`../.cache/testes-seo/cenarios/${nome}${caminhoImagem}`).equals(readFileSync('public' + caminhoImagem))).toBe(true)
    const robots = await page.request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    const texto = await robots.text()
    expect(texto).toContain('Allow: /')
    expect(texto).not.toMatch(/Disallow|noindex/i)
    const sitemap = await page.request.get('/sitemap.xml')
    if (publica) {
      const textoAlternativo = 'Logo SAILAWAY sobre o mar ao pôr do sol. Explore novos horizontes. Turismo, conexões e novas possibilidades.'
      for (const [chave, valor] of Object.entries({
        'og:image': dominio.slice(0, -1) + caminhoImagem,
        'og:image:secure_url': dominio.slice(0, -1) + caminhoImagem,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/jpeg',
        'og:image:alt': textoAlternativo,
      })) {
        const tag = page.locator(`head meta[property="${chave}"]`)
        await expect(tag).toHaveCount(1)
        await expect(tag).toHaveAttribute('content', valor)
      }
      for (const [chave, valor] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:image': dominio.slice(0, -1) + caminhoImagem, 'twitter:image:alt': textoAlternativo })) {
        const tag = page.locator(`head meta[name="${chave}"]`)
        await expect(tag).toHaveCount(1)
        await expect(tag).toHaveAttribute('content', valor)
      }
      await expect(canonical).toHaveAttribute('href', dominio)
      await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', dominio)
      expect(texto).toContain(`Sitemap: ${dominio}sitemap.xml`)
      expect(sitemap.status()).toBe(200)
      expect(sitemap.headers()['content-type']).toContain('xml')
      const xml = await sitemap.text()
      const dados = await page.evaluate(texto => {
        const doc = new DOMParser().parseFromString(texto, 'application/xml')
        return { erro: doc.querySelector('parsererror')?.textContent, urls: [...doc.querySelectorAll('loc')].map(e => e.textContent), raiz: doc.documentElement.namespaceURI }
      }, xml)
      expect(dados).toEqual({ erro: undefined, urls: [dominio], raiz: 'http://www.sitemaps.org/schemas/sitemap/0.9' })
      expect(xml).not.toMatch(/lastmod|404|pages\.dev|#/)
      const dadosJson = await page.locator('script[type="application/ld+json"]').evaluate(e => JSON.parse(e.textContent!))
      expect(dadosJson).toMatchObject({ '@type': 'WebSite', name: 'SAILAWAY', url: dominio, inLanguage: 'pt-BR' })
    } else {
      await expect(page.locator('head meta[property^="og:image"], head meta[name^="twitter:image"]')).toHaveCount(0)
      await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute('content', 'summary')
      expect(sitemap.status()).toBe(404)
      expect(texto).not.toContain('Sitemap:')
      await expect(page.locator('head meta[property="og:url"], script[type="application/ld+json"]')).toHaveCount(0)
    }
    expect(readFileSync(`../.cache/testes-seo/cenarios/${nome}/_headers`, 'utf8')).toBe(readFileSync('public/_headers', 'utf8'))
  })
}

test('404 real no servidor estático de contrato, assets válidos e homepage preservada', async ({ page }, testInfo) => {
  const caminho = '/pagina-inexistente-seo'
  testInfo.annotations.push({ type: 'recurso-indisponivel', description: caminho })
  const resposta = await page.goto(caminho)
  expect(resposta!.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('Parece que este horizonte ainda não existe.')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.locator('#root')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  const captura = testInfo.outputPath('pagina-404.png')
  await page.screenshot({ path: captura, fullPage: true })
  await testInfo.attach('Página 404', { path: captura, contentType: 'image/png' })
  const voltar = page.getByRole('link', { name: 'Voltar ao início' })
  await voltar.focus()
  await expect(voltar).toBeFocused()
  await voltar.press('Enter')
  await expect(page).toHaveURL('http://127.0.0.1:4173/')
  await expect(page.locator('#root')).toHaveAttribute('data-ssg', 'true')
  for (const caminho of ['/robots.txt', '/images/logo/sailaway-favicon.svg', '/videos/hero-sailaway-10s-1080p-web.mp4']) {
    const recurso = await page.request.head(caminho)
    expect(recurso.status(), caminho).toBe(200)
  }
  for (const caminho of ['/outra/inexistente', '/robots.txt/inexistente', '/assets/inexistente.js']) expect((await page.request.get(caminho)).status()).toBe(404)
})
