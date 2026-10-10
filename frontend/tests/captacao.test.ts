import assert from 'node:assert/strict'
import { test } from 'node:test'
import { interpretarWhatsApp, excedeComprimentoWhatsApp, emailValido, criarMensagemCaptacao, limitesCaptacao, validarNome, validarEmail, possuiControleUnicode, validarMensagemWhatsApp, validarUrlWhatsApp } from '../src/sections/Captacao/validacoesCaptacao.ts'

test('Brasil exige celular válido com DDD e onze dígitos nacionais', () => {
  for (const valor of ['', ' ', '119876543', '1198765432', '00123456789', '1132345678', '119876543210']) {
    assert.ok(interpretarWhatsApp(valor, 'BR').erro)
  }
  const nacional = interpretarWhatsApp('(11) 98765-4321', 'BR')
  assert.equal(nacional.numero, '+5511987654321')
  assert.equal(interpretarWhatsApp('+55 (11) 98765-4321', 'BR').numero, nacional.numero)
  assert.equal(interpretarWhatsApp('5511987654321', 'BR').numero, nacional.numero)
  assert.ok(interpretarWhatsApp('(11) 98765-4321 ramal 2', 'BR').erro)
})

test('excesso é identificado sem truncar números nacionais e internacionais', () => {
  assert.equal(excedeComprimentoWhatsApp('119876543210', 'BR'), true)
  assert.equal(excedeComprimentoWhatsApp('9'.repeat(300), 'BR'), true)
  assert.equal(excedeComprimentoWhatsApp('+55 (11) 98765-4321', 'BR'), false)
  assert.equal(excedeComprimentoWhatsApp('202555012300', 'US'), true)
  assert.ok(interpretarWhatsApp('9'.repeat(300), 'PT').erro)
})

test('validação internacional preserva país, DDI compartilhado e comprimentos distintos', () => {
  assert.equal(interpretarWhatsApp('+351 912 345 678', 'PT').numero, '+351912345678')
  assert.equal(interpretarWhatsApp('(202) 555-0123', 'US').numero, '+12025550123')
  assert.equal(interpretarWhatsApp('(416) 555-0123', 'CA').numero, '+14165550123')
  assert.ok(interpretarWhatsApp('(416) 555-0123', 'US').erro)
  assert.ok(interpretarWhatsApp('(202) 555-0123', 'CA').erro)
  assert.ok(interpretarWhatsApp('11987654321', 'PT').erro)
  assert.equal(interpretarWhatsApp('030 123456', 'DE').numero, '+4930123456')
})

test('e-mail exige nome e domínio completo, aceita espaços externos e endereços usuais', () => {
  for (const valor of ['', ' ', 'abc', 'abc@', 'abc@gmail', '@gmail.com', 'abc@@gmail.com', 'a b@gmail.com', 'abc@gmail..com', 'abc@-gmail.com']) {
    assert.equal(emailValido(valor), false)
  }
  for (const valor of ['contato@gmail.com', 'nome.sobrenome@empresa.com.br', '  nome+contato@empresa.com.br  ']) {
    assert.equal(emailValido(valor), true)
  }
})

test('mensagem mantém o modelo solicitado e os caracteres do visitante', () => {
  const mensagem = criarMensagemCaptacao({
    nome: 'Pessoa de Teste',
    whatsapp: '+5511987654321',
    email: 'teste+contato@exemplo.com.br',
    interesse: 'outras-duvidas',
  }, 'Tenho outras dúvidas')
  assert.equal(mensagem, [
    'Olá! Gostaria de entrar em contato com a SAILAWAY.',
    '',
    'Nome: Pessoa de Teste',
    'WhatsApp: +5511987654321',
    'E-mail: teste+contato@exemplo.com.br',
    'Assunto: Tenho outras dúvidas',
    '',
    'Quero saber mais sobre esse assunto.',
  ].join('\n'))
  assert.equal(decodeURIComponent(encodeURIComponent(mensagem)), mensagem)
})

test('nome obrigatório, espaços externos e limite de 120 sem truncamento', () => {
  for (const nome of ['', '  ', '\u200C\u200D']) assert.ok(validarNome(nome))
  assert.equal(validarNome('  Ana Maria  '), undefined)
  assert.equal(validarNome('A'.repeat(limitesCaptacao.nome)), undefined)
  assert.equal(validarNome('A'.repeat(limitesCaptacao.nome + 1)), 'Use até 120 caracteres no nome.')
  assert.ok(validarNome('A'.repeat(5000)))
})

