# SEO técnico e publicação estática

Esta configuração pertence ao build. Não altera componentes, animações, validação do formulário ou hidratação React. Não adiciona dependências, servidor em produção, Worker, Pages Function ou analytics.

## Configuração central

`scripts/seo.ts` reúne título, descrição, identidade social, política de ambientes e geração de canonical, robots, sitemap e JSON-LD. `SEO_SITE_URL` é uma variável de build, sem prefixo `VITE_`; não é lida pelo código do navegador. Valores do ambiente têm precedência sobre `.env` / `.env.production`. A `.env.example` não contém domínio inventado.

O título é **SAILAWAY | Planejamento de viagens e rede de membros**. Ele descreve os temas que a página efetivamente apresenta. A descrição anterior foi preservada; nenhum texto comercial do corpo foi reescrito.

O domínio precisa ser uma origem HTTPS pública: sem credenciais, porta não padrão, parâmetros, fragmentos, escapes ou subcaminho. IPs, localhost, nomes locais e endereços temporários de hospedagem são rejeitados. O resultado é normalizado para uma barra final. Erros abortam o build; não ativam indexação com valores de fallback. A validação é sintática e não comprova propriedade, DNS, certificado ou aprovação comercial do domínio.

## Ambientes e indexação

As [variáveis oficiais da Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables) são usadas assim:

- Sem `CF_PAGES`, `CF_PAGES_BRANCH` e `CF_PAGES_URL`: ambiente local.
- `CF_PAGES=1`, branch `main` e URL HTTPS de deploy válida: produção.
- `CF_PAGES=1` e qualquer outra branch válida, inclusive `develop`: Preview.
- Variáveis incompletas ou inconsistentes: erro explícito.

`CF_PAGES_URL` identifica a URL daquele deploy, não o domínio canônico. Nunca é copiada para canonical, sitemap ou Open Graph. Não sobrescrever as variáveis oficiais para tentar promover um Preview a produção. A branch de produção esperada é `main`; esta implementação não muda a configuração do projeto na Cloudflare.

| Ambiente | Canonical / og:url / WebSite / sitemap | Robots da homepage |
| --- | --- | --- |
| Local, mesmo com domínio informado | Omitidos | Sem `noindex` global; rastreamento permitido |
| Preview, mesmo com domínio de produção herdado | Omitidos | Meta `noindex`; rastreamento permitido para que o crawler leia a diretiva |
| Produção sem domínio aprovado configurado | Omitidos | Sem `noindex` global, preservando a produção atual |
| Produção com `SEO_SITE_URL` válido e aprovado | Gerados com a mesma URL raiz | Rastreamento permitido; robots referencia o sitemap |

O endereço atual `sailaway.pages.dev` não é escolhido automaticamente como identidade definitiva. Sua indexação pública não é bloqueada pelo build de produção sem domínio.

O arquivo `robots.txt` permite `/` em todos os ambientes. Isso é intencional: [robots.txt não substitui noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing). O Preview contém meta `noindex` complementar e continua dependendo também do [header nativo `X-Robots-Tag: noindex` da Cloudflare](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-indexing-by-search-engines). O `_headers` existente é preservado integralmente; não adicionamos `index`, remoções ou overrides desse header.

## Canonical, sitemap e dados estruturados

O Vite injeta o head durante o build, a partir de um único marcador no template. O SSG continua renderizando os mesmos componentes com `renderToString`; o cliente continua usando `hydrateRoot`. Não há atualização de metadados por efeitos React.

Em produção com domínio aprovado, há uma única canonical HTTPS para `/`, igual a `og:url`, ao `url` do JSON-LD e à única entrada do sitemap. Âncoras não são rotas. Não há `lastmod` artificial, página 404 ou URLs externas no sitemap.

Sem essa configuração, `sitemap.xml` não é gerado e robots não o anuncia. A ausência do arquivo deve resultar em 404 na hospedagem estática. Cada build limpa apenas seu diretório de saída para não reutilizar sitemap de outro ambiente. Não adicionar `robots.txt` ou `sitemap.xml` manualmente a `public/`; são artefatos controlados pelo gerador.

