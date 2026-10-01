# Pelada

Sorteio de times sem discussão. Pelada é o design system de um app mobile (vertical, smartphone) para organizar o futebol casual da semana: cadastrar o elenco, marcar quem chegou, definir as regras e sortear times equilibrados em segundos.

## Princípios

1. **Rápido antes de completo.** Cadastrar um jogador exige só o nome. Posição começa em *Qualquer*, habilidades começam em 3 estrelas, Mensalista começa desligado. Tudo mais é opcional e fica a um toque.
2. **Uma decisão por tela.** Elenco cadastra, Presença marca quem veio, Regras define o formato, Times mostra o resultado. Nada de telas misturando tudo.
3. **O polegar manda.** Ações principais ficam embaixo (FAB, botão Sortear fixo, bottom sheets). Alvos de toque com no mínimo 44px; a linha inteira do jogador é clicável.
4. **Gramado limpo.** Fundo claro (`surface-100`), cards brancos com borda `line`, um verde (`pitch-600`) para a ação que importa. Cor forte só nos coletes dos times.

## Tom de voz

Português do Brasil, direto e de boleiro, sem gíria forçada.

- Botões são verbos curtos: **Sortear**, **Salvar**, **Sortear de novo**, **Exportar**.
- Contagens dizem o que importa: "15 presentes · 1 goleiro", "Falta 1 pro Time Laranja".
- Avisos explicam a consequência: "Time Laranja com 4 — completar com 1 de fora".
- Sem ponto de exclamação em excesso e sem emoji na interface.

## Fundamentos visuais

**Cor.** `surface-100` é o fundo de todas as telas; `surface-000` para cards e sheets. Texto em `ink`, secundário em `ink-muted`. `pitch-600` é reservado para a ação primária, estados ligados e seleção; `pitch-100` é o tom de seleção suave (chip escolhido, jogador presente). `gold-500` aparece apenas em estrelas e no selo Mensalista (`gold-100` + `gold-800`). As seis cores `team-*` são os coletes — usadas só no resultado do sorteio (faixa do card e bolinha do time). `team-amarelo` usa texto `ink`.

**Tipografia.** Plus Jakarta Sans (Google Fonts), geométrica e amigável, com numerais fortes. Hierarquia curta: `display` 28 só no topo do Elenco, `title` 20 em app bars e cabeçalhos de time, `subtitle` 16 em nomes, `body` 15, `label` 13 em botões e chips, `caption` 12 em contagens. Números grandes (`number`) nos steppers de regras.

**Forma.** Inspirado no Material 3: cantos generosos (`radius-lg` 22 em cards, `radius-pill` em botões e FAB), superfícies tonais em vez de sombras. `shadow-1` quase invisível nos cards; `shadow-2` só no que flutua (FAB, sheet).

**Espaço.** Grade de 4px. Margem lateral `space-4` (16px), `space-6` entre seções, `space-3` no padding vertical das linhas de lista.

## Iconografia

Material Symbols Rounded (Google Fonts), peso 500, 24px, preenchido quando ativo. Ícones do app:

| Uso | Ícone |
| --- | --- |
| Elenco | `groups` |
| Presença | `how_to_reg` |
| Times / sortear | `shuffle` |
| Regras | `tune` |
| Importar / exportar | `swap_vert`, `upload`, `download` |
| Goleiro | `sports_handball` |
| Mensalista | `workspace_premium` |
| Novo jogador | `person_add` |

## Estrutura do app

Barra inferior com 4 abas: **Elenco · Presença · Times · Regras**. Importar/Exportar fica no menu da app bar do Elenco.

1. **Elenco** — lista de jogadores com busca, selo Mensalista e posições. O botão de olho (`visibility` / `visibility_off`) mostra ou esconde as notas médias, como o saldo num app de banco; a escolha fica salva. FAB "Novo jogador".
2. **Novo jogador** (bottom sheet) — nome (único campo obrigatório, já com foco), chips de posição (múltipla escolha; *Qualquer* é o padrão e é exclusivo), switch Mensalista e seção recolhível **Habilidades**: Ataque, Defesa, Velocidade, Habilidade, 1 a 5 estrelas (padrão 3). "Salvar e adicionar outro" mantém o sheet aberto para cadastrar em sequência.
3. **Presença** — o elenco inteiro com um toque por jogador para marcar presente. Resumo fixo no topo ("15 presentes · 1 goleiro") e botão **Sortear** fixo embaixo. Atalhos: "Todos os mensalistas", "Limpar".
4. **Regras** — steppers para *jogadores de linha por time* e *quantidade de times*, escolha do modo de goleiro e três switches de equilíbrio (nota média, características, posições). Um card de prévia calcula ao vivo o que vai acontecer.
5. **Times** — um card por time com a cor do colete, força média, perfil de características (4 barras), chips de posição, goleiro e vagas abertas. Ações: **Sortear de novo** e **Compartilhar**.
6. **Importar / Exportar** — gerar ou ler o JSON do elenco para levar os dados para outro aparelho.

