import { defineConfig } from '@playwright/test'

const resolucoes = [[375, 812], [390, 844], [768, 1024], [1366, 768], [1440, 900], [1920, 1080]]

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  updateSnapshots: 'none',
  forbidOnly: Boolean(process.env.CI),
  timeout: 45_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { animations: 'allow', maxDiffPixelRatio: 0.001, threshold: 0.2 },
  },
  outputDir: '../.cache/testes-ui/resultados',
  snapshotPathTemplate: './tests/e2e/referencias/{platform}/{projectName}/{arg}{ext}',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../.cache/testes-ui/relatorio', open: 'never' }],
    ['json', { outputFile: '../.cache/testes-ui/resultado.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: resolucoes.map(([width, height]) => ({
    name: `${width}x${height}`,
    testIgnore: [...(width === 390 ? [] : ['**/limites.spec.ts']), ...([390, 1440].includes(width) ? [] : ['**/fontes-historico.spec.ts'])],
    use: { viewport: { width, height } },
  })),
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 20_000,
  },
})
