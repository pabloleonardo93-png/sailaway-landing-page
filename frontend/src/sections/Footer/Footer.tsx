import { useEffect, useRef } from 'react'
import { avisoAtuacao, contato } from '../../config/site'
import './Footer.css'

const anoAtual = import.meta.env.VITE_ANO_PUBLICACAO

const explore = [
  { label: 'Experiências', href: '#experiencias' },
] as const

const sailaway = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'FAQ', href: '#faq' },
] as const

export function Footer() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sincronizarReproducao = () => {
      video.autoplay = !movimentoReduzido.matches
      if (movimentoReduzido.matches) {
        video.pause()
      } else {
        void video.play().catch(() => undefined)
      }
    }

    sincronizarReproducao()
    video.addEventListener('loadeddata', sincronizarReproducao)
    movimentoReduzido.addEventListener('change', sincronizarReproducao)
    return () => {
      video.removeEventListener('loadeddata', sincronizarReproducao)
      movimentoReduzido.removeEventListener('change', sincronizarReproducao)
    }
  }, [])

  const canais = [
    { label: 'Instagram', href: contato.instagram?.trim(), externo: true },
    { label: 'WhatsApp', href: contato.whatsapp?.trim(), externo: true },
    { label: 'E-mail', href: contato.email?.trim() ? 'mailto:' + contato.email.trim() : undefined, externo: false },
  ].filter(({ href }) => Boolean(href))
  const aviso = avisoAtuacao?.trim()

  return (
    <footer className="site-footer">
      <div className="site-footer__body">
        <video
          className="site-footer__video"
          ref={videoRef}
          src={`${import.meta.env.BASE_URL}videos/footer-mar-web.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="site-footer__overlay" aria-hidden="true" />

        <div className="site-footer__inner">
          <div className="site-footer__columns">
            <div className="site-footer__brand-column">
              <a className="site-footer__brand" href="#inicio" aria-label="SAILAWAY, início">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo/sailaway-logo-header-horizontal-lossless.png`}
                  width="1813"
                  height="368"
                  alt="SAILAWAY"
                  loading="lazy"
                />
              </a>
              <p className="site-footer__tagline">Viagens começam muito antes do embarque.</p>
            </div>

            <nav className="site-footer__navigation" aria-labelledby="footer-explore">
              <h2 className="site-footer__heading" id="footer-explore">Explore</h2>
              <ul className="site-footer__links">
                {explore.map(({ label, href }) => (
                  <li key={href}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </nav>

            <nav className="site-footer__navigation" aria-labelledby="footer-sailaway">
              <h2 className="site-footer__heading" id="footer-sailaway">SAILAWAY</h2>
              <ul className="site-footer__links">
                {sailaway.map(({ label, href }) => (
                  <li key={href}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </nav>

            <div className={'site-footer__contact' + (!canais.length ? ' site-footer__contact--pending' : '')}>
              <h2 className="site-footer__heading">Contato</h2>
              {canais.length > 0 && (
                <ul className="site-footer__links">
                  {canais.map(({ label, href, externo }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={externo ? '_blank' : undefined}
                        rel={externo ? 'noopener noreferrer' : undefined}
                        aria-label={label === 'Instagram'
                          ? 'Instagram da SAILAWAY: @sailaway.tur (abre em nova aba)'
                          : label === 'WhatsApp'
                            ? 'Conversar com a SAILAWAY pelo WhatsApp (abre em nova aba)'
                            : undefined}
                      >
                        {label === 'Instagram' && (
                          <svg
                            className="site-footer__contact-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                          </svg>
                        )}
                        {label === 'WhatsApp' && (
                          <img
                            className="site-footer__contact-icon"
                            src={import.meta.env.BASE_URL + 'images/icons/whatsapp.svg'}
                            width="24"
                            height="24"
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <span className="site-footer__contact-text">{label === 'Instagram' ? '@sailaway.tur' : label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="site-footer__bottom">
            {aviso && <p className="site-footer__notice">{aviso}</p>}
            <p className="site-footer__copyright">© {anoAtual} SAILAWAY</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
