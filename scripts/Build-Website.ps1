# Builds the TTM Connect documentation site (GitHub Pages, https://software.kmarflow.com/TTM-Connect/) with MkDocs.
# Stages website/mkdocs.yml, website/overrides and website/pages, and pulls the extension icon and the store
# screenshots from the repo into images/, so the site and the extension share one set of images.
#
# Usage: pwsh -File scripts/Build-Website.ps1 -OutDir out/website     (needs mkdocs-material: pip install mkdocs-material)
param(
    [string]$OutDir = 'out/website',
    [string]$MkDocs = 'mkdocs'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$stage = Join-Path $root $OutDir
$docs = Join-Path $stage 'docs'
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path (Join-Path $docs 'images') | Out-Null

Copy-Item (Join-Path $root 'website/mkdocs.yml') $stage
Copy-Item (Join-Path $root 'website/overrides') $stage -Recurse
Copy-Item (Join-Path $root 'website/pages/*') $docs -Recurse

# The site's images come from the extension's own assets, so there's one source for each.
Copy-Item (Join-Path $root 'icons/icon-128.png') (Join-Path $docs 'images/logo.png')
foreach ($shot in '01-settings', '02-menu', '03-insert') {
    Copy-Item (Join-Path $root "store-assets/screenshots/$shot.png") (Join-Path $docs 'images')
}

Push-Location $stage
try {
    & $MkDocs build --strict
    if ($LASTEXITCODE -ne 0) { throw 'mkdocs build failed' }
}
finally { Pop-Location }
Write-Host "Site built: $(Join-Path $stage 'site')"
