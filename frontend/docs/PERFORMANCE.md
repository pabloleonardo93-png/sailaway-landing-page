# Performance e preservação visual

## Alteração local da Fase 5

A landing usa `public/images/logo/sailaway-logo-header-horizontal-lossless.png` no cabeçalho e no rodapé. A variante tem os mesmos 1813×368 pixels RGBA do PNG oficial, sem redimensionamento ou quantização. Foram mantidos os dados sRGB, gamma e resolução física do original. O tamanho passou de 384.502 para 291.181 bytes, uma redução de 93.321 bytes (24,27%) por transferência do recurso. Dimensões HTML, CSS, prioridade e carregamento continuam iguais.

O original `sailaway-logo-header-horizontal.png` permanece preservado. Ele não é solicitado automaticamente pela landing; também serve de referência para o teste de equivalência. Preservá-lo aumenta o armazenamento publicado em 291.181 bytes, mas não duplica seu download normal. Não existe processamento de imagens no build ou dependência nova. O PNG final pronto é copiado pelo Vite, como os demais assets.

`tests/e2e/logo.spec.ts` compara os pixels decodificados dos dois arquivos no Chromium, nas seis resoluções, e verifica os consumidores reais e a redução de bytes. Os 28 testes originais e as 30 referências não foram alterados; com os seis novos casos, `npm run test:ui` executa 34 testes.

## Medição reproduzível

Depois de instalar as dependências e o Chromium compatível com o Playwright, executar na pasta `frontend`, sem outro build ou suíte de navegador simultânea:

```powershell
npm run build
$env:REPETICOES = '5'
$env:PERFORMANCE_DESTINO = 'minha-medicao/performance.json'
npm run test:performance
```

O resultado fica em `.cache/minha-medicao/performance.json`, fora do versionamento. Para comparar com uma cópia anterior de `dist` preservada em `.cache/controle/dist`, definir `PERFORMANCE_DIST=controle/dist`. Remover essa variável para medir o build atual. Manter navegador, máquina, parâmetros, número de amostras e condições de carga iguais nas duas séries. Detalhes dos perfis e limitações estão em [testes de navegador](../tests/e2e/README.md#performance).

As métricas são locais: Chromium headless, DPR 1, contextos novos, cache desabilitado, sem interações nem navegação externa. Desktop 1440×900 e viewport mobile 390×844 observam 6 segundos; o mobile limitado observa 20 segundos com CPU 4×, latência de 150 ms e 200.000 bytes/s. Vídeos e animações permanecem ativos. Transferências de mídia podem continuar após a janela; bytes parciais não demonstram economia de download total.

Comparar medianas e intervalos, mantendo as amostras individuais. FCP/LCP locais não equivalem a dados de usuários reais. O último candidato LCP da janela não garante o instante final da apresentação da Hero. O excesso de tarefas longas após FCP não é TBT Lighthouse. O instante observável de inicialização não isola a hidratação React. Não há medição de INP de campo, Lighthouse ou entrega real da Cloudflare nesta infraestrutura.

## Decisões conservadoras

- A telefonia mantém imports síncronos e `libphonenumber-js/max`. A preparação/validação é chamada durante digitação, colagem, blur, seleção de país e submit; a lista de países também depende da biblioteca na renderização SSG. Postergar o módulo exigiria um estado de disponibilidade e novos caminhos assíncronos. Não foi introduzida espera, validação alternativa ou dependência de rede na primeira interação.
- Não se criaram chunks apenas para eliminar o aviso de 500 kB. React, GSAP e telefonia continuam com consumidores reais. Os tamanhos dos módulos antes da minificação não são parcelas comprimidas do bundle.
- As duas fontes WOFF2 têm consumidores atuais e foram solicitadas uma vez por navegação medida. Não se removeram fontes ou preloads sem benefício demonstrado.
- Imagens de Experiências já participam da inicialização de geometria/scroll. Não se alterou sua disponibilidade para tentar reduzir bytes da janela inicial.
- Todos os vídeos, seus carregamentos e comportamentos, hooks de animação, CSS, SEO, SSG, 404 e arte social permanecem protegidos. Alterações futuras dessas áreas precisam respeitar as autorizações específicas.

Não houve redução do JavaScript nesta otimização: os dois caminhos mais longos da logo acrescentam 18 bytes ao bundle bruto. O aviso preexistente permanece. O ganho comprovado é a entrega menor do PNG sem perda de pixels; resultados de tempo devem sempre ser acompanhados da metodologia e dispersão.
