# Installs only what is missing for motion-video (Windows PowerShell).
# Safe to run again: anything already installed is left untouched.
#
#   powershell -ExecutionPolicy Bypass -File scripts\install.ps1               # tools + freecut
#   powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -WithSkill    # also copies the skill (no plugin)

param([switch]$WithSkill)

$ErrorActionPreference = 'Stop'
$RepoDir = Split-Path -Parent $PSScriptRoot
$Freecut = Join-Path $HOME 'Developer\freecut'
$Skills = Join-Path $HOME '.claude\skills'
$Restart = $false

function Have($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }
function Line($name, $msg) { Write-Host ('  {0,-12} {1}' -f $name, $msg) }
function WingetInstall($id) {
	winget install -e --id $id --accept-source-agreements --accept-package-agreements
	$script:Restart = $true
}

Write-Host 'motion-video: checking tools'

if ((Have 'ffmpeg') -and (Have 'ffprobe')) { Line 'ffmpeg' 'ok' } else { Line 'ffmpeg' 'installing'; WingetInstall 'Gyan.FFmpeg.Essentials' }

$nodeOk = $false
if (Have 'node') { $nodeOk = [int]((node -v).TrimStart('v').Split('.')[0]) -ge 22 }
if ($nodeOk) { Line 'node' "ok ($(node -v))" } else { Line 'node' 'installing (22+ required)'; WingetInstall 'OpenJS.NodeJS.LTS' }

if (Have 'uv') { Line 'uv' 'ok' } else { Line 'uv' 'installing'; WingetInstall 'astral-sh.uv' }
if (Have 'git') { Line 'git' 'ok' } else { Line 'git' 'installing'; WingetInstall 'Git.Git' }

if ($Restart) {
	Write-Host ''
	Write-Host 'Some tools were installed with winget. Close and reopen the terminal, then run this script again.'
	exit 0
}

if (Test-Path (Join-Path $Freecut '.git')) { Line 'freecut' "ok ($Freecut)" } else {
	Line 'freecut' 'cloning'
	New-Item -ItemType Directory -Force (Split-Path $Freecut) | Out-Null
	git clone -q https://github.com/Moh4696/freecut $Freecut
}

$Py = Join-Path $Freecut '.venv\Scripts\python.exe'
$whisperOk = $false
if (Test-Path $Py) {
	& $Py -c 'import faster_whisper, librosa' 2>$null
	$whisperOk = ($LASTEXITCODE -eq 0)
}
if ($whisperOk) { Line 'whisper' 'ok (faster_whisper)' } else {
	Line 'whisper' 'installing (whisper-fast)'
	Push-Location $Freecut
	try { uv sync -q --extra whisper-fast } finally { Pop-Location }
}

New-Item -ItemType Directory -Force $Skills | Out-Null
$FreecutSkill = Join-Path $Skills 'freecut'
if (Test-Path (Join-Path $FreecutSkill 'SKILL.md')) { Line 'skill' 'freecut ok' } else {
	Line 'skill' 'linking freecut'
	New-Item -ItemType Junction -Path $FreecutSkill -Target $Freecut | Out-Null
}

Write-Host 'motion-video: freecut compatibility fixes'
& $Py (Join-Path $RepoDir 'scripts\patch_freecut.py') $Freecut

if ($WithSkill) {
	$src = Join-Path $RepoDir 'skills\motion-video'
	$dst = Join-Path $Skills 'motion-video'
	if (Test-Path $dst) { Rename-Item $dst ("motion-video.bak." + [DateTimeOffset]::Now.ToUnixTimeSeconds()) }
	Copy-Item -Recurse $src $dst
	Line 'skill' 'motion-video copied'
}

Write-Host ''
Write-Host 'Done. Open Claude Code in a folder with your videos and type /motion-video setup to confirm.'
