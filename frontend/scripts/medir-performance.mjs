import { chromium } from '@playwright/test'
import { preview, version as versaoVite } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { cpus, totalmem, freemem, release } from 'node:os'
import { resolve, relative, isAbsolute } from 'node:path'

const raiz = fileURLToPath(new URL('../', import.meta.url))
const cache = fileURLToPath(new URL('../../.cache/', import.meta.url))
function dentroDoCache(caminho) {
  const absoluto = resolve(cache, caminho)
  const relativo = relative(cache, absoluto)
  if (!relativo || relativo.startsWith('..') || isAbsolute(relativo)) throw new Error('O caminho de medição deve ficar dentro de .cache/.')
  return absoluto
}
const destino = process.env.PERFORMANCE_DESTINO ? dentroDoCache(process.env.PERFORMANCE_DESTINO) : resolve(cache, 'testes-ui/performance.json')
const dist = process.env.PERFORMANCE_DIST ? dentroDoCache(process.env.PERFORMANCE_DIST) : resolve(raiz, 'dist')
const repeticoes = Number(process.env.REPETICOES ?? 3)
if (!Number.isInteger(repeticoes) || repeticoes < 1 || repeticoes > 10) throw new Error('REPETICOES precisa estar entre 1 e 10.')
const perfis = [
  { nome: 'desktop-local', width: 1440, height: 900, cpu: 1, latencia: 0, vazao: -1, janela: 6000 },
  { nome: 'mobile-local', width: 390, height: 844, cpu: 1, latencia: 0, vazao: -1, janela: 6000 },
  { nome: 'mobile-limitado', width: 390, height: 844, cpu: 4, latencia: 150, vazao: 200000, janela: 20000 },
]
const servidor = await preview({ root: raiz, build: { outDir: dist }, logLevel: 'silent', preview: { host: '127.0.0.1', port: 4174, strictPort: true } })
let navegador
const resultados = []
const notas = 'Medições locais, sem Lighthouse ou métricas de campo. DPR 1, mobile=false, cache frio, sem interações. Janela fixa de observação após início da navegação; recursos pendentes podem continuar além dela. Bloqueio externo e observadores iguais em todos os perfis. Executar sem outros testes/carga concorrente. Valores não são metas de aprovação.'

function calcularCls(deslocamentos) {
  let inicio = 0, anterior = 0, soma = 0, maximo = 0
  for (const entrada of deslocamentos.filter(e => !e.input)) {
    if (!inicio || entrada.inicio - anterior > 1000 || entrada.inicio - inicio > 5000) {
      inicio = entrada.inicio
      soma = 0
    }
    soma += entrada.valor
    maximo = Math.max(maximo, soma)
    anterior = entrada.inicio
  }
  return maximo
}

