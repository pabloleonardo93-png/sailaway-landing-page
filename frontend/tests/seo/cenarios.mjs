export const dominioTeste = 'https://sailaway.example.com/'
export const ambienteCloudflareTeste = { CF_PAGES: '1', CF_PAGES_BRANCH: 'main', CF_PAGES_URL: 'https://build.sailaway.pages.dev/' }
export const cenariosSeo = [
  { nome: 'local', ambiente: {}, publica: false, noindex: false },
  { nome: 'preview', ambiente: { ...ambienteCloudflareTeste, CF_PAGES_BRANCH: 'develop', SEO_SITE_URL: dominioTeste }, publica: false, noindex: true },
  { nome: 'producao-sem-dominio', ambiente: ambienteCloudflareTeste, publica: false, noindex: false },
  { nome: 'producao-com-dominio', ambiente: { ...ambienteCloudflareTeste, SEO_SITE_URL: dominioTeste }, publica: true, noindex: false },
]
