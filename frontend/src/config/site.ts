export const planningUrl = '#captacao'

export const navigation = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Experiências', href: '#experiencias' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Sobre', href: '#sobre' },
] as const

/** Sem variantes, os dois breakpoints usam o mesmo MP4 oficial. */
export const heroVideo: { default: string; desktop?: string; mobile?: string } = {
  default: `${import.meta.env.BASE_URL}videos/hero-sailaway-ultra.mp4`,
}

export type InteresseCaptacao = 'cruzeiro' | 'viagem-hospedagem' | 'passagens' | 'viagem-personalizada' | 'ainda-nao-sei'

export type DadosCaptacao = {
  nome: string
  whatsapp: string
  email: string
  interesse: InteresseCaptacao
}

export const captacao: {
  enviar: ((dados: DadosCaptacao) => Promise<void>) | undefined
} = {
  enviar: undefined,
}

export const contato: {
  whatsapp: string | undefined
  instagram: string | undefined
  email: string | undefined
} = {
  whatsapp: undefined,
  instagram: undefined,
  email: undefined,
}

export const avisoAtuacao: string | undefined = undefined