try {
  navegador = await chromium.launch({ headless: true })
  const ambiente = { data: new Date().toISOString(), node: process.version, vite: versaoVite, navegador: navegador.version(), plataforma: process.platform, sistema: release(), cpu: cpus()[0]?.model, processadoresLogicos: cpus().length, memoriaBytes: totalmem(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: raiz, encoding: 'utf8' }).trim() }
  for (const perfil of perfis) for (let repeticao = 1; repeticao <= repeticoes; repeticao++) {
    const contexto = await navegador.newContext({ viewport: { width: perfil.width, height: perfil.height }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', deviceScaleFactor: 1, reducedMotion: 'no-preference', serviceWorkers: 'block' })
    const externas = []
    await contexto.route('**/*', async rota => {
      if (new URL(rota.request().url()).origin === 'http://127.0.0.1:4174') await rota.continue()
      else { externas.push(rota.request().url()); await rota.abort('blockedbyclient') }
    })
    await contexto.addInitScript(() => {
      window.open = () => null
      const dados = { lcp: [], deslocamentos: [], tarefas: [], erros: [], fontesProntas: null, interfaceInicialPronta: null }
      window.__baselinePerformance = dados
      const observar = (tipo, registrar) => {
        if (PerformanceObserver.supportedEntryTypes.includes(tipo)) new PerformanceObserver(lista => lista.getEntries().forEach(registrar)).observe({ type: tipo, buffered: true })
      }
      observar('largest-contentful-paint', e => dados.lcp.push({ inicio: e.startTime, tamanho: e.size, elemento: e.element?.tagName, classe: e.element?.className }))
      observar('layout-shift', e => dados.deslocamentos.push({ inicio: e.startTime, valor: e.value, input: e.hadRecentInput }))
      observar('longtask', e => dados.tarefas.push({ inicio: e.startTime, duracao: e.duration }))
      addEventListener('error', e => dados.erros.push(e.message))
      addEventListener('DOMContentLoaded', () => document.fonts.ready.then(() => { dados.fontesProntas = performance.now() }), { once: true })
      const observarInterface = () => {
        if (document.querySelector('.hero__video.is-ready') && document.querySelector('.experiencias[data-experiencias]') && document.querySelector('.faq__answer[aria-hidden]')) {
          dados.interfaceInicialPronta = performance.now()
        } else requestAnimationFrame(observarInterface)
      }
      requestAnimationFrame(observarInterface)
    })
    const pagina = await contexto.newPage()
    pagina.on('console', mensagem => { if (mensagem.type() === 'error') console.error(`[${perfil.nome}] ${mensagem.text()}`) })
    const cdp = await contexto.newCDPSession(pagina)
    await cdp.send('Network.enable')
    await cdp.send('Performance.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: perfil.cpu })
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: perfil.latencia, downloadThroughput: perfil.vazao, uploadThroughput: perfil.vazao, connectionType: perfil.vazao < 0 ? 'ethernet' : 'cellular4g' })
    const rede = new Map()
    cdp.on('Network.requestWillBeSent', e => rede.set(e.requestId, { url: e.request.url, tipo: e.type, inicio: e.timestamp, bytes: 0, completo: false }))
    cdp.on('Network.responseReceived', e => { const recurso = rede.get(e.requestId); if (recurso) recurso.status = e.response.status })
    cdp.on('Network.dataReceived', e => { const recurso = rede.get(e.requestId); if (recurso) recurso.bytes += e.encodedDataLength })
    cdp.on('Network.loadingFinished', e => { const recurso = rede.get(e.requestId); if (recurso) Object.assign(recurso, { bytes: e.encodedDataLength, fim: e.timestamp, completo: true }) })
    await pagina.goto('http://127.0.0.1:4174/', { waitUntil: 'commit' })
    await pagina.waitForTimeout(perfil.janela)
    const dados = await pagina.evaluate(() => ({
      ...window.__baselinePerformance,
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      instante: performance.now(),
      recursos: performance.getEntriesByType('resource').map(r => ({ url: r.name, tipo: r.initiatorType, inicio: r.startTime, duracao: r.duration, transferencia: r.transferSize, tamanhoCodificado: r.encodedBodySize })),
      videos: [...document.querySelectorAll('video')].map(v => ({ classe: v.className, src: v.getAttribute('src'), pronto: v.readyState, pausado: v.paused, tempo: v.currentTime })),
    }))
    if (externas.length) throw new Error(`Recursos externos bloqueados: ${externas.join(', ')}`)
    const metricasCdp = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
    const linha = { perfil, repeticao, memoriaLivreBytes: freemem(), metricasCdp, ...dados, lcpFinalDaJanela: dados.lcp.at(-1)?.inicio ?? null, cls: calcularCls(dados.deslocamentos), excessoTarefasAposFcp: dados.tarefas.filter(t => t.inicio >= (dados.fcp ?? 0)).reduce((s, t) => s + Math.max(0, t.duracao - 50), 0), rede: [...rede.values()].map(recurso => ({ ...recurso })), externas }
    resultados.push(linha)
    await mkdir(resolve(destino, '..'), { recursive: true })
    await writeFile(destino, JSON.stringify({ ambiente, notas, resultados }, null, 2))
    console.log(JSON.stringify({ perfil: perfil.nome, repeticao, fcp: linha.fcp, lcp: linha.lcpFinalDaJanela, cls: linha.cls, excessoTarefas: linha.excessoTarefasAposFcp, bytesObservados: linha.rede.reduce((s, r) => s + r.bytes, 0) }))
    await contexto.close()
  }
} finally {
  await navegador?.close()
  await new Promise(resolve => servidor.httpServer.close(resolve))
}
