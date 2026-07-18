#!/usr/bin/env pwsh
# Build store-ready extension packages locally.
#
# Produces:
#   dist/ttm-connect-chromium-v<version>.zip   (background.service_worker — Chrome / Edge)
#   dist/ttm-connect-firefox-v<version>.zip    (background.scripts        — Firefox)
#
# The per-browser manifest transform lives in scripts/build.mjs (shared with CI); this script stages
# via Node, then zips each staged folder.
#
# NOTE: we do NOT use Compress-Archive — on Windows it writes zip entry paths with backslashes
# (icons\icon-128.png), which violates the ZIP spec and is rejected by AMO ("Invalid file name in
# archive"). We build the archive via System.IO.Compression with explicit forward-slash entry names.

param(
    [ValidateSet("chromium", "firefox", "all")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-ExtensionZip {
    # Zips the CONTENTS of $SourceDir (so manifest.json sits at the archive root) using forward-slash
    # entry names, regardless of PowerShell/.NET version.
    param([string]$SourceDir, [string]$ZipPath)
    if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
    $root = (Resolve-Path $SourceDir).Path.TrimEnd('\', '/')
    $archive = [System.IO.Compression.ZipFile]::Open($ZipPath, 'Create')
    try {
        Get-ChildItem -Path $SourceDir -Recurse -File | ForEach-Object {
            $entry = $_.FullName.Substring($root.Length + 1) -replace '\\', '/'
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive, $_.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
    finally {
        $archive.Dispose()
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required (it performs the per-browser manifest transform). Install from https://nodejs.org/"
}

$version = (Get-Content (Join-Path $PSScriptRoot "manifest.json") -Raw | ConvertFrom-Json).version
$dist = Join-Path $PSScriptRoot "dist"
New-Item -ItemType Directory -Force $dist | Out-Null

$targets = if ($Target -eq "all") { @("chromium", "firefox") } else { @($Target) }

foreach ($t in $targets) {
    # Stage the tailored manifest + runtime files into build/<t>/.
    node (Join-Path $PSScriptRoot "scripts/build.mjs") $t
    if ($LASTEXITCODE -ne 0) { throw "build.mjs failed for target '$t'" }

    $stage = Join-Path $PSScriptRoot "build/$t"
    $zip = Join-Path $dist "ttm-connect-$t-v$version.zip"

    New-ExtensionZip -SourceDir $stage -ZipPath $zip
    Write-Host "created $zip" -ForegroundColor Green
}

Write-Host "Done. Packages are in $dist"
