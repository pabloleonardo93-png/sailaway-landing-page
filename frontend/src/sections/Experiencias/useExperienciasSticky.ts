import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useExperienciasSticky() {
  const secaoRef = useRef<HTMLElement>(null)
  const percursoRef = useRef<HTMLDivElement>(null)
  const fixacaoRef = useRef<HTMLDivElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const secao = secaoRef.current
    const percurso = percursoRef.current
    const fixacao = fixacaoRef.current
    const palco = palcoRef.current
    if (!secao || !percurso || !fixacao || !palco) return

    const responsividade = gsap.matchMedia()

    responsividade.add(
      {
        desktop: '(min-width: 48rem)',
        mobile: '(max-width: 47.999rem)',
        movimentoReduzido: '(prefers-reduced-motion: reduce)',
      },
      (contexto) => {
        if (contexto.conditions?.movimentoReduzido) return

        const mobile = Boolean(contexto.conditions?.mobile)
        const fotografias = Array.from(secao.querySelectorAll<HTMLElement>('.experiencia__media'))
        const imagens = Array.from(secao.querySelectorAll<HTMLImageElement>('.experiencia__image'))
        const textos = Array.from(secao.querySelectorAll<HTMLElement>('.experiencia__content'))
        let ativo = true
        let quadro = 0
        let medidasAnteriores = ''
        let animacao: gsap.Context | undefined

        const limparLayout = () => {
          delete secao.dataset.experiencias
          secao.style.removeProperty('--experiencias-altura-texto')
          secao.style.removeProperty('--experiencias-altura-palco')
        }

        const configurar = () => {
          if (!ativo) return
          secao.dataset.experiencias = 'sticky'
          if (mobile) secao.style.removeProperty('--experiencias-altura-palco')

          const alturaDisponivel = mobile ? fixacao.clientHeight : palco.clientHeight
          const alturaTexto = Math.ceil(Math.max(...textos.map((texto) =>
            mobile ? Math.max(texto.scrollHeight, texto.getBoundingClientRect().height) : texto.scrollHeight,
          )))
          const alturaFoto = mobile ? fotografias[0].getBoundingClientRect().height : 0
          const etapa = palco.querySelector<HTMLElement>('.experiencia')
          if (!etapa) return
          const estiloEtapa = getComputedStyle(etapa)
          const margens = parseFloat(estiloEtapa.top) + parseFloat(estiloEtapa.bottom)
          const intervalo = mobile ? parseFloat(estiloEtapa.rowGap) : 0
          const alturaNecessaria = Math.ceil(alturaTexto + margens + (mobile ? alturaFoto + intervalo : 0))
          const cabeNoPalco = alturaNecessaria <= alturaDisponivel
          const medidas = [palco.clientWidth, alturaDisponivel, alturaTexto, alturaFoto, cabeNoPalco].join(':')

          if (mobile && cabeNoPalco) {
            secao.style.setProperty('--experiencias-altura-palco', alturaNecessaria + 'px')
          }

          if (medidas === medidasAnteriores) {
            if (!cabeNoPalco) limparLayout()
            ScrollTrigger.getById('experiencias-sailaway')?.refresh()
            return
          }
          medidasAnteriores = medidas
          animacao?.revert()
          animacao = undefined

          if (!cabeNoPalco) {
            limparLayout()
            ScrollTrigger.refresh()
            return
          }

          if (mobile) secao.style.setProperty('--experiencias-altura-texto', alturaTexto + 'px')

          animacao = gsap.context(() => {
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
                end: mobile ? () => '+=' + (percurso.offsetHeight - fixacao.offsetHeight) : 'bottom bottom',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            })

            const permanencias = mobile ? [1, 1.1, 0.9] : [0.7, 0.9, 0.7]
            const duracaoTransicao = mobile ? 1.5 : 1.8
            sequencia.to({}, { duration: permanencias[0] })
            fotografias.slice(0, -1).forEach((fotografia, indice) => {
              const inicio = sequencia.duration()
              sequencia
                .to(fotografia, {
                  clipPath: 'inset(0% 0% 100% 0%)',
                  duration: duracaoTransicao,
                  ease: 'none',
                }, inicio)
                .to(imagens[indice], {
                  scale: 1,
                  duration: duracaoTransicao,
                  ease: 'none',
                }, inicio)
                .to(imagens[indice + 1], {
                  scale: 1.04,
                  duration: duracaoTransicao,
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
          }, secao)
          ScrollTrigger.refresh()
        }

        const atualizar = () => {
          if (!ativo) return
          cancelAnimationFrame(quadro)
          quadro = requestAnimationFrame(configurar)
        }
        configurar()
        window.addEventListener('resize', atualizar)
        imagens.forEach((imagem) => imagem.addEventListener('load', atualizar))
        void document.fonts.ready.then(atualizar)

        return () => {
          ativo = false
          cancelAnimationFrame(quadro)
          window.removeEventListener('resize', atualizar)
          imagens.forEach((imagem) => imagem.removeEventListener('load', atualizar))
          animacao?.revert()
          limparLayout()
        }
      },
      secao,
    )

    return () => responsividade.revert()
  }, [])

  return { secaoRef, percursoRef, fixacaoRef, palcoRef }
}
