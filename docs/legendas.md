# Modelos de legenda

Se você quiser legenda, a skill mostra os 4 modelos que mais combinam com o estilo escolhido, cada um com
uma prévia, e você escolhe um. A legenda é desenhada palavra por palavra no tempo exato da fala, usa a
fonte e a cor de destaque do estilo e some sempre que um texto grande de animação está na tela.

| Modelo | Como aparece | Animação | Combina com |
| --- | --- | --- | --- |
| **Reels clássica** (`reels`) | 2 palavras por vez, MAIÚSCULAS, branco grosso com contorno preto | Troca seca, sem efeito | Shorts energético, Terminal |
| **Karaokê** (`karaoke`) | 3–4 palavras em MAIÚSCULAS; a palavra falada muda para a cor de destaque | A cor acompanha a fala palavra por palavra | Shorts energético, Futurista |
| **Pílula** (`pilula`) | Frase curta (até 6 palavras) em letra normal, dentro de uma pílula preta translúcida | Fade + leve subida | Keynote, Futurista |
| **Palavra gigante** (`gigante`) | Uma palavra por vez, enorme, no centro; palavras-chave na cor de destaque | "Pop" rápido de escala | Shorts energético |
| **Cinema** (`cinema`) | Frase completa em até 2 linhas, branco com sombra suave, sem fundo | Fade curto | Documentário, Editorial |
| **Marca-texto** (`marca-texto`) | Frase curta escura sobre faixa clara; palavras-chave com marca-texto | O marca-texto passa da esquerda para a direita | Bloco de notas, Quadro branco |

## Detalhes

- **Posição:** no horizontal, perto da base. No vertical, a cerca de 68% da altura, acima da área onde o
  Reels e o TikTok mostram botões e descrição. A Palavra gigante fica sempre no centro.
- **Blocos:** as palavras são agrupadas pelo tamanho do modelo e quebradas em pontuação ou em pausas de
  0,35 s ou mais. Nunca passam de 2 linhas nem de 80% da largura do vídeo.
- **Termos corrigidos:** nomes próprios e termos em inglês que você informar são corrigidos antes de virar
  legenda ("Chat Ept" → "ChatGPT").
- **Trocar depois:** peça "troca a legenda para Karaokê".

## Para desenvolvedores

O componente está em [`skills/motion-video/templates/Captions.tsx`](../skills/motion-video/templates/Captions.tsx)
e pode ser usado em qualquer projeto Remotion:

```tsx
import {Captions} from './Captions';
import words from './words.json'; // [{text, start, end}] em segundos

<Captions
	words={words}
	model="karaoke"
	theme={{fontFamily: 'Inter', text: '#FFFFFF', accent: '#FFE600', ink: '#111111'}}
	keywords={['LLM', 'internet']}
	hidden={(t) => t > 30 && t < 36}
/>;
```
