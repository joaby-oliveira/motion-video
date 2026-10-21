---
name: motion-video
description: Transforma gravações brutas de talking head em um vídeo curto editado, com legenda e motion design (estilos Keynote, Bloco de notas, Editorial, Terminal, Shorts energético, Quadro branco, Futurista, Documentário; 6 modelos de legenda). Use quando o usuário digitar /motion-video, pedir para "editar esses vídeos com animação", "fazer um vídeo estilo Apple/Keynote", "juntar os vídeos e animar", ou /motion-video setup para conferir as ferramentas.
---

# motion-video

Você conduz um fluxo de três etapas sobre os vídeos da pasta atual:

1. **Corte**: transcrever, escolher os melhores trechos e cortar (via skill `freecut`).
2. **Plano de cenas**: decidir quais momentos ganham animação (`scenes.json`).
3. **Motion design + legenda**: implementar em Remotion no estilo e no modelo de legenda escolhidos.

O usuário pode rodar só `/motion-video`, sem informar nada: você pergunta tudo em caixinhas (seção 1).
Há **duas paradas obrigatórias para aprovação**: o plano de cortes e o plano de cenas. Nunca corte nem
implemente antes do "pode seguir" do usuário. Fale em português do Brasil, com mensagens curtas.
Os arquivos originais nunca são alterados.

## 0. Pré-checagem (sempre; e é tudo que `/motion-video setup` faz)

Confira, sem instalar nada:

| Item | Como checar | Mínimo |
| --- | --- | --- |
| ffmpeg + ffprobe | `ffmpeg -version` | qualquer |
| Node.js | `node -v` | 22 |
| uv | `uv --version` | qualquer |
| freecut | existe `~/.claude/skills/freecut/SKILL.md` e `~/Developer/freecut/.venv` | — |
| Whisper local | `~/Developer/freecut/.venv/Scripts/python.exe -c "import faster_whisper"` (Mac: `.venv/bin/python`, `mlx_whisper`) | — |

Confira também se a pasta atual tem vídeos (.mov, .mp4, .mkv). Se não tiver, avise e pare.

Mostre a tabela com o status. Se algo faltar, pergunte em caixinha (AskUserQuestion) se pode instalar
agora. Com o "sim", instale **só o que falta**, sem reinstalar o que já funciona:

- ffmpeg: Windows `winget install Gyan.FFmpeg.Essentials` · Mac `brew install ffmpeg` · Linux `sudo apt install ffmpeg`.
- Node.js 22+: Windows `winget install OpenJS.NodeJS.LTS` · Mac `brew install node`.
- uv: Windows `winget install astral-sh.uv` · Mac `brew install uv` · Linux `curl -LsSf https://astral.sh/uv/install.sh | sh`.
- freecut: `git clone https://github.com/Moh4696/freecut ~/Developer/freecut`, depois dentro dela
  `uv sync --extra whisper-fast` (Mac com chip Apple: `--extra whisper-mlx`).
- Registrar o freecut como skill: `~/.claude/skills/freecut` apontando para `~/Developer/freecut`
  (Windows: `New-Item -ItemType Junction`; Mac/Linux: `ln -s`).
- Aplicar as correções de compatibilidade abaixo.

Se um instalador pedir senha ou exigir reiniciar o terminal, pare e explique o que o usuário deve fazer.
Quem preferir o terminal tem os scripts `scripts/install.sh` e `scripts/install.ps1` no repositório
https://github.com/joaby-oliveira/motion-video.

Compatibilidade conhecida do freecut (corrija se o arquivo ainda estiver no estado antigo):

- `helpers/transcribe.py`: se o faster-whisper recebe `str(audio_path)`, troque por um array carregado
  com `librosa.load(str(audio_path), sr=16000, mono=True)`. Motivo: o decoder do faster-whisper passa
  `metadata_errors=` ao `av.open()`, que o PyAV 15+ recusa.
- `helpers/render.py`: o caminho da legenda no filtro do ffmpeg deve usar `.as_posix()` (barras
  invertidas do Windows quebram o filtro).
- Sempre rode os helpers com `PYTHONUTF8=1` (no Windows o Python lê o JSON como cp1252 e estraga acentos).
- O `!` do Claude Code roda bash (Git Bash no Windows): passe comandos em sintaxe bash, nunca `$env:` ou `&`.

## 1. Briefing em caixinhas

