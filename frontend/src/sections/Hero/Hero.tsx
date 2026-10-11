import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { heroVideo, planningUrl } from '../../config/site'
import './Hero.css'

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasFrame, setHasFrame] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let primeiroFrame: number | undefined
    const exibirPrimeiroFrame = () => {
      if (typeof video.requestVideoFrameCallback !== 'function') return
      if (primeiroFrame !== undefined) video.cancelVideoFrameCallback(primeiroFrame)
      primeiroFrame = video.requestVideoFrameCallback(() => {
        primeiroFrame = undefined
        setHasFrame(true)
      })
    }

    const mobile = window.matchMedia('(max-width: 59.999rem)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPlayback = () => {
      const deveReproduzir = !reducedMotion.matches && !document.hidden
      video.autoplay = deveReproduzir
      if (!deveReproduzir) {
        video.pause()
      } else if (video.paused) {
        void video.play().catch(() => {
          // Mantém o fundo de segurança se o navegador bloquear o autoplay.
        })
      }
    }

    // Carrega uma única fonte por vez, mesmo com variantes por breakpoint.
    const syncSource = () => {
      const source = mobile.matches
        ? heroVideo.mobile ?? heroVideo.default
        : heroVideo.desktop ?? heroVideo.default
      if (video.src !== new URL(source, window.location.href).href) {
        video.src = source
        video.load()
        syncPlayback()
      }
    }

    video.addEventListener('loadedmetadata', exibirPrimeiroFrame)
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) exibirPrimeiroFrame()
    syncSource()
    syncPlayback()
    video.addEventListener('loadeddata', syncPlayback)
    mobile.addEventListener('change', syncSource)
    reducedMotion.addEventListener('change', syncPlayback)
    document.addEventListener('visibilitychange', syncPlayback)

    return () => {
      video.removeEventListener('loadedmetadata', exibirPrimeiroFrame)
      if (primeiroFrame !== undefined) video.cancelVideoFrameCallback(primeiroFrame)
      video.removeEventListener('loadeddata', syncPlayback)
      mobile.removeEventListener('change', syncSource)
      reducedMotion.removeEventListener('change', syncPlayback)
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [])

  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <video
        className={`hero__video${hasFrame ? ' is-ready' : ''}`}
        ref={videoRef}
        src={heroVideo.default}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={() => setHasFrame(true)}
        onEmptied={() => setHasFrame(false)}
        onError={() => setHasFrame(false)}
      />
      <div className="hero__overlay" aria-hidden="true" />

      <div className="hero__inner container">
        <div className="hero__content">
          <h1 className="hero__title" id="hero-title">
            Explore novos horizontes
          </h1>
          <p className="hero__description">
            Quer planejar uma viagem ou conhecer melhor a SAILAWAY? Podemos ajudar você a organizar seu roteiro e explicar como funciona a participação na nossa rede de membros.
          </p>
          <Button href={planningUrl} showArrow={false}>Quero saber mais</Button>
        </div>
      </div>
    </section>
  )
}
