# motion-video

Skill para o [Claude Code](https://claude.com/claude-code) que transforma gravações brutas de talking head
em um vídeo curto editado, legendado e com motion design.

Você coloca os arquivos numa pasta, digita `/motion-video` e responde algumas perguntas. A skill transcreve
no seu computador, escolhe as melhores gravações, corta, planeja as animações e renderiza o vídeo final com
[Remotion](https://www.remotion.dev). Nada é cortado ou animado antes da sua aprovação.

- **8 estilos visuais:** Keynote, Editorial, Documentário, Bloco de notas, Quadro branco, Shorts energético,
  Terminal e Futurista.
- **6 modelos de legenda**, palavra por palavra no tempo da fala: Reels clássica, Karaokê, Pílula, Palavra
  gigante, Cinema e Marca-texto.
- **Vertical, horizontal ou quadrado**, com duração de 30 s a 3 min.
- **Sem custo de API:** a transcrição roda localmente com Whisper, via
  [freecut](https://github.com/Moh4696/freecut).

## Instalação

Com o Claude Code instalado, rode:

```
/plugin marketplace add joaby-oliveira/motion-video
/plugin install motion-video@motion-video
```

Reinicie o Claude Code e rode `/motion-video setup`. A skill confere ffmpeg, Node.js 22+, uv, freecut e o
Whisper local, e pergunta antes de instalar o que faltar.

Prefere o terminal? Use os scripts de instalação:

```bash
git clone https://github.com/joaby-oliveira/motion-video
cd motion-video
bash scripts/install.sh --with-skill        # Mac, Linux ou Git Bash
```

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -WithSkill   # Windows
```

Detalhes e instalação manual em [docs/instalacao.md](docs/instalacao.md).

## Uso

1. Crie uma pasta só para o vídeo e coloque nela os arquivos brutos (.mov, .mp4). Pode gravar cada trecho
   várias vezes: a skill fica com a melhor versão.
2. Abra o terminal nessa pasta, rode `claude` e digite `/motion-video`.
3. Responda as perguntas (duração, formato, estilo, legenda) e aprove o **plano de cortes** e o **plano de
   cenas**.
4. O vídeo sai em `out/final_motion.mp4`. Os originais nunca são alterados.

Para pular as perguntas, escreva as respostas junto com o comando:

```
/motion-video 60 segundos, vertical, estilo Keynote, legenda Pílula. Termos: ChatGPT, Claude, LLM.
```

Depois, peça ajustes em linguagem normal: "deixe a cena 4 mais lenta", "troca a legenda para Karaokê".

## Documentação

| Guia | Conteúdo |
| --- | --- |
| [Como funciona](docs/como-funciona.md) | As 7 etapas, as perguntas e os arquivos gerados |
| [Estilos](docs/estilos.md) | Os 8 estilos visuais e como escolher |
| [Legendas](docs/legendas.md) | Os 6 modelos de legenda e o componente `Captions.tsx` |
| [Roteiro](docs/roteiro.md) | Estrutura de roteiro e dicas de gravação para facilitar a edição |
| [Instalação](docs/instalacao.md) | Plugin, scripts e instalação manual |
| [Problemas comuns](docs/problemas.md) | Erros conhecidos e como resolver |

## Estrutura do repositório

```
.claude-plugin/         manifesto do plugin e do marketplace
skills/motion-video/
  SKILL.md              o roteiro que o Claude Code segue
  templates/            componente de legenda (Captions.tsx)
  examples/keynote/     projeto Remotion completo no estilo Keynote
scripts/                instaladores e patch de compatibilidade do freecut
docs/                   guias
```

## Créditos

Corte e transcrição pelo [freecut](https://github.com/Moh4696/freecut); animações pelo
[Remotion](https://www.remotion.dev). O Remotion tem licença própria, que pode exigir uma licença paga para
empresas: confira em [remotion.dev/license](https://www.remotion.dev/license).
