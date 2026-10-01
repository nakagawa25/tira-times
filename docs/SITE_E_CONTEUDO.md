# Site e conteúdo

O site existe para três coisas: explicar o Tira times, trazer gente pelo Google ("sorteio de times", "tirar times pelada") e dar ao AdSense conteúdo de verdade para aprovar e exibir anúncios.

## Páginas fixas

| Rota | Conteúdo |
| --- | --- |
| `/` | Home: campo desenhado, "Times equilibrados em 1 minuto.", CTA "Abrir o Tira times" (link real para `/app/`), Como funciona (3 passos), Como o sorteio equilibra (3 camadas), Regras que toda pelada tem, FAQ, CTA final, guias em destaque. Texto base no protótipo. |
| `/app/` | O app (PWA). `noindex` não é necessário, mas o título e a descrição devem ser próprios. |
| `/guias/` | Lista de artigos |
| `/guias/[slug]/` | Artigo |
| `/regras-da-pelada/` | Guia completo de regras (pilar de SEO) |
| `/perguntas-frequentes/` | FAQ completo com `FAQPage` em JSON-LD |
| `/sobre/` · `/contato/` · `/privacidade/` · `/termos/` | Obrigatórias para o AdSense |

SEO técnico: `<title>` e `description` por página, Open Graph, `sitemap.xml` (`@astrojs/sitemap`), `robots.txt`, URLs canônicas, JSON-LD (`WebSite`, `SoftwareApplication` na home, `Article` nos guias, `FAQPage`), `lang="pt-BR"`.

## Plano editorial inicial

Escreva com o Lucas revisando cada texto. Conteúdo **original e útil**: o Google recusa texto genérico ou feito em massa. Cada artigo: 700–1.500 palavras, exemplos reais de pelada, um chamado para o app no fim (sem exagero), data e autor.

| Slug | Título | Ideia central |
| --- | --- | --- |
| `como-tirar-times-equilibrados` | Como tirar times equilibrados na pelada | Média, características e posições; erro de só olhar o "melhor jogador" |
| `regras-da-pelada` | Regras da pelada: o guia completo | Goleiro fixo, time de fora, tempo e gols, empate, completar com 1 de fora |
| `como-organizar-pelada-semanal` | Como organizar uma pelada semanal sem dor de cabeça | Lista, horário, quadra, grupo, presença |
| `mensalista-ou-avulso` | Mensalista ou avulso: como cobrar a pelada | Modelos de cobrança, prioridade, Pix, inadimplência |
| `quantos-jogadores-por-time` | Quantos jogadores por time no society, futsal e campo | Tabelas por modalidade e tamanho de quadra |
| `goleiro-fixo-ou-revezamento` | Goleiro fixo ou revezamento? | Prós e contras, como decidir no dia |
| `como-avaliar-jogadores-sem-briga` | Como dar nota para os jogadores sem criar briga | Critérios por característica, notas ocultas, revisão periódica |
| `time-de-fora-regras` | Time de fora: quem sai, quem entra | Variações de rodízio e critérios de desempate |
| `sorteio-de-times-online` | Sorteio de times online: o que olhar numa ferramenta | Comparação de critérios (sem citar concorrentes de forma negativa) |
| `numero-impar-de-jogadores` | O que fazer quando o número de jogadores não fecha | Time incompleto, completar com 1 de fora, próxima |
| `aquecimento-para-pelada` | Aquecimento rápido antes da pelada | 10 minutos para evitar lesão (revisar com cuidado; sem promessa médica) |
| `pelada-com-chuva` | Pelada com chuva: cuidados com quadra e bola | Prático, sazonal |

Meta para pedir o AdSense: home + páginas fixas + pelo menos 10–12 guias publicados e revisados. (O Google não publica um número mínimo; isto é uma meta prática.)

## Layout do artigo (mobile first)

Título (balance), data e tempo de leitura, texto com 65ch, intertítulos, listas e tabelas responsivas (`overflow-x: auto`), 1 anúncio após o 2º parágrafo e 1 antes da conclusão, caixa final "Tire os times no Tira times" com link para `/app/`, artigos relacionados.
