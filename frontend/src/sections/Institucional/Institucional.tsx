import { planningUrl } from '../../config/site'
import './Institucional.css'

export function Institucional() {
  return (
    <section className="institucional" id="sobre" aria-labelledby="institucional-titulo">
      <div className="institucional__inner">
        <div className="institucional__content">
          <p className="institucional__eyebrow">BEM-VINDO À SAILAWAY</p>
          <h2 className="institucional__title" id="institucional-titulo">
            Viagens que começam<br />com você.
          </h2>
          <p className="institucional__description">
            Cada pessoa imagina uma viagem de um jeito. A SAILAWAY entende o que você procura e ajuda a organizar cada etapa, para que o planejamento seja tão tranquilo quanto o destino.
          </p>
          <p className="institucional__description">
            Pode ser uma viagem em família, alguns dias a dois ou um destino que você ainda quer descobrir. A conversa começa pelos seus planos: onde ir, quando viajar e o que você quer viver.
          </p>
          <a className="institucional__link" href={planningUrl}>Conte seus planos</a>
        </div>
        <figure className="institucional__figure">
          <img
            className="institucional__image"
            src={import.meta.env.BASE_URL + 'images/experiencias/familia.webp'}
            alt="Uma criança caminha junto ao mar, acompanhada por dois adultos."
            width="1586"
            height="992"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="institucional__caption">O planejamento começa pelo que importa para você.</figcaption>
        </figure>
      </div>
    </section>
  )
}
