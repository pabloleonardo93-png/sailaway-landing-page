import { useState, type FormEvent } from 'react'
import { criarLinkWhatsApp, type DadosCaptacao, type InteresseCaptacao } from '../../config/site'
import { CampoWhatsApp } from './CampoWhatsApp'
import { interpretarWhatsApp, paisesWhatsApp } from './paisesWhatsApp'
import { criarMensagemCaptacao, validarNome, validarEmail, validarMensagemWhatsApp, validarUrlWhatsApp } from './validacoesCaptacao'
import './Captacao.css'

const campos = [
  { nome: 'nome', label: 'Nome', tipo: 'text', autocomplete: 'name', placeholder: 'Seu nome completo' },
  { nome: 'whatsapp', label: 'WhatsApp', tipo: 'tel', autocomplete: 'tel', placeholder: '(00) 00000-0000' },
  { nome: 'email', label: 'E-mail', tipo: 'email', autocomplete: 'email', placeholder: 'seu@email.com' },
] as const

const interesses: { valor: InteresseCaptacao; label: string; icone: string }[] = [
  { valor: 'planejamento-viagem', label: 'Quero planejar uma viagem', icone: 'm21 3-6 18-4-8-8-4 18-6ZM11 13l10-10M3 17l4 4' },
  { valor: 'socio-membro', label: 'Quero saber como me tornar membro', icone: 'm3 6 4 4 5-7 5 7 4-4-2 13H5L3 6ZM7 22h10' },
  { valor: 'outras-duvidas', label: 'Tenho outras dúvidas', icone: 'M20 4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2v4l5-4h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 11h.01M12 11h.01M17 11h.01' },
]

type ErrosCaptacao = Partial<Record<keyof DadosCaptacao, string>>

function validar(formulario: HTMLFormElement) {
  const valores = new FormData(formulario)
  const nomeInformado = String(valores.get('nome') ?? '')
  const nome = nomeInformado.trim()
  const whatsapp = String(valores.get('whatsapp') ?? '')
  const pais = paisesWhatsApp.find((item) => item.codigo === valores.get('whatsapp-pais')) ?? paisesWhatsApp[0]
  const telefone = interpretarWhatsApp(whatsapp, pais.codigo)
  const emailInformado = String(valores.get('email') ?? '')
  const email = emailInformado.trim()
  const interesse = interesses.find((opcao) => opcao.valor === valores.get('interesse'))?.valor
  const campoEmail = formulario.elements.namedItem('email') as HTMLInputElement
  const erros: ErrosCaptacao = {}

  const erroNome = validarNome(nomeInformado)
  if (erroNome) erros.nome = erroNome

  if (telefone.erro) erros.whatsapp = telefone.erro

  const erroEmail = validarEmail(emailInformado)
  if (erroEmail || campoEmail.validity.typeMismatch) {
    erros.email = erroEmail ?? 'Informe um e-mail válido.'
  }

  if (!erros.email) campoEmail.value = email
  const campoNome = formulario.elements.namedItem('nome') as HTMLInputElement
  if (!erros.nome) campoNome.value = nome

  if (!interesse) erros.interesse = 'Escolha um assunto.'

  const dados: DadosCaptacao | undefined = Object.keys(erros).length === 0 && interesse && telefone.numero
    ? { nome, whatsapp: telefone.numero, email, interesse }
    : undefined

  return { erros, dados }
}

