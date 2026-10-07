/** Preencha com o link oficial do WhatsApp quando o contato for definido. */
export const planningUrl: string | undefined = undefined
export const sobreUrl: string | undefined = undefined

export const navigation = [
  { label: 'inCruises', href: '#incruises' },
  { label: 'Viagens', href: '#viagens-passagens' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Sobre', href: '#sobre' },
] as const

/** Sem variantes, os dois breakpoints usam o mesmo MP4 oficial. */
export const heroVideo: { default: string; desktop?: string; mobile?: string } = {
  default: `${import.meta.env.BASE_URL}videos/hero-sailaway-ultra.mp4`,
}

export type InteresseCaptacao = 'incruises' | 'viagens-passagens' | 'ambos'

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
  whatsapp: planningUrl,
  instagram: undefined,
  email: undefined,
}

export const avisoAtuacao: string | undefined = undefined
