import { useState, type CSSProperties } from 'react'
import { useScrollExperiencias } from './useScrollExperiencias'
import './Experiencias.css'

type Experiencia = {
  id: string
  categoria: string
  frase: string
  imagem: string
  descricaoImagem: string
}

const experiencias: Experiencia[] = [
  {
    id: 'cruzeiros',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/cruzeiros.webp',
    descricaoImagem: 'Deck de um navio com espreguiçadeiras, passageiros e vista para o mar ao pôr do sol.',
    categoria: 'CRUZEIROS',
    frase: 'O horizonte muda todos os dias.',
  },
  {
    id: 'praias-resorts',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/praias-resorts.webp',
    descricaoImagem: 'Piscina de um resort à beira-mar, com espreguiçadeiras e palmeiras.',
    categoria: 'PRAIAS & RESORTS',
    frase: 'Dias de descanso, mar e tempo para aproveitar.',
  },
  {
    id: 'romance',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/romance.webp',
    descricaoImagem: 'Casal caminhando por um caminho de pedra junto à costa ao pôr do sol.',
    categoria: 'ROMANCE',
    frase: 'Viagens pensadas para viver a dois.',
  },
  {
    id: 'familia',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/familia.webp',
    descricaoImagem: 'Uma criança e dois adultos caminham pela areia junto ao mar.',
    categoria: 'FAMÍLIA',
    frase: 'Experiências para criar boas lembranças juntos.',
  },
]

function BlocoExperiencia({ experiencia, indice }: { experiencia: Experiencia; indice: number }) {
  const [imagemIndisponivel, setImagemIndisponivel] = useState(false)
  const { id, categoria, frase, imagem, descricaoImagem } = experiencia

  return (
    <article
      className={'experiencia experiencia--' + id}
      aria-labelledby={'experiencia-' + id}
      style={{ '--experience-index': indice } as CSSProperties}
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
        <div className="experiencia__overlay" aria-hidden="true" />
      </div>
      <div className="experiencia__content">
        <h3 className="experiencia__category" id={'experiencia-' + id}>{categoria}</h3>
        <p className="experiencia__phrase">{frase}</p>
      </div>
    </article>
  )
}

export function Experiencias() {
  const { percursoRef, palcoRef } = useScrollExperiencias(experiencias.length)

  return (
    <section className="experiencias" id="experiencias" aria-labelledby="experiencias-titulo">
      <div className="experiencias__inner">
        <p className="experiencias__eyebrow">EXPERIÊNCIAS SAILAWAY</p>
        <div className="experiencias__heading">
          <h2 className="experiencias__title" id="experiencias-titulo">
            Qual viagem combina<br />com o seu momento?
          </h2>
          <p className="experiencias__intro">
            Tem viagem que pede mar aberto. Outras, alguns dias sem pressa. A SAILAWAY ajuda você a encontrar uma experiência que faça sentido para o que deseja viver agora.
          </p>
        </div>
      </div>
      <div
        className="experiencias__scroll"
        ref={percursoRef}
        style={{ '--experience-count': experiencias.length } as CSSProperties}
      >
        <div className="experiencias__inner experiencias__grid" ref={palcoRef}>
          {experiencias.map((experiencia, indice) => (
            <BlocoExperiencia key={experiencia.id} experiencia={experiencia} indice={indice} />
          ))}
        </div>
      </div>
    </section>
  )
}
