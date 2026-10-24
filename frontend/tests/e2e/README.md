# Baseline visual e funcional

A suíte usa Playwright Test 1.64.1, fixado como dependência de desenvolvimento. Ela não entra no bundle de produção. O Chromium compatível deve ser instalado novamente quando essa versão for atualizada.

## Execução

Na pasta `frontend`, com Node 24:

```powershell
npm ci
npx playwright install chromium --only-shell
npm run typecheck
npm run lint
npm test
npm run build
node scripts/verificar-integridade.mjs
npm run test:ui
npm run test:ssg
npm run test:estrito
npm run test:seo
```

O build precisa estar atualizado antes da suíte, que serve somente `frontend/dist` em `127.0.0.1:4173`. Obtenha as referências oficiais junto com os testes; não gere uma nova baseline na instalação. A porta precisa estar livre; não se reaproveita um servidor com build desconhecido. Execute as suítes em sequência, sem medições de performance simultâneas. Os comandos completos acima exigem o Chromium do Playwright, Node 24 e as dependências de desenvolvimento do lockfile; nenhuma dependência nova foi acrescentada para transportar as referências ou preparar o CI.

## Investigação de intermitências

Para repetir cinco execuções completas em série, preservando os resultados de todas elas:

```powershell
node scripts/repetir-testes-ui.mjs
```

O executor mantém os timeouts, asserts, seis projetos e zero retries da configuração. Ele copia relatório HTML, JSON, traces e capturas de cada execução para `.cache/testes-ui/repeticoes/<data>/rodada-<n>`. Registra também a memória livre do sistema a cada segundo, como contexto de diagnóstico, sem inferir uso de memória exclusivo do navegador. O processo termina com erro se qualquer rodada falhar; execuções posteriores aprovadas não apagam esse resultado. `UI_REPETICOES` aceita de 1 a 10, com padrão 5. Não execute simultaneamente análise de traces, builds, medições de performance ou outra suíte de navegador.

O executor força `--update-snapshots=none`: referência ausente é uma falha, não uma autorização para criá-la. Opções de atualização (`-u` e `--update-snapshots`) e de substituição dos destinos de evidências são rejeitadas.

Para investigar somente os casos mobile, com dez repetições por caso e sem trace:

```powershell
$env:UI_REPETICOES = '1'
node scripts/repetir-testes-ui.mjs landing.spec.ts --project=375x812 --project=390x844 --grep 'Experiências|CTAs' --repeat-each=10 --trace=off
```

Para coletar diagnóstico adicional em Experiências:

```powershell
$env:DIAGNOSTICAR_UI = '1'
node scripts/repetir-testes-ui.mjs landing.spec.ts --project=375x812 --project=390x844 --grep 'Experiências' --repeat-each=10 --trace=on
Remove-Item Env:DIAGNOSTICAR_UI
Remove-Item Env:UI_REPETICOES
```

Essa opção anexa caixas, estilos, fontes e recursos antes/depois da comparação, além de camadas de composição via CDP e uma captura natural sem o CSS auxiliar histórico da baseline. A coleta não modifica o DOM, não injeta CSS, não pausa vídeos, não controla GSAP, não substitui o assert visual e não tenta recuperar uma comparação reprovada. Ela tem custo de observação e deve ser identificada no relatório da execução. Não atualize as referências ou eleve tolerâncias para contornar intermitência. Resultados instáveis precisam de diagnóstico; uma rodada aprovada isolada não comprova estabilidade.

Todos os contextos bloqueiam requisições fora da origem local antes da navegação, bloqueiam Service Workers, interceptam `window.open` e cancelam cliques em âncoras externas. Uma solicitação externa inesperada falha no teste mesmo tendo sido bloqueada. A URL do destinatário real é apenas inspecionada; não existe navegação até ela. Os dados preenchidos são exemplos fictícios. O teste não controla o WhatsApp nem executa envio. Mantenha essas proteções mesmo ao depurar um teste que falhou.

