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
            NOVOS HORIZONTES.<br />
            <span className="institucional__title-highlight">NOVAS POSSIBILIDADES.</span>
          </h2>
          <p className="institucional__description">
            A SAILAWAY apresenta uma proposta no universo do turismo para quem deseja explorar novas oportunidades, desenvolver conhecimentos e viver experiências únicas.
          </p>
          <ul className="institucional__benefits" aria-label="Benefícios da proposta SAILAWAY">
            <li className="institucional__benefit">
              <span className="institucional__benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <ellipse cx="12" cy="12" rx="4" ry="9" />
                  <path d="M3 12h18M4.2 7.5c4.6 2 11 2 15.6 0M4.2 16.5c4.6-2 11-2 15.6 0" />
                </svg>
              </span>
              <div>
                <h3 className="institucional__benefit-title">Projeto internacional</h3>
                <p className="institucional__benefit-description">Faça parte de uma proposta conectada ao universo global do turismo.</p>
              </div>
            </li>
            <li className="institucional__benefit">
              <span className="institucional__benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="16" height="13" rx="1" />
                  <path d="m4 16-2 4h20l-2-4M10 18h4" />
                </svg>
              </span>
              <div>
                <h3 className="institucional__benefit-title">100% online</h3>
                <p className="institucional__benefit-description">Uma oportunidade que pode ser desenvolvida de forma remota, com liberdade e autonomia.</p>
              </div>
            </li>
            <li className="institucional__benefit">
              <span className="institucional__benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="7" r="3" />
                  <circle cx="4.5" cy="10" r="2" />
                  <circle cx="19.5" cy="10" r="2" />
                  <path d="M6.5 21v-3a5.5 5.5 0 0 1 11 0v3ZM1 19v-2a3.5 3.5 0 0 1 5-3.15M23 19v-2a3.5 3.5 0 0 0-5-3.15M1 19h3M20 19h3" />
                </svg>
              </span>
              <div>
                <h3 className="institucional__benefit-title">Treinamento e suporte</h3>
                <p className="institucional__benefit-description">Conte com orientação e recursos para o seu desenvolvimento.</p>
              </div>
            </li>
            <li className="institucional__benefit">
              <span className="institucional__benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              <div>
                <h3 className="institucional__benefit-title">Flexibilidade de horário</h3>
                <p className="institucional__benefit-description">Organize a sua rotina de acordo com os seus objetivos e estilo de vida.</p>
              </div>
            </li>
          </ul>
          <a className="institucional__link" href={planningUrl}>Fale com a equipe</a>
        </div>
        <figure className="institucional__figure">
          <WorldConnections />
        </figure>
      </div>
    </section>
  )
}
