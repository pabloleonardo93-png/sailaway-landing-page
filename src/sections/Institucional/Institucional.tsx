import { sobreUrl } from '../../config/site'
import './Institucional.css'

export function Institucional() {
  return (
    <section className="institucional" id="sobre" aria-labelledby="institucional-titulo">
      <div className="institucional__inner">
        <p className="institucional__eyebrow">BEM-VINDO À SAILAWAY</p>
        <h2 className="institucional__title" id="institucional-titulo">
          Viagens que começam<br />com você.
        </h2>
        <div className="institucional__content">
          <p className="institucional__description">
            Cada pessoa imagina uma viagem de um jeito. A SAILAWAY entende o que você procura e ajuda a organizar cada etapa, para que o planejamento seja tão tranquilo quanto o destino.
          </p>
          <a
            className="institucional__link"
            href={sobreUrl}
            role={sobreUrl ? undefined : 'link'}
            aria-disabled={sobreUrl ? undefined : true}
            title={sobreUrl ? undefined : 'Destino ainda não definido'}
          >
            Descubra a SAILAWAY
          </a>
        </div>
      </div>
    </section>
  )
}
