import { useEffect, useRef } from 'react'

export function useScrollExperiencias(quantidade: number) {
  const percursoRef = useRef<HTMLDivElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const percurso = percursoRef.current
    const palco = palcoRef.current
    if (!percurso || !palco) return

    const condicao = window.matchMedia('(min-width: 75rem) and (prefers-reduced-motion: no-preference)')
    let quadro: number | undefined
    let ultimoProgresso = ''

    function atualizar() {
      quadro = undefined
      if (!percurso || !palco) return

      const limite = percurso.getBoundingClientRect()
      const distancia = limite.height - palco.clientHeight
      if (distancia <= 0) return

      const progresso = Math.min(quantidade - 1, Math.max(0, -limite.top / distancia * quantidade - 0.5))
      const valor = progresso.toFixed(4)
      if (valor === ultimoProgresso) return

      palco.style.setProperty('--experience-progress', valor)
      ultimoProgresso = valor
    }

    function agendar() {
      if (condicao.matches && quadro === undefined) {
        quadro = window.requestAnimationFrame(atualizar)
      }
    }

    function desconectar() {
      window.removeEventListener('scroll', agendar)
      window.removeEventListener('resize', agendar)
      if (quadro !== undefined) window.cancelAnimationFrame(quadro)
      quadro = undefined
    }

    function adaptar() {
      desconectar()
      ultimoProgresso = ''
      palco?.style.removeProperty('--experience-progress')

      if (condicao.matches) {
        window.addEventListener('scroll', agendar, { passive: true })
        window.addEventListener('resize', agendar)
        agendar()
      }
    }

    const observador = new ResizeObserver(agendar)
    observador.observe(percurso)
    observador.observe(palco)
    condicao.addEventListener('change', adaptar)
    adaptar()

    return () => {
      desconectar()
      observador.disconnect()
      condicao.removeEventListener('change', adaptar)
      palco.style.removeProperty('--experience-progress')
    }
  }, [quantidade])

  return { percursoRef, palcoRef }
}
