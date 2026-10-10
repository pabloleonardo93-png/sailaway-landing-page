import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max'

const paises: { codigo: CountryCode; nome: string }[] = [
  { codigo: 'BR', nome: 'Brasil' },
  { codigo: 'PT', nome: 'Portugal' },
  { codigo: 'US', nome: 'Estados Unidos' },
  { codigo: 'CA', nome: 'Canadá' },
  { codigo: 'AR', nome: 'Argentina' },
  { codigo: 'UY', nome: 'Uruguai' },
  { codigo: 'PY', nome: 'Paraguai' },
  { codigo: 'CL', nome: 'Chile' },
  { codigo: 'ES', nome: 'Espanha' },
  { codigo: 'GB', nome: 'Reino Unido' },
  { codigo: 'FR', nome: 'França' },
  { codigo: 'IT', nome: 'Itália' },
  { codigo: 'DE', nome: 'Alemanha' },
  { codigo: 'CO', nome: 'Colômbia' },
  { codigo: 'MX', nome: 'México' },
]

export const paisesWhatsApp = paises.map((pais) => ({
  ...pais,
  ddi: '+' + getCountryCallingCode(pais.codigo),
  bandeira: `${import.meta.env.BASE_URL}images/paises/${pais.codigo.toLowerCase()}.svg`,
}))

export function interpretarWhatsApp(valor: string, codigo: CountryCode) {
  const nomePais = paisesWhatsApp.find((item) => item.codigo === codigo)?.nome ?? codigo
  const telefone = parsePhoneNumberFromString(valor, { defaultCountry: codigo, extract: false })

  if (!valor.trim()) return { erro: 'Informe seu WhatsApp.' }
  if (!telefone?.isValid() || telefone.ext) {
    return { erro: `Informe um número de WhatsApp válido para ${nomePais}.` }
  }
  if (telefone.country !== codigo) {
    return { erro: `Confira o número e o país selecionado (${nomePais}).` }
  }

  return { numero: telefone.number, formatado: telefone.formatNational() }
}

export function detectarPaisWhatsApp(valor: string) {
  if (!valor.trim().startsWith('+')) return undefined
  const telefone = parsePhoneNumberFromString(valor, { extract: false })
  if (!telefone?.isValid()) return undefined
  return paisesWhatsApp.find((pais) => pais.codigo === telefone.country)
}

export function pesquisarPaisesWhatsApp(pesquisa: string) {
  const consulta = pesquisa.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  if (/^[+\d\s]+$/.test(consulta)) {
    const digitos = consulta.replace(/\D/g, '')
    return paisesWhatsApp.filter((pais) => pais.ddi.slice(1).startsWith(digitos))
  }
  return paisesWhatsApp.filter((pais) => (
    `${pais.nome} ${pais.codigo}`.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().includes(consulta)
  ))
}
