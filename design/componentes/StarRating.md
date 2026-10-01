# StarRating

Linha de habilidade com rótulo à esquerda e 5 estrelas à direita (alvos de 36px).

- Valor padrão 3 — o cadastro rápido não obriga a avaliar.
- Tocar numa estrela define a nota; tocar de novo na mesma diminui uma (permite chegar a 0 = não avaliado).
- Estrela vazia é só contorno `line-strong`; cheia é `gold-500` com contorno `gold-700`.
- As quatro habilidades vêm de `Pelada.SKILLS`: Ataque, Defesa, Velocidade, Habilidade. A nota do jogador é a média (`Pelada.rating`).