Use **AskUserQuestion** para todas as escolhas, sempre em caixinhas de múltipla escolha. Pule apenas uma
pergunta que o usuário já tenha respondido na mensagem. **Nunca assuma a duração**: ela é sempre perguntada.
No máximo duas chamadas (rodadas), cada uma com até 4 perguntas.

**Rodada 1** (uma chamada só):

| Header | Pergunta | Opções |
| --- | --- | --- |
| Duração | Qual a duração máxima do vídeo final? | 30 s · 60 s · 90 s · 3 min |
| Formato | Onde o vídeo vai ser publicado? | Vertical 9:16 (Reels, TikTok, Shorts) · Horizontal 16:9 (YouTube) · Quadrado 1:1 (feed) |
| Estilo | Qual a cara do vídeo? | Sóbrio e premium · Didático · Energético · Tecnológico |
| Legenda | Quer legenda no vídeo? | Sim · Não |

Na descrição de cada opção de Estilo, liste os estilos da família: Sóbrio e premium = Keynote, Editorial,
Documentário · Didático = Bloco de notas, Quadro branco · Energético = Shorts energético · Tecnológico =
Terminal, Futurista.

**Rodada 2** (uma chamada, só com as perguntas que se aplicam):

- **Estilo exato**, se a família tiver mais de um estilo. Uma opção por estilo, com a descrição da seção 4
  e um `preview` em ASCII do layout.
- **Modelo de legenda**, se Legenda = Sim. Mostre os 4 modelos que mais combinam com o estilo escolhido
  (o recomendado primeiro, com "(Recomendado)"), cada um com um `preview` em ASCII como os da seção 5.
  Na descrição da pergunta, cite os outros 2 modelos pelo nome (o usuário pode digitá-los em "Other").
