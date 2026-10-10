import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { detectarPaisWhatsApp, interpretarWhatsApp, paisesWhatsApp, pesquisarPaisesWhatsApp } from './paisesWhatsApp'
import './CampoWhatsApp.css'

type CampoWhatsAppProps = {
  erro?: string
  onValidar: (erro: string | undefined) => void
}

export function CampoWhatsApp({ erro, onValidar }: CampoWhatsAppProps) {
  const [pais, setPais] = useState(paisesWhatsApp[0])
  const [valor, setValor] = useState('')
  const [aberto, setAberto] = useState(false)
  const [acima, setAcima] = useState(false)
  const [pesquisa, setPesquisa] = useState('')
  const [ativo, setAtivo] = useState(0)
  const grupoRef = useRef<HTMLDivElement>(null)
  const botaoRef = useRef<HTMLButtonElement>(null)
  const pesquisaRef = useRef<HTMLInputElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const resultados = pesquisarPaisesWhatsApp(pesquisa)

  function abrirLista() {
    setPesquisa('')
    setAtivo(paisesWhatsApp.findIndex((item) => item.codigo === pais.codigo))
    setAberto(true)
  }

  function selecionar(proximo: typeof pais) {
    setPais(proximo)
    setAberto(false)
    onValidar(valor.trim() ? interpretarWhatsApp(valor, proximo.codigo).erro : undefined)
    botaoRef.current?.focus()
  }

  useEffect(() => {
    if (!aberto) return

    function ajustarPosicao() {
      const limite = botaoRef.current?.getBoundingClientRect()
      if (!limite) return
      const altura = window.visualViewport?.height ?? window.innerHeight
      const topo = window.visualViewport?.offsetTop ?? 0
      const abaixo = topo + altura - limite.bottom
      setAcima(abaixo < 300 && limite.top - topo > abaixo)
    }
    function fecharFora(evento: PointerEvent) {
      if (evento.target instanceof Node && !grupoRef.current?.contains(evento.target)) setAberto(false)
    }

    ajustarPosicao()
    pesquisaRef.current?.focus()
    document.addEventListener('pointerdown', fecharFora)
    window.addEventListener('resize', ajustarPosicao)
    window.visualViewport?.addEventListener('resize', ajustarPosicao)
    window.visualViewport?.addEventListener('scroll', ajustarPosicao)
    return () => {
      document.removeEventListener('pointerdown', fecharFora)
      window.removeEventListener('resize', ajustarPosicao)
      window.visualViewport?.removeEventListener('resize', ajustarPosicao)
      window.visualViewport?.removeEventListener('scroll', ajustarPosicao)
    }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    const lista = listaRef.current
    const opcao = lista?.children[ativo] as HTMLElement | undefined
    if (!lista || !opcao) return
    const inicio = opcao.offsetTop
    const fim = inicio + opcao.offsetHeight
    if (inicio < lista.scrollTop) lista.scrollTop = inicio
    else if (fim > lista.scrollTop + lista.clientHeight) lista.scrollTop = fim - lista.clientHeight
  }, [aberto, ativo, pesquisa])

  function navegar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      setAtivo((anterior) => Math.max(0, Math.min(resultados.length - 1, anterior + (evento.key === 'ArrowDown' ? 1 : -1))))
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      if (resultados[ativo]) selecionar(resultados[ativo])
    }
  }

  return (
    <div
      className="whatsapp"
      ref={grupoRef}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false)
      }}
    >
      <button
        className="whatsapp__pais"
        type="button"
        ref={botaoRef}
        aria-label={`País do WhatsApp: ${pais.nome}, DDI ${pais.ddi}`}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={aberto ? 'whatsapp-paises' : undefined}
        onClick={() => {
          if (aberto) {
            setAberto(false)
            botaoRef.current?.focus()
          } else abrirLista()
        }}
        onPointerDown={(evento) => {
          if (aberto) evento.preventDefault()
        }}
        onKeyDown={(evento) => {
          if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
            evento.preventDefault()
            abrirLista()
          }
        }}
      >
        <img className="whatsapp__bandeira" src={pais.bandeira} width="24" height="18" alt="" />
        <span>{pais.ddi}</span>
        <svg className="whatsapp__seta" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <input type="hidden" name="whatsapp-pais" value={pais.codigo} />
      {aberto && (
        <div
          className={`whatsapp__menu${acima ? ' whatsapp__menu--acima' : ''}`}
          id="whatsapp-paises"
          role="dialog"
          aria-label="Escolher país do WhatsApp"
          onBlur={(evento) => {
            if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false)
          }}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape') {
              evento.preventDefault()
              evento.stopPropagation()
              setAberto(false)
              botaoRef.current?.focus()
            }
          }}
        >
          <input
            className="whatsapp__pesquisa"
            ref={pesquisaRef}
            type="search"
            role="combobox"
            aria-label="Buscar país ou DDI"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="whatsapp-opcoes"
            aria-activedescendant={resultados[ativo] ? `whatsapp-pais-${resultados[ativo].codigo}` : undefined}
            autoComplete="off"
            placeholder="Buscar país ou DDI"
            value={pesquisa}
            onChange={(evento) => { setPesquisa(evento.target.value); setAtivo(0) }}
            onKeyDown={navegar}
          />
          <div className="whatsapp__lista" id="whatsapp-opcoes" ref={listaRef} tabIndex={-1} role="listbox" aria-label="Países disponíveis">
            {resultados.map((item, indice) => (
              <button
                className={`whatsapp__opcao${indice === ativo ? ' whatsapp__opcao--ativa' : ''}`}
                id={`whatsapp-pais-${item.codigo}`}
                key={item.codigo}
                type="button"
                role="option"
                aria-selected={item.codigo === pais.codigo}
                tabIndex={-1}
                onClick={() => selecionar(item)}
              >
                <img className="whatsapp__bandeira" src={item.bandeira} width="24" height="18" alt="" loading="lazy" />
                <span className="whatsapp__nome">{item.nome}</span>
                <span className="whatsapp__ddi">{item.ddi}</span>
              </button>
            ))}
          </div>
          {!resultados.length && <p className="whatsapp__vazio" role="status">Nenhum país encontrado.</p>}
        </div>
      )}
      <input
        className="whatsapp__numero"
        id="captacao-whatsapp"
        name="whatsapp"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={pais.codigo === 'BR' ? '(00) 00000-0000' : 'Número de WhatsApp'}
        required
        value={valor}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? 'captacao-whatsapp-erro' : undefined}
        onFocus={() => setAberto(false)}
        onChange={(evento) => {
          const proximoValor = evento.target.value
          const paisDetectado = detectarPaisWhatsApp(proximoValor)
          const proximoPais = paisDetectado ?? pais
          setValor(paisDetectado ? interpretarWhatsApp(proximoValor, proximoPais.codigo).formatado ?? proximoValor : proximoValor)
          setPais(proximoPais)
          if (erro) onValidar(interpretarWhatsApp(proximoValor, proximoPais.codigo).erro)
        }}
        onBlur={() => {
          const resultado = interpretarWhatsApp(valor, pais.codigo)
          if (resultado.formatado) setValor(resultado.formatado)
          onValidar(resultado.erro)
        }}
      />
    </div>
  )
}
