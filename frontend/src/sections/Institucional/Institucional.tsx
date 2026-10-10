import { WorldConnections } from '../../components/WorldConnections/WorldConnections'
import { planningUrl } from '../../config/site'
import './Institucional.css'

export function Institucional() {
  return (
    <section className="institucional" id="sobre" aria-labelledby="institucional-titulo">
      <div className="institucional__inner">
        <div className="institucional__content">
          <p className="institucional__eyebrow">BEM-VINDO À SAILAWAY</p>
          <h2 className="institucional__title" id="institucional-titulo">
            Viajar também é criar conexões.
          </h2>
          <p className="institucional__description">
            A SAILAWAY ajuda você a organizar sua próxima viagem, mesmo que ainda não tenha escolhido o destino.
          </p>
          <p className="institucional__description">
            Também temos uma proposta para quem deseja participar da nossa rede de membros. Nossa equipe explica as condições e tira suas dúvidas antes de qualquer decisão.
          </p>
          <a className="institucional__link" href={planningUrl}>Fale com a equipe</a>
        </div>
        <figure className="institucional__figure">
          <WorldConnections />
        </figure>
      </div>
    </section>
  )
}
