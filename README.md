# SAILAWAY Landing Page

Landing page responsiva da SAILAWAY, desenvolvida para apresentar a marca, experiências de viagem e duas frentes de interesse: inCruises e Viagens e Passagens.

## Sobre o projeto

O site apresenta serviços relacionados a viagens e reúne um formulário para identificar o interesse do visitante. Não realiza venda direta de viagens.

## Tecnologias

- React
- TypeScript
- Vite
- CSS
- Oxlint para verificação do código

## Principais áreas

- Header e Hero com vídeo de fundo.
- Escolha de interesse entre inCruises e Viagens e Passagens.
- Apresentação da inCruises.
- Viagens e Passagens, incluindo a seção Experiências.
- Captação de interesse com Nome, WhatsApp, E-mail e Interesse.
- Sobre a SAILAWAY, no componente Institucional.
- Como funciona.
- FAQ / Dúvidas frequentes.
- Contato final e Footer.

## Executando localmente

Com Node.js e npm instalados, execute na raiz do repositório:

```bash
npm install
npm run dev
```

O Vite informa no terminal o endereço para acessar a aplicação.

## Verificação e build

```bash
npm run lint
npm run build
```

O build inclui a verificação de TypeScript e gera os arquivos de produção em `dist/`.

Para visualizar o build localmente:

```bash
npm run preview
```

## Estrutura

- `src/sections/`: seções da landing page.
- `src/components/`: componentes compartilhados, como Header e Button.
- `src/styles/`: estilos globais, variáveis visuais e animações.
- `src/config/site.ts`: navegação, vídeos, contatos e configuração de envio do formulário.
- `src/App.tsx`: composição e ordem das seções.
- `public/`: imagens, vídeos e fontes locais.

## Status

Projeto em desenvolvimento. O formulário possui validação no frontend, mas o envio ainda não está configurado. Sem um destino definido, os dados não são enviados, os campos são preservados e a interface informa que o canal está sendo configurado.

Os contatos oficiais e o aviso de atuação também aguardam configuração em `src/config/site.ts`.

`AGENTS.md`, variáveis de ambiente, dependências e arquivos gerados permanecem fora do versionamento.
