# Como funciona

Você roda `/motion-video` numa pasta com as gravações brutas, responde algumas caixinhas e aprova dois
planos. A skill faz o resto: transcreve, corta, planeja as animações, implementa e confere o resultado.

## As 7 etapas

1. **Organize a pasta.** Uma pasta só para o vídeo, com os arquivos brutos (.mov, .mp4). Abra o terminal
   nela, rode `claude` e digite `/motion-video`.
    - Grave cada trecho quantas vezes quiser: a skill escolhe a melhor gravação.
    - Os arquivos originais nunca são alterados. Tudo o que é gerado vai para `edit/`, `src/` e `out/`.
2. **Responda as caixinhas.** Duração, formato, estilo, legenda, modelo de legenda e termos que a
   transcrição pode errar (veja abaixo).
3. **Transcrição.** Cada arquivo é transcrito palavra por palavra, com o tempo de cada palavra, no seu
   computador. A transcrição fica salva e não é refeita.
4. **Aprove o plano de cortes.** A skill descreve em português simples o que fica, o que sai e a duração
   total. Nada é cortado antes do seu "pode seguir". É a hora de pedir para manter ou tirar algo.
5. **Corte.** A skill renderiza `edit/base_nosubs.mp4`, o corte sem legenda e sem animações, e confere cada
   ponto de corte (estalos de áudio, saltos de imagem) e a duração.
6. **Aprove o plano de cenas.** A skill cria o `scenes.json`: os momentos que ganham animação (frases-chave,
   listas, comparações, números), cada um com início, fim, tipo e o texto exato. Regra padrão: no máximo uma
   animação a cada ~8 segundos.
7. **Animações, legenda e revisão.** A skill cria um projeto Remotion na pasta, renderiza
   `out/final_motion.mp4` e confere quadros de cada cena, a duração e o volume antes de mostrar.

## As perguntas

| Rodada | Pergunta | Opções |
| --- | --- | --- |
| 1 | Duração máxima | 30 s · 60 s · 90 s · 3 min |
| 1 | Onde vai ser publicado | Vertical 9:16 · Horizontal 16:9 · Quadrado 1:1 |
| 1 | Cara do vídeo | Sóbrio e premium · Didático · Energético · Tecnológico |
| 1 | Legenda | Sim · Não |
| 2 | Estilo exato (quando a família tem mais de um) | ex.: Keynote · Editorial · Documentário |
| 2 | Modelo de legenda (se escolheu legenda) | os 4 que mais combinam com o estilo, com prévia |
| 2 | Termos que a transcrição pode errar | Não tem · Não sei, revise você · ou digitar |

Toda caixinha tem a opção "Other" para digitar uma resposta própria. Para pular perguntas, escreva as
respostas junto com o comando:

```
/motion-video 60 segundos, vertical, estilo Keynote, legenda Pílula. Termos: ChatGPT, Claude, LLM.
```

## Arquivos gerados

| Arquivo | O que é |
| --- | --- |
| `out/final_motion.mp4` | O vídeo final |
| `edit/base_nosubs.mp4` | O corte, sem legenda e sem animações |
| `edit/edl.json` | A lista de cortes |
| `scenes.json` | O plano de cenas que você aprovou |
| `src/theme.ts` | Cores, fonte e movimento do estilo |
| `src/Main.tsx` | As cenas animadas |
| `src/Captions.tsx` | A legenda no modelo escolhido |
| `edit/project.md` | O diário do projeto, com as decisões de cada sessão |

## Ajustes depois

Peça em linguagem normal: "deixe a cena 4 mais lenta", "troca a legenda para Karaokê", "troque o azul por
verde". Ou rode `npm run studio` na pasta para ver e mexer nas animações no navegador, e `npm run render`
para gerar o vídeo de novo.
