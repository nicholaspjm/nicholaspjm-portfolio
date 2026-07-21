# Rebuilds "Edit Site.exe" from scripts/edit-site.ps1.
# Run this if you change the launcher: powershell -File scripts\build-exe.ps1
# One-time setup if ps2exe is missing:
#   Install-Module ps2exe -Scope CurrentUser -Force
$root = Split-Path -Parent $PSScriptRoot
Import-Module ps2exe
Invoke-PS2EXE `
  -InputFile (Join-Path $root 'scripts\edit-site.ps1') `
  -OutputFile (Join-Path $root 'Edit Site.exe') `
  -NoConsole:$false `
  -Title 'Nicholas Marriott - Edit Site' `
  -Description 'Runs the portfolio locally in edit mode' `
  -Company 'nicholaspjm'
Write-Host 'Built "Edit Site.exe"'
