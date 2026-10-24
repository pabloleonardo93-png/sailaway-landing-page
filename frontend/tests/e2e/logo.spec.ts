import { test, expect, abrir } from './apoio'

test('Logo sem perdas preserva os pixels oficiais e evita baixar o original na landing', async ({ page }, testInfo) => {
  const pedidos: string[] = []
  const registrar = (pedido: { url(): string }) => pedidos.push(pedido.url())
  page.on('request', registrar)
  await abrir(page)
  const caminho = '/images/logo/sailaway-logo-header-horizontal-lossless.png'
  const logos = page.locator('.site-header__brand img, .site-footer__brand img')
  await expect(logos).toHaveCount(2)
  for (const logo of await logos.all()) await expect(logo).toHaveAttribute('src', caminho)
  await logos.last().scrollIntoViewIfNeeded()
  await expect.poll(() => logos.last().evaluate(e => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth)).toBe(1813)
  page.off('request', registrar)
  expect(pedidos.some(url => url.endsWith(caminho))).toBe(true)
  expect(pedidos.some(url => url.endsWith('/sailaway-logo-header-horizontal.png'))).toBe(false)

  const comparacao = await page.evaluate(async otimizada => {
    const original = '/images/logo/sailaway-logo-header-horizontal.png'
    const imagens = []
    for (const url of [original, otimizada]) {
      const resposta = await fetch(url)
      if (!resposta.ok) throw new Error(`Logo indisponível: ${url}`)
      const blob = await resposta.blob()
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const contexto = canvas.getContext('2d')!
      contexto.drawImage(bitmap, 0, 0)
      imagens.push({ largura: bitmap.width, altura: bitmap.height, bytes: blob.size, pixels: contexto.getImageData(0, 0, bitmap.width, bitmap.height).data })
      bitmap.close()
    }
    const [antes, depois] = imagens
    let canaisDiferentes = 0
    for (let indice = 0; indice < antes.pixels.length; indice++) if (antes.pixels[indice] !== depois.pixels[indice]) canaisDiferentes++
    return { largura: depois.largura, altura: depois.altura, bytesAntes: antes.bytes, bytesDepois: depois.bytes, canaisDiferentes, mesmaQuantidade: antes.pixels.length === depois.pixels.length }
  }, caminho)
  expect(comparacao).toMatchObject({ largura: 1813, altura: 368, mesmaQuantidade: true, canaisDiferentes: 0 })
  expect(comparacao.bytesDepois).toBeLessThan(comparacao.bytesAntes)
  await testInfo.attach('equivalencia-logo', { body: JSON.stringify(comparacao), contentType: 'application/json' })
})
