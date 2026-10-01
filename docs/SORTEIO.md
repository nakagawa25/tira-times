# Algoritmo de sorteio

Implementação de referência: `reference/sorteio/sorteio.mjs` (`drawTeams`, `planSummary`). Testes: `reference/sorteio/sorteio.test.mjs`.

## 1. Goleiros

Goleiro = jogador com `GOL` nas posições.

- **Fixos no gol** (`goalkeepers: 'fixed'`): até 2 goleiros ficam no gol e não entram nos times. Com 1, o outro gol é revezamento; com 0, revezamento nos dois. Goleiros além de 2 viram jogadores de linha.
- **Um por time** (`'perTeam'`): cada time recebe um goleiro (os melhores primeiro); times sem goleiro revezam. Excedentes viram linha.

## 2. Vagas e excedentes

Vagas = `linePerTeam × teams`. Se há mais jogadores de linha que vagas, os excedentes vão para "Próxima". Com `monthlyPriority`, avulsos saem antes dos mensalistas (mantendo a ordem de chegada dentro de cada grupo).

Tamanhos dos times: distribuição o mais igual possível, times maiores primeiro (ex.: 14 em 3 → 5, 5, 4). O time incompleto mostra a vaga aberta.

## 3. Equilíbrio (busca local com custo)

Cada jogador tem nota `r` (média das 4 habilidades), habilidades `sk[4]`, "especialista" em cada habilidade se ≥ 4, e papéis DEF/MEI/ATA explícitos.

Custo de uma distribuição (menor = melhor), pesos em `W = { role: 30, roleStack: 1.5, avg: 60, trait: 10, spec: 2.5 }`:

| Camada | Termo | Liga com |
| --- | --- | --- |
| Posições | `role × (min(times, oferta) − times cobertos)` para DEF, MEI, ATA | `positions` |
| Posições | `roleStack × Σ (qtd no time − oferta/times)²` evita empilhar | `positions` |
| Média | `avg × Σ (média do time − média geral)²` | `balance` |
| Características | `trait × Σ (média da habilidade no time − média geral da habilidade)²` | `balance && traits` |
| Características | `spec × Σ (especialistas no time − esperado proporcional)²` | `balance && traits` |

Busca:
1. Ponto de partida: ordena por nota (+ ruído) e distribui em serpentina (1-2-3-3-2-1…) respeitando os tamanhos.
2. Melhora: tenta trocar cada par de jogadores de times diferentes; mantém a troca se o custo cair; repete até não melhorar (máx. 40 passadas).
3. Repete com 16 pontos de partida (4 se `balance` desligado) e escolhe aleatoriamente entre as soluções com custo ≤ melhor + max(0,4; 15%). Isso faz "Sortear de novo" variar sem perder equilíbrio.
4. Com `balance` desligado: partida aleatória e só o custo de posições (times aleatórios, mas com DEF/MEI/ATA).

RNG com seed opcional (determinístico para testes). No app, use seed aleatória por sorteio.

## 4. Apresentação

Times ordenados do maior para o menor; cores na ordem Verde, Azul, Laranja, Grafite, Vermelho, Amarelo. Dentro do time, jogadores ordenados DEF → MEI → ATA → demais.

## Ideias futuras (não fazer no MVP sem pedir)

- "Não separar" / "não juntar" pares de jogadores.
- Histórico para evitar repetir os mesmos times seguidos.
- Peso configurável por característica.
