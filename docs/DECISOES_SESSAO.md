# Decisões da sessão (2026-10-01) — complemento ao CLAUDE.md

Os docs existentes (`CLAUDE.md`, `docs/*.md`, `design/`, `reference/`) continuam como
fonte principal. Este arquivo só registra decisões tomadas antes de abrir o plano de
implementação, onde o pedido do Lucas divergia ou faltava decidir algo.

## 1. Persistência — mantido localStorage, sem conta

Sem SQLite, sem backend, sem login. `Zustand` + `persist` em `localStorage`,
exatamente como o CLAUDE.md já definia. Elenco é pequeno (dezenas/poucas centenas de
jogadores); SQLite seria complexidade sem ganho aqui.

"Dono do time" = quem tem o aparelho. Sem ID de usuário, sem sincronização entre
aparelhos. Mover dados entre aparelhos é manual via Importar/Exportar JSON
(`docs/FORMATO_JSON.md`), já especificado.

## 2. Domínio e anúncios — subir sem domínio próprio por enquanto

Deploy grátis no subdomínio do Netlify (`*.netlify.app`). AdSense exige domínio
próprio com HTTPS para aprovar — isso fica para quando o Lucas decidir comprar um
domínio (~R$ 40–60/ano). Até lá, `PUBLIC_ADS_ENABLED=false` (anúncios desligados,
só o código/flag preparado).

**Checklist para quando for ativar anúncios (depois do deploy):**
1. Comprar domínio e apontar DNS pro Netlify (ou importar o domínio custom nas
   configurações do site no Netlify).
2. Criar conta Google AdSense, adicionar o domínio, aguardar aprovação (precisa do
   checklist completo de `docs/ANUNCIOS.md`: páginas obrigatórias, `ads.txt`,
   conteúdo original — isso é escopo do site, fora desta primeira entrega).
3. Pegar `data-ad-client` (publisher ID) e os slot IDs no painel do AdSense.
4. Setar `PUBLIC_ADS_ENABLED=true`, `PUBLIC_ADSENSE_CLIENT=<id>` e os slot IDs nas
   variáveis de ambiente do Netlify (Site settings → Environment variables).
5. Redeploy.

## 3. Escopo da primeira entrega — só o app

Construir só `/app/` (PWA de sorteio), etapas 1–6 do `ROADMAP.md`:
setup do projeto, domínio (código), store, componentes, telas, PWA.

Fora do escopo agora (fica para depois, sem necessidade de decidir já):
site de conteúdo, artigos SEO, páginas legais, `ConsentBanner`, ativação real do
AdSense.

**Preparo mínimo de anúncio incluído nesta entrega** (pedido explícito do Lucas):
componente `AdSlot` na tela Times, atrás da flag `PUBLIC_ADS_ENABLED` (padrão
`false`), mostrando placeholder tracejado rotulado "Anúncio" em dev — só o
suporte técnico, sem conta AdSense real ainda.
