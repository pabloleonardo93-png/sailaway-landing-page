import { useEffect, useRef, useState } from 'react'
import './WorldConnections.css'

const videoGlobo = '/videos/sailaway-globo-web.mp4'
const posterGlobo = '/images/sailaway-globo-poster.webp'

export function WorldConnections() {
  const cenaRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reproduzindo, setReproduzindo] = useState(false)

  useEffect(() => {
    const cena = cenaRef.current
    const video = videoRef.current
    if (!cena || !video || typeof IntersectionObserver === 'undefined') return

    const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)')
    let proximo = false
    let visivel = false

    function sincronizar() {
      const executar = visivel && !movimentoReduzido.matches && !document.hidden
      video!.autoplay = executar

      if (movimentoReduzido.matches) {
        video!.pause()
        if (video!.hasAttribute('src')) {
          video!.removeAttribute('src')
          video!.load()
        }
        return
      }

      if (proximo && !video!.hasAttribute('src')) {
        video!.src = videoGlobo
        video!.load()
      }

      if (executar && video!.hasAttribute('src')) {
        void video!.play().catch(() => {})
      } else {
        video!.pause()
      }
    }

    const observarProximidade = new IntersectionObserver(([entrada]) => {
      proximo = entrada.isIntersecting
      sincronizar()
    }, { rootMargin: '240px 0px', threshold: 0 })

    const observarVisibilidade = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting && entrada.intersectionRatio > 0
      sincronizar()
    }, { threshold: 0 })

    sincronizar()
    observarProximidade.observe(cena)
    observarVisibilidade.observe(cena)
    movimentoReduzido.addEventListener('change', sincronizar)
    document.addEventListener('visibilitychange', sincronizar)
    video.addEventListener('loadeddata', sincronizar)

    return () => {
      observarProximidade.disconnect()
      observarVisibilidade.disconnect()
      movimentoReduzido.removeEventListener('change', sincronizar)
      document.removeEventListener('visibilitychange', sincronizar)
      video.removeEventListener('loadeddata', sincronizar)
      video.pause()
    }
  }, [])

  return (
    <div className="world-connections">
      <div
        className="world-connections__scene"
        ref={cenaRef}
        role="img"
        aria-label="Globo com conexões douradas entre pessoas e destinos."
      >
        <img className="world-connections__poster" src={posterGlobo} alt="" loading="lazy" decoding="async" width="1280" height="720" />
        <video
          className={`world-connections__video${reproduzindo ? ' is-ready' : ''}`}
          ref={videoRef}
          poster={posterGlobo}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setReproduzindo(true)}
          onEmptied={() => setReproduzindo(false)}
          onError={() => setReproduzindo(false)}
        />
      </div>
    </div>
  )
}
