import { defineConfig } from '@playwright/test'
import baseline from './playwright.config'

export default defineConfig({
  ...baseline,
  testDir: './tests/ssg',
  outputDir: '../.cache/fase-3/resultados',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../.cache/fase-3/relatorio-playwright', open: 'never' }],
    ['json', { outputFile: '../.cache/fase-3/resultado-ssg.json' }],
  ],
  projects: baseline.projects!.map(projeto => ({
    ...projeto,
    testIgnore: ['390x844', '1440x900'].includes(projeto.name!) ? [] : ['**/compatibilidade.spec.ts'],
  })),
})
