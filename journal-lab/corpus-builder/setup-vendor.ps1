param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Vendor = Join-Path $Root "vendor"
$PdfDir = Join-Path $Vendor "pdfjs"
$MammothDir = Join-Path $Vendor "mammoth"

New-Item -ItemType Directory -Force -Path $PdfDir | Out-Null
New-Item -ItemType Directory -Force -Path $MammothDir | Out-Null

$items = @(
    @{
        Name = "PDF.js display layer"
        Url = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.mjs"
        Path = (Join-Path $PdfDir "pdf.mjs")
        Package = "pdfjs-dist"
        Version = "6.3.289"
    },
    @{
        Name = "PDF.js worker"
        Url = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.mjs"
        Path = (Join-Path $PdfDir "pdf.worker.mjs")
        Package = "pdfjs-dist"
        Version = "6.3.289"
    },
    @{
        Name = "Mammoth browser"
        Url = "https://cdn.jsdelivr.net/npm/mammoth@1.12.2/mammoth.browser.min.js"
        Path = (Join-Path $MammothDir "mammoth.browser.min.js")
        Package = "mammoth"
        Version = "1.12.2"
    }
)

foreach ($item in $items) {
    if ((Test-Path $item.Path) -and -not $Force) {
        Write-Host "Déjà présent : $($item.Path)"
        continue
    }
    Write-Host "Téléchargement : $($item.Name)"
    Invoke-WebRequest -Uri $item.Url -OutFile $item.Path -UseBasicParsing
}

$lock = @()
foreach ($item in $items) {
    if (-not (Test-Path $item.Path)) {
        throw "Dépendance absente : $($item.Path)"
    }
    $hash = (Get-FileHash -Algorithm SHA256 -Path $item.Path).Hash.ToLowerInvariant()
    $fileInfo = Get-Item $item.Path
    $relative = $item.Path.Substring($Root.Length).TrimStart("\")
    $lock += [ordered]@{
        package = $item.Package
        version = $item.Version
        file = $relative.Replace("\","/")
        sha256 = $hash
        bytes = $fileInfo.Length
        source = $item.Url
    }
}

$lockObject = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    note = "Hashes calculés après téléchargement. Conserver ce fichier avec le déploiement offline."
    files = $lock
}

$lockPath = Join-Path $Vendor "vendor-lock.json"
$lockObject | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $lockPath

Write-Host ""
Write-Host "Dépendances locales prêtes."
Write-Host "Lock : $lockPath"
Write-Host "Vous pouvez maintenant couper Internet et lancer Corpus Builder via localhost."
