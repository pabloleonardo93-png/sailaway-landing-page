import { useState } from 'react'
import './Faq.css'

const perguntas = [
  {
    pergunta: 'Como a SAILAWAY pode me ajudar a planejar uma viagem?',
    resposta: 'Você conta pra gente para onde quer ir, quando pretende viajar e o que tem em mente. A partir disso, podemos conversar sobre as opções e ajudar a organizar seu roteiro.',
  },
  {
    pergunta: 'Posso pedir ajuda mesmo sem ter um destino definido?',
    resposta: 'Claro. Se você ainda está escolhendo, pode contar o tipo de viagem que gostaria de fazer e quanto pretende gastar. Isso já ajuda a começar o planejamento.',
  },
  {
    pergunta: 'Como faço para me tornar sócio-membro?',
    resposta: 'É só entrar em contato e dizer que quer conhecer a proposta de associação. A equipe explica como funciona a participação e quais são as condições, para você avaliar com calma.',
  },
  {
    pergunta: 'Como funciona a rede de membros?',
    resposta: 'A SAILAWAY também apresenta uma proposta de participação em rede. Antes de aderir, você pode solicitar informações sobre as regras de indicação, as responsabilidades dos membros e as condições de participação.',
  },
  {
    pergunta: 'Posso comprar minha viagem diretamente pelo site?',
    resposta: 'Não. As viagens não são compradas pelo site. Aqui você pode conhecer as possibilidades de planejamento e a proposta de participação como membro.',
  },
  {
    pergunta: 'Quais informações preciso enviar?',
    resposta: 'O formulário solicita nome, WhatsApp, e-mail e a opção de interesse para ajudar a direcionar o atendimento. O canal de envio ainda está sendo configurado. Enquanto isso, seus dados não são enviados.',
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
