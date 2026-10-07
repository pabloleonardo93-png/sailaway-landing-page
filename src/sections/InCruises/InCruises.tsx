import './InCruises.css'

const categorias = [
  {
    numero: '01',
    titulo: 'CRUZEIROS',
    texto: 'Viagens em mar aberto.',
  },
  {
    numero: '02',
    titulo: 'HOTÉIS & RESORTS',
    texto: 'Refúgios à beira-mar.',
  },
  {
    numero: '03',
    titulo: 'EXPERIÊNCIAS',
    texto: 'Destinos para descobrir.',
  },
] as const

export function InCruises() {
  return (
    <section className="incruises" id="incruises" aria-labelledby="incruises-titulo">
      <div className="incruises__inner">
        <div className="incruises__presentation">
          <div className="incruises__content">
            <p className="incruises__eyebrow">CONHEÇA A INCRUISES</p>
            <h2 className="incruises__title" id="incruises-titulo">
              Uma nova forma de{' '}<br />planejar suas viagens.
            </h2>
            <p className="incruises__intro">
              Conheça uma forma diferente de explorar cruzeiros, hospedagens e experiências de viagem.
            </p>
            <a className="incruises__cta" href="#captacao">Quero saber mais</a>
          </div>

          <img
            className="incruises__photo"
            src={`${import.meta.env.BASE_URL}images/captacao/captacao-cruzeiro.webp`}
            width="2752"
            height="1536"
            alt="Navio de cruzeiro navegando próximo a uma costa montanhosa em um dia de céu claro."
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="incruises__categories">
          {categorias.map(({ numero, titulo, texto }) => (
            <article className="incruises__category" key={numero}>
              <p className="incruises__category-number">{numero}</p>
              <h3 className="incruises__category-title">{titulo}</h3>
              <p className="incruises__category-description">{texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
