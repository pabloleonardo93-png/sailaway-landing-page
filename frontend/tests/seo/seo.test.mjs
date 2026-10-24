import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { obterConfiguracaoSeo, gerarHeadSeo, gerarRobots, gerarSitemap, inserirHeadSeo } from '../../scripts/seo.ts'
import { dominioTeste as dominio, ambienteCloudflareTeste as cloudflare } from './cenarios.mjs'

test('Local sem domínio mantém metadados independentes e não fabrica URLs', () => {
  const config = obterConfiguracaoSeo({})
  const head = gerarHeadSeo(config)
  assert.equal(config.ambiente, 'local')
  assert.match(head, /og:title/)
  assert.match(head, /twitter:card/)
  assert.doesNotMatch(head, /canonical|og:url|og:image|twitter:image|application\/ld\+json|noindex/)
  assert.equal(gerarSitemap(config), undefined)
  assert.equal(gerarRobots(config), 'User-agent: *\nAllow: /\n')
})

test('Produção sem domínio não bloqueia indexação nem anuncia sitemap', () => {
  const config = obterConfiguracaoSeo(cloudflare)
  assert.equal(config.ambiente, 'producao')
  assert.doesNotMatch(gerarHeadSeo(config), /noindex|canonical|og:url|og:image|twitter:image/)
  assert.equal(gerarSitemap(config), undefined)
  assert.doesNotMatch(gerarRobots(config), /Sitemap|Disallow/)
})

test('Produção com domínio gera canonical, OG, WebSite e sitemap coerentes', () => {
  const config = obterConfiguracaoSeo({ ...cloudflare, SEO_SITE_URL: dominio })
  const head = gerarHeadSeo(config)
  assert.equal((head.match(/rel="canonical"/g) ?? []).length, 1)
  assert.ok(head.includes(`href="${dominio}"`))
  assert.ok(head.includes(`property="og:url" content="${dominio}"`))
  const dados = JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])
  assert.deepEqual(dados, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'SAILAWAY', url: dominio, inLanguage: 'pt-BR' })
  assert.ok(gerarSitemap(config).includes(`<loc>${dominio}</loc>`))
  assert.ok(gerarRobots(config).includes(`Sitemap: ${dominio}sitemap.xml`))
  assert.doesNotMatch(gerarSitemap(config), /lastmod|404|#|pages\.dev/)
})

test('Preview usa a branch e mantém noindex mesmo com domínio de produção herdado', () => {
  const config = obterConfiguracaoSeo({ ...cloudflare, CF_PAGES_BRANCH: 'develop', SEO_SITE_URL: dominio })
  assert.equal(config.ambiente, 'preview')
  assert.match(gerarHeadSeo(config), /name="robots" content="noindex"/)
  assert.doesNotMatch(gerarHeadSeo(config), /canonical|og:url|og:image|twitter:image|application\/ld\+json|pages\.dev|example\.com/)
  assert.equal(gerarSitemap(config), undefined)
  assert.doesNotMatch(gerarRobots(config), /Sitemap|Disallow/)
})

test('Branch desconhecida é Preview; URL do deploy nunca escolhe canonical ou produção', () => {
  const config = obterConfiguracaoSeo({ ...cloudflare, CF_PAGES_BRANCH: 'feature/seo', CF_PAGES_URL: 'https://sailaway.pages.dev/' })
  assert.equal(config.ambiente, 'preview')
  assert.equal(config.siteUrl, undefined)
  assert.equal(gerarSitemap(config), undefined)
})

test('Local com domínio explícito não é promovido silenciosamente a produção', () => {
  const config = obterConfiguracaoSeo({ SEO_SITE_URL: dominio })
  assert.equal(config.ambiente, 'local')
  assert.doesNotMatch(gerarHeadSeo(config), /canonical|og:url|og:image|twitter:image|application\/ld\+json/)
})

for (const valor of ['http://sailaway.example.com', 'https://localhost/', 'https://127.0.0.1/', 'https://[::1]/', 'https://2130706433/', 'https://sailaway.local/', 'https://dominio/', 'https://sailaway.pages.dev/', 'https://develop.sailaway.pages.dev/', 'https://hash.sailaway.pages.dev/', 'https://site.workers.dev/', 'https://site.vercel.app/', 'https://site.netlify.app/', 'https://sailaway.example.com/?utm_source=teste', 'https://sailaway.example.com/#sobre', 'https://sailaway.example.com/subpagina', 'https://usuario:senha@sailaway.example.com/', 'https://sailaway.example.com:8443/', ' https://sailaway.example.com/', 'https://sailaway.example.com/\n', 'https://sailaway.example.com/\\outro', 'https://sailaway.example.com/%2e', 'https://foo_bar.com/', 'javascript:alert(1)', 'https://sailaway.example.com./']) {
  test(`Domínio rejeitado: ${JSON.stringify(valor)}`, () => assert.throws(() => obterConfiguracaoSeo({ ...cloudflare, SEO_SITE_URL: valor })))
}

