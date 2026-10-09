import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useExperienciasSticky() {
  const secaoRef = useRef<HTMLElement>(null)
  const percursoRef = useRef<HTMLDivElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const secao = secaoRef.current
    const percurso = percursoRef.current
    const palco = palcoRef.current
    if (!secao || !percurso || !palco) return

    const responsividade = gsap.matchMedia()

    responsividade.add(
      '(min-width: 48rem) and (prefers-reduced-motion: no-preference)',
      () => {
        const fotografias = Array.from(secao.querySelectorAll<HTMLElement>('.experiencia__media'))
        const imagens = Array.from(secao.querySelectorAll<HTMLImageElement>('.experiencia__image'))
        const textos = Array.from(secao.querySelectorAll<HTMLElement>('.experiencia__content'))
        let ativo = true
        secao.dataset.experiencias = 'sticky'

        fotografias.forEach((fotografia, indice) => {
          gsap.set(fotografia, {
            zIndex: fotografias.length - indice,
            clipPath: 'inset(0% 0% 0% 0%)',
          })
        })
        imagens.forEach((imagem, indice) => {
          gsap.set(imagem, {
            scale: indice === 0 ? 1.04 : 1.1,
            transformOrigin: 'center center',
          })
        })
        textos.forEach((texto, indice) => {
          gsap.set(texto, {
            opacity: indice === 0 ? 1 : 0,
            yPercent: indice === 0 ? 0 : 2,
            zIndex: textos.length - indice,
          })
        })

        const sequencia = gsap.timeline({
          scrollTrigger: {
            id: 'experiencias-sailaway',
            trigger: percurso,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })

        const permanencias = [0.7, 0.9, 0.7]
        sequencia.to({}, { duration: permanencias[0] })
        fotografias.slice(0, -1).forEach((fotografia, indice) => {
          const inicio = sequencia.duration()
          sequencia
            .to(fotografia, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: 1.8,
              ease: 'none',
            }, inicio)
            .to(imagens[indice], {
              scale: 1,
              duration: 1.8,
              ease: 'none',
            }, inicio)
            .to(imagens[indice + 1], {
              scale: 1.04,
              duration: 1.8,
              ease: 'none',
            }, inicio)
            .to(textos[indice], {
              opacity: 0,
              yPercent: -2,
              duration: 0.55,
              ease: 'power2.inOut',
            }, inicio)
            .to(textos[indice + 1], {
              opacity: 1,
              yPercent: 0,
              duration: 0.75,
              ease: 'power2.inOut',
            }, inicio + 0.6)
            .to({}, { duration: permanencias[indice + 1] })
        })

        const atualizar = () => {
          if (ativo) sequencia.scrollTrigger?.refresh()
        }
        imagens.forEach((imagem) => imagem.addEventListener('load', atualizar))
        void document.fonts.ready.then(atualizar)

        return () => {
          ativo = false
          imagens.forEach((imagem) => imagem.removeEventListener('load', atualizar))
          delete secao.dataset.experiencias
        }
      },
      secao,
    )

    return () => responsividade.revert()
  }, [])

  return { secaoRef, percursoRef, palcoRef }
}
