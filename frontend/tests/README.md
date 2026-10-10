# Validação do formulário de Captação

Execute na pasta `frontend`, com Node 24:

```powershell
node --test tests/captacao.test.ts
```

Os testes usam o executor nativo do Node e dados fictícios. Não abrem conversas nem enviam mensagens.

## Política de entrada

- Nome: obrigatório, com espaços externos removidos e até 120 unidades UTF-16. O limite deixa espaço para nomes compostos e internacionais sem permitir entradas de milhares de caracteres.
- E-mail: obrigatório, com espaços externos removidos e até 254 unidades UTF-16 no endereço completo. O formato é verificado, sem afirmar que a caixa postal existe.
- Os limites são conferidos na edição e no envio. Os campos preservam colagens completas e exibem erro, em vez de usar um corte automático por `maxLength`.
- Controles Unicode das categorias Cc, Cf e Cs, além dos separadores de linha e parágrafo Zl e Zp são rejeitados, incluindo controles direcionais e sequências Unicode malformadas. ZWNJ (U+200C) e ZWJ (U+200D) são preservados, pois podem integrar nomes em persa e escritas indianas. Acentos, marcas combinantes e caracteres fora do alfabeto latino são preservados.
- Na mensagem completa, somente as quebras de linha LF do modelo são permitidas. Os dados individuais não aceitam controles.
- Telefone: continua usando os metadados completos de `libphonenumber-js`, país selecionado e número internacional normalizado.

## Orçamento do link

A mensagem tem limite de 1.000 unidades UTF-16, e a URL codificada tem limite de 4.096 caracteres. São limites internos para manter o link pequeno e detectar crescimento inesperado, não limites oficiais garantidos pelo WhatsApp. Os testes incluem dados internacionais nos limites dos campos. Excesso gera erro, sem truncar ou omitir dados.

A codificação com `encodeURIComponent` preserva os caracteres e separadores da URL; não criptografa os dados. O número de destino e a geração do link permanecem em `site.ts`.

## CI

O workflow mantém `npm ci`, lint e build, executa estes testes e usa `npm audit --audit-level=high` em toda a árvore de dependências. Vulnerabilidades HIGH ou CRITICAL interrompem o CI, tanto em produção quanto em desenvolvimento. Indisponibilidade do registry também causa falha e não equivale a uma auditoria sem vulnerabilidades. O script de build já executa TypeScript antes do Vite, evitando repetir a verificação no CI.
