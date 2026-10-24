import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { obterConfiguracaoSeo, inserirHeadSeo } from './scripts/seo.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const raiz = fileURLToPath(new URL('.', import.meta.url))
  const seo = obterConfiguracaoSeo({ ...loadEnv(mode, raiz, 'SEO_'), ...process.env })
  return {
    plugins: [react(), {
      name: 'sailaway-seo',
      transformIndexHtml: (html, contexto) => resolve(contexto.filename) === resolve(raiz, 'index.html') ? inserirHeadSeo(html, seo) : html,
    }],
    define: {
      'import.meta.env.VITE_ANO_PUBLICACAO': JSON.stringify(String(new Date().getUTCFullYear())),
    },
  }
})
