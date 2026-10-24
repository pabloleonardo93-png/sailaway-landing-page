# SAILAWAY Landing Page

Landing page responsiva da SAILAWAY, desenvolvida para apresentar a marca, o planejamento de viagens, experiências e a rede de membros.

## Sobre o projeto

O site apresenta a proposta da SAILAWAY e reúne um formulário para identificar o interesse do visitante e preparar um contato pelo WhatsApp. Não realiza venda direta de viagens. O build gera HTML estático com SSG, e o React hidrata a página no navegador. Não há SSR por requisição.

## Tecnologias

- React 19 e TypeScript
- Vite 8
- CSS convencional por componente
- GSAP e ScrollTrigger para as animações de Experiências
- `libphonenumber-js/max` para validação de telefones
- Oxlint para verificação do código
- Playwright Test para regressão visual e funcional, somente em desenvolvimento

## Principais áreas

- Header e Hero com vídeo de fundo.
- Apresentação da SAILAWAY, quatro benefícios e globo em vídeo, no componente Institucional.
- Galeria editorial de Experiências, no componente ViagensPassagens.
- Como funciona, com timeline horizontal no desktop e apresentação vertical no mobile.
- Captação de interesse com Nome, WhatsApp, E-mail e opções de planejamento de viagem, rede de membros ou outras dúvidas.
- FAQ / Dúvidas frequentes.
- Footer com vídeo de fundo e navegação interna.

## Executando localmente

Utilize Node.js 24 e npm. A baseline local de testes foi criada com Node 24.10.0 e npm 11.6.1. A partir da raiz do repositório:

```bash
cd frontend
npm ci
npm run dev
```

O Vite informa no terminal o endereço para acessar a aplicação.

## Formulário e WhatsApp

O formulário está implementado em `frontend/src/sections/Captacao/`. Ele não grava dados em um backend próprio nem envia e-mail.

1. O visitante informa Nome, WhatsApp com país selecionado, E-mail e um dos assuntos disponíveis.
2. A validação ocorre no frontend. Nome é obrigatório e limitado a 120 caracteres; E-mail precisa ter formato válido e respeitar o limite de 254 caracteres. Caracteres de controle inadequados são rejeitados.
3. O telefone é interpretado com os metadados completos de `libphonenumber-js/max`, considerando país, DDI e comprimento. Para o Brasil, exige celular válido com DDD e onze dígitos nacionais. O seletor permite pesquisar os 15 países configurados por nome, código ou DDI. Essa validação não consulta se o número possui conta no WhatsApp.
4. Se houver erros, a interface mostra as mensagens e direciona o foco ao primeiro campo inválido. Nenhum link de conversa é aberto nessa condição.
5. Com dados válidos, `criarMensagemCaptacao` monta a mensagem com Nome, telefone em formato internacional, E-mail e assunto. A mensagem e a URL também passam pelos limites de 1.000 e 4.096 caracteres, respectivamente.
6. `criarLinkWhatsApp`, em `frontend/src/config/site.ts`, gera `https://wa.me/<numero-oficial>?text=<mensagem-codificada>` usando `encodeURIComponent`. O destinatário é o número oficial configurado, não o telefone informado pelo visitante.
7. O formulário solicita a abertura do link em nova aba com `noopener,noreferrer` e exibe um link alternativo caso a abertura seja bloqueada. O visitante confere a mensagem e confirma o envio no WhatsApp; a aplicação não envia a mensagem automaticamente.

As regras de validação e a construção do texto ficam em `validacoesCaptacao.ts`; a lista e a pesquisa de países ficam em `paisesWhatsApp.ts`. O campo de telefone e suas interações ficam em `CampoWhatsApp.tsx`.

## Configuração dos contatos

O ponto de configuração é `frontend/src/config/site.ts`:

- `planningUrl`: destino dos CTAs de planejamento, atualmente a âncora local `#captacao`.
- `numeroWhatsAppOficial` e `mensagemWhatsAppOficial`: destinatário e mensagem padrão dos contatos diretos.
- `criarLinkWhatsApp` e `whatsappOficial`: construção e reutilização do link oficial pelo formulário, rodapé e WhatsApp flutuante.
- `contato`: canais apresentados no rodapé. WhatsApp e Instagram (`@sailaway.tur`) já estão configurados; E-mail permanece `undefined`.
- `avisoAtuacao`: texto opcional do rodapé, atualmente `undefined`.

O rodapé filtra canais sem URL e só apresenta o aviso quando há texto. Não é necessário preencher canais opcionais para o formulário funcionar. Evite duplicar o número oficial nos componentes.

## Verificações, testes e build

A partir da raiz do repositório:

```bash
cd frontend
npm run lint
npm test
npm run typecheck
npm run build
```

