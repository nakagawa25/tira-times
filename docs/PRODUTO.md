# Tira times — especificação do app (`/app/`)

## Objetivo

Em menos de 1 minuto na beira do campo: marcar quem veio e ter times equilibrados, justos e sem discussão. Roda no navegador do celular, instalável como PWA, funciona offline. O site de conteúdo está em `docs/SITE_E_CONTEUDO.md`; anúncios em `docs/ANUNCIOS.md`.

## Modelo de dados

```ts
type Position = 'GOL' | 'DEF' | 'ALA' | 'MEI' | 'ATA' | 'QQ'; // QQ = Qualquer (exclusivo)
interface Skills { attack: number; defense: number; speed: number; skill: number } // 0–5, padrão 3
interface Player { id: string; name: string; positions: Position[]; monthly: boolean; skills: Skills }
interface Rules {
  linePerTeam: number;               // 2–11, padrão 5
  teams: number;                     // 2–6, padrão 3
  goalkeepers: 'fixed' | 'perTeam';  // padrão 'fixed'
  balance: boolean;                  // equilibrar pela nota média (padrão true)
  traits: boolean;                   // espalhar características (padrão true; só vale com balance)
  positions: boolean;                // garantir DEF/MEI/ATA por time (padrão true)
  monthlyPriority: boolean;          // excedentes: avulsos saem primeiro (padrão true)
}
interface AppState {
  groupName: string; players: Player[]; present: string[]; rules: Rules;
  draw: Draw | null; showRatings: boolean;
  web: { consent: 'all' | 'essential' | null; pro: boolean; installDismissed: boolean };
}
```

Nota do jogador = média das 4 habilidades (`rating`). Exibição com vírgula: `3,4`.

## Navegação

Barra inferior com 4 abas: **Elenco · Presença · Times · Regras**. A aba Presença mostra um badge com o número de presentes. **Importar/Exportar** abre pelo ícone `swap_vert` no topo do Elenco (tela interna com voltar, sem barra inferior).

## Telas

### 1. Elenco
- Topo: logo + "Tira times" + nome do grupo (toque leva ao site, `/`); ícone de importar/exportar.
- Aviso dispensável "Instale na tela inicial": usa o evento `beforeinstallprompt` quando existir (botão Instalar); no iOS, instrução "Compartilhar › Adicionar à Tela de Início". Some quando o app já roda instalado (`display-mode: standalone`).
- Título "Elenco" + contagem "22 jogadores · 12 mensalistas".
- Botão **olho "Notas"** (`visibility` / `visibility_off`): mostra/oculta a nota média de cada jogador na lista. Persistido (`showRatings`). Toast "Notas visíveis" / "Notas ocultas".
- Busca por nome.
- Lista em ordem alfabética (pt-BR): avatar com iniciais (verde suave se goleiro), nome, ícone dourado se mensalista, tags de posição, nota (se visível). Toque abre edição.
- FAB estendido "Novo jogador".
- Vazios: "Nenhum jogador ainda" com botão "Cadastrar primeiro"; busca sem resultado: "Ninguém com esse nome".

### 2. Novo / Editar jogador (bottom sheet)
- Campo "Nome ou apelido" (foco automático no novo). Único obrigatório; erro: "Digite o nome ou apelido do jogador."
- "Posição · pode escolher mais de uma": chips Goleiro, Defesa, Ala, Meio, Ataque, Qualquer. Qualquer é padrão e exclusivo; desmarcar tudo volta para Qualquer.
- Switch Mensalista ("Paga por mês e tem prioridade na lista").
- Seção recolhível **Habilidades** (aberta na edição, fechada no novo): Ataque, Defesa, Velocidade, Habilidade, 5 estrelas cada, padrão 3. Tocar na estrela atual diminui 1. Mostra "Nota média".
- Rodapé: "Salvar e + outro" (só no novo; limpa o formulário e mantém o sheet) e "Salvar".
- Edição: "Excluir jogador" com confirmação na própria tela ("Excluir X do elenco?" · Manter · Excluir).
- Novo jogador entra já marcado como presente.

### 3. Presença
- Título "Quem veio?" + data por extenso ("Quinta, 1 de outubro").
- Dois contadores: presentes de N (verde) e goleiros.
- Atalhos: Mensalistas, Todos, Limpar.
- Lista: linha inteira alterna presença (fundo verde suave + check).
- Botão fixo: "Sortear N jogadores"; desabilitado abaixo de 4 ("Marque pelo menos 4"). Ao sortear vai para Times com toast "Times sorteados".

