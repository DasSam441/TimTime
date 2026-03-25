param(
  [string]$RepoUrl = "https://github.com/DasSam441/TimTime",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Host ""
  Write-Host "ERROR: $Message" -ForegroundColor Red
  exit 1
}

function Info([string]$Message) {
  Write-Host $Message -ForegroundColor Cyan
}

function Step([string]$Message) {
  Write-Host ""
  Write-Host $Message -ForegroundColor Yellow
}

try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  Set-Location -LiteralPath $scriptDir

  $zipUrl = "$RepoUrl/archive/refs/heads/$Branch.zip"
  $tempRoot = Join-Path $env:TEMP ("timtime_update_" + [guid]::NewGuid().ToString("N"))
  $zipPath = Join-Path $tempRoot "timtime.zip"
  $extractPath = Join-Path $tempRoot "extract"

  New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
  New-Item -ItemType Directory -Force -Path $extractPath | Out-Null

  Info "Projekt : $scriptDir"
  Info "Quelle  : $zipUrl"

  Step "Lade aktuelle Version von GitHub..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

  if(-not (Test-Path $zipPath)) {
    Fail "ZIP-Datei konnte nicht geladen werden."
  }

  Step "Entpacke Update..."
  Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath -Force

  $sourceRoot = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1
  if(-not $sourceRoot) {
    Fail "Entpackter Inhalt wurde nicht gefunden."
  }

  Step "Aktualisiere Dateien..."
  $excludeDirs = @(".git", "data", "api")
  $excludeFiles = @("update-from-git.ps1", "update-from-git.bat")

  $robocopyArgs = @(
    $sourceRoot.FullName,
    $scriptDir,
    "/MIR",
    "/R:2",
    "/W:1",
    "/NFL",
    "/NDL",
    "/NP",
    "/XD"
  ) + $excludeDirs + @("/XF") + $excludeFiles

  & robocopy @robocopyArgs | Out-Host
  $rc = $LASTEXITCODE
  if($rc -ge 8) {
    Fail "Dateiupdate fehlgeschlagen (Robocopy Code $rc)."
  }

  Step "Räume temporäre Dateien auf..."
  try {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction Stop
  } catch {
    Write-Host "Temporäre Dateien konnten nicht vollständig gelöscht werden." -ForegroundColor DarkYellow
  }

  Write-Host ""
  Write-Host "Update erfolgreich abgeschlossen." -ForegroundColor Green
  Write-Host "Deine Daten im Ordner 'data' wurden nicht angetastet." -ForegroundColor Green
} catch {
  Fail ($_ | Out-String)
}
