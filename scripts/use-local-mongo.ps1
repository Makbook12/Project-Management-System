# Point server/.env at local MongoDB (no Atlas IP whitelist).
$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '..\server\.env' | Resolve-Path -ErrorAction Stop
$localUri = 'MONGODB_URI=mongodb://127.0.0.1:27017/project-management'

$lines = Get-Content $envPath
$found = $false
$out = foreach ($line in $lines) {
  if ($line -match '^\s*MONGODB_URI\s*=') {
    $found = $true
    $localUri
  } else {
    $line
  }
}
if (-not $found) { $out = @($localUri) + $out }
Set-Content -Path $envPath -Value $out -Encoding utf8
Write-Host "Updated $envPath to use local MongoDB at 127.0.0.1:27017"
