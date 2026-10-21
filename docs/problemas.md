# Problemas comuns

Quando algo falhar, cole a mensagem de erro no Claude Code: ele lê o erro, corrige e roda de novo. A tabela
abaixo lista os problemas já conhecidos.

| Sintoma | Causa | Solução |
| --- | --- | --- |
| Transcrição falha com `unexpected keyword argument 'metadata_errors'` | O faster-whisper não é compatível com o PyAV 15 ou mais novo | `python scripts/patch_freecut.py` (a skill aplica sozinha no `setup`) |
| Render com legenda do freecut falha no ffmpeg | Barras invertidas do caminho no Windows quebram o filtro de legenda | `python scripts/patch_freecut.py` |
| Acentos viram símbolos estranhos | O Python no Windows lê arquivos como cp1252 | A skill roda os scripts com `PYTHONUTF8=1`; se rodar à mão, faça o mesmo |
| Comando com `$env:` ou `&` dá erro de sintaxe no `!` do Claude Code | O `!` roda no Git Bash, não no PowerShell | Use a sintaxe de bash: `PYTHONUTF8=1 caminho/python.exe script.py` |
| Termos em inglês saem errados na legenda | O Whisper transcreve em português e "aportuguesa" os termos | Informe os termos na pergunta da rodada 2 |
| Uma palavra parece cortada no fim de um trecho | O corte ficou justo demais na borda da palavra | Peça: "estica o trecho em 1:02 em 0,2 segundo" |
| Texto quebra em muitas linhas ao lado do card | A coluna de texto ficou estreita | Peça para diminuir o card (no Keynote: de 720×900 para 600×820) |
| `winget` instalou algo, mas o comando não é encontrado | O terminal ainda usa o PATH antigo | Feche e abra o terminal, depois rode o instalador de novo |
| Versões diferentes de pacotes `@remotion/*` | Instalação misturada | Reinstale todos na mesma versão (a skill usa 4.0.537) |