Opcionalmente, para manter os binários de navegador dentro do workspace:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Resolve-Path ..) '.cache/playwright-browsers'
npx playwright install chromium --only-shell
```

A variável deve permanecer definida ao executar os testes. Não altere o navegador entre gerar e comparar uma referência.

## Referências e resultados

- Seis projetos: 375×812, 390×844, 768×1024, 1366×768, 1440×900 e 1920×1080.
- As 30 referências oficiais ficam em `tests/e2e/referencias/win32/<resolução>/`, relativas ao frontend, disponíveis para versionamento. `tests/e2e/referencias/manifesto.json` registra SHA-256, plataforma, Playwright e Chromium. São cópias idênticas às originais; as referências históricas em `.cache/testes-ui/referencias/` permanecem preservadas.
- As referências são específicas de plataforma porque fontes/rasterização variam entre Windows e Linux. A baseline local atual usa Windows.
- Resultados, traces e relatório HTML ficam em `.cache/testes-ui`, fora do Git.
- `updateSnapshots: 'none'` impede criação/atualização automática, inclusive de referências ausentes. `npm run test:ui:atualizar` é uma ferramenta explícita para mudanças futuras de baseline que exigem autorização e revisão visual separadas; não faz parte da instalação, homologação nem do CI. Não o execute para esconder falhas.
- `node scripts/verificar-integridade.mjs`, após o build, valida os 15 arquivos do contrato existente (incluindo os oito vídeos), suas cópias públicas em `dist/` e os 30 PNGs contra o manifesto. Referências ausentes, extras ou alteradas falham; o verificador não escreve nem gera arquivos.

Nas capturas, um estilo temporário oculta **somente os elementos de vídeo**, preservando a geometria e a camada de texto. Isso evita comparar frames de instantes diferentes. Arquivos, dimensões, source, enquadramento, primeiro frame, reprodução e progressão dos vídeos são verificados separadamente, antes das capturas. O CSS de produto não é alterado.

Os testes usam condições observáveis, polling com prazo máximo, término de animações finitas e progressos conhecidos. Não usam pausas fixas para decidir se a UI está pronta. As pausas da timeline, o scrub e as curvas aprovadas permanecem código de produto, não são desativados para passar testes.

`contrato-protegido.json` registra o commit original e hashes de todas as mídias de vídeo, poster do globo e fontes críticas de Hero/globo/hooks. Não regenere esse arquivo durante otimizações; qualquer divergência precisa de revisão explícita.

## Cobertura

- Hero: conteúdo, source original, primeiro frame, resolução/duração, loop/mute/inline, enquadramento e entrada.
- Institucional: conteúdo, quatro benefícios, grade e CTA abaixo/alinhado, coluna do globo e reprodução.
- Experiências: sticky, painel ativo, clip-path, escala/opacidade, retorno e saída.
- Como funciona: modo horizontal/vertical, marcadores/progresso e troca de breakpoint com retorno.
- CTAs: navegação, estabilidade geométrica do hover, camada/duração/cores, foco e movimento reduzido.
- Formulário: erro/foco, seleção de países por teclado, telefone, assunto e URL fictícia de WhatsApp.
- Menu mobile, Escape, FAQ, links internos, rodapé e WhatsApp flutuante.
- Erros de execução e mensagens de hidratação são falhas, mesmo se a tela parecer correta.

Os quatro cenários principais são executados nas seis resoluções (24 casos). Dois casos adicionais usam emulação de toque real e viewport mobile em 390×844: navegação local por toque e falha de carregamento do vídeo do globo (404 simulado localmente). Somente o erro HTTP deliberado desse recurso é permitido nesse último cenário; outros erros de console falham.

Um cenário adicional é executado em 390×844 e 1440×900: retém as fontes locais até os hooks iniciarem, libera o carregamento, verifica a geometria e testa a restauração de scroll ao voltar de uma âncora pelo histórico. Esses são os 28 casos originais. Com os seis testes de equivalência da logo, a suíte UI atual contém **34 testes**. O cenário de toque também troca entre retrato e paisagem emulados; as barras dinâmicas de aparelhos reais continuam fora dessa simulação.

Os projetos principais usam mouse/ponteiro fino mesmo em viewport estreita, para verificar hover nos layouts responsivos. A emulação touch é separada; não representa testes em aparelhos físicos. O foco e os controles são acionados pelo teclado, mas a suíte não substitui auditoria manual com leitor de tela.

O relatório HTML contém anexos de geometria, propriedades animadas antes/depois e durante uma transição, resultado do bloqueio de rede e capturas reais dos vídeos sem comparação de pixels. A referência visual de Experiências mostra o painel intermediário; a da timeline mostra um estado controlado de progresso. A suíte observa mudanças de clip-path, escala, opacidade, transform e marcadores, além da entrada/saída e troca de breakpoint. Não conta diretamente todas as instâncias internas de ScrollTrigger: equivalência visual e ausência de erros não provam ausência de todos os vazamentos possíveis.

## Performance

`npm run test:performance` serve o mesmo build em `127.0.0.1:4174` e grava `.cache/testes-ui/performance.json`. São três amostras por perfil, em contextos novos: desktop 1440×900, viewport mobile 390×844 e mobile limitado a CPU 4×, latência 150 ms e 200.000 bytes/s. DPR 1, navegador e locale iguais aos testes; `mobile=false` nesses perfis para manter as medidas CSS comparáveis. `REPETICOES` permite de 1 a 10 amostras, com padrão 3.

O cache é desabilitado via CDP. A janela de observação após o início da navegação dura 6 segundos nos perfis locais e 20 segundos no limitado; ela é uma condição da medição, não uma espera arbitrária para aprovar a interface. O script registra FCP, último LCP observado na janela, CLS por janelas de sessão, tarefas longas, recursos concluídos/pendentes e bytes observados. O excesso de tarefas acima de 50 ms após FCP é apenas um indicador local; não é uma pontuação Lighthouse/TBT padronizada nem INP de usuários reais. Não há interações nesse perfil e nenhum vídeo é alterado. Valores nulos e recursos pendentes devem ser reportados, não descartados.

`PERFORMANCE_DESTINO` permite arquivar uma série sem sobrescrever a anterior; `PERFORMANCE_DIST` permite medir uma cópia preservada de outro build. Ambos são caminhos relativos a `.cache/`, com validação para impedir saídas dessa pasta. Exemplo: `PERFORMANCE_DESTINO=fase-5/antes.json` e `PERFORMANCE_DIST=fase-5/dist-antes`. Sem essas variáveis, os caminhos anteriores continuam válidos. Use os mesmos parâmetros nas séries comparadas. A janela de 20 segundos não é diretamente comparável à coleta histórica de 10 segundos da Fase 1.

Também são registrados o custo acumulado de script/layout pelo CDP, memória livre do sistema, fontes prontas após o DOM e um instante observável de inicialização (Hero pronta, modo de Experiências definido e ARIA do FAQ aplicado). Este último é uma aproximação de prontidão, não uma medição isolada da duração da hidratação React. Custos acumulados incluem animações em execução durante a janela; não são INP nem tempo exclusivo de montagem.

`logo.spec.ts` complementa os 28 casos originais com seis verificações da logo: mesmo tamanho intrínseco, pixels decodificados idênticos no navegador, arquivo menor e ausência de solicitação automática do PNG original. O original continua disponível para preservação e para essa comparação; nenhuma referência visual é atualizada.

Execute performance depois dos testes funcionais, sem concorrência ou outras cargas pesadas. Observadores, interceptação e máquina local influenciam as medidas. Compare execuções com a mesma máquina, versão do navegador, perfil, janela e número de amostras. Nenhum ganho é inferido apenas a partir desta baseline.

## Limitações e revisão manual

Hashes de integridade são verificados antes dos cenários e devem ser reconferidos ao terminar. Revisão manual deve complementar a suíte para qualidade dos vídeos em movimento, fluidez percebida, leitores de tela, Safari/Firefox, aparelhos físicos, orientação com barras dinâmicas e restauração de histórico/BFCache. Resize cobre a troca entre os dois layouts; não equivale a todos esses cenários.

Não atualize referências para aprovar uma regressão. As verificações específicas de SSG/hidratação e StrictMode estão em [../ssg/README.md](../ssg/README.md); SEO e seus cenários de domínio estão em [../../docs/SEO.md](../../docs/SEO.md). Os scripts de performance são medições separadas, não validações obrigatórias do CI.

**H01: risco visual conhecido e aceito pelo usuário.** Na homologação, Experiências em 768×1024 divergiu em 1.062 pixels. A causa não foi definitivamente confirmada; não se declara correção. Não repetir sua investigação, alterar o produto, atualizar snapshots, aumentar tolerâncias ou adicionar skips/retries para obter aprovação. Se reaparecer, preservar a falha real do teste/job e registrar a ocorrência conhecida. Outras falhas devem ser avaliadas separadamente; a aceitação de H01 não autoriza chamar qualquer divergência nova de conhecida. As intermitências históricas em 375/390 px continuam documentadas nos relatórios anteriores.

## Integração contínua preparada localmente

O workflow existente mantém `push`, `pull_request` para `main`/`develop` e `workflow_dispatch`, `contents: read`, checkout sem credenciais persistidas e auditoria `npm audit --audit-level=high`. O único job foi adaptado para `windows-2022`, com Node 24, `npm ci` e `npx --no-install playwright install --with-deps --only-shell chromium`. Não instala Firefox/WebKit nem Chromium com interface; o navegador corresponde ao Playwright 1.64.1 do lockfile. As suítes rodam em sequência, um worker, zero retries. O passo final de integridade também roda após uma falha de testes, sem converter essa falha em sucesso. Não há deploy, escrita no repositório, upload de artefatos, matriz extra ou agendamento.

O runner Windows evita comparar a baseline `win32` como se fosse Linux. Não há baseline Linux aprovada: executar UI nesse sistema deve falhar por referência ausente, sem criar ou copiar referências para `linux`. O runner hospedado usa Windows Server 2022, enquanto a baseline foi criada no Windows 10.0.19045 com Node 24.10.0, Chromium 156.0.8078.4 e Playwright 1.64.1. Fixar o rótulo de sistema e as versões do lockfile reduz variação, mas não fixa a imagem inteira do runner, hardware, fontes de sistema ou revisão Node 24. A [documentação do Playwright](https://playwright.dev/docs/test-snapshots) explica que esses fatores afetam a renderização. A equivalência local/CI ainda exige uma execução real futura; **nenhum workflow remoto foi executado nesta tarefa e não há aprovação integral do CI**.

As reprovações aparecem no log e mantêm o job reprovado, inclusive H01. Os relatórios e traces gerados ficam no runner durante a execução; não há upload automático. Localmente, abra `npx playwright show-report ../.cache/testes-ui/relatorio`. Preparar a configuração não autoriza publicar, nem absorver diferenças do runner em novos snapshots sem revisão.

### Cotas e custo

Foi escolhido um único job para evitar duplicar instalações/builds e contratar serviços. Não há execuções agendadas, mas os gatilhos preservados podem executar tanto no push quanto no PR. A duração remota ainda não foi medida: após a primeira execução autorizada, some instalação, audit, build, suítes e arredondamento por job para estimar o consumo mensal. Não confunda a duração na máquina local com previsão do runner.

Segundo a [documentação de cobrança](https://docs.github.com/en/billing/concepts/product-billing/github-actions), runners padrão em repositórios públicos não consomem cobrança de minutos; repositórios privados dependem da franquia/plano e do uso total da conta. A [tabela consultada](https://docs.github.com/en/billing/reference/actions-runner-pricing) informa US$ 0,010/minuto para Windows x64 padrão e US$ 0,006/minuto para Linux x64 padrão, além da franquia aplicável: nesse tarifário, a razão de preço é aproximadamente 1,67, não uma promessa de multiplicador universal. O fator histórico de 2× para Windows não deve ser aplicado automaticamente a um contrato atual sem conferir a conta. Exemplo apenas aritmético: 20 minutos Windows cobrados seriam US$ 0,20 por execução nesse preço, sem prever que o job durará 20 minutos. Não se verificaram plano, visibilidade do repositório, saldo, orçamento ou limites reais. Não há garantia de custo zero ilimitado.
