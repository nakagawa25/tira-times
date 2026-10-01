# Roadmap de implementação

Faça em ordem; cada etapa termina com testes, `astro check` e build passando, e um commit.

1. **Setup** — Astro (static) + React + TypeScript, `@vite-pwa/astro`, `@astrojs/sitemap`, Vitest, Playwright, ESLint/Prettier. Copiar `design/tokens.css` e `design/componentes.css` para `src/styles/`. Layouts `SiteLayout` e `AppLayout`.
2. **Domínio** — `src/domain/`: tipos, `rating`, `formatRating`, `planSummary`, `drawTeams`, `teamProfile`, import/export (`parseImport`, `buildExport`, `mergePlayers`). Portar `reference/sorteio/sorteio.test.mjs` para Vitest + testes de import/export.
3. **Store do app** — Zustand + persist (localStorage com try/catch): players, present, rules (mesclando padrões), draw, showRatings, groupName, web (consent, pro, installDismissed). Seed de exemplo só em dev.
4. **Componentes React** — os 11 de `design/componentes/`. Página `/app/dev/catalogo` só em dev.
5. **Telas do app** — Elenco (+ olho das notas, aviso de instalação) e sheet de jogador → Presença → Times → Regras → Importar/Exportar → sheet Pro. Abas sem recarregar a página.
6. **PWA** — manifest (nome "Tira times", `theme_color` #1b7a3e, `background_color` #f4f7f2, ícones maskable do logo), service worker com precache do `/app/`, `start_url` e `scope` em `/app/`, teste offline no Playwright.
7. **Site** — home, páginas fixas (sobre, contato, privacidade, termos, regras, FAQ), coleção `guias` com layout de artigo, SEO técnico (meta, OG, JSON-LD, sitemap, robots, canonical).
8. **Conteúdo** — redigir os guias de `docs/SITE_E_CONTEUDO.md` **com revisão do Lucas**, um por vez.
9. **Consentimento + anúncios** — `ConsentBanner`, `AdSlot`, carregamento condicional do AdSense, flags de ambiente, placeholders em dev, `public/ads.txt` (com placeholder até ter o ID). Seguir `docs/ANUNCIOS.md`.
10. **Qualidade** — Playwright nos fluxos (cadastrar, presença, sortear, importar, instalar), Lighthouse mobile ≥ 90 no site, revisão de acessibilidade, testes em Chrome Android e Safari iOS.
11. **Publicação** — deploy estático com domínio próprio, Search Console, sitemap enviado. Pedir o AdSense só quando o checklist de `docs/ANUNCIOS.md` estiver completo.
12. **(Depois, com aprovação)** Pagamento do Pro, contas e sincronização entre aparelhos.
