import { Experiencias } from '../Experiencias/Experiencias'
import './ViagensPassagens.css'

export function ViagensPassagens() {
  return (
    <div id="viagens-passagens" role="region" aria-labelledby="viagens-passagens-titulo">
      <div className="viagens-passagens">
        <div className="viagens-passagens__inner">
          <h2 className="viagens-passagens__title" id="viagens-passagens-titulo">Viagens e Passagens</h2>
          <p className="viagens-passagens__intro">Encontre opções para sua próxima viagem.</p>
        </div>
      </div>
      <Experiencias />
    </div>
  )
}
