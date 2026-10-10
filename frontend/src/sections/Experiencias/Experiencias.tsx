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
    frase: 'Vamos tirar sua viagem do papel?',
    descricao: 'Já sabe para onde quer ir ou ainda está escolhendo? Conte pra gente o que tem em mente. A SAILAWAY ajuda você a organizar seus planos e avaliar as opções para sua próxima viagem.',
  },
  {
    id: 'praias-resorts',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/praias-resorts.webp',
    descricaoImagem: 'Piscina de um resort à beira-mar, com espreguiçadeiras e palmeiras.',
    categoria: 'Roteiros personalizados',
    frase: 'Sua viagem, do seu jeito.',
    descricao: 'Tem quem prefira passar uns dias na praia. Outros gostam de cruzeiros ou de conhecer vários lugares na mesma viagem. A SAILAWAY ajuda a montar um roteiro levando em conta suas preferências, o tempo disponível e quanto você pretende gastar.',
  },
  {
    id: 'romance',
    imagem: import.meta.env.BASE_URL + 'images/experiencias/romance.webp',
    descricaoImagem: 'Casal caminhando por um caminho de pedra junto à costa ao pôr do sol.',
    categoria: 'Seja um sócio-membro',
    frase: 'Quer fazer parte da SAILAWAY?',
    descricao: 'Você também pode conhecer nossa proposta de participação como membro. Entre em contato, entenda como funciona a adesão, conheça as condições e tire suas dúvidas antes de decidir.',
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
          <p className="experiencias__intro">
            Tem viagem que pede mar aberto. Outras, alguns dias sem pressa. A SAILAWAY ajuda você a encontrar uma experiência que faça sentido para o que deseja viver agora.
          </p>
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
