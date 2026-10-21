# Instalação

Você instala uma vez e usa em qualquer pasta de vídeos. São duas partes: a **skill** (o roteiro que o
Claude Code segue) e as **ferramentas** que ela usa (ffmpeg, Node.js, uv, freecut e Whisper).

## Antes de tudo: Claude Code

O Claude Code é o único item instalado à mão. Ele exige o Node.js 18 ou mais novo (a skill pede o 22+ para o
Remotion, e o instalador cuida disso depois).

| Sistema | Comando |
| --- | --- |
| Windows | instale o Node.js em [nodejs.org](https://nodejs.org) e rode `npm install -g @anthropic-ai/claude-code` |
| Mac | `brew install node && npm install -g @anthropic-ai/claude-code` |
| Linux | instale o Node.js pelo gerenciador da sua distro e rode `npm install -g @anthropic-ai/claude-code` |

## Opção 1 (recomendada): plugin do Claude Code

Abra o Claude Code em qualquer pasta (`claude`) e rode:

```
/plugin marketplace add joaby-oliveira/motion-video
/plugin install motion-video@motion-video
```

Reinicie o Claude Code. Depois, para instalar as ferramentas:

```
/motion-video setup
```

A skill confere cada ferramenta, mostra uma tabela com o que já existe e pergunta se pode instalar o que
falta. Nada que já funciona é reinstalado.

Para atualizar depois: `/plugin update motion-video@motion-video`.

## Opção 2: scripts de instalação

Para quem prefere o terminal. Os scripts também só instalam o que falta e podem ser rodados de novo sem
problema.

```bash
git clone https://github.com/joaby-oliveira/motion-video
cd motion-video

# Mac, Linux ou Git Bash no Windows
bash scripts/install.sh --with-skill

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -WithSkill
```

`--with-skill` / `-WithSkill` copia a skill para `~/.claude/skills/motion-video`. Não use essa opção se já
instalou pelo plugin, para não ter a skill duplicada.

## Opção 3: manual

Copie a pasta `skills/motion-video` deste repositório para `~/.claude/skills/motion-video` e instale as
ferramentas da tabela abaixo. Depois rode `python scripts/patch_freecut.py` para aplicar as correções de
compatibilidade no freecut.

## O que é instalado

| Ferramenta | Para que serve | Windows | Mac | Linux |
| --- | --- | --- | --- | --- |
| ffmpeg | Corta, junta e converte vídeo e áudio | `winget install Gyan.FFmpeg.Essentials` | `brew install ffmpeg` | `sudo apt install ffmpeg` |
| Node.js 22+ | Roda o Remotion (animações) | `winget install OpenJS.NodeJS.LTS` | `brew install node` | gerenciador da distro |
| uv | Gerencia o Python do freecut | `winget install astral-sh.uv` | `brew install uv` | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| [freecut](https://github.com/Moh4696/freecut) | Transcrição, corte e legenda | `git clone` em `~/Developer/freecut` | igual | igual |
| Whisper local | Transcrição no seu computador, sem custo | `uv sync --extra whisper-fast` | chip Apple: `--extra whisper-mlx` | `--extra whisper-fast` |
| Remotion | Gera as animações em React | instalado pela skill em cada projeto | igual | igual |

## Conferir se deu certo

Abra o Claude Code numa pasta com vídeos e digite `/motion-video setup`. Todas as linhas da tabela devem
aparecer como "ok".
