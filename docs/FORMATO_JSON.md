# Formato de importação / exportação

Schema: `reference/formato.schema.json`. Exemplo completo: `reference/exemplo-export.json`.

```json
{
  "app": "tira-times",
  "version": 1,
  "exportedAt": "2026-10-01T20:00:00-03:00",
  "group": { "name": "Pelada de Quinta" },
  "rules": { "linePerTeam": 5, "teams": 3, "goalkeepers": "fixed", "balance": true, "traits": true, "positions": true, "monthlyPriority": true },
  "players": [
    { "id": "p01", "name": "Marcão", "positions": ["GOL"], "monthly": true,
      "skills": { "attack": 1, "defense": 4, "speed": 2, "skill": 3 } }
  ]
}
```

## Regras de importação (tolerante)

- Exige `players` como array; aceita `app` = `"tira-times"` ou `"pelada"` (versão antiga do design) ou ausente.
- Ignora jogadores sem `name` (string não vazia, aparada).
- `positions`: mantém só valores válidos; vazio → `["QQ"]`. Se tiver `QQ` junto com outras, remova `QQ`.
- `skills`: cada valor vira inteiro entre 0 e 5; ausente ou inválido → 3.
- `id` ausente → gerar novo.
- `rules`: mesclar com as regras padrão (campos faltando ganham o padrão).
- `group.name` substitui o nome do grupo se existir.
- **Mesclar**: atualiza jogadores com o mesmo `id` e adiciona os novos; mantém presença e último sorteio.
- **Substituir**: troca o elenco, limpa presença e último sorteio.
- Erros (texto para o usuário):
  - JSON inválido: "Esse texto não é um JSON válido. Copie o arquivo inteiro, do primeiro { ao último }."
  - Sem `players`: "Não achei a lista \"players\" nesse JSON. Ele precisa ter sido exportado pelo Tira times."
  - Nenhum jogador válido: "O arquivo não tem nenhum jogador com nome."

Nome do arquivo exportado: `tira-times-<grupo-em-slug>-AAAA-MM-DD.json`.
