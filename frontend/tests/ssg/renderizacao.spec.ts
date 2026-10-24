import { readFileSync } from 'node:fs'
import { test, expect, conferirArquivosProtegidos } from '../e2e/apoio'

test.beforeAll(() => conferirArquivosProtegidos())
test.afterAll(() => conferirArquivosProtegidos())

test.describe('Conteúdo estático', () => {
  test.use({ javaScriptEnabled: false })

  test('HTML bruto e conteúdo público legível sem JavaScript', async ({ page }, testInfo) => {
    const resposta = await page.goto('/')
    expect(resposta!.status()).toBe(200)
    const html = await resposta!.text()
    expect(html).toBe(readFileSync('dist/index.html', 'utf8'))
    expect(html).toContain('data-ssg="true"')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('SEU PRÓXIMOHORIZONTECOMEÇA AQUI.')
    await expect(page.locator('h2')).toHaveCount(8)
    await expect(page.locator('.institucional__benefit')).toHaveCount(4)
    await expect(page.locator('.faq__answer')).toHaveCount(6)
    for (const seletor of ['.hero__description', '.institucional__description', '.institucional__benefit-description', '.experiencia__content', '.como-funciona__content', '.captacao__intro', '.faq__answer p', '.site-footer__copyright']) {
      const elementos = page.locator(seletor)
      expect(await elementos.count(), seletor).toBeGreaterThan(0)
      for (const elemento of await elementos.all()) {
        await expect(elemento).toBeVisible()
        await expect(elemento).toHaveCSS('opacity', '1')
        expect((await elemento.innerText()).trim(), seletor).not.toBe('')
        const caixa = await elemento.boundingBox()
        expect(caixa!.width).toBeGreaterThan(0)
        expect(caixa!.height).toBeGreaterThan(0)
      }
    }
    await expect(page.locator('.faq__answer[aria-hidden="true"]')).toHaveCount(0)
    for (const resposta of await page.locator('.faq__answer').all()) {
      await expect(resposta).toHaveCSS('opacity', '1')
      expect((await resposta.boundingBox())!.height).toBeGreaterThan(0)
    }
    await expect(page.locator('form')).toHaveCount(1)
    await expect(page.locator('.hero .button')).toHaveAttribute('href', '#captacao')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const captura = testInfo.outputPath('sem-javascript.png')
    await page.screenshot({ path: captura, fullPage: true })
    await testInfo.attach('sem-javascript', { path: captura, contentType: 'image/png' })
    await testInfo.attach('html-inicial', { body: html, contentType: 'text/html' })
  })
})

test('JavaScript atrasado hidrata os mesmos nós e preserva a geometria inicial', async ({ page, context }, testInfo) => {
  let liberar!: () => void
  const liberacao = new Promise<void>(resolve => { liberar = resolve })
  let scriptsRetidos = 0
  await context.route(/http:\/\/127\.0\.0\.1:4173\/assets\/.*\.js$/, async rota => {
    scriptsRetidos++
    await liberacao
    await rota.continue()
  })
  let geometriaAntes: unknown
  try {
    await page.goto('/', { waitUntil: 'commit' })
    await expect(page.locator('#root main h1')).toBeVisible()
    await expect.poll(() => scriptsRetidos).toBeGreaterThan(0)
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    await page.waitForFunction(() => document.querySelector('.hero__content')?.getAnimations().every(a => a.playState === 'finished'))
    geometriaAntes = await page.evaluate(() => {
      const seletores = ['#root', 'main', 'h1', 'form', '.experiencias', '.como-funciona']
      Object.assign(window, { __nosAntes: seletores.map(s => document.querySelector(s)) })
      const h1 = document.querySelector('h1')!
      return { h1: h1.getBoundingClientRect().toJSON(), alturaHero: document.querySelector('.hero')!.getBoundingClientRect().height }
    })
    const captura = testInfo.outputPath('antes-da-hidratacao.png')
    await page.screenshot({ path: captura })
    await testInfo.attach('antes-da-hidratacao', { path: captura, contentType: 'image/png' })
  } finally {
    liberar()
  }
  await expect(page.locator('.experiencias')).toHaveAttribute('data-experiencias', 'sticky')
  await expect(page.locator('.como-funciona')).toHaveAttribute('data-timeline', page.viewportSize()!.width >= 960 ? 'horizontal' : 'vertical')
  await expect(page.locator('.hero__video')).toHaveClass(/is-ready/)
  await expect(page.locator('.faq__answer[aria-hidden]')).toHaveCount(6)
  const depois = await page.evaluate(() => {
    const anteriores = (window as unknown as { __nosAntes: Element[] }).__nosAntes
    const seletores = ['#root', 'main', 'h1', 'form', '.experiencias', '.como-funciona']
    return {
      mesmosNos: seletores.map((s, i) => document.querySelector(s) === anteriores[i]),
      h1: document.querySelector('h1')!.getBoundingClientRect().toJSON(),
      alturaHero: document.querySelector('.hero')!.getBoundingClientRect().height,
    }
  })
  expect(depois.mesmosNos).toEqual([true, true, true, true, true, true])
  expect({ h1: depois.h1, alturaHero: depois.alturaHero }).toEqual(geometriaAntes)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('.experiencia')).toHaveCount(3)
  await expect(page.locator('.como-funciona__step')).toHaveCount(3)
  const captura = testInfo.outputPath('apos-hidratacao.png')
  await page.screenshot({ path: captura })
  await testInfo.attach('apos-hidratacao', { path: captura, contentType: 'image/png' })
  await page.locator('#faq-pergunta-2').click()
  await expect(page.locator('#faq-pergunta-2')).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#faq-resposta-2')).toHaveAttribute('aria-hidden', 'false')
  await testInfo.attach('identidade-e-geometria', { body: JSON.stringify({ antes: geometriaAntes, depois }), contentType: 'application/json' })
})