`npm test` executa os 18 testes existentes do formulário, telefone, mensagem e URL. `npm run typecheck` verifica a aplicação, as configurações e os testes TypeScript. O build também verifica o TypeScript da aplicação e gera os arquivos estáticos com SSG em `frontend/dist/`.

Para visualizar o build localmente, também a partir da raiz do repositório:

```bash
cd frontend
npm run preview
```

### Regressão visual e funcional com Playwright

Após instalar as dependências, execute na pasta `frontend`:

```bash
npx playwright install chromium --only-shell
npm run build
npm run test:ui
```

A suíte inicia seu próprio servidor local do build de produção em `127.0.0.1:4173`; a porta precisa estar livre. São **34 testes de interface: 28 originais e seis de equivalência da logo**, cobrindo Hero, globo, Experiências, timeline, CTAs, formulário, menu, FAQ, rodapé, fontes tardias e histórico. A matriz inclui 375×812, 390×844, 768×1024, 1366×768, 1440×900 e 1920×1080, com cenários adicionais de toque e movimento reduzido.

Os testes usam dados fictícios e bloqueiam navegação externa antes da interação. A abertura do WhatsApp é interceptada; nenhuma conversa ou mensagem real deve ser aberta ou enviada durante os testes. Preserve essas proteções.

As 30 referências oficiais ficam em `frontend/tests/e2e/referencias/win32/<resolução>/`, com hashes em `manifesto.json` no diretório `referencias`, e estão disponíveis para futuro versionamento. São cópias binariamente idênticas às referências históricas preservadas em `.cache/testes-ui/referencias/`. Capturas de execução, traces e relatórios continuam em `.cache/testes-ui/`, ignorada pelo Git. Uma instalação nova deve obter as referências oficiais junto com os testes, sem regenerá-las. A configuração usa `updateSnapshots: 'none'`: ausência ou divergência reprova o teste. Não use `test:ui:atualizar` durante homologação ou CI. As referências são específicas de plataforma e navegador.

