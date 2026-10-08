# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tira times — instruções para o Claude Code

Site **web mobile first** para organizar pelada: cadastrar o elenco, marcar presença, definir regras e **sortear times equilibrados**. Tem duas partes:

1. **Site de conteúdo** (páginas estáticas, indexáveis): home, guias, regras, FAQ, páginas legais. Monetizado com **Google AdSense**.
2. **App** em `/app/`: ferramenta de sorteio, instalável como **PWA**, funciona offline, dados só no aparelho.

Idioma: **português do Brasil**. Este repositório começa só com especificação e referências; seu trabalho é construir o produto a partir delas.

## Leia antes de codar

| Arquivo | O que é |
| --- | --- |
| `docs/PRODUTO.md` | Telas do app, fluxos, regras de negócio e critérios de aceite |
| `docs/SITE_E_CONTEUDO.md` | Páginas do site, plano editorial, SEO |
| `docs/ANUNCIOS.md` | AdSense: posições permitidas, consentimento, requisitos de aprovação. **Regras obrigatórias** |
| `docs/SORTEIO.md` | Algoritmo de sorteio (posições → média → características) |
| `docs/FORMATO_JSON.md` | Importação/exportação + `reference/formato.schema.json` |
| `docs/DESIGN_SYSTEM.md` | Design system "Pelada": princípios, cores, tipografia, ícones, tom de voz |
| `design/tokens.json` · `design/tokens.css` | Tokens oficiais |
| `design/componentes.css` · `design/componentes/*.md` | Estilo e guia de uso de cada componente |
| `reference/prototipo/tira-times.html` | **Protótipo navegável** (site + app + anúncios simulados). Referência visual e de comportamento |
| `reference/sorteio/sorteio.mjs` · `sorteio.test.mjs` | Lógica de sorteio funcionando + testes (`node --test reference/sorteio/sorteio.test.mjs`) |
| `docs/ROADMAP.md` | Ordem de implementação |

## Stack (padrão — confirme com o Lucas antes de trocar)

- **Astro** (saída estática) para o site: páginas e artigos em Markdown/MDX via Content Collections, HTML pronto do servidor (essencial para o AdSense e o Google lerem o conteúdo).
- **React + TypeScript** para o app, montado como ilha em `src/pages/app/index.astro` (`client:only="react"`).
- **PWA** com `@vite-pwa/astro` (manifest, ícones, service worker, offline). Escopo do PWA: `/app/`.
- Estado do app: **Zustand** com `persist` em `localStorage`. Sem backend.
- Estilo: CSS com os tokens (`design/tokens.css`) e as classes de `design/componentes.css` como base. Sem Tailwind.
- Fontes: Plus Jakarta Sans e Material Symbols Rounded (Google Fonts, ou self-host via `@fontsource`).
- Testes: **Vitest** (domínio e componentes) + **Playwright** (fluxos principais no viewport 390×844).
- Hospedagem estática: Cloudflare Pages, Netlify ou Vercel. Domínio próprio é requisito do AdSense.

## Arquitetura

```
src/
  domain/          # tipos, rating, planSummary, drawTeams, teamProfile, import/export — puro e testado
  app/
    store/         # useAppStore (Zustand+persist), safeStorage (localStorage com try/catch), mergeState (merge de rules com defaults no load)
    components/    # os componentes do design system (AppBar, Badge, BottomNav, Button, MonthlySwitch, PlayerRow, PositionPicker, StarRating, Stepper, TeamCard, TextField, AdSlot, Empty)
    screens/       # ElencoScreen, PresencaScreen, TimesScreen, RegrasScreen, PlayerSheet, ProSheet, ImportExportScreen
    App.tsx        # shell com BottomNav + 4 abas (elenco/presenca/times/regras) + ProSheet
  layouts/         # AppLayout.astro (sem anúncio âncora)
  pages/app/       # index.astro — monta <App client:only="react">
  styles/          # tokens.css, componentes.css, app.css, ads.css, sheet.css
public/            # robots.txt, icon.svg
```

**Estado atual:** só o app (`/app/`) está implementado — é a primeira entrega (ver `docs/DECISOES_SESSAO.md`, item 3). O site de conteúdo (`components/` Astro, `content/guias/`, `layouts/SiteLayout`, páginas `index`/`guias`/`regras`/`faq`/legais, `ConsentBanner`, AdSense real) ainda **não existe** — é trabalho futuro, fora do escopo desta entrega. Não assuma que esses arquivos existem; confira antes de referenciá-los.

### Detalhes que exigem ler o código (não só os docs)

