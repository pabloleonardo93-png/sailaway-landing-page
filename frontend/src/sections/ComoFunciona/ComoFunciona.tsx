import { useTimelineComoFunciona } from './useTimelineComoFunciona'
import './ComoFunciona.css'

const etapas = [
  {
    numero: '01',
    imagem: '/images/como-funciona/01-planejamento.webp',
    imagemAlt: 'Planejamento de viagem com mapa e anotações em uma varanda à beira-mar.',
    titulo: 'Conte o que procura',
    descricao: 'Conte pra gente o destino, período, estilo de viagem e orçamento. Quanto mais detalhes, melhor.',
  },
  {
    numero: '02',
    imagem: '/images/como-funciona/02-atendimento-online.webp',
    imagemAlt: 'Mulher consultando o celular e o notebook em uma varanda com vista para o mar.',
    titulo: 'Receba opções alinhadas ao seu orçamento',
    descricao: 'A SAILAWAY apresenta alternativas de acordo com o que você procura, com as informações organizadas para facilitar sua escolha.',
  },
  {
    numero: '03',
    imagem: '/images/como-funciona/03-embarque.webp',
    imagemAlt: 'Viajante com mala em um terminal de aeroporto, diante de um avião.',
    titulo: 'Organize e avance com apoio da SAILAWAY',
    descricao: 'Depois de escolher sua opção, você recebe orientação para organizar os próximos passos da viagem.',
  },
] as const

export function ComoFunciona() {
  const { secaoRef, palcoRef, janelaRef, trilhoRef, indicadorRef } = useTimelineComoFunciona()

  return (
    <section className="como-funciona" id="como-funciona" aria-labelledby="como-funciona-titulo" ref={secaoRef}>
      <div className="como-funciona__stage" ref={palcoRef}>
        <div className="como-funciona__inner">
          <div className="como-funciona__heading">
            <div>
              <p className="como-funciona__eyebrow">PASSO A PASSO</p>
              <h2 className="como-funciona__title" id="como-funciona-titulo">Como funciona</h2>
            </div>
          </div>
          <div className="como-funciona__viewport" ref={janelaRef}>
            <p className="como-funciona__progress" aria-hidden="true">
              <span ref={indicadorRef}>01</span> / 03
            </p>
            <div className="como-funciona__track" ref={trilhoRef}>
              <div className="como-funciona__line" aria-hidden="true">
                <span className="como-funciona__line-progress" />
              </div>
              <ol className="como-funciona__steps" role="list">
                {etapas.map(({ numero, titulo, descricao, imagem, imagemAlt }) => (
                  <li className="como-funciona__step" key={numero}>
                    <span className="como-funciona__number" aria-hidden="true">{numero}</span>
                    <div className="como-funciona__content">
                      <h3 className="como-funciona__step-title">{titulo}</h3>
                      <p className="como-funciona__description">{descricao}</p>
                      <img
                        className="como-funciona__photo"
                        src={imagem}
                        alt={imagemAlt}
                        width={numero === '03' ? 1600 : 1376}
                        height={numero === '03' ? 893 : 768}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
