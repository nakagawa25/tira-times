# Tira times

Site web mobile first + app PWA para sortear times de pelada com equilíbrio de nota, características e posições. Monetização com Google AdSense e plano Pro para organizadores.

- **Comece por aqui:** `PROMPT_INICIAL.md` (o que colar no Claude Code) e `CLAUDE.md` (instruções do projeto).
- **Ver funcionando:** abra `reference/prototipo/tira-times.html` no navegador (precisa de internet para fontes e React). Os anúncios são espaços simulados.
- **Testar a lógica de sorteio:** `node --test reference/sorteio/sorteio.test.mjs` (Node 18+).

```
CLAUDE.md               instruções para o Claude Code
PROMPT_INICIAL.md       primeiro prompt
docs/                   produto (app), site e conteúdo, anúncios, sorteio, formato JSON, design system, roadmap
design/                 tokens (json/css), css dos componentes e guias de cada componente
reference/prototipo/    protótipo navegável (site + app) + componentes do design system
reference/sorteio/      lógica de sorteio + testes
reference/*.json        exemplo de exportação e JSON Schema
```