- **Regras de sorteio são mutuamente exclusivas em runtime**, não só na UI: em `useAppStore.setRules` (`src/app/store/useAppStore.ts`), ativar `avoidRepeatPairs` desliga `balance`/`traits`/`positions` e vice-versa — os termos de custo do algoritmo competem pelos mesmos swaps e misturá-los deixava os times visivelmente desequilibrados (comentário `ponytail:` no código).
- **Histórico de pares (`pairHistory`) é efêmero**: fica fora do `partialize` do `persist`, não é salvo no `localStorage`. Reseta quando o roster/config muda (`historyKey`) ou após `presentPlayers.length` sorteios (cap ingênuo, ver comentário `ponytail:`).
- **PWA scope vs. base**: no `astro.config.mjs`, a opção `scope` do `@vite-pwa/astro` controla o service worker (`/app/`); a opção `base` do Astro (site inteiro) fica em `/`. São coisas diferentes — não confundir ao mudar o deploy path.
- **Build precisa de flag no Node 18**: `npm run build` roda `node --experimental-global-webcrypto node_modules/astro/astro.js build` (não é só `astro build`) por causa do webcrypto global exigido pelo Astro nessa versão de Node.

## Regras do projeto

- **Domínio primeiro.** Porte `reference/sorteio/sorteio.mjs` para `src/domain/` em TypeScript com os testes. Todos os casos de `sorteio.test.mjs` precisam passar. Não altere o algoritmo sem um teste que mostre o ganho.
- **Anúncios seguem `docs/ANUNCIOS.md` à risca.** Nunca coloque anúncio em tela vazia, formulário, Presença, Regras, Importar/Exportar ou sheet. Nunca force espera para fechar anúncio. Tudo atrás de flags (`PUBLIC_ADS_ENABLED`, `PUBLIC_ADSENSE_CLIENT`) e desligado em desenvolvimento, mostrando um placeholder rotulado.
- **Conteúdo legível sem JavaScript.** Toda página do site precisa ter o texto no HTML gerado. Confira com `curl` ou com o JS desligado.
- **Tokens, nunca valores soltos.** Nada de hex no meio de componente.
- **Fidelidade ao protótipo.** Em dúvida sobre layout, texto ou comportamento, o protótipo manda. Exceção: a contagem de 5 s da vinheta do protótipo é só simulação. A vinheta real é do AdSense (ver `docs/ANUNCIOS.md`).
- **Mobile first.** Projete a 360–430px; no desktop, o site centraliza em ~640px e o app em uma coluna de 420px. Alvos de toque ≥ 44px. Ações principais embaixo no app.
- **Tema claro** apenas, no MVP.
- **Acessibilidade:** HTML semântico, `aria-pressed`/`role="switch"`/`role="checkbox"` nos controles, foco visível, contraste dos tokens.
- **Performance:** Lighthouse mobile ≥ 90 em performance, acessibilidade, boas práticas e SEO nas páginas do site (com anúncios desligados). Carregue o script do AdSense só depois do consentimento e com `async`.
- **Persistência à prova de falha:** `try/catch` em todo acesso a `localStorage`; ao carregar, mescle `rules` com os padrões.
- Rode testes, `astro check` e build antes de dizer que algo está pronto.

## Comandos

- `npm run dev` — Astro dev server.
- `npm run build` — build de produção (ver nota sobre a flag `--experimental-global-webcrypto` acima).
- `npm run preview` — serve o build.
- `npm run check` — `astro check` (tipos nos `.astro`).
- `npm test` — Vitest (domínio + componentes), roda uma vez. `npm run test:watch` para modo watch.
  - Um arquivo só: `npx vitest run src/domain/drawTeams.test.ts`.
  - Um teste só: `npx vitest run src/domain/drawTeams.test.ts -t "nome do teste"`.
- `npm run lint` — ESLint em `.js/.ts/.tsx`.
- `npm run e2e` — Playwright (`e2e/*.spec.ts`, viewport 390×844).
  - Um arquivo só: `npx playwright test e2e/golden-path.spec.ts`.
- `node --test reference/sorteio/sorteio.test.mjs` — testes do protótipo original do algoritmo (referência, não o código em `src/domain/`).

## Glossário

- **Pelada**: futebol casual. **Mensalista**: paga por mês e tem prioridade. **Avulso**: paga por jogo.
- **Jogadores de linha**: todos menos o goleiro. **Goleiro fixo**: fica no gol enquanto os times revezam.
- **Revezamento**: sem goleiro, o time em campo se reveza no gol. **Próxima**: quem sobrou e entra depois.
- **Completar com 1 de fora**: time incompleto pega um jogador de outro time que está esperando.
