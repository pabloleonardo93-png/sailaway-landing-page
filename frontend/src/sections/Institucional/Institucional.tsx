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
            A SAILAWAY reúne pessoas que gostam de viajar e querem conhecer novas possibilidades.
          </p>
          <p className="institucional__description">
            Se você está organizando as próximas férias, pode contar com a nossa ajuda para planejar seu roteiro. E, se tem interesse em fazer parte da SAILAWAY, pode conversar com a equipe para entender como funciona a participação como membro.
          </p>
          <a className="institucional__link" href={planningUrl}>Conte seus planos</a>
        </div>
        <figure className="institucional__figure">
          <WorldConnections />
        </figure>
      </div>
    </section>
  )
}
