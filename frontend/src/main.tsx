import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './styles/variables.css'
import './styles/globals.css'
import './styles/animations.css'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('Raiz da SAILAWAY não encontrada.')

const aplicacao = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (import.meta.env.DEV) {
  createRoot(raiz).render(aplicacao)
} else {
  if (raiz.dataset.ssg !== 'true' || !raiz.querySelector('main h1')) {
    throw new Error('HTML pré-renderizado da SAILAWAY ausente. Execute o build SSG completo.')
  }
  hydrateRoot(raiz, aplicacao, {
    onRecoverableError: erro => console.error('Falha na hidratação da SAILAWAY.', erro),
  })
}
