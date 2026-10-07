import './ComoFunciona.css'

const etapas = [
  {
    numero: '01',
    titulo: 'Conte seus planos',
    descricao: 'Destino, período, estilo de viagem e o que é importante para você.',
  },
  {
    numero: '02',
    titulo: 'A gente organiza',
    descricao: 'A SAILAWAY seleciona as opções e monta uma proposta de acordo com o que você procura.',
  },
  {
    numero: '03',
    titulo: 'É só embarcar',
    descricao: 'Com tudo definido, você recebe as informações da viagem e segue com mais tranquilidade.',
  },
] as const

export function ComoFunciona() {
  return (
    <section className="como-funciona" id="como-funciona" aria-labelledby="como-funciona-titulo">
      <div className="como-funciona__inner">
        <div className="como-funciona__heading">
          <h2 className="como-funciona__title" id="como-funciona-titulo">
            Do plano ao embarque.
          </h2>
          <p className="como-funciona__intro">
            Você conta como quer viajar. A SAILAWAY organiza os detalhes e acompanha o caminho até a hora de embarcar.
          </p>
        </div>
        <ol className="como-funciona__steps" role="list">
          {etapas.map(({ numero, titulo, descricao }) => (
            <li className="como-funciona__step" key={numero}>
              <span className="como-funciona__number" aria-hidden="true">{numero}</span>
              <h3 className="como-funciona__step-title">{titulo}</h3>
              <p className="como-funciona__description">{descricao}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
