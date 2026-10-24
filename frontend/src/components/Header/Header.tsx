import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { navigation, planningUrl } from '../../config/site'
import './Header.css'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const desktop = window.matchMedia('(min-width: 60rem)')
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false) }
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    desktop.addEventListener('change', closeOnDesktop)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      desktop.removeEventListener('change', closeOnDesktop)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [isOpen])

  const planningButton = (
    <Button href={planningUrl} showArrow={false} onClick={() => setIsOpen(false)}>
      Fale conosco
    </Button>
  )

  return (
    <header
      className="site-header"
      ref={headerRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          setIsOpen(false)
          menuButtonRef.current?.focus()
        }
      }}
    >
      <div className="site-header__inner">
        <a className="site-header__brand" href="#inicio" aria-label="SAILAWAY, início">
          <img
            src={`${import.meta.env.BASE_URL}images/logo/sailaway-logo-header-horizontal-lossless.png`}
            width="1813"
            height="368"
            alt="SAILAWAY"
            fetchPriority="high"
          />
        </a>

        <button
          className="menu-toggle"
          type="button"
          ref={menuButtonRef}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          aria-controls="navegacao-principal"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="menu-toggle__label">Menu</span>
          <span className={`menu-toggle__icon${isOpen ? ' is-open' : ''}`} aria-hidden="true">
            <span /><span />
          </span>
        </button>

        <nav
          id="navegacao-principal"
          className={`site-nav${isOpen ? ' is-open' : ''}`}
          aria-label="Navegação principal"
        >
          <ul className="site-nav__links">
            {navigation.map(({ label, href }) => (
              <li key={href}>
                <a href={href} onClick={() => {
                  setIsOpen(false)
                  if (window.matchMedia('(max-width: 59.999rem)').matches) {
                    menuButtonRef.current?.focus()
                  }
                }}>{label}</a>
              </li>
            ))}
          </ul>
          <div className="header-planning--mobile">{planningButton}</div>
        </nav>
      </div>
      <div className="header-actions">
        {planningButton}
      </div>
    </header>
  )
}
