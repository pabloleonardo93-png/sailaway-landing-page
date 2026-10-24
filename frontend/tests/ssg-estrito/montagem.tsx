import { StrictMode, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from '../../src/App'
import '../../src/styles/variables.css'
import '../../src/styles/globals.css'
import '../../src/styles/animations.css'

let raiz: Root | undefined
let montagens = 0
let limpezas = 0

export function Sonda() {
  useEffect(() => { montagens++; return () => { limpezas++ } }, [])
  return <App />
}

function montar() {
  raiz = createRoot(document.getElementById('root')!)
  raiz.render(<StrictMode><Sonda /></StrictMode>)
}

Object.assign(window, {
  __controleSSG: {
    montar,
    desmontar: () => { raiz!.unmount(); raiz = undefined },
    estado: () => ({ montagens, limpezas, triggers: ScrollTrigger.getAll().map(t => t.vars.id ?? null) }),
  },
})
montar()
