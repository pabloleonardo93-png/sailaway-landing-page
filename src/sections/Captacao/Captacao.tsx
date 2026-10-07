import { useState, type FormEvent } from 'react'
import { captacao, type DadosCaptacao, type InteresseCaptacao } from '../../config/site'
import './Captacao.css'

const campos = [
  { nome: 'nome', label: 'Nome', tipo: 'text', autocomplete: 'name', placeholder: 'Seu nome completo' },
  { nome: 'whatsapp', label: 'WhatsApp', tipo: 'tel', autocomplete: 'tel', placeholder: '(00) 00000-0000' },
  { nome: 'email', label: 'E-mail', tipo: 'email', autocomplete: 'email', placeholder: 'seu@email.com' },
] as const

const interesses: { valor: InteresseCaptacao; label: string }[] = [
  { valor: 'incruises', label: 'inCruises' },
  { valor: 'viagens-passagens', label: 'Viagens e Passagens' },
  { valor: 'ambos', label: 'Ambos' },
]

type ErrosCaptacao = Partial<Record<keyof DadosCaptacao, string>>

function validar(formulario: HTMLFormElement) {
  const valores = new FormData(formulario)
  const nome = String(valores.get('nome') ?? '').trim()
  const whatsapp = String(valores.get('whatsapp') ?? '').trim()
  const email = String(valores.get('email') ?? '').trim()
  const interesse = interesses.find((opcao) => opcao.valor === valores.get('interesse'))?.valor
  const campoEmail = formulario.elements.namedItem('email') as HTMLInputElement
  const erros: ErrosCaptacao = {}

  if (!nome) erros.nome = 'Informe seu nome.'

  const digitos = whatsapp.replace(/\D/g, '')
  if (digitos.length < 10 || digitos.length > 15) {
    erros.whatsapp = 'Informe um WhatsApp válido, com 10 a 15 dígitos.'
  }

  if (!email || campoEmail.validity.typeMismatch) {
    erros.email = 'Informe um e-mail válido.'
  }

  if (!interesse) erros.interesse = 'Escolha um dos interesses.'

  const dados: DadosCaptacao | undefined = Object.keys(erros).length === 0 && interesse
    ? { nome, whatsapp, email, interesse }
    : undefined

  return { erros, dados }
}

export function Captacao() {
  const [erros, setErros] = useState<ErrosCaptacao>({})
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviarInteresse(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return

    const formulario = evento.currentTarget
    const resultado = validar(formulario)
    setErros(resultado.erros)
    setMensagem('')

    if (!resultado.dados) {
      const primeiroErro = Object.keys(resultado.erros)[0]
      formulario.querySelector<HTMLInputElement>('[name="' + primeiroErro + '"]')?.focus()
      return
    }

    if (!captacao.enviar) {
      setMensagem('O canal de envio ainda está sendo configurado. Seus dados não foram enviados.')
      return
    }

    setEnviando(true)
    try {
      await captacao.enviar(resultado.dados)
      setMensagem('Seu interesse foi enviado.')
    } catch {
      setMensagem('Não foi possível enviar. Seus dados continuam nos campos. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="captacao" id="captacao" aria-labelledby="captacao-titulo">
      <img
        className="captacao__background"
        src={`${import.meta.env.BASE_URL}images/captacao/captacao-cruzeiro.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className="captacao__overlay" aria-hidden="true" />
      <div className="captacao__inner">
        <div className="captacao__heading">
          <p className="captacao__eyebrow">VAMOS PLANEJAR?</p>
          <h2 className="captacao__title" id="captacao-titulo">
            Por onde você<br />quer <span className="captacao__title-accent">começar?</span>
          </h2>
          <p className="captacao__intro">
            Conte um pouco do que você procura. Assim, a SAILAWAY consegue direcionar seu atendimento para o caminho certo.
          </p>
        </div>

        <form
          className="captacao__form"
          aria-label="Informe seu interesse"
          aria-busy={enviando}
          noValidate
          onSubmit={enviarInteresse}
          onChange={() => setMensagem('')}
        >
          <p className="captacao__announcement" role="alert">{Object.values(erros)[0] ?? ''}</p>
          {campos.map(({ nome, label, tipo, autocomplete, placeholder }) => (
            <div className="captacao__field" key={nome}>
              <label htmlFor={'captacao-' + nome}>{label}</label>
              <input
                id={'captacao-' + nome}
                name={nome}
                type={tipo}
                autoComplete={autocomplete}
                placeholder={placeholder}
                inputMode={tipo === 'tel' ? 'tel' : undefined}
                required
                aria-invalid={erros[nome] ? true : undefined}
                aria-describedby={erros[nome] ? 'captacao-' + nome + '-erro' : undefined}
              />
              {erros[nome] && (
                <p className="captacao__error" id={'captacao-' + nome + '-erro'}>{erros[nome]}</p>
              )}
            </div>
          ))}

          <fieldset
            className="captacao__interests"
            aria-describedby={erros.interesse ? 'captacao-interesse-erro' : undefined}
          >
            <legend>Tenho interesse em</legend>
            <div className="captacao__options">
              {interesses.map(({ valor, label }) => (
                <label className="captacao__option" key={valor}>
                  <input
                    type="radio"
                    name="interesse"
                    value={valor}
                    required
                    aria-invalid={erros.interesse ? true : undefined}
                    aria-describedby={erros.interesse ? 'captacao-interesse-erro' : undefined}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {erros.interesse && (
              <p className="captacao__error" id="captacao-interesse-erro">{erros.interesse}</p>
            )}
          </fieldset>

          <button className="captacao__submit" type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar interesse'}
          </button>
          <p className="captacao__status" role="status" aria-live="polite">{mensagem}</p>
        </form>
      </div>
    </section>
  )
}