for (const variaveis of [{ CF_PAGES: '0' }, { CF_PAGES: 'true' }, { CF_PAGES: '1' }, { CF_PAGES_BRANCH: 'main' }, { ...cloudflare, CF_PAGES_BRANCH: '' }, { ...cloudflare, CF_PAGES_URL: 'http://site.pages.dev' }]) {
  test(`Ambiente incompleto ou inválido rejeitado: ${JSON.stringify(variaveis)}`, () => assert.throws(() => obterConfiguracaoSeo(variaveis)))
}

test('Normalização mantém HTTPS e uma barra final, sem campanhas', () => {
  const config = obterConfiguracaoSeo({ ...cloudflare, SEO_SITE_URL: 'https://SAILAWAY.EXAMPLE.COM' })
  assert.equal(config.siteUrl, dominio)
})

test('Template precisa de um marcador e rejeita metadados duplicados', () => {
  const config = obterConfiguracaoSeo({})
  assert.throws(() => inserirHeadSeo('<head></head>', config))
  assert.throws(() => inserirHeadSeo('<!--seo-head--><!--seo-head-->', config))
  for (const tag of ['<title>duplicado</title>', '<meta name="description" content="duplicada">', '<link rel="canonical" href="https://sailaway.example.com">', '<meta property="og:title" content="duplicado">']) assert.throws(() => inserirHeadSeo(`<head>${tag}<!--seo-head--></head>`, config))
  assert.equal((inserirHeadSeo('<head><!--seo-head--></head>', config).match(/<title>/g) ?? []).length, 1)
})

test('Imagem só é anunciada com origem pública e caminho local validado', () => {
  const config = obterConfiguracaoSeo({ ...cloudflare, SEO_SITE_URL: dominio })
  const head = gerarHeadSeo(config)
  const imagemUrl = `${dominio}images/social/sailaway-og-1200x630.jpg`
  const tags = [...head.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map(([, chave, valor]) => [chave, valor])
  const esperadas = {
    'og:image': imagemUrl,
    'og:image:secure_url': imagemUrl,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/jpeg',
    'og:image:alt': 'Logo SAILAWAY sobre o mar ao pôr do sol. Explore novos horizontes. Turismo, conexões e novas possibilidades.',
    'twitter:card': 'summary_large_image',
    'twitter:image': imagemUrl,
    'twitter:image:alt': 'Logo SAILAWAY sobre o mar ao pôr do sol. Explore novos horizontes. Turismo, conexões e novas possibilidades.',
  }
  for (const [chave, valor] of Object.entries(esperadas)) assert.deepEqual(tags.filter(([nome]) => nome === chave), [[chave, valor]])
  assert.doesNotMatch(gerarHeadSeo({ ...config, ambiente: 'preview' }), /og:image|twitter:image|summary_large_image/)
  assert.throws(() => gerarHeadSeo({ ...config, imagem: { ...config.imagem, caminho: 'https://externo.example.com/foto.jpg' } }))
})

test('O único asset social configurado corresponde ao JPEG aprovado, sem cópia do original em public', () => {
  const { imagem } = obterConfiguracaoSeo({})
  assert.deepEqual({ caminho: imagem.caminho, largura: imagem.largura, altura: imagem.altura, tipo: imagem.tipo }, { caminho: '/images/social/sailaway-og-1200x630.jpg', largura: 1200, altura: 630, tipo: 'image/jpeg' })
  const bytes = readFileSync(new URL('../../public' + imagem.caminho, import.meta.url))
  assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff')
  assert.equal(bytes.length, 235315)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '19173ee1c387d22a825b7259f9a7cc83fe48d8bdbf3b47b29b3e3e68a6cd2713')
  assert.deepEqual(readdirSync(new URL('../../public/images/social/', import.meta.url)), ['sailaway-og-1200x630.jpg'])
})

test('Configuração sem imagem mantém o fallback social sem tags de imagem', () => {
  const config = { ...obterConfiguracaoSeo({ ...cloudflare, SEO_SITE_URL: dominio }), imagem: null }
  const head = gerarHeadSeo(config)
  assert.match(head, /name="twitter:card" content="summary"/)
  assert.doesNotMatch(head, /og:image|twitter:image|summary_large_image/)
})