## Regras do sorteio

Entrada: jogadores presentes + regras (`linePerTeam`, `teams`, `goalkeepers`, `balance`, `traits`, `positions`, `monthlyPriority`).

- **Goleiros fixos** (padrão da pelada): quem tem `GOL` fica no gol e não entra nos times. Com 2 goleiros, os dois gols estão cobertos; com 1, o outro gol é **revezamento**; com 0, revezamento nos dois.
- **Um por time**: cada time recebe um goleiro; times sem goleiro disponível revezam.
- **Linha**: o sorteio busca o melhor time em três camadas, nesta ordem de peso:
  1. **Posições** — cada time com pelo menos 1 `DEF`, 1 `MEI` e 1 `ATA`, sempre que houver jogadores suficientes daquela posição; e sem empilhar (ex.: 3 atacantes num time e nenhum no outro). `QQ` e `ALA` completam onde faltar.
  2. **Nota média** — as médias das 4 habilidades por time ficam o mais próximas possível.
  3. **Características** — as médias de Ataque, Defesa, Velocidade e Habilidade de cada time ficam parecidas, e os "especialistas" (4 ou 5 estrelas numa habilidade) são espalhados. Assim nenhum time fica só com quem corre e outro só com quem finaliza.

  Como funciona: começa por uma distribuição em serpentina (1-2-3-3-2-1…) e troca pares de jogadores entre times enquanto o resultado melhorar; repete com 16 pontos de partida e sorteia entre as soluções quase empatadas, para que **Sortear de novo** traga times diferentes sem perder o equilíbrio. Cada camada pode ser desligada em Regras (`balance`, `traits`, `positions`).
- **Excedentes**: se há mais jogadores que vagas, sobram para a "Próxima". Com `monthlyPriority`, avulsos saem antes dos mensalistas.

Exemplo do briefing — 15 presentes (1 goleiro, 14 de linha), 5 por time, 3 times: **1 goleiro fixo + revezamento no outro gol**, **Times Verde e Azul completos (5)**, **Time Laranja com 4 — completar com 1 de fora**.

O bundle expõe essa lógica: `Pelada.planSummary(players, rules)` (prévia da tela de Regras) e `Pelada.drawTeams(players, rules)` (resultado).

## Formato de importação / exportação

```json
{
  "app": "tira-times",
  "version": 1,
  "exportedAt": "2026-09-30T21:00:00-03:00",
  "group": { "name": "Pelada de Quinta" },
  "rules": { "linePerTeam": 5, "teams": 3, "goalkeepers": "fixed", "balance": true, "traits": true, "positions": true, "monthlyPriority": true },
  "players": [
    { "id": "p01", "name": "Marcão", "positions": ["GOL"], "monthly": true,
      "skills": { "attack": 1, "defense": 4, "speed": 2, "skill": 3 } }
  ]
}
```

`positions` aceita `GOL`, `DEF`, `ALA`, `MEI`, `ATA` ou `QQ` (Qualquer, exclusivo). `skills` vai de 1 a 5. Ao importar, o usuário escolhe **Mesclar** (atualiza por `id`, adiciona novos) ou **Substituir** o elenco.

## Uso dos tokens

- Ação primária: fundo `pitch-600`, texto `on-pitch`, `radius-pill`. Pressionado: `pitch-700`.
- Ação secundária (tonal): fundo `pitch-100`, texto `pitch-700`.
- Selecionado (chip, presença): fundo `pitch-100`, borda `pitch-600`.
- Estrela vazia: contorno `line-strong`, sem preenchimento; cheia: `gold-500` com contorno `gold-700` — diferem em forma, não só em cor.
- Aviso de vaga aberta: `warn-100` + `warn-700`, borda tracejada.
