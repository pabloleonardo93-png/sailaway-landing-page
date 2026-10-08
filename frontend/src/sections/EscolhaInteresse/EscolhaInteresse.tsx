import { planningUrl } from '../../config/site'
import './EscolhaInteresse.css'

const servicos = [
  {
    titulo: 'Cruzeiros',
    descricao: 'Viagens em mar aberto, com o planejamento pensado para o que você procura.',
  },
  {
    titulo: 'Hotéis & resorts',
    descricao: 'Hospedagens para descansar e aproveitar o destino no seu ritmo.',
  },
  {
    titulo: 'Passagens',
    descricao: 'Conte seu destino e quando você quer viajar. A SAILAWAY ajuda a organizar essa etapa.',
  },
  {
    titulo: 'Viagens personalizadas',
    descricao: 'Um planejamento que considera seu período, estilo de viagem e as experiências que deseja viver.',
  },
] as const

export function EscolhaInteresse() {
  return (
    <section className="escolha-interesse" id="servicos" aria-labelledby="servicos-titulo">
      <div className="escolha-interesse__inner">
        <div className="escolha-interesse__heading">
          <div>
            <p className="escolha-interesse__eyebrow">SEUS PLANOS, NOSSO PONTO DE PARTIDA</p>
            <h2 className="escolha-interesse__title" id="servicos-titulo">Viagens com a SAILAWAY.</h2>
          </div>
          <p className="escolha-interesse__intro">
            Passagens, hospedagem e experiências: a SAILAWAY ajuda a organizar a viagem a partir dos seus planos.
          </p>
        </div>
        <div className="escolha-interesse__composition">
          <img
            className="escolha-interesse__image"
            src={import.meta.env.BASE_URL + 'images/experiencias/praias-resorts.webp'}
            alt="Piscina e espreguiçadeiras de um resort junto à praia, ao entardecer."
            width="1237"
            height="1536"
            loading="lazy"
            decoding="async"
          />
          <div className="escolha-interesse__content">
            <div className="escolha-interesse__services">
              {servicos.map(({ titulo, descricao }) => (
                <article className="escolha-interesse__service" key={titulo}>
                  <h3>{titulo}</h3>
                  <p>{descricao}</p>
                </article>
              ))}
            </div>
            <a className="escolha-interesse__cta" href={planningUrl}>Planejar minha viagem</a>
          </div>
        </div>
      </div>
    </section>
  )
}
