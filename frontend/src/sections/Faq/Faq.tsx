import { useState } from 'react'
import './Faq.css'

const perguntas = [
  {
    pergunta: 'Posso comprar minha viagem diretamente pelo site?',
    resposta: 'Não. O site da SAILAWAY foi criado para apresentar as opções e identificar o seu interesse. Depois disso, o atendimento segue pelo canal de contato da SAILAWAY.',
  },
  {
    pergunta: 'Que tipo de viagem posso planejar com a SAILAWAY?',
    resposta: 'Você pode indicar interesse em cruzeiro, viagem e hospedagem, passagens ou viagem personalizada. Se ainda não souber, pode escolher a opção "Ainda não sei".',
  },
  {
    pergunta: 'Como funciona o atendimento?',
    resposta: 'Você conhece as opções, informa o que procura e deixa seus dados de contato. A partir daí, a SAILAWAY pode dar continuidade ao atendimento de acordo com o seu interesse.',
  },
  {
    pergunta: 'Quais informações preciso enviar?',
    resposta: 'O formulário solicita nome, WhatsApp, e-mail e a opção de interesse para ajudar a direcionar o atendimento.',
  },
] as const

export function Faq() {
  const [perguntaAberta, setPerguntaAberta] = useState<number | null>(0)

  return (
    <section className="faq" id="faq" aria-labelledby="faq-titulo">
      <div className="faq__inner">
        <div className="faq__heading">
          <p className="faq__eyebrow">DÚVIDAS FREQUENTES</p>
          <h2 className="faq__title" id="faq-titulo">
            Antes de seguir,<br />talvez você queira saber.
          </h2>
          <p className="faq__intro">
            Algumas respostas rápidas para entender melhor como funciona o atendimento da SAILAWAY.
          </p>
        </div>

        <div className="faq__list">
          {perguntas.map(({ pergunta, resposta }, indice) => {
            const aberta = perguntaAberta === indice
            const botaoId = 'faq-pergunta-' + (indice + 1)
            const respostaId = 'faq-resposta-' + (indice + 1)

            return (
              <article className={'faq__item' + (aberta ? ' is-open' : '')} key={pergunta}>
                <h3 className="faq__question">
                  <button
                    id={botaoId}
                    type="button"
                    aria-expanded={aberta}
                    aria-controls={respostaId}
                    onClick={() => setPerguntaAberta(aberta ? null : indice)}
                  >
                    <span>{pergunta}</span>
                    <span className="faq__indicator" aria-hidden="true">{aberta ? '−' : '+'}</span>
                  </button>
                </h3>
                <div
                  className="faq__answer"
                  id={respostaId}
                  role="region"
                  aria-labelledby={botaoId}
                  aria-hidden={!aberta}
                >
                  <div className="faq__answer-inner">
                    <p>{resposta}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
