import { defineConfig } from '@playwright/test'
import baseline from './playwright.config'

export default defineConfig({
  ...baseline,
  testDir: './tests/ssg-estrito',
  outputDir: '../.cache/fase-3/resultados-estrito',
  reporter: [['list'], ['json', { outputFile: '../.cache/fase-3/resultado-estrito.json' }]],
  projects: baseline.projects!.filter(p => ['390x844', '1440x900'].includes(p.name!)).map(p => ({ ...p, testIgnore: [] })),
  webServer: {
    ...baseline.webServer,
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 20_000,
  },
})
