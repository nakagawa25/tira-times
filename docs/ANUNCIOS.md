# Anúncios (Google AdSense) — regras obrigatórias

Objetivo: monetizar sem atrapalhar o sorteio e sem arriscar a conta do AdSense. Referências: [políticas do programa](https://support.google.com/adsense/answer/48182), [posicionamento](https://support.google.com/adsense/answer/1346295), [telas sem conteúdo](https://support.google.com/publisherpolicies/answer/11112688), [vinheta](https://support.google.com/adsense/answer/16531962), [âncora](https://support.google.com/adsense/answer/15484692).

## Mapa de posições

| Onde | Formato | Regra |
| --- | --- | --- |
| Home e artigos do site | Display responsivo no conteúdo | Até 2 por página na home; em artigos, 1 após o 2º parágrafo e 1 antes do fim. Nunca colado a botões. |
| Site (todas as páginas) | **Âncora** (Auto ads, rodapé) | Só no `SiteLayout`. **Desligada no app** (conflita com a barra de abas e o botão Sortear). |
| Passagem site → app | **Vinheta** (Auto ads) | Controlada pelo Google; aparece na navegação entre páginas do site. Por isso "Abrir o Tira times" é um **link real** para `/app/` (não navegação SPA). Frequência configurada no painel do AdSense. **Não** criar tela própria com contagem regressiva. |
| App · tela Times | Banner responsivo 320×100 (slot manual) | Só quando existe sorteio; no topo da lista, abaixo do título, com espaço ≥ 16px do botão de copiar e do botão "Sortear de novo". Rótulo "Anúncio" e link "Remover anúncios" (abre o plano Pro). |
| App · demais telas, sheets, estados vazios, Importar/Exportar | — | **Proibido** anúncio. |

## Implementação

- Componente único `AdSlot` (Astro e React) com: rótulo "Anúncio", `data-ad-client`, `data-ad-slot`, `data-ad-format="auto"`, `data-full-width-responsive="true"`, altura mínima reservada (evita CLS).
- Script `adsbygoogle.js` carregado **uma vez**, `async`, **só após consentimento** (ou em modo não personalizado, conforme escolha).
- Flags: `PUBLIC_ADS_ENABLED` (padrão `false`), `PUBLIC_ADSENSE_CLIENT`, IDs de slot por posição. Em dev/preview, renderizar placeholder tracejado igual ao protótipo.
- No app (SPA), ao trocar para a tela Times, inicializar o slot (`(adsbygoogle = window.adsbygoogle || []).push({})`) só quando ele for montado, e não recriar a cada re-render.
- Usuário **Pro** (flag local no MVP): não carregar o script de anúncios em lugar nenhum.
- Auto ads: ativar só âncora e vinheta no painel; desligar anúncios "in-page" automáticos e excluir `/app/*` dos Auto ads (URL exclusions), para controlar o app manualmente.

## Consentimento (LGPD / UE)

- Banner na primeira visita: "Só essenciais" e "Aceitar", com link para a política de privacidade e opção "Gerenciar cookies" no rodapé e no app.
- "Só essenciais" → anúncios não personalizados (`requestNonPersonalizedAds`) ou nenhum anúncio, conforme a política escolhida.
- Para visitantes da UE/Reino Unido, o Google exige uma CMP certificada: usar a mensagem de privacidade do próprio AdSense ("Privacy & messaging") ou uma CMP certificada IAB TCF.

## Requisitos para pedir aprovação (checklist)

- [ ] Domínio próprio com HTTPS.
- [ ] Conteúdo original suficiente (ver `docs/SITE_E_CONTEUDO.md`), em HTML gerado no servidor.
- [ ] Páginas: Sobre, Contato, Política de privacidade (cookies, Google AdSense, dados locais), Termos.
- [ ] Navegação clara (header e footer com links).
- [ ] `public/ads.txt` com a linha do publisher.
- [ ] Sem páginas quebradas, sem "em construção".
- [ ] Consentimento funcionando.

## Proibido (motivo comum de suspensão)

- Pedir ou incentivar cliques ("clique no anúncio", setas, "apoie o app clicando").
- Anúncio que parece botão, item de lista ou conteúdo do app.
- Anúncio em tela sem conteúdo (vazios, formulários, confirmações, carregamento).
- Clicar nos próprios anúncios em produção.
- Forçar espera ou bloquear o uso para exibir anúncio.