### 4. Times
- Sem sorteio: vazio "Bora sortear?" com botão "Marcar presença".
- Faixa de goleiro: "Marcão fixo no gol · outro gol reveza" / "Sem goleiro · revezamento nos dois gols" / "Cada time com seu goleiro".
- **Banner de anúncio** 320×100 no topo da lista (só no plano grátis e só com sorteio), rótulo "Anúncio" e link "Remover anúncios" que abre o Pro. Regras em `docs/ANUNCIOS.md`.
- Um `TeamCard` por time, cores na ordem Verde, Azul, Laranja, Grafite, Vermelho, Amarelo: cabeçalho com nome, "5 jogadores" (ou "4/5"), força média; **perfil** com 4 barras (ATA, DEF, VEL, HAB) e chips DEF/MEI/ATA (laranja se faltar); goleiro (modo um por time); jogadores; vagas abertas tracejadas "Vaga aberta — completar com 1 de fora".
- "Próxima · N" com os nomes que sobraram.
- Rodapé: "Sortear de novo" e "Copiar". Copiar gera texto para o grupo (ver abaixo). Se `navigator.share` existir, oferecer também "Enviar" (share sheet do celular, ótimo para WhatsApp).

Texto copiado:
```
Tira times · Pelada de Quinta
Quinta, 1 de outubro · 19:42

Gol: Marcão + revezamento

TIME VERDE (3,3)
  Dudu
  ...
TIME LARANJA (3,2)
  ...
  + 1 de fora

Próxima: Serginho, Paulo
```

### 5. Regras
- Card com Steppers: "Jogadores de linha por time" (sem contar o goleiro, 2–11) e "Quantidade de times" (2–6).
- Goleiros: segmentado "Fixos no gol" | "Um por time".
- Equilíbrio: switches "Equilibrar pela nota média", "Espalhar características" (desabilitado se o primeiro estiver desligado), "Garantir posições", "Prioridade para mensalistas".
- **Prévia ao vivo** "Com N presentes hoje" usando `planSummary`: goleiros, times completos, times incompletos ("1 time com 4 — completar com 1 de fora"), cobertura de posições ("Poucos DEF para todos os times — QQ e ALA completam"), excedentes.

### 6. Importar / Exportar
- Exportar: card com nome do grupo, contagem, prévia do JSON, "Copiar JSON" e "Baixar .json" (download via Blob) ou "Compartilhar" (`navigator.share` com arquivo, quando suportado).
- Importar: escolher arquivo .json ou colar texto; opção "Mesclar com o elenco" (atualiza por `id`, adiciona novos) ou "Substituir tudo"; mensagens de erro claras (JSON inválido, sem `players`, nenhum jogador com nome). Resultado: "3 adicionados e 19 atualizados."
- "Restaurar exemplo" (apenas em build de desenvolvimento/demo).
- Card **Plano e anúncios**: plano atual (Grátis/Pro), botão "Conhecer o Pro" e "Gerenciar cookies".

### 7. Tira times Pro (sheet)
- "Para quem organiza": preço (definir; protótipo usa R$ 9,90/mês como exemplo), benefícios: Sem anúncios; Controle de mensalidades (com lembrete por Pix); Histórico de sorteios; Estatísticas da galera.
- MVP: só o visual e uma flag local `pro` (para testar o comportamento sem anúncios). Pagamento real (Pix/cartão via Mercado Pago, Stripe ou similar) e contas de usuário ficam para depois, com aprovação.

### 8. Consentimento
- Banner na primeira visita (site e app compartilham a escolha). Ver `docs/ANUNCIOS.md`.

## Critérios de aceite do MVP

- [ ] Cadastrar um jogador só com nome em ≤ 3 toques após abrir o sheet.
- [ ] App instalável (manifest + service worker válidos) e funcionando offline depois da primeira visita.
- [ ] Anúncio só na tela Times, com sorteio, no plano grátis; nenhum no Pro.
- [ ] Exemplo do briefing (15 presentes, 1 goleiro, 5 por time, 3 times) mostra: 1 goleiro fixo + revezamento, 2 times de 5, 1 time de 4 com vaga aberta.
- [ ] Todos os testes de `reference/sorteio/sorteio.test.mjs` portados e passando.
- [ ] Sorteio com 30 jogadores em < 200 ms num celular médio (Chrome Android).
- [ ] Dados sobrevivem a fechar e reabrir o navegador/app.
- [ ] Exportar de um aparelho e importar em outro reproduz elenco e regras.
- [ ] Notas ocultas não aparecem na lista do Elenco.