- **Termos**: "A transcrição pode errar algum nome ou termo em inglês?" com as opções
  "Não tem" e "Não sei, revise você" (descrição: "Se tiver, escolha Other e digite os termos separados por
  vírgula").

Trechos que precisam ficar ou sair não são perguntados aqui: o usuário diz isso ao aprovar o plano de cortes.

## 2. Etapa 1: Corte (via freecut)

Invoque a skill `freecut` e siga as regras dela (Hard Rules valem integralmente). Pontos aprendidos:

- Transcreva com `transcribe_batch.py <pasta> --language pt` e gere `edit/takes_packed.md`.
- Se o roteiro seguiu o modelo de 7 blocos (gancho, definição, analogia, como funciona, frase-chave,
  mito × verdade, prova + chamada), use os blocos para organizar o plano.
- **Os tempos de palavra do Whisper se esticam sobre silêncios longos.** Encaixe as bordas dos cortes
  nos silêncios reais detectados no áudio:
  `ffmpeg -i <arquivo> -map 0:a -af silencedetect=n=-38dB:d=0.35 -f null -` (use `n=-35dB:d=0.08` em
  janelas curtas para refinar bordas duvidosas).
- Corte pausas internas longas de listas faladas dividindo em segmentos menores.
- A soma dos trechos deve ficar até a duração escolhida (mire em 95–100% dela).
- Mostre o plano em português simples (bloco, o que é dito, o que sai e por quê, duração total) e
  **espere aprovação**. Aceite pedidos de "manter X" ou "tirar Y" nesse momento.
- Renderize **sem legenda**: `render.py edit/edl.json -o edit/base_nosubs.mp4 --no-subtitles`.
  A legenda é desenhada no Remotion (seção 6), no modelo escolhido.
- Formato vertical ou quadrado com fonte horizontal: recorte centralizado no rosto (confira com
  `timeline_view.py`) durante a extração; o freecut aceita `--filter` para o crop/scale.
- Autoavaliação: `timeline_view.py` sobre o vídeo renderizado, em janelas de 30 s, procurando picos de
  áudio nos cortes e saltos de imagem; `ffprobe` para conferir a duração.

## 3. Etapa 2: Plano de cenas

1. Transcreva o corte numa pasta separada (para não misturar com as gravações):
   `transcribe.py edit/base_nosubs.mp4 --language pt --edit-dir edit/verify/cut_tx`.
2. Monte `src/words.json` com **uma entrada por palavra** (`[{text, start, end}]`, segundos), já com os
   termos corrigidos (os do briefing; e junções como "Chat" + "Ept" → "ChatGPT", "ir rar" → "errar").
   Esses tempos servem para a legenda e para sincronizar as cenas.
3. Crie `scenes.json` na raiz da pasta:

```json
{
  "source": "edit/base_nosubs.mp4",
  "duration": 89.7,
  "style": "Keynote",
  "captions": "pilula",
  "scenes": [
    {
      "id": 1, "start": 4.18, "end": 10.98, "type": "title_definition", "video_mode": "card",
      "spoken": "texto falado exato, com erros de transcrição corrigidos",
      "on_screen": ["O que é uma LLM?", "Large Language Model"],
      "cues": [{"t": 4.18, "show": "O que é uma LLM?"}, {"t": 6.78, "show": "Large Language Model"}]
    }
  ],
  "skipped": [{"start": 71.1, "end": 73.9, "spoken": "...", "reason": "..."}]
}
```

Regras:

- Tipos: `key_phrase`, `title_definition`, `list`, `comparison`, `myth_vs_fact`, `counter`, `chart`, `cta`.
- `video_mode`: `card` (vídeo encolhe, texto ao lado) ou `full` (vídeo escurecido, texto por cima).
- **No máximo 1 cena a cada ~8 s** (distância entre os `start`). Registre o que ficou de fora em `skipped`.
- Poucas palavras na tela (até ~6). Cada `cue.t` = o instante da palavra falada correspondente.
- `counter` só se um número for **falado e estiver no corte**. Nunca invente números.
- Mostre uma tabela resumida (tempo, tipo, o que aparece, card/tela cheia) e **espere aprovação**.

## 4. Estilos

Gere `src/theme.ts` a partir do estilo escolhido. Tokens obrigatórios em todo tema: `colors`
(fundo, texto, texto secundário, um destaque), `fonts`, `type` (hero/title/subtitle/body/label/number),
`layout`, `springConfig`, `motion` (riseDistance, scaleFrom, transitionSeconds), `videoCard` e os helpers
`enterProgress`, `countUp`, `videoFrameStyle`. Fontes sempre via `@remotion/google-fonts/<Fonte>`.

| Estilo | Cores (fundo / texto / secundário / destaque) | Fontes | Movimento | Vídeo |
| --- | --- | --- | --- | --- |
| Keynote | #000 / #FFF / #A1A1A6 / #2F7BFF (gradiente até #6AA8FF) | Inter 700–800 | fade + subida 30px + escala 0.96→1; spring damping 200, stiffness 80, sem overshoot; 0,8 s | card 600×820, raio 40, sombra suave, à direita |
| Bloco de notas | #FBF7EC (com linhas #E8E1CF) / #1C1C1E / #6E6E73 / marca-texto #FFE066 | Inter + Caveat | linhas "digitadas", check que se desenha, marca-texto varrendo da esquerda; 0,6 s | card pequeno inclinado 2°, como foto colada |
| Editorial | #F4F0E8 / #111 / #6B6B6B / #C4622D | Instrument Serif (títulos) + Inter | revelação por máscara de baixo para cima; 1 s | recorte vertical sem sombra |
| Terminal | #0A0A0A / #EDEDED / #6E6E6E / #FF5A00 | JetBrains Mono | digitação letra a letra (centralize pela largura da frase completa), cursor piscando | janela com barra de 28px e três pontos cinza |
| Shorts energético | #000 / #FFF / #BDBDBD / #FFE600 | Anton (maiúsculas) | palavra por palavra no tempo da fala; zoom "soco" 1→1.08 em 0,25 s; damping 18 | sempre tela cheia; zoom nos picos |
| Quadro branco | #FFF / #1B1B1B / #7A7A7A / #1E5BFF (+ #E5383B para erro) | Patrick Hand | traços e setas com `strokeDashoffset`; 0,8 s | card ao lado do desenho |
| Futurista | #070B1A / #F2F5FF / #8A93B2 / #22D3EE → #A855F7 | Space Grotesk | cards de vidro (blur 24px, borda rgba branca 0.12) deslizando; brilho suave | dentro de card de vidro |
| Documentário | #000 com barras 2.39:1 / #F5EFE6 / #B8AFA3 / #D9A35B | Cormorant (títulos) + Inter | fades de 1,5 s, letreiro de nome no canto inferior esquerdo | tela cheia com cor quente |

Se o usuário descrever um estilo próprio, siga a descrição dele. Nunca use logos, ícones ou marcas de
terceiros: nomes de produtos aparecem só como texto.

## 5. Modelos de legenda

A legenda usa a fonte e a cor de destaque do estilo, salvo quando o modelo diz outra coisa. Cada modelo
define quantas palavras aparecem por vez (bloco), a caixa (maiúsculas ou normal), a posição e a animação.

| Modelo | Bloco | Caixa | Visual | Animação | Combina com |
| --- | --- | --- | --- | --- | --- |
| Reels clássica | 2 palavras | MAIÚSCULAS | branco 800, contorno preto 3px | corte seco | Shorts energético, Terminal |
| Karaokê | 3–4 palavras | MAIÚSCULAS | branco; a palavra falada vira cor de destaque e cresce 1.06× | troca de cor no tempo da palavra | Shorts energético, Futurista |
| Pílula | até 6 palavras, quebra em pausas | normal | Inter 600 sobre pílula preta 70% de opacidade, raio 999 | fade + subida 8px | Keynote, Futurista |
| Palavra gigante | 1 palavra | MAIÚSCULAS | 140px no centro da tela, palavras-chave na cor de destaque | "pop" de escala 0.8→1 em 0,15 s | Shorts energético (sem cenas `full`) |
| Cinema | frase completa, até 2 linhas | normal | branco 500 com sombra suave, sem fundo | fade 0,2 s | Documentário, Editorial |
| Marca-texto | até 6 palavras | normal | texto escuro sobre faixa clara; palavras-chave com fundo marca-texto | marca-texto varre da esquerda | Bloco de notas, Quadro branco |

Previews para a pergunta da rodada 2 (adapte o texto):

```
Reels clássica      Karaokê               Pílula                   Palavra gigante
+--------------+    +--------------+      +----------------+       +--------------+
|              |    |              |      |                |       |              |
|  [ rosto ]   |    |  [ rosto ]   |      |   [ rosto ]    |       |   PALAVRA    |
|              |    |              |      |                |       |              |
|  O QUE É     |    | O QUE É *UMA*|      | ( O que é uma  |       |  [ rosto ]   |
|              |    |     LLM      |      |     LLM? )     |       |              |
+--------------+    +--------------+      +----------------+       +--------------+
```

Implementação (já pronta em `templates/Captions.tsx`; camada final do Remotion, por cima de tudo):

- Monte os blocos a partir das palavras de `src/words.json`: quebre no tamanho do modelo e também em
  pontuação ou em pausas ≥ 0,35 s. Cada bloco vai do `start` da primeira palavra ao `end` da última.
- Karaokê: a palavra ativa é a que tem `start ≤ t < end`; mantenha a última ativa até a próxima começar.
- Posição: horizontal a 72px da base; **vertical a ~68% da altura** (fora da área da interface do
  Reels/TikTok); Palavra gigante sempre no centro.
- Esconda a legenda enquanto uma cena com texto grande estiver na tela:
  `t ∈ [sceneIn(s) − 0.1, s.end + transitionSeconds]`.
- Nunca mais de 2 linhas; nenhuma linha passa de 80% da largura do vídeo.

## 6. Etapa 3: Motion design em Remotion

Projeto na própria pasta dos vídeos. Instale só se `node_modules/remotion` não existir, com **todas as
versões `@remotion/*` idênticas**:

```bash
V=4.0.537
npm install remotion@$V @remotion/cli@$V @remotion/google-fonts@$V react@19.1.0 react-dom@19.1.0
npm install -D typescript@5.8.3 @types/react@19.1.8
mkdir -p public && cp edit/base_nosubs.mp4 public/base.mp4 && cp scenes.json src/scenes.json
cp <pasta desta skill>/templates/Captions.tsx src/Captions.tsx
```

`package.json` scripts: `"studio": "remotion studio src/index.ts"`,
`"render": "remotion render src/index.ts Main out/final_motion.mp4 --crf=18"`.
`tsconfig.json`: `moduleResolution: Bundler`, `jsx: react-jsx`, `resolveJsonModule: true`, `strict: true`.

Estrutura: `src/index.ts` → `registerRoot`; `src/Root.tsx` → `<Composition id="Main">` com largura e
altura do formato escolhido e o fps e a duração do `base.mp4` (via ffprobe); `src/Main.tsx` com as cenas;
`src/Captions.tsx` com a legenda.

Arquivos prontos ao lado deste SKILL.md (use-os em vez de reescrever):

- `templates/Captions.tsx`: os 6 modelos de legenda (seção 5), já testados. Copie para `src/Captions.tsx` e
  use `<Captions words={...} model="pilula" theme={...} keywords={[...]} hidden={(t) => ...} />`.
  Modelos: `reels`, `karaoke`, `pilula`, `gigante`, `cinema`, `marca-texto`.
- `examples/keynote/`: um projeto completo de referência (vídeo "O que é uma LLM", estilo Keynote,
  9 cenas, legenda Pílula): `theme.ts`, `Main.tsx`, `Root.tsx`, `scenes.json`, `words.json`, `package.json`.
  Leia `Main.tsx` antes de escrever as cenas: ele mostra cada tipo de cena implementado.

Núcleo que deve existir em `Main.tsx`:

```tsx
// Visual start: the first cue, never before the scene start.
const sceneIn = (s: Scene) => Math.max(s.start, s.cues[0].t) - 0.2;

// Entrance + optional exit on the theme spring.
const fx = (frame: number, fps: number, inS: number, outS?: number): CSSProperties => {
	const pIn = enterProgress(frame, fps, seconds(inS, fps));
	const pOut = outS === undefined ? 0 : enterProgress(frame, fps, seconds(outS, fps));
	const y = motion.riseDistance * (1 - pIn) - (motion.riseDistance / 2) * pOut;
	const scale = 1 - (1 - motion.scaleFrom) * (1 - pIn) - (1 - motion.scaleFrom) * pOut;
	return {opacity: pIn * (1 - pOut), transform: `translateY(${y}px) scale(${scale})`};
};

// 0 outside / 1 inside the scenes of a video_mode (springs in at sceneIn, out at end).
const modeProgress = (frame: number, fps: number, mode: 'card' | 'full') =>
	Math.min(1, scenes.filter((s) => s.video_mode === mode).reduce((acc, s) =>
		acc + enterProgress(frame, fps, seconds(sceneIn(s), fps)) - enterProgress(frame, fps, seconds(s.end, fps)), 0));
```

Camadas, nesta ordem:

1. Fundo do tema.
2. `<OffthreadVideo src={staticFile('base.mp4')}>` dentro de um `div` com `videoFrameStyle(modeProgress(..., 'card'))`
   e `objectFit: 'cover'`.
3. Véu escuro com opacidade `modeProgress(..., 'full') * 0.62`.
4. Componentes das cenas ativas (um por `id`), com cada elemento entrando em `fx(frame, fps, cue.t, ...)`.
   Texto no modo card fica numa coluna à esquerda do card: largura = 1920 − margem − card − margem − 100.
5. **Legenda por último** (seção 5), se o usuário pediu legenda.

Layout por formato:

- Horizontal (1920×1080): card à direita, texto à esquerda.
- Vertical (1080×1920): card na metade de baixo (900×900), texto na metade de cima; tipografia ~85%.
- Quadrado (1080×1080): card 460×560 à direita, texto à esquerda com tipografia ~70%.

## 7. Verificação (antes de mostrar ao usuário)

1. `npx tsc -p .` sem erros.
2. Stills em momentos-chave (`npx remotion still src/index.ts Main out/s_<t>.png --frame=<t*fps> --scale=0.5`).
   Confira: texto quebrando em linhas demais, rosto escondido pelo card ou pela legenda, legenda
   aparecendo junto com texto grande.
3. Render completo; mosaico 4×4 de quadros (um por cena + intervalos) com ffmpeg `tile=4x4`.
4. Duração do `out/final_motion.mp4` dentro do limite escolhido.
5. Volume: `ffmpeg -i out/final_motion.mp4 -af ebur128 -f null -` deve dar cerca de −14 LUFS.

Até 3 rodadas de correção; se algo persistir, avise o usuário em vez de esconder.

## 8. Entrega e memória

- Diga onde está o vídeo final, a duração, o estilo, o modelo de legenda, o que foi feito e o que ficou de
  fora (`skipped`).
- Anexe uma seção em `edit/project.md` com estilo, legenda, cenas e pendências.
- Ajustes depois: o usuário pode pedir em linguagem natural ("troca a legenda para Karaokê") ou rodar
  `npm run studio`.