export function Captacao() {
  const [erros, setErros] = useState<ErrosCaptacao>({})
  const [linkConversa, setLinkConversa] = useState('')
  const [erroMensagem, setErroMensagem] = useState('')

  function conferirCampo(nome: 'nome' | 'email', valor: string) {
    const erro = nome === 'nome' ? validarNome(valor) : validarEmail(valor)
    setErros((anteriores) => {
      const atualizados = { ...anteriores }
      if (erro) atualizados[nome] = erro
      else delete atualizados[nome]
      return atualizados
    })
  }

  function enviarInteresse(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const formulario = evento.currentTarget
    const resultado = validar(formulario)
    setErros(resultado.erros)
    setLinkConversa('')
    setErroMensagem('')

    if (!resultado.dados) {
      const primeiroErro = Object.keys(resultado.erros)[0]
      formulario.querySelector<HTMLInputElement>('[name="' + primeiroErro + '"]')?.focus()
      return
    }

    const assunto = interesses.find((opcao) => opcao.valor === resultado.dados?.interesse)!.label
    const mensagem = criarMensagemCaptacao(resultado.dados, assunto)
    const erroTexto = validarMensagemWhatsApp(mensagem)
    const link = erroTexto ? '' : criarLinkWhatsApp(mensagem)
    const erroLink = erroTexto ?? validarUrlWhatsApp(link)
    if (erroLink) {
      setErroMensagem(erroLink)
      formulario.querySelector<HTMLButtonElement>('[type="submit"]')?.focus()
      return
    }
    setLinkConversa(link)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="captacao" id="captacao" aria-labelledby="captacao-titulo">
      <div className="captacao__inner">
        <div className="captacao__media" aria-hidden="true">
          <img
            className="captacao__background"
            src={`${import.meta.env.BASE_URL}images/captacao/captacao-cruzeiro.webp`}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <div className="captacao__overlay" aria-hidden="true" />
        </div>
        <div className="captacao__heading">
          <p className="captacao__eyebrow">FALE CONOSCO</p>
          <h2 className="captacao__title" id="captacao-titulo">
            Vamos <span className="captacao__title-accent">conversar?</span>
          </h2>
          <p className="captacao__intro">
            Quer planejar uma viagem ou saber mais sobre a nossa rede de membros? Escolha o assunto e conte pra gente o que você procura.
          </p>
        </div>

        <form
          className="captacao__form"
          aria-labelledby="captacao-titulo"
          noValidate
          onSubmit={enviarInteresse}
          onChange={() => {
            setLinkConversa('')
            setErroMensagem('')
          }}
        >
          <p className="captacao__announcement" role="alert">{Object.values(erros)[0] ?? ''}</p>
          {campos.map(({ nome, label, tipo, autocomplete, placeholder }) => (
            <div className="captacao__field" key={nome}>
              <label htmlFor={'captacao-' + nome}>{label}</label>
              {nome === 'whatsapp' ? (
                <CampoWhatsApp
                  erro={erros.whatsapp}
                  onValidar={(erro) => {
                    setErros((anteriores) => {
                      const atualizados = { ...anteriores }
                      if (erro) atualizados.whatsapp = erro
                      else delete atualizados.whatsapp
                      return atualizados
                    })
                    setLinkConversa('')
                  }}
                />
              ) : (
                <input
                  id={'captacao-' + nome}
                  name={nome}
                  type={tipo}
                  autoComplete={autocomplete}
                  placeholder={placeholder}
                  required
                  onChange={(evento) => conferirCampo(nome, evento.currentTarget.value)}
                  onBlur={(evento) => conferirCampo(nome, evento.currentTarget.value)}
                  aria-invalid={erros[nome] ? true : undefined}
                  aria-describedby={erros[nome] ? 'captacao-' + nome + '-erro' : undefined}
                />
              )}
              {erros[nome] && (
                <p className="captacao__error" id={'captacao-' + nome + '-erro'}>{erros[nome]}</p>
              )}
            </div>
          ))}

          <fieldset
            className="captacao__interests"
            aria-describedby={erros.interesse ? 'captacao-interesse-erro' : undefined}
          >
            <legend>O que você procura?</legend>
            <div className="captacao__options">
              {interesses.map(({ valor, label, icone }) => (
                <label className="captacao__option" key={valor}>
                  <input
                    type="radio"
                    name="interesse"
                    value={valor}
                    required
                    aria-invalid={erros.interesse ? true : undefined}
                    aria-describedby={erros.interesse ? 'captacao-interesse-erro' : undefined}
                  />
                  <svg className="captacao__option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                    <path d={icone} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="captacao__option-label">{label}</span>
                </label>
              ))}
            </div>
            {erros.interesse && (
              <p className="captacao__error" id="captacao-interesse-erro">{erros.interesse}</p>
            )}
          </fieldset>

          <p className="captacao__privacy" id="captacao-privacidade">
            Seus dados serão incluídos em uma mensagem no WhatsApp. Você poderá conferir tudo antes de enviar.
          </p>
          {erroMensagem && <p className="captacao__error" id="captacao-mensagem-erro" role="alert">{erroMensagem}</p>}
          <button
            className="captacao__submit"
            type="submit"
            aria-describedby={'captacao-privacidade' + (erroMensagem ? ' captacao-mensagem-erro' : '')}
          >
            Fale conosco
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="captacao__status" role="status" aria-live="polite">
            {linkConversa && (
              <>
                Confira a mensagem e confirme o envio no WhatsApp. Se a conversa não abriu,{' '}
                <a href={linkConversa} target="_blank" rel="noopener noreferrer">abra por este link</a>.
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  )
}
