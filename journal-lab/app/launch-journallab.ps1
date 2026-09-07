$ErrorActionPreference = "Stop"

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Html = Join-Path $Here "mvp2-journallab.html"

if (-not (Test-Path $Html)) {
    throw "Fichier introuvable : $Html"
}

$uri = ([System.Uri]$Html).AbsoluteUri

# On ne transmet l'identité Windows que si la session semble appartenir
# à un domaine (USERDOMAIN différent du nom local de la machine).
$annotatorId = $null
if ($env:USERNAME -and $env:USERDOMAIN -and $env:COMPUTERNAME) {
    if ($env:USERDOMAIN -ne $env:COMPUTERNAME) {
        $annotatorId = $env:USERNAME
    }
}

if ($annotatorId) {
    $encoded = [System.Uri]::EscapeDataString($annotatorId)
    $uri = "$uri?annotatorId=$encoded"
    Write-Host "JournalLab : identité Windows transmise ($env:USERDOMAIN\$annotatorId)."
} else {
    Write-Host "JournalLab : aucune identité institutionnelle détectée ; lancement anonyme."
}

Start-Process $uri
