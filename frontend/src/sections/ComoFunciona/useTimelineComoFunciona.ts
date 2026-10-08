import { useLayoutEffect, useRef } from 'react'

const limitar = (valor: number) => Math.max(0, Math.min(1, valor))
const suavizar = (valor: number) => valor * valor * (3 - 2 * valor)

export function useTimelineComoFunciona() {
  const secaoRef = useRef<HTMLElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)
  const janelaRef = useRef<HTMLDivElement>(null)
  const trilhoRef = useRef<HTMLDivElement>(null)
  const indicadorRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const secao = secaoRef.current
    const palco = palcoRef.current
    const janela = janelaRef.current
    const trilho = trilhoRef.current
    const indicador = indicadorRef.current
    if (!secao || !palco || !janela || !trilho) return

    const etapas = Array.from(trilho.querySelectorAll<HTMLElement>('.como-funciona__step'))
    const conteudos = Array.from(trilho.querySelectorAll<HTMLElement>('.como-funciona__content'))
    const marcadores = Array.from(trilho.querySelectorAll<HTMLElement>('.como-funciona__number'))
    const fotografias = Array.from(trilho.querySelectorAll<HTMLImageElement>('.como-funciona__photo'))
    const desktop = window.matchMedia('(min-width: 60rem)')
    const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)')
    let limparModo = () => {}
    let montado = true
    let atualizarFontes = () => {}

    const restaurar = () => {
      delete secao.dataset.timeline
      secao.style.removeProperty('--timeline-distance')
      secao.style.removeProperty('--timeline-window-width')
      secao.style.removeProperty('--timeline-content-height')
      secao.style.removeProperty('--timeline-stage-height')
      trilho.style.removeProperty('--timeline-x')
      trilho.style.removeProperty('--timeline-progress')
      if (indicador) indicador.textContent = '01'
      etapas.forEach((etapa) => {
        delete etapa.dataset.revelada
        etapa.style.removeProperty('--etapa-progresso')
        etapa.style.removeProperty('--etapa-foco')
        etapa.style.removeProperty('--etapa-line-progress')
      })
    }

    const configurar = () => {
      limparModo()
      restaurar()
      atualizarFontes = () => {}
      if (movimentoReduzido.matches) return

      if (!desktop.matches) {
        if (!('IntersectionObserver' in window)) return
        const revelar = (etapa: HTMLElement) => {
          etapa.dataset.revelada = 'true'
          const indice = etapas.indexOf(etapa)
          if (indice > 0) etapas[indice - 1].style.setProperty('--etapa-line-progress', '1')
        }
        const observador = new IntersectionObserver((entradas) => {
          entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
              const etapa = entrada.target as HTMLElement
              revelar(etapa)
              observador.unobserve(etapa)
            }
          })
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })

        etapas.forEach((etapa) => {
          etapa.dataset.revelada = 'false'
          etapa.style.setProperty('--etapa-line-progress', '0')
        })
        etapas.forEach((etapa) => {
          if (etapa.getBoundingClientRect().top < window.innerHeight * 0.9) revelar(etapa)
          else observador.observe(etapa)
        })
        secao.dataset.timeline = 'vertical'
        limparModo = () => observador.disconnect()
        return
      }

      if (!('ResizeObserver' in window)) return
      secao.dataset.timeline = 'horizontal'
      let quadro: number | undefined
      let recalcular = true
      let posicoes: number[] = []
      let posicoesMarcadores: number[] = []
      let limites: { esquerda: number; direita: number }[] = []
      let larguraJanela = 0
      let larguraEtapa = 0
      let percurso = 0
      let ultimoProgresso = -1
      let ultimoAvanco = -1
      let etapaAtiva = -1

      const atualizar = () => {
        quadro = undefined
        const topo = secao.getBoundingClientRect().top
        if (recalcular) {
          larguraJanela = janela.clientWidth
          secao.style.setProperty('--timeline-window-width', larguraJanela + 'px')
          larguraEtapa = etapas[0].offsetWidth
          posicoes = etapas.map((etapa) => etapa.offsetLeft)
          posicoesMarcadores = etapas.map((etapa, indice) => etapa.offsetLeft + marcadores[indice].offsetLeft + marcadores[indice].offsetWidth / 2)
          percurso = Math.round(Math.max(640, Math.min(1120, larguraJanela * 0.84)))
          const alturaConteudo = Math.max(...conteudos.map((conteudo) => conteudo.offsetHeight))
          secao.style.setProperty('--timeline-content-height', alturaConteudo + 'px')
          limites = etapas.map((_, indice) => {
            const conteudo = conteudos[indice]
            const fotografia = fotografias[indice]
            const marcador = marcadores[indice]
            const esquerdaFoto = conteudo.offsetLeft + fotografia.offsetLeft
            return {
              esquerda: Math.min(conteudo.offsetLeft, esquerdaFoto, marcador.offsetLeft),
              direita: Math.max(conteudo.offsetLeft + conteudo.offsetWidth, esquerdaFoto + fotografia.offsetWidth, marcador.offsetLeft + marcador.offsetWidth),
            }
          })
          secao.style.setProperty('--timeline-stage-height', palco.getBoundingClientRect().height + 'px')
          secao.style.setProperty('--timeline-distance', percurso + 'px')
          recalcular = false
          ultimoProgresso = -1
          ultimoAvanco = -1
        }

        const progresso = limitar(-topo / percurso)
        if (progresso === ultimoProgresso) return
        ultimoProgresso = progresso
        const avanco = suavizar(limitar((progresso - 0.15) / 0.20))
          + suavizar(limitar((progresso - 0.65) / 0.20))
        if (avanco === ultimoAvanco) return
        ultimoAvanco = avanco
        const indiceAtual = Math.floor(avanco)
        const indiceSeguinte = Math.min(indiceAtual + 1, etapas.length - 1)
        const posicao = posicoes[indiceAtual]
          + (posicoes[indiceSeguinte] - posicoes[indiceAtual]) * (avanco - indiceAtual)
        const recuo = (larguraJanela - larguraEtapa) / 2
        const deslocamento = posicao - recuo
        trilho.style.setProperty('--timeline-x', -deslocamento + 'px')
        const posicaoMarcador = posicoesMarcadores[indiceAtual]
          + (posicoesMarcadores[indiceSeguinte] - posicoesMarcadores[indiceAtual]) * (avanco - indiceAtual)
        const progressoLinha = limitar((posicaoMarcador - posicoesMarcadores[0])
          / (posicoesMarcadores[etapas.length - 1] - posicoesMarcadores[0]))
        trilho.style.setProperty('--timeline-progress', String(progressoLinha))
        etapas.forEach((etapa, indice) => {
          const esquerda = posicoes[indice] - deslocamento
          const margem = Math.min(esquerda + limites[indice].esquerda, larguraJanela - esquerda - limites[indice].direita)
          const margemEmFoco = Math.min(recuo + limites[indice].esquerda, larguraJanela - recuo - limites[indice].direita)
          const revelacao = suavizar(limitar(margem / Math.max(1, Math.min(64, margemEmFoco))))
          const foco = limitar(1 - Math.abs(indice - avanco))
          etapa.style.setProperty('--etapa-progresso', String(revelacao))
          etapa.style.setProperty('--etapa-foco', String(foco))
        })
        const ativa = Math.round(avanco)
        if (ativa !== etapaAtiva) {
          etapaAtiva = ativa
          if (indicador) indicador.textContent = String(ativa + 1).padStart(2, '0')
        }
      }

      const agendar = () => {
        if (quadro === undefined) quadro = requestAnimationFrame(atualizar)
      }
      const redimensionar = () => {
        recalcular = true
        agendar()
      }
      atualizarFontes = redimensionar
      const dimensoes = new ResizeObserver(redimensionar)
      dimensoes.observe(janela)
      dimensoes.observe(palco)
      window.addEventListener('scroll', agendar, { passive: true })
      window.addEventListener('resize', redimensionar)
      atualizar()

      limparModo = () => {
        if (quadro !== undefined) cancelAnimationFrame(quadro)
        dimensoes.disconnect()
        window.removeEventListener('scroll', agendar)
        window.removeEventListener('resize', redimensionar)
      }
    }

    configurar()
    desktop.addEventListener('change', configurar)
    movimentoReduzido.addEventListener('change', configurar)
    void document.fonts.ready.then(() => {
      if (montado) atualizarFontes()
    })

    return () => {
      montado = false
      desktop.removeEventListener('change', configurar)
      movimentoReduzido.removeEventListener('change', configurar)
      limparModo()
      restaurar()
    }
  }, [])

  return { secaoRef, palcoRef, janelaRef, trilhoRef, indicadorRef }
}
