import assert from 'node:assert/strict'
import { isIP } from 'node:net'
import { writeFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'

type ImagemSocial = { caminho: string; descricao: string; largura: number; altura: number; tipo: 'image/png' | 'image/jpeg' | 'image/webp' }
export type ConfiguracaoSeo = { ambiente: 'local' | 'preview' | 'producao'; siteUrl?: string; imagem: ImagemSocial | null }

export const dadosSeo: { nome: string; titulo: string; descricao: string; imagem: ImagemSocial | null } = {
  nome: 'SAILAWAY',
  titulo: 'SAILAWAY | Planejamento de viagens e rede de membros',
  descricao: 'Conheça a SAILAWAY, tire suas dúvidas sobre planejamento de viagens e saiba como funciona nossa proposta de participação como membro.',
  imagem: {
    caminho: '/images/social/sailaway-og-1200x630.jpg',
    descricao: 'Logo SAILAWAY sobre o mar ao pôr do sol. Explore novos horizontes. Turismo, conexões e novas possibilidades.',
    largura: 1200,
    altura: 630,
    tipo: 'image/jpeg',
  },
}

const temControle = (valor: string) => [...valor].some(caractere => caractere.charCodeAt(0) < 32 || caractere.charCodeAt(0) === 127)

function lerHttps(valor: string, campo: string) {
  assert.ok(!temControle(valor) && !/[\s\\%?#]/u.test(valor), `${campo}: informe uma URL HTTPS sem espaços, escapes, parâmetros ou fragmentos.`)
  let url: URL
  try { url = new URL(valor) } catch { throw new Error(`${campo}: URL inválida.`) }
  assert.ok(url.protocol === 'https:' && !url.username && !url.password && !url.port && url.pathname === '/', `${campo}: use somente a origem HTTPS, sem credenciais, porta ou subcaminho.`)
  const host = url.hostname
  assert.ok(!isIP(host.replace(/^\[|\]$/g, '')) && host.includes('.') && !host.endsWith('.') && !/(^|\.)(localhost|local|internal|invalid|test|example)$/.test(host), `${campo}: é necessário um domínio público.`)
  assert.ok(host.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)), `${campo}: domínio inválido.`)
  return url
}

export function obterConfiguracaoSeo(variaveis: Record<string, string | undefined> = process.env): ConfiguracaoSeo {
  const { CF_PAGES: pages, CF_PAGES_BRANCH: branch, CF_PAGES_URL: deploy, SEO_SITE_URL: dominio } = variaveis
  let ambiente: ConfiguracaoSeo['ambiente'] = 'local'
  if (pages !== undefined || branch !== undefined || deploy !== undefined) {
    assert.equal(pages, '1', 'Ambiente Cloudflare inconsistente: CF_PAGES deve ser 1.')
    assert.ok(branch && branch.trim() === branch && !temControle(branch), 'CF_PAGES_BRANCH ausente ou inválida.')
    assert.ok(deploy, 'CF_PAGES_URL ausente no ambiente Cloudflare.')
    lerHttps(deploy, 'CF_PAGES_URL')
    ambiente = branch === 'main' ? 'producao' : 'preview'
  }
  let siteUrl: string | undefined
  if (dominio !== undefined && dominio !== '') {
    const url = lerHttps(dominio, 'SEO_SITE_URL')
    assert.ok(!/(^|\.)(pages\.dev|workers\.dev|vercel\.app|netlify\.app)$/.test(url.hostname), 'SEO_SITE_URL: não use domínio de hospedagem temporário ou Preview; aguarde o domínio próprio aprovado.')
    siteUrl = url.href
  }
  return { ambiente, siteUrl, imagem: dadosSeo.imagem }
}

export function urlPublica(configuracao: ConfiguracaoSeo) {
  return configuracao.ambiente === 'producao' ? configuracao.siteUrl : undefined
}

const escapar = (valor: string) => valor.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

function validarImagem(imagem: ImagemSocial) {
  assert.ok(/^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/.test(imagem.caminho), 'Imagem social deve ser um asset local aprovado em /images/.')
  assert.ok(imagem.descricao.trim() && Number.isInteger(imagem.largura) && imagem.largura > 0 && Number.isInteger(imagem.altura) && imagem.altura > 0, 'Imagem social precisa de descrição e dimensões reais.')
  assert.ok(['image/png', 'image/jpeg', 'image/webp'].includes(imagem.tipo), 'Formato de imagem social inválido.')
}

export function gerarHeadSeo(configuracao: ConfiguracaoSeo) {
  const tags: string[] = [`<title>${escapar(dadosSeo.titulo)}</title>`]
  const meta = (atributo: 'name' | 'property', chave: string, valor: string) => tags.push(`<meta ${atributo}="${chave}" content="${escapar(valor)}" />`)
  meta('name', 'description', dadosSeo.descricao)
  meta('property', 'og:title', dadosSeo.titulo)
  meta('property', 'og:description', dadosSeo.descricao)
  meta('property', 'og:type', 'website')
  meta('property', 'og:locale', 'pt_BR')
  meta('property', 'og:site_name', dadosSeo.nome)
  if (configuracao.ambiente === 'preview') meta('name', 'robots', 'noindex')
  const publica = urlPublica(configuracao)
  const imagem = configuracao.imagem
  if (imagem) validarImagem(imagem)
  meta('name', 'twitter:card', publica && imagem ? 'summary_large_image' : 'summary')
  meta('name', 'twitter:title', dadosSeo.titulo)
  meta('name', 'twitter:description', dadosSeo.descricao)
  if (publica) {
    tags.push(`<link rel="canonical" href="${escapar(publica)}" />`)
    meta('property', 'og:url', publica)
    if (imagem) {
      const origem = new URL(imagem.caminho, publica).href
      meta('property', 'og:image', origem)
      meta('property', 'og:image:secure_url', origem)
      meta('property', 'og:image:alt', imagem.descricao)
      meta('property', 'og:image:width', String(imagem.largura))
      meta('property', 'og:image:height', String(imagem.altura))
      meta('property', 'og:image:type', imagem.tipo)
      meta('name', 'twitter:image', origem)
      meta('name', 'twitter:image:alt', imagem.descricao)
    }
    const dados = { '@context': 'https://schema.org', '@type': 'WebSite', name: dadosSeo.nome, url: publica, inLanguage: 'pt-BR' }
    tags.push(`<script type="application/ld+json">${JSON.stringify(dados).replaceAll('<', '\\u003c')}</script>`)
  }
  return tags.join('\n    ')
}

export function inserirHeadSeo(html: string, configuracao: ConfiguracaoSeo) {
  const marcador = '<!--seo-head-->'
  assert.equal(html.split(marcador).length, 2, 'O template precisa de exatamente um marcador SEO.')
  assert.ok(!/<title\b|<link\b[^>]*rel=["']canonical["']|<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["']/i.test(html), 'Metadados SEO duplicados no template.')
  return html.replace(marcador, () => gerarHeadSeo(configuracao))
}

export function gerarRobots(configuracao: ConfiguracaoSeo) {
  const publica = urlPublica(configuracao)
  return 'User-agent: *\nAllow: /\n' + (publica ? `\nSitemap: ${new URL('sitemap.xml', publica).href}\n` : '')
}

export function gerarSitemap(configuracao: ConfiguracaoSeo) {
  const publica = urlPublica(configuracao)
  if (!publica) return undefined
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapar(publica)}</loc></url></urlset>\n`
}

export async function escreverArtefatosSeo(destino: string, configuracao: ConfiguracaoSeo) {
  if (configuracao.imagem) {
    validarImagem(configuracao.imagem)
    await access(resolve(destino, '.' + configuracao.imagem.caminho))
  }
  await writeFile(resolve(destino, 'robots.txt'), gerarRobots(configuracao))
  const sitemap = gerarSitemap(configuracao)
  if (sitemap) await writeFile(resolve(destino, 'sitemap.xml'), sitemap)
  await access(resolve(destino, '404.html'))
}