Para instalar e usar o navegador dentro do workspace, em PowerShell na pasta `frontend`:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Resolve-Path ..) '.cache/playwright-browsers'
npx playwright install chromium --only-shell
npm run test:ui
```

Mantenha a variável definida ao executar os testes nesse ambiente. Os vídeos são verificados por propriedades, reprodução e hashes; nas comparações de imagens, seus frames variáveis são ocultados temporariamente, sem alterar as mídias ou o CSS de produção.

Para abrir o relatório local:

```bash
npx playwright show-report ../.cache/testes-ui/relatorio
```

O workflow `.github/workflows/ci.yml` está preparado localmente para executar lint, TypeScript, testes unitários, build, integridade, SSG, StrictMode, SEO e os 34 testes UI em um único job `windows-2022`, Node 24 e Chromium headless do Playwright fixado no lockfile. Não há comparação das referências Windows em Linux, matriz adicional, agendamento ou publicação. A compatibilidade exata com o runner e o resultado remoto ainda dependem de execução futura autorizada no GitHub; preparar o YAML não significa CI aprovado.

**H01 — risco visual conhecido e aceito:** o snapshot de Experiências em 768×1024 apresentou 1.062 pixels divergentes na homologação. A causa não foi definitivamente confirmada. A aceitação do usuário não altera o assert: se ocorrer novamente, o teste e o job devem reprovar, sem atualização de referência, tolerância maior, skip, retry ou `continue-on-error`. Registre separadamente qualquer falha nova; não suponha que toda divergência seja H01. Condições, custos e limitações estão em [frontend/tests/e2e/README.md](frontend/tests/e2e/README.md).

### Medição local de performance

```bash
npm run build
npm run test:performance
```

O script serve o build em `127.0.0.1:4174` e registra três amostras por perfil desktop, mobile e mobile com CPU/rede limitadas em `.cache/testes-ui/performance.json`. Execute sem testes concorrentes. São medições locais de referência, não métricas de usuários reais nem pontuações Lighthouse. Detalhes e parâmetros estão na documentação dos testes.

## Estrutura

A aplicação fica em `frontend/`. O README e o `.gitignore` principal ficam na raiz do repositório.

- `frontend/src/sections/`: seções da landing page.
- `frontend/src/components/`: componentes compartilhados, como Header e Button.
- `frontend/src/styles/`: estilos globais, variáveis visuais e animações.
- `frontend/src/config/site.ts`: navegação, vídeo da Hero, contatos e construção do link WhatsApp.
- `frontend/src/App.tsx`: composição e ordem das seções.
- `frontend/src/entry-server.tsx`: renderização dos componentes reais em HTML durante o build.
- `frontend/scripts/construir-ssg.mjs`: builds do cliente e da entrada Node, verificações do conteúdo e gravação do HTML final.
- `frontend/public/`: imagens, vídeos e fontes locais.
- `frontend/tests/captacao.test.ts`: os 18 testes existentes de validação e construção da mensagem/link.
- `frontend/tests/e2e/`: suíte Playwright e documentação da baseline.
- `frontend/playwright.config.ts`: matriz e servidor dos testes de navegador.
- `frontend/scripts/medir-performance.mjs`: coleta local de performance.

## Status

Projeto em desenvolvimento, com contato pelo WhatsApp configurado e validação no frontend. E-mail e aviso de atuação são opcionais e ainda não estão preenchidos. A baseline, o SSG com hidratação e o SEO técnico estão disponíveis localmente. A ativação das URLs públicas aguarda o domínio próprio aprovado. A Fase 5 acrescenta uma variante PNG da logo sem perdas, preservando o original e todos os efeitos; consulte [frontend/docs/PERFORMANCE.md](frontend/docs/PERFORMANCE.md) para os limites e comandos de comparação. A suíte UI mantém os 28 casos anteriores e acrescenta seis verificações de equivalência da logo (34 no total).

`AGENTS.md`, arquivos de ambiente reais, dependências instaladas e artefatos gerados permanecem fora do versionamento. `frontend/.env.example` documenta a configuração sem credenciais ou domínio inventado.

## HTML estático e hidratação React

`npm run build` verifica o TypeScript, gera os assets do navegador com Vite e compila uma entrada Node temporária. Essa entrada executa `renderToString` sobre o mesmo `App` e insere seu HTML no template gerado pelo Vite. O build falha se o template, as seções obrigatórias, os quatro benefícios, as seis respostas do FAQ ou o H1 estiverem ausentes.

No navegador, o build de produção utiliza `hydrateRoot`, preservando o HTML existente. Erros recuperáveis de hidratação são registrados no console, sem ocultação de avisos. A ausência do HTML pré-renderizado é um erro explícito; não existe fallback silencioso para CSR. `npm run dev` continua usando `createRoot` para o ambiente de desenvolvimento e HMR.

O ano do rodapé é o ano UTC da geração, incorporado igualmente ao HTML e ao JavaScript. Refaça o build para atualizar o ano; o relógio do visitante não altera o texto durante a hidratação. No desenvolvimento, o Vite define o ano ao iniciar. Sem JavaScript, todas as respostas do FAQ ficam abertas pelo estilo em `noscript`; após a hidratação, o acordeão mantém o estado e o comportamento originais.

O artefato de publicação continua sendo apenas `frontend/dist/`, contendo HTML, CSS, JavaScript e os assets públicos originais. A entrada Node fica em `frontend/node_modules/.cache/sailaway-ssg/`, fora da publicação. Node é necessário no build; não há SSR por requisição, servidor Node em produção, Worker ou Pages Function.

Após `npm ci` e `npm run build`, execute na pasta `frontend`:

```bash
npm test
npm run test:ui
npm run test:ssg
npm run test:estrito
```

`test:ssg` complementa a suíte UI (28 testes originais + seis da logo) com HTML sem JavaScript, carregamento atrasado do JavaScript, identidade dos nós durante a hidratação, geometria, fontes tardias, âncora inicial, histórico, ano determinístico, resize e movimento reduzido. `test:estrito` usa exclusivamente uma página de teste no Vite de desenvolvimento para verificar a repetição dos efeitos em StrictMode, desmontagem, remontagem e ausência de ScrollTriggers duplicados. As suítes usam a mesma porta local sequencialmente; não as execute em paralelo. Evidências ficam em `.cache/fase-3/`, ignorada pelo Git. Mais detalhes em [frontend/tests/ssg/README.md](frontend/tests/ssg/README.md).

## SEO técnico e domínio futuro

O build gera metadados sociais, `robots.txt` e uma página `404.html` estática. Canonical, sitemap público, `og:url` e JSON-LD `WebSite` só são ativados na produção com `SEO_SITE_URL` explicitamente configurado e válido. Sem domínio aprovado, não há URL fictícia ou `noindex` global na produção atual. Previews mantêm a proteção nativa da Cloudflare e recebem meta `noindex` complementar.

A imagem social oficial aprovada está preparada em JPEG 1200×630; suas URLs só são emitidas no build de produção com domínio aprovado configurado. Sem domínio ou em Preview, não há URL fictícia de imagem. Não há analytics, Worker, servidor em runtime ou alteração dos headers existentes. Consulte [frontend/docs/SEO.md](frontend/docs/SEO.md) para a matriz de ambientes, origem da arte, validações, limitações do teste local de 404 e procedimento de ativação futura.

Após `npm run build`, na pasta `frontend`, execute `npm run test:seo`. A suíte cria builds com URL sintética exclusivamente em `.cache/testes-seo/`, preservando o `dist/` normal, e usa dados fictícios e bloqueio de navegação externa. `npm run test:seo:unit` executa somente as validações unitárias. As suítes Playwright devem ser executadas separadamente.
