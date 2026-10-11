import { getCountryCallingCode, parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from 'libphonenumber-js/max'
import type { DadosCaptacao } from '../../config/site'

export const limitesCaptacao = {
  nome: 120,
  email: 254,
  mensagem: 1000,
  url: 4096,
} as const

export function possuiControleUnicode(valor: string) {
  return /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}]/u.test(valor.replace(/[\u200C\u200D]/gu, ''))
}

export function validarNome(valor: string) {
  if (!valor.replace(/[\u200C\u200D]/gu, '').trim()) return 'Informe seu nome.'
  if (possuiControleUnicode(valor)) return 'Digite seu nome sem caracteres de controle.'
  if (valor.trim().length > limitesCaptacao.nome) return 'Use até 120 caracteres no nome.'
  return undefined
}

export function validarEmail(valor: string) {
  if (valor.trim().length > limitesCaptacao.email) return 'Use até 254 caracteres no e-mail.'
  if (!emailValido(valor)) return 'Informe um e-mail válido.'
  return undefined
}

export function validarMensagemWhatsApp(mensagem: string) {
  if (possuiControleUnicode(mensagem.replace(/\n/gu, ''))) {
    return 'Confira os caracteres informados antes de continuar.'
  }
  if (mensagem.length > limitesCaptacao.mensagem) {
    return 'A mensagem ficou muito longa. Revise os dados informados.'
  }
  return undefined
}

export function validarUrlWhatsApp(url: string) {
  if (url.length > limitesCaptacao.url) {
    return 'O link ficou muito longo. Revise os dados informados.'
  }
  return undefined
}

export function excedeComprimentoWhatsApp(valor: string, codigo: CountryCode) {
  const digitos = valor.replace(/\D/g, '')
  const ddi = getCountryCallingCode(codigo)
  const nacional = valor.trim().startsWith('+') && digitos.startsWith(ddi)
    ? digitos.slice(ddi.length)
    : digitos
  const numeroParaMedir = valor.trim().startsWith('+') ? '+' + digitos : digitos
  return (codigo === 'BR' && nacional.length > 11)
    || validatePhoneNumberLength(numeroParaMedir, codigo) === 'TOO_LONG'
}

export function prepararEntradaWhatsApp(valor: string, codigo: CountryCode) {
  if (possuiControleUnicode(valor) || !/^\+?[\d () .\-\p{Zs}]*$/u.test(valor.trim())) {
    return { erro: 'Use apenas números, espaços, parênteses e hífens. O DDI só pode aparecer no início.' }
  }
  if (excedeComprimentoWhatsApp(valor, codigo)) {
    return { erro: 'Esse número tem dígitos demais.', limiteExcedido: true }
  }
  if (valor.trim().startsWith('+')) {
    const telefone = parsePhoneNumberFromString(valor, { extract: false })
    if (!telefone?.isValid()) {
      return { erro: 'Cole o telefone completo com DDI ou digite apenas o número nacional.' }
    }
    if (telefone.country !== codigo) {
      return { erro: 'Confira o número e o país selecionado.' }
    }
    return { valor: telefone.formatNational() }
  }
  return { valor }
}

export function interpretarWhatsApp(valor: string, codigo: CountryCode) {
  if (!valor.trim()) return { erro: 'Informe seu WhatsApp.' }
  const entrada = prepararEntradaWhatsApp(valor, codigo)
  if (entrada.erro) return { erro: entrada.erro }
  const telefone = parsePhoneNumberFromString(entrada.valor!, { defaultCountry: codigo, extract: false })
  if (!telefone?.isValid() || telefone.ext || telefone.number.length > 16) {
    return { erro: codigo === 'BR' ? 'Confira o DDD e o número.' : 'Número de WhatsApp inválido.' }
  }
  if (telefone.country !== codigo) return { erro: 'Confira o número e o país selecionado.' }
  if (codigo === 'BR' && (telefone.nationalNumber.length !== 11 || telefone.getType() !== 'MOBILE')) {
    return { erro: 'Confira o DDD e o número.' }
  }
  return { numero: telefone.number, formatado: telefone.formatNational() }
}

export function emailValido(valor: string) {
  const email = valor.trim()
  if (!email || email.length > limitesCaptacao.email || possuiControleUnicode(valor) || /\s/u.test(email)) return false
  const partes = email.split('@')
  if (partes.length !== 2 || !partes[0]) return false
  const dominios = partes[1].split('.')
  return dominios.length >= 2 && dominios.every((parte) => (
    /^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u.test(parte)
  ))
}

export function criarMensagemCaptacao(dados: DadosCaptacao, assunto: string) {
  return [
    'Olá! Gostaria de entrar em contato com a SAILAWAY.',
    '',
    'Nome: ' + dados.nome,
    'WhatsApp: ' + dados.whatsapp,
    'E-mail: ' + dados.email,
    'Assunto: ' + assunto,
    '',
    'Quero saber mais sobre esse assunto.',
  ].join('\n')
}
