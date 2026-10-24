import { build, loadEnv } from 'vite'
import { readFile, writeFile, lstat } from 'node:fs/promises'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { parseArgs } from 'node:util'
import { obterConfiguracaoSeo, escreverArtefatosSeo } from './seo.ts'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values } = parseArgs({ options: { outDir: { type: 'string' } } })
const destino = resolve(raiz, values.outDir ?? 'dist')
if (values.outDir !== undefined) {
  assert.ok(values.outDir.trim(), 'O outDir de teste não pode estar vazio.')
  const caminho = relative(resolve(raiz, '../.cache/testes-seo/cenarios'), destino)
  assert.ok(/^[a-z0-9-]+$/.test(caminho), 'O outDir de teste deve ser um cenário dentro de .cache/testes-seo/cenarios/.')
  for (let atual = destino; atual !== resolve(raiz, '..'); atual = dirname(atual)) {
    const info = await lstat(atual).catch(erro => { if (erro.code === 'ENOENT') return undefined; throw erro })
    assert.ok(!info?.isSymbolicLink(), 'O outDir de teste não pode atravessar links simbólicos ou junctions.')
  }
}
const seo = obterConfiguracaoSeo({ ...loadEnv('production', raiz, 'SEO_'), ...process.env })
const ano = String(new Date().getUTCFullYear())
const define = { 'import.meta.env.VITE_ANO_PUBLICACAO': JSON.stringify(ano) }
await build({ root: raiz, define, build: { outDir: destino, emptyOutDir: true } })
const destinoNode = resolve(raiz, 'node_modules/.cache/sailaway-ssg')
await build({
  root: raiz,
  define,
  publicDir: false,
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: destinoNode,
    emptyOutDir: true,
    rolldownOptions: { output: { entryFileNames: 'entry-server.mjs' } },
  },
})

const { renderizar } = await import(pathToFileURL(resolve(destinoNode, 'entry-server.mjs')).href)
const html = renderizar()
assert.equal(typeof html, 'string', 'O renderer SSG precisa retornar HTML.')
assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'O HTML precisa conter exatamente um H1.')
for (const id of ['conteudo', 'inicio', 'sobre', 'experiencias', 'como-funciona', 'captacao', 'faq']) {
  assert.ok(html.includes(`id="${id}"`), `Conteúdo público ausente: ${id}.`)
}
assert.equal((html.match(/class="institucional__benefit"/g) ?? []).length, 4, 'Os quatro benefícios precisam estar no HTML.')
assert.equal((html.match(/class="faq__answer"/g) ?? []).length, 6, 'As respostas do FAQ precisam estar no HTML.')
assert.ok(!html.includes('<!--$!-->'), 'O SSG não pode publicar fallback de Suspense.')
assert.ok(html.replace(/<!--[\s\S]*?-->/g, '').includes(`© ${ano}`), 'O ano do HTML precisa coincidir com o bundle de hidratação.')

const arquivo = resolve(destino, 'index.html')
const modelo = await readFile(arquivo, 'utf8')
const marcador = '<div id="root"><!--app-html--></div>'
assert.equal(modelo.split(marcador).length, 2, 'O template deve conter exatamente um ponto de inserção SSG.')
const pagina = modelo.replace(marcador, () => `<div id="root" data-ssg="true">${html}</div>`)
await writeFile(arquivo, pagina)
await escreverArtefatosSeo(destino, seo)
console.log(`SSG: ${Buffer.byteLength(html)} bytes de conteúdo React; HTML final ${Buffer.byteLength(pagina)} bytes; ano ${ano}.`)
console.log(`SEO: ambiente ${seo.ambiente}; canonical e sitemap ${seo.ambiente === 'producao' && seo.siteUrl ? 'configurados' : 'não ativados'}.`)
