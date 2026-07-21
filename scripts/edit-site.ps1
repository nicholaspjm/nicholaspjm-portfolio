# Launches the portfolio in local edit mode: the website + the content studio
# (which saves your edits), then opens the browser. Works run directly as a
# .ps1 or compiled to Edit Site.exe (see scripts/build-exe.ps1).
$ErrorActionPreference = 'SilentlyContinue'

# Folder this launcher lives in (the project root), resolved for both the raw
# script and the compiled exe.
$root = if ($PSScriptRoot) {
  Split-Path -Parent $PSScriptRoot   # scripts/ -> project root
} else {
  Split-Path ([Environment]::GetCommandLineArgs()[0])  # exe sits at project root
}
Set-Location $root

Write-Host '=============================================='
Write-Host '  Nicholas Marriott - local edit mode'
Write-Host '=============================================='
Write-Host ''

if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Host 'First run: installing dependencies (about a minute)...'
  npm install
  Write-Host ''
}

Write-Host 'Starting the content studio (saves your text edits)...'
Start-Process cmd -ArgumentList '/k','npm run studio' -WorkingDirectory $root

Write-Host 'Starting the website...'
Start-Process cmd -ArgumentList '/k','npm run dev' -WorkingDirectory $root

Write-Host 'Waiting for the site to come up...'
$port = $null
foreach ($i in 1..40) {
  Start-Sleep -Seconds 1
  foreach ($p in 3000, 3001, 3002) {
    try {
      $r = Invoke-WebRequest "http://localhost:$p/" -UseBasicParsing -TimeoutSec 2
      if ($r.StatusCode -eq 200) { $port = $p; break }
    } catch { }
  }
  if ($port) { break }
}
if (-not $port) { $port = 3000 }
Start-Process "http://localhost:$port/"

Write-Host ''
Write-Host "The site is running at http://localhost:$port/"
Write-Host 'Click "edit text" at the bottom of the page, make changes, then "save".'
Write-Host 'To stop: close the two windows titled "NPJM Dev" and "NPJM Studio".'
Write-Host ''
Write-Host 'You can close this window.'
Start-Sleep -Seconds 4
