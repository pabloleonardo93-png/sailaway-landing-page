import { Header } from './components/Header/Header'
import { Hero } from './sections/Hero/Hero'
import { ViagensPassagens } from './sections/ViagensPassagens/ViagensPassagens'
import { Captacao } from './sections/Captacao/Captacao'
import { Institucional } from './sections/Institucional/Institucional'
import { ComoFunciona } from './sections/ComoFunciona/ComoFunciona'
import { Faq } from './sections/Faq/Faq'
import { Footer } from './sections/Footer/Footer'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Institucional />
        <ViagensPassagens />
        <ComoFunciona />
        <Captacao />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
