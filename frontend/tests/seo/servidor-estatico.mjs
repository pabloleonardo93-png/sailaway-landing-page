import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat, readFile } from 'node:fs/promises'
import { resolve, relative, isAbsolute, extname } from 'node:path'
import { cenariosSeo } from './cenarios.mjs'

const raiz = resolve(import.meta.dirname, '../..')
const tipos = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' }
const servidor = createServer(async (pedido, resposta) => {
  try {
    const nome = pedido.headers['x-cenario-seo']
    if (nome && !cenariosSeo.some(c => c.nome === nome)) { resposta.writeHead(400).end(); return }
    const pasta = nome ? resolve(raiz, '../.cache/testes-seo/cenarios', nome) : resolve(raiz, 'dist')
    const caminho = decodeURIComponent(new URL(pedido.url, 'http://127.0.0.1:4173').pathname)
    const arquivo = resolve(pasta, caminho === '/' ? 'index.html' : '.' + caminho)
    const dentro = relative(pasta, arquivo)
    const proibido = dentro.startsWith('..') || isAbsolute(dentro) || /(?:^|[/\\])_(?:headers|redirects)$/.test(dentro)
    const existe = !proibido && await stat(arquivo).then(e => e.isFile(), () => false)
    if (!existe) {
      const corpo = await readFile(resolve(pasta, '404.html'))
      resposta.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': corpo.length })
      resposta.end(pedido.method === 'HEAD' ? undefined : corpo)
      return
    }
    const dados = await stat(arquivo)
    resposta.writeHead(200, { 'Content-Type': tipos[extname(arquivo)] ?? 'application/octet-stream', 'Content-Length': dados.size })
    if (pedido.method === 'HEAD') resposta.end()
    else createReadStream(arquivo).pipe(resposta)
  } catch (erro) {
    console.error('Erro no servidor estático exclusivo dos testes SEO.', erro)
    resposta.writeHead(500).end()
  }
})
servidor.listen(4173, '127.0.0.1')
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => servidor.close(() => process.exit(0)))
