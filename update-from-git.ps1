param(
  [string]$Remote = "origin",
  [string]$Branch = "",
  [switch]$AllowDirty
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Host ""
  Write-Host "ERROR: $Message" -ForegroundColor Red
  exit 1
}

try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  Set-Location -LiteralPath $scriptDir

  $null = git --version
} catch {
  Fail "Git wurde nicht gefunden."
}

try {
  $insideRepo = (git rev-parse --is-inside-work-tree).Trim()
  if($insideRepo -ne "true") {
    Fail "Dieses Verzeichnis ist kein Git-Repository."
  }
} catch {
  Fail "Git-Repository konnte nicht geprueft werden."
}

if([string]::IsNullOrWhiteSpace($Branch)) {
  $Branch = (git branch --show-current).Trim()
}

if([string]::IsNullOrWhiteSpace($Branch)) {
  Fail "Aktueller Branch konnte nicht ermittelt werden."
}

$remoteUrl = (git remote get-url $Remote 2>$null)
if([string]::IsNullOrWhiteSpace($remoteUrl)) {
  Fail "Remote '$Remote' wurde nicht gefunden."
}

$statusLines = @(git status --porcelain)
if(-not $AllowDirty -and $statusLines.Count -gt 0) {
  Write-Host ""
  Write-Host "Lokale Aenderungen gefunden. Update wurde aus Sicherheitsgruenden abgebrochen." -ForegroundColor Yellow
  Write-Host "Verwende -AllowDirty nur, wenn du genau weisst, was du tust." -ForegroundColor Yellow
  Write-Host ""
  git status --short
  exit 2
}

Write-Host ""
Write-Host "Repository : $scriptDir" -ForegroundColor Cyan
Write-Host "Remote     : $Remote" -ForegroundColor Cyan
Write-Host "Branch     : $Branch" -ForegroundColor Cyan
Write-Host "Quelle     : $remoteUrl" -ForegroundColor Cyan
Write-Host ""

Write-Host "Hole aktuelle Informationen von GitHub..." -ForegroundColor Yellow
git fetch $Remote $Branch
if($LASTEXITCODE -ne 0) {
  Fail "Fetch fehlgeschlagen."
}

$localRef = (git rev-parse HEAD).Trim()
$remoteRef = (git rev-parse "$Remote/$Branch").Trim()
$baseRef = (git merge-base HEAD "$Remote/$Branch").Trim()

if($localRef -eq $remoteRef) {
  Write-Host ""
  Write-Host "Bereits auf dem neuesten Stand." -ForegroundColor Green
  exit 0
}

if($localRef -ne $baseRef) {
  Fail "Lokaler Branch ist nicht nur hinterher. Bitte zuerst mergen oder rebasen."
}

Write-Host ""
Write-Host "Lade aktuelle Version..." -ForegroundColor Yellow
git pull --ff-only $Remote $Branch
if($LASTEXITCODE -ne 0) {
  Fail "Pull fehlgeschlagen."
}

Write-Host ""
Write-Host "Update erfolgreich abgeschlossen." -ForegroundColor Green
git log --oneline -n 1
