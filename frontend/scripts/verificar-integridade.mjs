import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const frontend = resolve(import.meta.dirname, '..')
const raiz = resolve(frontend, '..')
const referencias = resolve(frontend, 'tests/e2e/referencias')
const contrato = JSON.parse(readFileSync(resolve(frontend, 'tests/e2e/contrato-protegido.json'), 'utf8'))
const manifesto = JSON.parse(readFileSync(resolve(referencias, 'manifesto.json'), 'utf8'))
const hash = caminho => createHash('sha256').update(readFileSync(caminho)).digest('hex')

for (const [caminho, esperado] of Object.entries(contrato.arquivos)) {
  assert.equal(hash(resolve(raiz, caminho)), esperado, `Recurso protegido alterado: ${caminho}`)
  if (caminho.startsWith('frontend/public/')) {
    const publicado = resolve(frontend, 'dist', caminho.slice('frontend/public/'.length))
    assert.equal(hash(publicado), esperado, `Cópia de build alterada: ${caminho}`)
  }
}

const listarPng = (pasta, prefixo = '') => readdirSync(pasta, { withFileTypes: true }).flatMap(entrada => {
  const nome = prefixo + entrada.name
  return entrada.isDirectory() ? listarPng(resolve(pasta, entrada.name), `${nome}/`) : nome.endsWith('.png') ? [nome] : []
})
const arquivos = Object.keys(manifesto.arquivos).sort()
assert.equal(arquivos.length, 30, 'A baseline aprovada contém exatamente 30 referências.')
assert.deepEqual(listarPng(referencias).sort(), arquivos, 'Referências ausentes ou extras; não gere substitutas automaticamente.')
for (const caminho of arquivos) {
  assert.equal(hash(resolve(referencias, caminho)), manifesto.arquivos[caminho], `Referência visual alterada: ${caminho}`)
}

console.log(`${Object.keys(contrato.arquivos).length} recursos protegidos, suas cópias públicas no build e 30 referências visuais íntegros.`)
