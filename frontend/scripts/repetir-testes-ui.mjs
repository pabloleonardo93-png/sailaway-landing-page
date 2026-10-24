import { spawn } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, writeFileSync, createWriteStream } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { freemem, totalmem, cpus } from 'node:os'

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repeticoes = Number(process.env.UI_REPETICOES ?? 5)
if (!Number.isInteger(repeticoes) || repeticoes < 1 || repeticoes > 10) throw new Error('UI_REPETICOES deve ser um inteiro entre 1 e 10.')
const pasta = resolve(frontend, '../.cache/testes-ui/repeticoes', new Date().toISOString().replace(/[:.]/g, '-'))
mkdirSync(pasta, { recursive: true })
const argumentos = process.argv.slice(2)
if (argumentos.some(a => a.startsWith('-u') || a.startsWith('-c') || /update-snapshots|--output|--reporter|--config/.test(a))) throw new Error('Não substitua referências nem os destinos de evidências neste executor.')
const rodadas = []
console.log('Evidências locais: ' + pasta)
for (let rodada = 1; rodada <= repeticoes; rodada++) {
  const destino = resolve(pasta, `rodada-${rodada}`)
  mkdirSync(destino)
  const log = createWriteStream(resolve(destino, 'execucao.txt'))
  const memoria = [{ tempo: Date.now(), livre: freemem() }]
  const amostragem = setInterval(() => memoria.push({ tempo: Date.now(), livre: freemem() }), 1000)
  const inicio = new Date().toISOString()
  console.log(`Rodada ${rodada}/${repeticoes}: ${inicio}`)
  const filho = spawn(process.execPath, ['node_modules/playwright/cli.js', 'test', '--update-snapshots=none', ...argumentos], { cwd: frontend, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] })
  for (const canal of [filho.stdout, filho.stderr]) canal.on('data', dados => { process.stdout.write(dados); log.write(dados) })
  const codigo = await new Promise((aceitar, rejeitar) => { filho.on('error', rejeitar); filho.on('close', aceitar) }).finally(() => { clearInterval(amostragem); log.end() })
  for (const nome of ['resultado.json', 'resultados', 'relatorio']) {
    const origem = resolve(frontend, '../.cache/testes-ui', nome)
    if (existsSync(origem)) cpSync(origem, resolve(destino, nome), { recursive: true })
  }
  writeFileSync(resolve(destino, 'memoria-do-sistema.json'), JSON.stringify({ total: totalmem(), amostras: memoria }))
  rodadas.push({ rodada, inicio, fim: new Date().toISOString(), codigo })
  writeFileSync(resolve(pasta, 'matriz.json'), JSON.stringify({ node: process.version, cpu: cpus()[0]?.model, argumentos, rodadas }, null, 2))
}
process.exitCode = rodadas.some(r => r.codigo !== 0) ? 1 : 0
