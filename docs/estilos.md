# Estilos visuais

A skill pergunta a "cara do vídeo" (uma família) e, quando a família tem mais de um estilo, qual deles.
Cada estilo vira um `src/theme.ts` com cores, fontes, movimento e o jeito de mostrar o seu vídeo. Todas as
fontes são gratuitas (Google Fonts) e nenhum estilo usa logo ou marca de terceiros.

| Família | Estilo | Visual | Fonte | Movimento | Seu vídeo | Melhor para |
| --- | --- | --- | --- | --- | --- | --- |
| Sóbrio e premium | **Keynote** | Fundo preto, texto branco, um azul de destaque, muito espaço vazio | Inter, títulos enormes em negrito | Fade + leve subida + escala 0.96→1, lento, sem quique | Encolhe para um card arredondado com sombra | Explicações, tecnologia, "o que é X" |
| Sóbrio e premium | **Editorial** | Fundo off-white, texto quase preto, terracota de destaque | Instrument Serif + Inter | Texto revelado por máscara de baixo para cima | Recorte vertical, como foto de revista | Opinião, histórias, carreira |
| Sóbrio e premium | **Documentário** | Faixas pretas em cima e embaixo, cor quente | Cormorant + Inter | Fades longos, letreiro de nome no canto | Tela cheia, cor tratada | Histórias pessoais, viagens, entrevistas |
| Didático | **Bloco de notas** | Papel creme com linhas, marca-texto amarelo | Inter + Caveat | Linhas "digitadas", itens ganhando check | Card pequeno, como foto colada | Listas, dicas, "3 coisas que…" |
| Didático | **Quadro branco** | Fundo branco, traços de caneta azul e vermelha | Patrick Hand | Linhas e setas que se desenham sozinhas | Card ao lado do desenho | Aulas, conceitos com etapas |
| Energético | **Shorts energético** | Preto com amarelo forte, palavras gigantes | Anton, tudo maiúsculo | Palavra por palavra no ritmo da fala, zoom curto | Sempre tela cheia, zoom nos picos | Reels, TikTok e Shorts |
| Tecnológico | **Terminal** | Fundo quase preto, laranja de destaque | JetBrains Mono | Texto digitado letra a letra, cursor piscando | Janela com barra de título minimalista | Programação, ferramentas |
| Tecnológico | **Futurista** | Azul-marinho escuro, cards translúcidos, ciano e roxo | Space Grotesk | Cards que deslizam com desfoque, números que sobem | Dentro de um card de vidro | IA, lançamentos, novidades |

As cores exatas de cada estilo estão na seção 4 do [`SKILL.md`](../skills/motion-video/SKILL.md).

## Como escolher rápido

- Quer parecer sério e premium? **Keynote** ou **Editorial**.
- É uma lista ou um tutorial? **Bloco de notas** ou **Quadro branco**.
- Vai postar em vertical e precisa prender atenção? **Shorts energético**.
- O público é técnico? **Terminal**.

## Estilo próprio

Escolha "Other" na pergunta e descreva: cores (fundo, texto, uma cor de destaque), tipografia, movimento,
ritmo e como o seu vídeo aparece. Também dá para misturar: "Keynote, mas com fundo branco e verde de
destaque".

O exemplo completo do estilo Keynote está em
[`skills/motion-video/examples/keynote`](../skills/motion-video/examples/keynote).
