# Validação de SSG e hidratação

Execute após `npm ci`, instalação do Chromium e `npm run build`, com Node compatível com o Vite instalado. Use o mesmo navegador e ambiente da baseline da Fase 1.

```bash
npm run typecheck
npm run lint
npm test
npm run test:ui
npm run test:ssg
npm run test:estrito
```

Os testes originais permanecem separados e inalterados. A suíte SSG usa o build estático de produção, servido localmente em 127.0.0.1:4173, nas seis resoluções da baseline. São 16 casos: dois por resolução, mais dois cenários de compatibilidade em 390×844 e 1440×900. As comparações verificam o HTML HTTP real, leitura sem JavaScript, nós idênticos antes/depois da hidratação, geometria da Hero, contagem das seções e eventos do FAQ. A retenção do JavaScript e das fontes termina por condição explícita, sem atrasos arbitrários. O teste do ano simula a data do navegador no ano seguinte ao do HTML gerado para detectar dependência do relógio do visitante.

Há mais dois casos no Vite de desenvolvimento. Eles abrem primeiro a página real, validando a entrada de desenvolvimento, e depois uma página de teste separada. A sonda importa o App real em StrictMode e observa a repetição dos efeitos, limpeza, desmontagem, remontagem, transições reais de Experiências e resize. O registro público de ScrollTrigger precisa ter uma única instância de `experiencias-sailaway` durante o uso e nenhuma após desmontar. A leitura dos listeners de scroll e resize pelo CDP verifica a ausência de crescimento após a remontagem, sem substituir os callbacks reais. Isso complementa os testes de hidratação do bundle de produção; não injeta uma sonda no site publicado.

Todas as suítes reutilizam a interceptação da Fase 1: recursos externos são bloqueados antes da navegação, `window.open` é simulado e links externos são interceptados. Não há envio de mensagens ou abertura de conversas. Os testes SSG não atualizam snapshots, tolerâncias ou o contrato dos 15 arquivos protegidos.

Relatórios JSON, traces de falha e screenshots ficam em `.cache/fase-3/`. As capturas sem JavaScript mostram o conteúdo em fluxo natural; as capturas anteriores à hidratação observam a página real com seus estilos e animações. Não há máscara adicional, CSS artificial, desativação global de animações ou modificação dos vídeos.

A verificação de identidade dos nós detecta substituição da raiz pelo React, enquanto erros de console e exceções são reprovados pelo fixture compartilhado. A igualdade da geometria antes/depois protege a primeira viewport com fontes prontas; não representa uma medição de Core Web Vitals de usuários reais. Os 28 testes originais continuam responsáveis pela progressão detalhada de GSAP, timeline, vídeos, formulário e CTAs. As diferenças intermitentes já documentadas de rasterização de texto em Experiências mobile continuam sendo uma limitação conhecida e devem ser analisadas junto à geometria e aos estados, sem regenerar referências.
