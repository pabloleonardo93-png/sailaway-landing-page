import { test as base, expect, type Page, type Locator } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const test = base.extend<{ paginaValidada: void }>({
  paginaValidada: [async ({ page, context }, use, testInfo) => {
    const erros: string[] = []
    const redeExterna: string[] = []
    await context.route('**/*', async rota => {
      const url = new URL(rota.request().url())
      if (url.origin === 'http://127.0.0.1:4173') await rota.continue()
      else {
        redeExterna.push(url.href)
        await rota.abort('blockedbyclient')
      }
    })
    await context.addInitScript(() => {
      const aberturas: string[] = []
      const navegacoes: string[] = []
      Object.assign(window, { __mensagensTeste: aberturas, __navegacoesBloqueadas: navegacoes })
      window.open = url => { aberturas.push(String(url)); return null }
      document.addEventListener('click', evento => {
        const link = (evento.target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null
        if (link && new URL(link.href).origin !== location.origin) {
          evento.preventDefault()
          evento.stopImmediatePropagation()
          navegacoes.push(link.href)
        }
      }, true)
    })
    page.on('pageerror', erro => erros.push(erro.message))
    page.on('console', mensagem => {
      const falhaPrevista = testInfo.annotations.some(a => a.type === 'recurso-indisponivel' && mensagem.location().url.endsWith(a.description ?? ''))
        && /Failed to load resource.*404/.test(mensagem.text())
      if (mensagem.type() === 'error' && !falhaPrevista) erros.push(mensagem.text())
    })
    await use()
    await testInfo.attach('seguranca-de-rede', { body: JSON.stringify({ requisicoesExternasBloqueadas: redeExterna }), contentType: 'application/json' })
    expect(redeExterna, 'Nenhum recurso externo deve ser solicitado; a interceptação impede o envio mesmo em falha').toEqual([])
    expect(erros, 'Sem erro de execução ou hidratação').toEqual([])
  }, { auto: true }],
})

export { expect }

export async function abrir(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.hero__video')).toHaveClass(/is-ready/)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForFunction(() => document.querySelector('.hero__content')?.getAnimations().every(a => a.playState === 'finished'))
  await expect(page.locator('.experiencias')).toHaveAttribute('data-experiencias', 'sticky')
}

export async function caixa(elemento: Locator) {
  const resultado = await elemento.boundingBox()
  expect(resultado, 'Elemento precisa ter geometria visível').not.toBeNull()
  return resultado!
}

export async function rolar(page: Page, seletor: string, deslocamento = 0) {
  await page.locator(seletor).evaluate((elemento, ajuste) => window.scrollTo({ top: elemento.getBoundingClientRect().top + window.scrollY + ajuste, behavior: 'instant' }), deslocamento)
}

export async function foto(page: Page, nome: string, elemento?: Locator) {
  const opcoes = { stylePath: resolve('tests/e2e/captura.css'), caret: 'hide' as const }
  const diagnosticar = process.env.DIAGNOSTICAR_UI === '1' && nome === 'experiencias.png'
  const sessao = diagnosticar ? await page.context().newCDPSession(page) : undefined
  const camadas: unknown[] = []
  if (sessao) {
    sessao.on('LayerTree.layerTreeDidChange', estado => { camadas.splice(0, 1, estado) })
    await sessao.send('LayerTree.enable')
  }
  if (diagnosticar) await registrarRenderizacao(page, 'antes')
  try {
    if (elemento) await expect(elemento).toHaveScreenshot(nome, opcoes)
    else await expect(page).toHaveScreenshot(nome, opcoes)
  } finally {
    if (diagnosticar) {
      await registrarRenderizacao(page, 'depois')
      await test.info().attach('experiencias-sem-estilo-de-captura', { body: await page.screenshot(), contentType: 'image/png' })
      if (sessao) {
        const { root } = await sessao.send('DOM.getDocument')
        const { nodeIds } = await sessao.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.experiencia__content' })
        const nos = await Promise.all(nodeIds.map((nodeId: number) => sessao.send('DOM.describeNode', { nodeId })))
        await test.info().attach('camadas-experiencias', { body: JSON.stringify({ camadas, nos }), contentType: 'application/json' })
        await sessao.detach()
      }
    }
  }
}

async function registrarRenderizacao(page: Page, instante: string) {
  const estado = await page.evaluate(() => {
    const elementos = [...document.querySelectorAll('.experiencias, .experiencias__percurso, .experiencias__fixacao, .experiencias__stage, .experiencia, .experiencia__content, .experiencia__content > *, .experiencia__image')]
    return {
      tempo: performance.now(), scroll: { x: scrollX, y: scrollY }, fontes: { status: document.fonts.status, carregadas: [...document.fonts].map(f => ({ familia: f.family, estado: f.status })) },
      elementos: elementos.map(e => {
        const s = getComputedStyle(e)
        const imagem = e instanceof HTMLImageElement ? { completa: e.complete, largura: e.naturalWidth, altura: e.naturalHeight, origem: e.currentSrc } : undefined
        return { classe: e.className, caixa: e.getBoundingClientRect().toJSON(), estilo: e.getAttribute('style'), transform: s.transform, opacity: s.opacity, fonte: s.font, willChange: s.willChange, imagem }
      }),
      recursos: performance.getEntriesByType('resource').filter(r => /\.(woff2|webp|png|jpg)/.test(r.name)).map(r => ({ nome: r.name, inicio: r.startTime, duracao: r.duration })),
    }
  })
  await test.info().attach(`renderizacao-experiencias-${instante}`, { body: JSON.stringify(estado, null, 2), contentType: 'application/json' })
}

export async function esperarTransicoes(elemento: Locator) {
  await elemento.evaluate(async e => {
    await Promise.all(e.getAnimations({ subtree: true }).filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => undefined)))
  })
}