test('nomes internacionais, acentos e junções legítimas são preservados', () => {
  for (const nome of ['José de Sá', "Ana D'Ávila", 'Anne-Marie', '李小龙', 'Ольга Иванова', 'محمد علي', 'علی\u200Cرضا', 'क्\u200Dष', 'Jose\u0301', '𠮷田']) {
    assert.equal(validarNome(nome), undefined, nome)
    assert.equal(possuiControleUnicode(nome), false)
  }
})

test('controles Unicode, controles direcionais e sequências malformadas são rejeitados', () => {
  for (const controle of ['\0', '\t', '\n', '\r', '\u007F', '\u0085', '\u061C', '\u200B', '\u200E', '\u200F', '\u2028', '\u2029', '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', '\u2060', '\u2066', '\u2067', '\u2068', '\u2069', '\uFEFF', '\uD800']) {
    assert.ok(validarNome('Ana' + controle + ' Silva'))
    assert.equal(emailValido('nome' + controle + '@exemplo.com'), false)
    assert.ok(interpretarWhatsApp('+5511987654321' + controle, 'BR').erro)
  }
  assert.ok(validarNome('\tAna'))
  assert.ok(validarNome('Ana\uFEFF'))
})

test('e-mail aceita 254, rejeita excesso e controles sem alterar o endereço', () => {
  const email = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.' + 'd'.repeat(61)
  assert.equal(email.length, 254)
  assert.equal(emailValido(email), true)
  assert.equal(validarEmail('  ' + email + '  '), undefined)
  assert.equal(validarEmail(email + 'd'), 'Use até 254 caracteres no e-mail.')
  assert.equal(emailValido(email + 'd'), false)
  assert.ok(validarEmail('a'.repeat(3000) + '@exemplo.com'))
  for (const valor of ['', 'abc', 'abc@', 'abc@gmail', '@gmail.com', 'abc@@gmail.com']) {
    assert.equal(validarEmail(valor), 'Informe um e-mail válido.')
  }
})

test('mensagem e URL possuem limites independentes e não descartam dados', () => {
  assert.equal(validarMensagemWhatsApp('A'.repeat(limitesCaptacao.mensagem)), undefined)
  assert.ok(validarMensagemWhatsApp('A'.repeat(limitesCaptacao.mensagem + 1)))
  assert.equal(validarUrlWhatsApp('a'.repeat(limitesCaptacao.url)), undefined)
  assert.ok(validarUrlWhatsApp('a'.repeat(limitesCaptacao.url + 1)))
  const mensagem = '界'.repeat(500)
  assert.equal(validarMensagemWhatsApp(mensagem), undefined)
  assert.ok(validarUrlWhatsApp('https://wa.me/destino?text=' + encodeURIComponent(mensagem)))
  assert.ok(validarMensagemWhatsApp('Nome: Ana\u202E'))
  assert.ok(validarMensagemWhatsApp('Nome: Ana\uD800'))
  assert.ok(validarMensagemWhatsApp('Nome: Ana\tSilva'))
  assert.equal(validarMensagemWhatsApp('Nome: Ana\nAssunto: Viagem'), undefined)
})

test('dados no limite mantêm o modelo e cabem nos orçamentos de mensagem e URL', () => {
  const nome = '界'.repeat(limitesCaptacao.nome)
  const email = 'a'.repeat(64) + '@' + '界'.repeat(63) + '.' + '界'.repeat(63) + '.' + '界'.repeat(61)
  assert.equal(validarNome(nome), undefined)
  assert.equal(validarEmail(email), undefined)
  const mensagem = criarMensagemCaptacao({
    nome, email, whatsapp: '+5511987654321', interesse: 'socio-membro',
  }, 'Quero saber como me tornar membro')
  const url = 'https://wa.me/destino?text=' + encodeURIComponent(mensagem)
  assert.equal(validarMensagemWhatsApp(mensagem), undefined)
  assert.equal(validarUrlWhatsApp(url), undefined)
  assert.ok(mensagem.includes(nome))
  assert.ok(mensagem.includes(email))
})

test('acentos e caracteres especiais chegam intactos ao parâmetro codificado', () => {
  const mensagem = criarMensagemCaptacao({
    nome: "José D'Ávila & Família",
    email: 'teste+contato@exemplo.com.br',
    whatsapp: '+351912345678',
    interesse: 'outras-duvidas',
  }, 'Tenho outras dúvidas')
  const url = new URL('https://wa.me/destino?text=' + encodeURIComponent(mensagem))
  assert.equal(url.searchParams.get('text'), mensagem)
  assert.equal(validarMensagemWhatsApp(mensagem), undefined)
  assert.equal(validarUrlWhatsApp(url.href), undefined)
  assert.equal(url.searchParams.size, 1)
})
