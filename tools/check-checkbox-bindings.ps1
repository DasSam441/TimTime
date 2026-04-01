param(
  [string]$Root = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Add-ToSet {
  param(
    [System.Collections.Generic.HashSet[string]]$Set,
    [string]$Value
  )
  if([string]::IsNullOrWhiteSpace($Value)){ return }
  [void]$Set.Add($Value.Trim())
}

$targets = New-Object System.Collections.Generic.List[string]
$indexPath = Join-Path $Root 'index.html'
if(Test-Path -LiteralPath $indexPath){
  $targets.Add($indexPath)
}

$assetsPath = Join-Path $Root 'assets'
if(Test-Path -LiteralPath $assetsPath){
  Get-ChildItem -LiteralPath $assetsPath -Filter *.js -File | ForEach-Object {
    $targets.Add($_.FullName)
  }
}

if($targets.Count -eq 0){
  Write-Host "Keine Zieldateien gefunden."
  exit 2
}

$checkboxCounts = @{}
$referencedIds = New-Object 'System.Collections.Generic.HashSet[string]'

$rxCheckbox = [regex]'(?is)<input(?=[^>]*\btype\s*=\s*["'']checkbox["''])(?=[^>]*\bid\s*=\s*["'']([^"'']+)["''])[^>]*>'
$rxQuerySelector = [regex]'querySelector(?:All)?\(\s*["'']#([^"'']+)["'']\s*\)'
$rxGetById = [regex]'getElementById\(\s*["'']([^"'']+)["'']\s*\)'

foreach($file in $targets){
  $text = Get-Content -LiteralPath $file -Raw

  foreach($m in $rxCheckbox.Matches($text)){
    $id = [string]$m.Groups[1].Value
    if([string]::IsNullOrWhiteSpace($id)){ continue }
    if(-not $checkboxCounts.ContainsKey($id)){ $checkboxCounts[$id] = 0 }
    $checkboxCounts[$id] += 1
  }

  foreach($m in $rxQuerySelector.Matches($text)){
    Add-ToSet -Set $referencedIds -Value ([string]$m.Groups[1].Value)
  }
  foreach($m in $rxGetById.Matches($text)){
    Add-ToSet -Set $referencedIds -Value ([string]$m.Groups[1].Value)
  }
}

$checkboxIds = @($checkboxCounts.Keys | Sort-Object)
$duplicates = @($checkboxCounts.GetEnumerator() | Where-Object { $_.Value -gt 1 } | Sort-Object Name)
$unbound = @()
foreach($id in $checkboxIds){
  if(-not $referencedIds.Contains($id)){
    $unbound += $id
  }
}

Write-Host "Checkbox-Bindings Self-Test"
Write-Host "Root: $Root"
Write-Host "Checkbox IDs gefunden: $($checkboxIds.Count)"
Write-Host "Duplikate: $($duplicates.Count)"
Write-Host "Ohne JS-Referenz: $($unbound.Count)"

if($duplicates.Count -gt 0){
  Write-Host ""
  Write-Host "Duplikate:"
  foreach($entry in $duplicates){
    Write-Host ("- {0} (x{1})" -f $entry.Name, $entry.Value)
  }
}

if($unbound.Count -gt 0){
  Write-Host ""
  Write-Host "Checkboxen ohne querySelector/getElementById-Referenz:"
  foreach($id in ($unbound | Sort-Object)){
    Write-Host ("- {0}" -f $id)
  }
}

if($unbound.Count -gt 0){
  exit 1
}

exit 0