export async function observarHover(botao: Locator) {
  await botao.evaluate(elemento => {
    const quadros: { transform: string; cor: string; tempo: number }[] = []
    Object.assign(elemento, { __quadrosHover: quadros })
    const iniciar = (evento: Event) => {
      const transicao = evento as TransitionEvent
      if (transicao.propertyName !== 'transform' || transicao.pseudoElement !== '::before') return
      elemento.removeEventListener('transitionrun', iniciar)
      const camada = elemento.querySelector('.button__diagonal')!
      let ativo = true
      const terminar = (fim: Event) => {
        if ((fim as TransitionEvent).propertyName !== 'transform') return
        ativo = false
        elemento.removeEventListener('transitionend', terminar)
        elemento.removeEventListener('transitioncancel', terminar)
      }
      elemento.addEventListener('transitionend', terminar)
      elemento.addEventListener('transitioncancel', terminar)
      const registrar = () => {
        quadros.push({ transform: getComputedStyle(camada, '::before').transform, cor: getComputedStyle(elemento).color, tempo: performance.now() })
        if (ativo) requestAnimationFrame(registrar)
      }
      requestAnimationFrame(registrar)
    }
    elemento.addEventListener('transitionrun', iniciar)
  })
}

export async function estadoExperiencias(page: Page) {
  return page.locator('.experiencias').evaluate(secao => ({
    modo: (secao as HTMLElement).dataset.experiencias,
    fotos: [...secao.querySelectorAll('.experiencia__media')].map(e => ({ clip: getComputedStyle(e).clipPath, z: getComputedStyle(e).zIndex })),
    imagens: [...secao.querySelectorAll('.experiencia__image')].map(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).a),
    textos: [...secao.querySelectorAll('.experiencia__content')].map(e => Number(getComputedStyle(e).opacity)),
  }))
}

export async function irAoProgresso(page: Page, proporcao: number) {
  const y = await page.locator('.experiencias__percurso').evaluate((percurso, proporcao) => {
    const fixacao = document.querySelector('.experiencias__fixacao')!
    const distancia = percurso.getBoundingClientRect().height - (fixacao.getBoundingClientRect().height || innerHeight)
    return percurso.getBoundingClientRect().top + scrollY + distancia * proporcao
  }, proporcao)
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y)
}

export async function irAoPainel(page: Page, indice: number) {
  await irAoProgresso(page, [0, 0.46, 1][indice])
  await expect.poll(async () => (await estadoExperiencias(page)).textos[indice]).toBe(1)
  await expect.poll(async () => (await estadoExperiencias(page)).imagens[indice]).toBe(1.04)
  await expect.poll(async () => {
    const estado = await estadoExperiencias(page)
    return estado.textos.filter((_, i) => i !== indice).every(opacidade => opacidade === 0)
  }).toBe(true)
}

export function conferirArquivosProtegidos() {
  const contrato = JSON.parse(readFileSync(resolve('tests/e2e/contrato-protegido.json'), 'utf8')) as { arquivos: Record<string, string> }
  for (const [arquivo, esperado] of Object.entries(contrato.arquivos)) {
    const atual = createHash('sha256').update(readFileSync(resolve('..', arquivo))).digest('hex')
    expect(atual, `Arquivo protegido: ${arquivo}`).toBe(esperado)
  }
}
