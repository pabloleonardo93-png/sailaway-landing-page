import { useState, useSyncExternalStore } from 'react'
import './Faq.css'

const perguntas = [
  {
    pergunta: 'Como a SAILAWAY pode me ajudar a planejar uma viagem?',
    resposta: 'Conte pra gente onde você quer ir, quando pretende viajar e quanto pensa em gastar. A partir daí, podemos ajudar a organizar as opções de roteiro.',
  },
  {
    pergunta: 'E se eu ainda não tiver escolhido o destino?',
    resposta: 'Tudo bem. Podemos começar pelo tipo de viagem que você gosta, pelos dias disponíveis e pelo orçamento.',
  },
  {
    pergunta: 'Como faço para me tornar sócio-membro?',
    resposta: 'Entre em contato com a equipe para conhecer a proposta, as condições de adesão e as responsabilidades de quem participa. Assim, você pode decidir depois de tirar suas dúvidas.',
  },
  {
    pergunta: 'Como funciona a rede de membros?',
    resposta: 'Nossa equipe explica as regras de participação, como funcionam as indicações e quais são as responsabilidades dos membros. Vale conhecer todas as condições antes de decidir.',
  },
  {
    pergunta: 'Posso comprar minha viagem diretamente pelo site?',
    resposta: 'Não. As viagens não são compradas pelo site. Aqui você pode conhecer as possibilidades de planejamento e a proposta de participação como membro.',
  },
  {
    pergunta: 'Quais dados o formulário pede?',
    resposta: 'Pedimos seu nome, WhatsApp, e-mail e o assunto do contato. Depois de preencher, você será direcionado ao WhatsApp da SAILAWAY, com uma mensagem pronta para conferir e enviar.',
  },
] as const

const acompanharAmbiente = () => () => {}

export function Faq() {
  const [perguntaAberta, setPerguntaAberta] = useState<number | null>(0)
  const interativa = useSyncExternalStore(acompanharAmbiente, () => true, () => false)

  return (
    <section className="faq" id="faq" aria-labelledby="faq-titulo">
      <div className="faq__inner">
        <div className="faq__heading">
          <p className="faq__eyebrow">DÚVIDAS FREQUENTES</p>
          <h2 className="faq__title" id="faq-titulo">
            Dúvidas sobre<br />a SAILAWAY
          </h2>
          <p className="faq__intro">
            Respostas sobre planejamento de viagens e participação na rede de membros.
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
                  aria-hidden={interativa ? !aberta : undefined}
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
