<#
  Aplica una nueva version del sistema en el servidor:
    git pull -> pnpm install -> pnpm build -> reinicia el backend
  El frontend publicado en IIS se actualiza solo: IIS apunta a app\web-app\dist,
  que el build regenera. Si la compilacion falla, el sistema sigue corriendo
  con la version anterior (no se reinicia nada).
  Uso: doble clic en actualizar-sistema.bat
#>
$ErrorActionPreference = 'Continue'
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $Raiz

function Paso([string]$t) { Write-Host ''; Write-Host "==> $t" -ForegroundColor Cyan }
function Detener([string]$t) { Write-Host "    [X] $t" -ForegroundColor Red; exit 1 }

Paso 'Descargando cambios (git pull)'
git pull
if ($LASTEXITCODE -ne 0) { Detener 'git pull fallo (cambios locales sin guardar o sin acceso al repositorio).' }

Paso 'Instalando dependencias (pnpm install)'
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { Detener 'pnpm install fallo.' }

Paso 'Compilando (pnpm build)'
pnpm build
if ($LASTEXITCODE -ne 0) { Detener 'La compilacion fallo; el sistema sigue corriendo con la version anterior.' }

Paso 'Reiniciando el backend con la nueva version'
& (Join-Path $PSScriptRoot 'iniciar-backend.ps1')
exit $LASTEXITCODE
