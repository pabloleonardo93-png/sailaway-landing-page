import { test, expect, abrir, irAoPainel, estadoExperiencias } from '../e2e/apoio'

test('Âncora inicial, fontes tardias e retorno do histórico após hidratação', async ({ page, context }) => {
  let liberar!: () => void
  const liberacao = new Promise<void>(resolve => { liberar = resolve })
  let retidas = 0
  await context.route(/\/fonts\/.*\.woff2?$/, async rota => {
    retidas++
    await liberacao
    await rota.continue()
  })
  try {
    await page.goto('/#como-funciona', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.como-funciona')).toHaveAttribute('data-timeline', page.viewportSize()!.width >= 960 ? 'horizontal' : 'vertical')
    await expect.poll(() => retidas).toBeGreaterThan(0)
  } finally { liberar() }
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await expect.poll(() => page.locator('#como-funciona').evaluate(e => {
    const caixa = e.getBoundingClientRect()
    return caixa.top < innerHeight && caixa.bottom > 0
  })).toBe(true)
  await abrir(page)
  await irAoPainel(page, 1)
  const posicao = await page.evaluate(() => scrollY)
  await page.locator('.institucional__link').evaluate(e => (e as HTMLElement).click())
  await expect(page).toHaveURL(/#captacao$/)
  await page.goBack()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(posicao, 0)
  await expect.poll(async () => (await estadoExperiencias(page)).textos[1]).toBe(1)
})

test('Movimento reduzido, ano determinístico e resize após hidratação', async ({ page }) => {
  const anoHtml = await page.request.get('/').then(r => r.text()).then(html => html.match(/©\s*(?:<!--[\s\S]*?-->)*\s*(\d{4})/)?.[1])
  expect(anoHtml).toBeTruthy()
  await page.clock.setFixedTime(new Date(Date.UTC(Number(anoHtml) + 1, 0, 1, 12)))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await expect(page.locator('#root')).toHaveAttribute('data-ssg', 'true')
  await expect(page.locator('.site-footer__copyright')).toContainText(anoHtml!)
  await expect(page.locator('.experiencias')).not.toHaveAttribute('data-experiencias', 'sticky')
  expect(await page.locator('.hero .button .button__diagonal').evaluate(e => getComputedStyle(e, '::before').transitionDuration)).toBe('0s')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await abrir(page)
  const original = page.viewportSize()!
  await page.setViewportSize(original.width >= 960 ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  await expect(page.locator('.como-funciona')).toHaveAttribute('data-timeline', original.width >= 960 ? 'vertical' : 'horizontal')
  await page.setViewportSize(original)
  await expect(page.locator('.como-funciona')).toHaveAttribute('data-timeline', original.width >= 960 ? 'horizontal' : 'vertical')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
