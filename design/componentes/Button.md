# Button

Botão de ação em pílula; `primary` para a única ação principal da tela (Sortear, Salvar).

- **primary** — fundo `pitch-600`. No máximo um por tela.
- **tonal** — fundo `pitch-100`, ações de apoio (Sortear de novo, Salvar e adicionar outro).
- **outline** — neutras (Cancelar, Escolher arquivo).
- **ghost** / **danger** — ações de texto; danger só para excluir.
- **fab** — botão flutuante estendido do Elenco ("Novo jogador"), canto inferior direito.
- `size="lg"` + `block` para o botão fixo no rodapé (Sortear na Presença).

Você fornece: `children` (verbo curto), `icon` (nome Material Symbols), `onClick`.
