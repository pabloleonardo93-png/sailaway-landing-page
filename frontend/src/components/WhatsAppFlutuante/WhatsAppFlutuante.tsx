import { useEffect, useRef, useState } from 'react'
import { whatsappOficial } from '../../config/site'
import './WhatsAppFlutuante.css'

type WhatsAppFlutuanteProps = {
  areasProtegidas?: string
}

export function WhatsAppFlutuante({ areasProtegidas }: WhatsAppFlutuanteProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [recolhido, setRecolhido] = useState(false)

  useEffect(() => {
    const link = linkRef.current
    if (!link || !areasProtegidas || typeof IntersectionObserver === 'undefined') return

    const areas = document.querySelectorAll(areasProtegidas)
    const sobreposicoes = new Map<Element, boolean>()
    let observador: IntersectionObserver | undefined

    const atualizarVisibilidade = () => {
      setRecolhido(document.activeElement !== link && [...sobreposicoes.values()].some(Boolean))
    }

    const atualizarArea = () => {
      observador?.disconnect()
      sobreposicoes.clear()
      const { top, right, bottom, left } = link.getBoundingClientRect()
      const { clientWidth, clientHeight } = document.documentElement

      observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          sobreposicoes.set(entrada.target, entrada.isIntersecting &&
            entrada.intersectionRect.width > 0 && entrada.intersectionRect.height > 0)
        })
        atualizarVisibilidade()
      }, {
        rootMargin: [top, clientWidth - right, clientHeight - bottom, left]
          .map((distancia) => -distancia + 'px').join(' '),
      })
      areas.forEach((area) => observador?.observe(area))
    }

    atualizarArea()
    window.addEventListener('resize', atualizarArea)
    window.visualViewport?.addEventListener('resize', atualizarArea)
    link.addEventListener('blur', atualizarVisibilidade)

    return () => {
      observador?.disconnect()
      window.removeEventListener('resize', atualizarArea)
      window.visualViewport?.removeEventListener('resize', atualizarArea)
      link.removeEventListener('blur', atualizarVisibilidade)
    }
  }, [areasProtegidas])

  return (
    <a
      ref={linkRef}
      className={'whatsapp-flutuante' + (recolhido ? ' whatsapp-flutuante--recolhido' : '')}
      href={whatsappOficial.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com a SAILAWAY pelo WhatsApp"
    >
      <span
        className="whatsapp-flutuante__icone"
        style={{ maskImage: 'url("' + import.meta.env.BASE_URL + 'images/icons/whatsapp.svg")' }}
        aria-hidden="true"
      />
    </a>
  )
}
