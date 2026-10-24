import { test, expect, caixa, estadoExperiencias, irAoPainel, conferirArquivosProtegidos } from './apoio'

test.beforeAll(() => conferirArquivosProtegidos())
test.afterAll(() => conferirArquivosProtegidos())

test('Fontes tardias e retorno de âncora preservam os estados animados', async ({ page, context }) => {
  let liberar!: () => void
  const liberacao = new Promise<void>(resolve => { liberar = resolve })
  let fontesRetidas = 0
  await context.route(/\/fonts\/.*\.woff2?$/, async rota => {
    fontesRetidas++
    await liberacao
    await rota.continue()
  })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.como-funciona')).toHaveAttribute('data-timeline', page.viewportSize()!.width >= 960 ? 'horizontal' : 'vertical')
    await expect.poll(() => fontesRetidas).toBeGreaterThan(0)
    await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loading')
  } finally {
    liberar()
  }
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await irAoPainel(page, 1)
  const posicao = await page.evaluate(() => scrollY)
  const geometria = await caixa(page.locator('.experiencias__stage'))
  await page.locator('.institucional__link').evaluate(e => (e as HTMLElement).click())
  await expect(page).toHaveURL(/#captacao$/)
  await page.goBack()
  await expect(page).not.toHaveURL(/#captacao$/)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(posicao, 0)
  await expect.poll(async () => (await estadoExperiencias(page)).textos[1]).toBe(1)
  const restaurada = await caixa(page.locator('.experiencias__stage'))
  expect(restaurada.width).toBe(geometria.width)
  expect(restaurada.height).toBe(geometria.height)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
