import './EscolhaInteresse.css'

export function EscolhaInteresse() {
  return (
    <section className="escolha-interesse" id="interesses" aria-labelledby="interesses-titulo">
      <div className="escolha-interesse__inner">
        <h2 className="escolha-interesse__title" id="interesses-titulo">Escolha seu interesse.</h2>
        <div className="escolha-interesse__frentes">
          <article className="escolha-interesse__frente" aria-labelledby="interesse-incruises">
            <h3 id="interesse-incruises">inCruises</h3>
            <p>Conheça a proposta e como funciona.</p>
            <a href="#incruises">Conhecer inCruises</a>
          </article>
          <article className="escolha-interesse__frente" aria-labelledby="interesse-viagens">
            <h3 id="interesse-viagens">Viagens e Passagens</h3>
            <p>Encontre opções para sua próxima viagem.</p>
            <a href="#viagens-passagens">Ver viagens e passagens</a>
          </article>
        </div>
      </div>
    </section>
  )
}
