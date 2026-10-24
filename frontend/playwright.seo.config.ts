import { defineConfig } from '@playwright/test'
import baseline from './playwright.config'

export default defineConfig({
  ...baseline,
  testDir: './tests/seo',
  outputDir: '../.cache/testes-seo/resultados',
  reporter: [['list'], ['html', { outputFolder: '../.cache/testes-seo/relatorio', open: 'never' }], ['json', { outputFile: '../.cache/testes-seo/resultado.json' }]],
  projects: baseline.projects!.map(p => ({ ...p, testIgnore: ['390x844', '1440x900'].includes(p.name!) ? [] : ['**/cenarios.spec.ts'] })),
  webServer: {
    command: 'node tests/seo/servidor-estatico.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 20_000,
  },
})
