# TeamCard

Card de um time sorteado: faixa na cor do colete, contagem, força média e a lista de jogadores.

- `color`: `verde | azul | laranja | grafite | vermelho | amarelo` (tokens `team-*`), atribuídas nessa ordem.
- `goalkeeper` (modo "um por time") mostra uma faixa verde suave com o goleiro.
- `missing` desenha vagas tracejadas em `warn-100`: "Vaga aberta — completar com 1 de fora". Com `otherTeamsPlayers` preenchido (os jogadores dos outros times do sorteio), nomeia até 3 candidatos de nota mais parecida com a média do time ("completar com: Fulano ou Ciclano") — é só sugestão de quem pegar emprestado, quem entra de fato é escolha de quem organiza.
- `showProfile` mostra o perfil do time: 4 barras (ATA, DEF, VEL, HAB) com a média de cada característica e os chips de posição DEF · MEI · ATA (laranja quando falta). É o que deixa o equilíbrio do sorteio visível.
- Recebe direto um item de `Pelada.drawTeams(...).teams`.
