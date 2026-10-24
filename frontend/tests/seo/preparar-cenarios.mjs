import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { cenariosSeo } from './cenarios.mjs'

const raiz = resolve(import.meta.dirname, '../..')
const pasta = resolve(raiz, '../.cache/testes-seo')
mkdirSync(pasta, { recursive: true })
const ambiente = { ...process.env, SEO_SITE_URL: '' }
for (const chave of ['CF_PAGES', 'CF_PAGES_BRANCH', 'CF_PAGES_URL']) delete ambiente[chave]
const normal = readFileSync(resolve(raiz, 'dist/index.html'))
const resultados = []
for (const cenario of cenariosSeo) {
  const destino = resolve(pasta, 'cenarios', cenario.nome)
  const resultado = spawnSync(process.execPath, ['scripts/construir-ssg.mjs', '--outDir', destino], { cwd: raiz, env: { ...ambiente, ...cenario.ambiente }, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  writeFileSync(resolve(pasta, `build-${cenario.nome}.log`), resultado.stdout + resultado.stderr)
  resultados.push({ cenario: cenario.nome, codigo: resultado.status })
  assert.equal(resultado.status, 0, resultado.stderr)
  console.log(`Build SEO isolado ${cenario.nome}: aprovado.`)
}
const invalido = spawnSync(process.execPath, ['scripts/construir-ssg.mjs', '--outDir', resolve(pasta, 'cenarios/invalido')], { cwd: raiz, env: { ...ambiente, SEO_SITE_URL: 'http://localhost/' }, encoding: 'utf8' })
writeFileSync(resolve(pasta, 'build-invalido.log'), invalido.stdout + invalido.stderr)
assert.notEqual(invalido.status, 0)
assert.match(invalido.stderr, /SEO_SITE_URL/)
assert.ok(normal.equals(readFileSync(resolve(raiz, 'dist/index.html'))), 'Os cenários não podem alterar o dist normal.')
writeFileSync(resolve(pasta, 'builds.json'), JSON.stringify({ resultados, invalidoRejeitado: true, distNormalPreservado: true }, null, 2))
