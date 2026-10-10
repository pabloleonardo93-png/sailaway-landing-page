import { useState } from 'react'
import { useExperienciasSticky } from './useExperienciasSticky'
import './Experiencias.css'

type Experiencia = {
  id: string
  categoria: string
  frase: string
  descricao: string
  imagem: string
  descricaoImagem: string
}

const experiencias: Experiencia[] = [
  {
    id: 'cruzeiros',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/cruzeiros.webp',
    descricaoImagem: 'Deck de um navio com espreguiçadeiras, passageiros e vista para o mar ao pôr do sol.',
    categoria: 'Planejamento de viagens',
    frase: 'Já tem uma viagem em mente?',
    descricao: 'Você pode chegar com o destino decidido ou ainda estar escolhendo. Conte pra gente quando pretende viajar e o que procura. Ajudamos a organizar as opções.',
  },
  {
    id: 'praias-resorts',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/praias-resorts.webp',
    descricaoImagem: 'Piscina de um resort à beira-mar, com espreguiçadeiras e palmeiras.',
    categoria: 'Roteiros personalizados',
    frase: 'Praia, cruzeiro ou um pouco de tudo?',
    descricao: 'Um roteiro pode incluir praias, cruzeiros ou várias paradas. A gente leva em conta suas preferências, o tempo disponível e o orçamento para ajudar a organizar sua viagem.',
  },
  {
    id: 'romance',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/romance.webp',
    descricaoImagem: 'Casal caminhando por um caminho de pedra junto à costa ao pôr do sol.',
    categoria: 'Seja um sócio-membro',
    frase: 'Quer fazer parte da SAILAWAY?',
    descricao: 'Antes de decidir, você pode entender como funciona a adesão, conhecer as condições e conversar sobre as responsabilidades de quem participa. Nossa equipe também pode esclarecer suas dúvidas.',
  },
]

function BlocoExperiencia({ experiencia }: { experiencia: Experiencia }) {
  const [imagemIndisponivel, setImagemIndisponivel] = useState(false)
  const { id, categoria, frase, descricao, imagem, descricaoImagem } = experiencia

  return (
    <article
      className={'experiencia experiencia--' + id}
      aria-labelledby={'experiencia-' + id}
    >
      <div className="experiencia__media">
        {!imagemIndisponivel && (
          <img
            className="experiencia__image"
            src={imagem}
            alt={descricaoImagem}
            loading="lazy"
            decoding="async"
            onError={() => setImagemIndisponivel(true)}
          />
        )}
      </div>
      <div className="experiencia__content">
        <h3 className="experiencia__category" id={'experiencia-' + id}>{categoria}</h3>
        <p className="experiencia__phrase">{frase}</p>
        <p className="experiencia__description">{descricao}</p>
      </div>
    </article>
  )
}

export function Experiencias() {
  const { secaoRef, percursoRef, fixacaoRef, palcoRef } = useExperienciasSticky()

  return (
    <section className="experiencias" id="experiencias" aria-labelledby="experiencias-titulo" ref={secaoRef}>
      <div className="experiencias__inner">
        <p className="experiencias__eyebrow">EXPERIÊNCIAS SAILAWAY</p>
        <div className="experiencias__heading">
          <h2 className="experiencias__title" id="experiencias-titulo">
            Qual viagem combina<br />com o seu momento?
          </h2>
        </div>
      </div>
      <div className="experiencias__percurso" ref={percursoRef}>
        <div className="experiencias__fixacao" ref={fixacaoRef}>
          <div className="experiencias__painel">
            <div className="experiencias__inner experiencias__stage" ref={palcoRef}>
              {experiencias.map((experiencia) => (
                <BlocoExperiencia key={experiencia.id} experiencia={experiencia} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
