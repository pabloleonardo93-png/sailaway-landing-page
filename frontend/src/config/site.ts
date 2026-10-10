export const planningUrl = '#captacao'

export const navigation = [
  { label: 'Experiências', href: '#experiencias' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Sobre', href: '#sobre' },
] as const

/** Sem variantes, os dois breakpoints usam o mesmo MP4 oficial. */
export const heroVideo: { default: string; desktop?: string; mobile?: string } = {
  default: `${import.meta.env.BASE_URL}videos/hero-sailaway-10s-1080p-web.mp4`,
}

export type InteresseCaptacao = 'planejamento-viagem' | 'socio-membro' | 'outras-duvidas'

export type DadosCaptacao = {
  nome: string
  whatsapp: string
  email: string
  interesse: InteresseCaptacao
}

const numeroWhatsAppOficial = '5551991976077'
const mensagemWhatsAppOficial = 'Olá! Gostaria de conhecer melhor a SAILAWAY e entender como funciona a proposta de vocês.'

export function criarLinkWhatsApp(mensagem: string) {
  return 'https://wa.me/' + numeroWhatsAppOficial + '?text=' + encodeURIComponent(mensagem)
}

export const whatsappOficial = {
  numero: numeroWhatsAppOficial,
  mensagem: mensagemWhatsAppOficial,
  link: criarLinkWhatsApp(mensagemWhatsAppOficial),
} as const

export const contato: {
  whatsapp: string | undefined
  instagram: string | undefined
  email: string | undefined
} = {
  whatsapp: whatsappOficial.link,
  instagram: 'https://www.instagram.com/sailaway.tur/',
  email: undefined,
}

export const avisoAtuacao: string | undefined = undefined
