import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function renderizar() {
  return renderToString(<StrictMode><App /></StrictMode>)
}
