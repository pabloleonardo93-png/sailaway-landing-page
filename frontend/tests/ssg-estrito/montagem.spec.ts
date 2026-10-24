import { test, expect, abrir, irAoPainel } from '../e2e/apoio'

type Controle = { montar: () => void; desmontar: () => void; estado: () => { montagens: number; limpezas: number; triggers: (string | null)[] } }

test('StrictMode repete os efeitos, limpa e remonta sem duplicar ScrollTrigger', async ({ page }, testInfo) => {
  await abrir(page)
  await expect(page.locator('#root')).not.toHaveAttribute('data-ssg', 'true')
  await page.goto('/tests/ssg-estrito/index.html')
  const sessao = await page.context().newCDPSession(page)
  const { result } = await sessao.send('Runtime.evaluate', { expression: 'window' })
  const listeners = async () => {
    const { listeners } = await sessao.send('DOMDebugger.getEventListeners', { objectId: result.objectId! })
    return listeners.filter(l => ['scroll', 'resize'].includes(l.type)).map(l => `${l.type}:${l.scriptId}:${l.lineNumber}:${l.columnNumber}:${l.useCapture}`).sort()
  }
  const estado = () => page.evaluate(() => (window as unknown as { __controleSSG: Controle }).__controleSSG.estado())
  await expect.poll(async () => (await estado()).montagens).toBe(2)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await expect(page.locator('.experiencias')).toHaveAttribute('data-experiencias', 'sticky')
  await expect.poll(async () => (await estado()).triggers).toEqual(['experiencias-sailaway'])
  expect((await estado()).limpezas).toBe(1)
  await irAoPainel(page, 1)
  const listenersAntes = await listeners()
  await page.evaluate(() => (window as unknown as { __controleSSG: Controle }).__controleSSG.desmontar())
  await expect(page.locator('main')).toHaveCount(0)
  expect(await estado()).toEqual({ montagens: 2, limpezas: 2, triggers: [] })
  const listenersDesmontados = await listeners()
  expect(listenersDesmontados.length).toBeLessThan(listenersAntes.length)
  await page.evaluate(() => { scrollTo(0, 0); (window as unknown as { __controleSSG: Controle }).__controleSSG.montar() })
  await expect.poll(async () => (await estado()).montagens).toBe(4)
  await expect(page.locator('.experiencias')).toHaveAttribute('data-experiencias', 'sticky')
  await expect.poll(async () => (await estado()).triggers).toEqual(['experiencias-sailaway'])
  expect((await estado()).limpezas).toBe(3)
  await irAoPainel(page, 2)
  await irAoPainel(page, 0)
  const listenersRemontados = await listeners()
  expect(listenersRemontados).toEqual(listenersAntes)
  await testInfo.attach('listeners-de-scroll-e-resize', { body: JSON.stringify({ listenersAntes, listenersDesmontados, listenersRemontados }), contentType: 'application/json' })
  const original = page.viewportSize()!
  await page.setViewportSize(original.width >= 960 ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  await expect(page.locator('.como-funciona')).toHaveAttribute('data-timeline', original.width >= 960 ? 'vertical' : 'horizontal')
  await expect.poll(async () => (await estado()).triggers).toEqual(['experiencias-sailaway'])
  await sessao.detach()
})