O JSON-LD implementado é somente `WebSite`, com nome SAILAWAY, URL pública e idioma pt-BR. Ele aguarda o domínio. Não há Organization com dados incompletos, FAQPage, avaliações, preços ou promessa de resultado enriquecido. A marcação segue o uso de [WebSite para identidade do site](https://developers.google.com/search/docs/appearance/site-names).

## Compartilhamento social

Sempre presentes: `og:title`, `og:description`, `og:type=website`, `og:locale=pt_BR`, `og:site_name` e os campos Twitter de card, título e descrição. `og:url` depende da produção com domínio aprovado.

**Imagem social aprovada e preparada:** `public/images/social/sailaway-og-1200x630.jpg`, 1200×630 pixels, JPEG qualidade 95, 235.315 bytes. A configuração `dadosSeo.imagem` contém o caminho, dimensões, MIME `image/jpeg` e texto alternativo. A arte foi fornecida e aprovada pelo usuário; não foi gerada outra composição nem alterada a logo. A integração pública continua aguardando domínio aprovado e publicação autorizada.

Origem: `Imagem do ChatGPT 24 de out. de 2026, 09_49_16.png`, 1731×909 pixels, PNG de 2.068.333 bytes. SHA-256 original: `f382a5fdca84e4ad2790dd736fd38e37cc7ca4c3a199171f6c0979e8a7f24ef2`. O original foi preservado sem modificações e não é copiado para `public/` ou `dist/`.

O processamento técnico utilizou System.Drawing/GDI+ já disponível no Windows, interpolação HighQualityBicubic, PixelOffsetMode.HighQuality, WrapMode.TileFlipXY e saída RGB 24 bits, sem dependência nova ou alteração de cor, composição ou textos. O redimensionamento foi proporcional: a diferença entre 1731/909 e 1200/630 exigiu ajuste central de apenas 0,1125 pixel original em cada borda superior/inferior. Não houve deformação ou remoção de elementos. O PNG redimensionado sem perdas de codificação teria 1.621.128 bytes; o JPEG qualidade 95 foi escolhido após inspeção da imagem completa e dos detalhes de texto/logo ampliados, com legibilidade preservada e sem diferença perceptível no tamanho normal de uso. JPEG continua sendo uma codificação com perdas, não uma reprodução idêntica dos pixels do PNG.

SHA-256 do JPEG final: `19173ee1c387d22a825b7259f9a7cc83fe48d8bdbf3b47b29b3e3e68a6cd2713`. Há somente um arquivo final no diretório social. Comparações e candidatos intermediários ficam em `.cache/imagem-social/`, ignorada pelo Git; não são publicados. Nenhum script de processamento de imagem é executado durante o build, que apenas copia o asset pronto.

Em produção com `SEO_SITE_URL` válido, o gerador existente combina a origem e o caminho da imagem para emitir `og:image`, `og:image:secure_url`, dimensões, tipo e alt; o Twitter Card passa a `summary_large_image` com a mesma imagem e descrição. Os campos seguem as [propriedades estruturadas do Open Graph](https://ogp.me/#structured). O alt é: “Logo SAILAWAY sobre o mar ao pôr do sol. Explore novos horizontes. Turismo, conexões e novas possibilidades.” Não são aceitas URLs externas de imagens.

Sem domínio público configurado, em local ou produção, as tags `og:image*` e `twitter:image*` continuam omitidas; `twitter:card` permanece `summary`. Em Preview, a imagem também não é anunciada, mesmo com domínio de produção herdado; a proteção noindex continua intacta. O JPEG existe nos assets de todos esses builds, mas não é carregado ou mostrado pela homepage. A URL temporária de Preview nunca é usada para formar metadados públicos.

Os testes verificam o JPEG real por assinatura, tamanho e hash, confirmam um único arquivo final, decodificam 1200×630 no navegador, conferem MIME e bytes nos quatro builds isolados e validam as tags sem duplicação. Domínios sintéticos só são usados nos artefatos isolados de teste; nenhuma plataforma social é acessada e nenhum compartilhamento real é executado. Mudanças futuras da arte devem ter nova aprovação e atualização deliberada desse contrato, sem relaxar verificações para aceitar outro arquivo silenciosamente.

## 404 e headers

`public/404.html` é uma página estática independente, acessível, com a identidade e logo existentes, meta `noindex` e link para `/`. Ela não carrega React nem altera a landing. Não entra no sitemap.

A composição atual segue o mockup aprovado de 23/10/2026: logo oficial vertical, 404 ilustrado, mensagem central e botão azul sobre a paisagem marítima. O título e a descrição são HTML selecionável; o retorno é um link real, funcional sem JavaScript. Os algarismos laterais são vetores SVG compartilhando um único desenho, e o zero preserva a ilustração do anexo. Nenhuma fonte nova é instalada; o texto utiliza a família serifada de sistema.

O arquivo `public/images/404/mockup-aprovado.png` é uma cópia intacta do anexo fornecido pelo usuário, de 1586×992 pixels. Ele serve como fonte dos recortes ilustrativos, não como screenshot da página inteira: o SVG enquadra o zero em `(688,315,215,245)`, o mar em `(0,805,1586,187)` e as laterais sem texto a partir de `y=530`. As laterais se ampliam abaixo de `y=700`, fora da área do botão do mockup. `viewBox` e máscaras limitam essas regiões; os valores representam coordenadas do asset original, não deslocamentos compensatórios do layout. Céu e pássaros são composição SVG/CSS. Não há texto ou botão rasterizado exercendo função de interface. A imagem-fonte é compartilhada pelos recortes e só é requisitada na 404; não é adicionada à homepage ou ao Open Graph.

A logo é o PNG oficial existente, sem deformação, com dimensões intrínsecas e fundo integrado por composição de cor. Sua proporção é preservada mesmo quando difere da representação do mockup. As adaptações mobile mantêm a ordem e recortam a paisagem proporcionalmente. Foco é visível, camadas decorativas não recebem cliques e o hover da 404 respeita movimento reduzido sem modificar o Diagonal Fill Hover da landing.

`tests/seo/404.spec.ts` verifica as seis resoluções sem JavaScript, os assets locais, geometria, overflow, teclado e retorno à homepage. Também verifica hover e movimento reduzido. Não usa nem atualiza os snapshots da landing. Capturas e medições ficam nos diretórios ignorados de resultados. A versão antiga do HTML/CSS foi substituída no próprio arquivo; seus assets compartilhados não são removidos, pois continuam utilizados pelo cabeçalho, rodapé e estilos globais.

Na [Cloudflare Pages, um 404.html no nível raiz muda o fallback padrão de SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/): caminhos inexistentes passam pelo tratamento de Not Found. Esta é a solução estática escolhida; não há redirect para a homepage, router ou servidor de produção.

O Vite Preview não reproduz integralmente roteamento e headers da Cloudflare. A suíte SEO usa um servidor estático **exclusivo de testes**, que responde 404 para arquivos inexistentes e serve o artefato 404 real. Ele não simula o header nativo de Preview nem serve como evidência de um deploy remoto. Após publicação futuramente autorizada, será necessário verificar status e headers reais de `/`, de uma URL inexistente, de robots, sitemap e assets.

As regras existentes de CSP, X-Frame-Options e Permissions-Policy em `public/_headers` são mantidas. Não foram adicionados CSP restritivo, HSTS, cache de mídia, redirects permanentes ou alterações DNS.

## Testes e isolamento

Com Node 24, dependências e Chromium instalados, na pasta `frontend`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:seo
npm run test:ssg
npm run test:estrito
npm run test:ui
```

`test:seo:unit` executa somente as validações unitárias de configuração. `test:seo` executa essas validações, prepara quatro builds completos isolados e abre a suíte de navegador. Os testes de navegador precisam rodar sequencialmente, pois usam a porta 4173 e um worker.

As fixtures usam uma URL sintética sob `example.com`, sem navegação ou consulta externa. Ficam em `.cache/testes-seo/`, ignorada pelo Git. O build normal em `dist/` é comparado antes/depois da preparação para garantir que não recebeu essa URL. `--outDir` no script SSG permite exclusivamente uma pasta de cenário em `.cache/testes-seo/cenarios/`, sem links simbólicos ou junctions; o padrão continua sendo `frontend/dist/`. Um build inválido é rejeitado antes de alterar seus artefatos.

No servidor de teste, `X-Cenario-SEO` seleciona apenas um dos quatro diretórios de fixture. Esse mecanismo não é publicado nem usado pela aplicação. Nenhuma resposta artificial é aplicada ao código React ou às animações. XML é validado no navegador com DOMParser; metadados são inspecionados no HTML e no DOM real. As interceptações de WhatsApp e de navegação externa da baseline continuam obrigatórias.

Os 28 testes e 30 referências originais continuam separados e inalterados. A intermitência conhecida de rasterização mobile de Experiências deve ser registrada e comparada com geometria e estados; não atualizar snapshots ou tolerâncias para encobri-la.

## Ativação futura — não executada nesta fase

1. Definir e aprovar o domínio próprio, sua propriedade e a origem HTTPS pública definitiva.
2. Em uma operação separada e autorizada, configurar `SEO_SITE_URL` **no ambiente de produção** da Cloudflare Pages. Não sobrescrever as variáveis oficiais CF e não alterar a branch de produção para contornar testes.
3. Executar os testes e revisar o build: canonical única, sitemap com `/`, robots correto, Open Graph e WebSite com a mesma origem. Nenhum dado precisa ser alterado em componentes React.
4. A imagem oficial já está aprovada e integrada à configuração central; sua ativação acompanha o domínio, sem edição manual de HTML. Uma substituição futura de arte exige aprovação separada.
5. Somente após autorização de publicação, validar os status HTTP e os headers reais de produção e Preview, bem como a extração dos metadados pelas plataformas. Uma simulação local não comprova indexação ou comportamento remoto.

Google Analytics 4 e Google Tag Manager permanecem fora do projeto nesta fase. Uma integração futura depende da definição do domínio, aprovação separada e requisitos de privacidade aplicáveis. Nenhum ID ou script de rastreamento foi criado.
