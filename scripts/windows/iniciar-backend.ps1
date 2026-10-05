<#
  Inicia todo el backend de JisaMaintenance en el servidor (Windows):
    1. Docker Desktop (si no esta corriendo)
    2. Contenedor MySQL y espera a que acepte conexiones
    3. Los 5 servicios con pm2 (ecosystem.config.cjs)
    4. Espera a que respondan los puertos y prueba el login
  Uso: doble clic en iniciar-backend.bat (o: powershell -File iniciar-backend.ps1)
  Requiere haber compilado al menos una vez: pnpm build
#>
param(
  [int]$EsperaDockerSeg = 240,
  [int]$EsperaServiciosSeg = 120,
  [string]$ContenedorMysql = 'MYSQL',
  [int]$PuertoFrontend = 8095
)

$ErrorActionPreference = 'Continue'
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $Raiz
$script:errores = 0

function Paso([string]$t) { Write-Host ''; Write-Host "==> $t" -ForegroundColor Cyan }
function Ok([string]$t) { Write-Host "    [OK] $t" -ForegroundColor Green }
function Aviso([string]$t) { Write-Host "    [!]  $t" -ForegroundColor Yellow }
function Falla([string]$t) { Write-Host "    [X]  $t" -ForegroundColor Red; $script:errores++ }

function Esperar([scriptblock]$condicion, [int]$segundos) {
  $limite = (Get-Date).AddSeconds($segundos)
  while ((Get-Date) -lt $limite) {
    if (& $condicion) { return $true }
    Start-Sleep -Seconds 3
  }
  return $false
}

function PuertoAbierto([int]$puerto) {
  $cliente = New-Object System.Net.Sockets.TcpClient
  try {
    $intento = $cliente.BeginConnect('127.0.0.1', $puerto, $null, $null)
    return ($intento.AsyncWaitHandle.WaitOne(1000) -and $cliente.Connected)
  } catch { return $false } finally { $cliente.Close() }
}

function DockerResponde {
  docker info *> $null
  return ($LASTEXITCODE -eq 0)
}

function LeerEnv([string]$archivo, [string]$clave, [string]$porDefecto) {
  if (Test-Path $archivo) {
    $linea = Get-Content $archivo | Where-Object { $_ -match "^\s*$clave\s*=" } | Select-Object -First 1
    if ($linea) { return ($linea -split '=', 2)[1].Trim() }
  }
  return $porDefecto
}

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  JisaMaintenance - Inicio del backend' -ForegroundColor Cyan
Write-Host "  $Raiz"
Write-Host '============================================' -ForegroundColor Cyan

# --- 1. Requisitos ---------------------------------------------------------
Paso 'Verificando requisitos'
foreach ($cmd in 'node', 'pm2', 'docker') {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Falla "No se encontro '$cmd' en el PATH."
  }
}
if ($script:errores -gt 0) {
  Write-Host '    Instale lo que falta (ver DEPLOY.md, seccion 2) y vuelva a ejecutar.' -ForegroundColor Red
  exit 1
}
$versionNode = (node -v)
if ($versionNode -notmatch '^v22\.') { Aviso "Node $versionNode detectado; se recomienda Node 22 LTS." } else { Ok "Node $versionNode" }

$servicios = @('auth-service', 'users-service', 'inventary-service', 'ot-service', 'api-gateway')
$faltan = @($servicios | Where-Object { -not (Test-Path (Join-Path $Raiz "app\$_\dist\main.js")) })
if ($faltan.Count -gt 0) {
  Falla ('Falta compilar: ' + ($faltan -join ', ') + '. Ejecute "pnpm build" en la carpeta del proyecto.')
  exit 1
}
Ok 'Servicios compilados (dist)'

# --- 2. Docker -------------------------------------------------------------
Paso 'Docker'
if (-not (DockerResponde)) {
  $dockerDesktop = Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
  if (Test-Path $dockerDesktop) {
    Write-Host '    Iniciando Docker Desktop (puede tardar 1-2 minutos)...'
    Start-Process $dockerDesktop
  } else {
    Aviso 'No se encontro Docker Desktop en la ruta habitual; inicielo manualmente.'
  }
  if (-not (Esperar { DockerResponde } $EsperaDockerSeg)) {
    Falla "Docker no respondio en $EsperaDockerSeg s."
    exit 1
  }
}
Ok 'Docker en ejecucion'

# --- 3. MySQL --------------------------------------------------------------
Paso 'Base de datos MySQL'
$existe = docker ps -a --filter "name=^$ContenedorMysql$" --format '{{.Names}}'
if ($existe) {
  docker start $ContenedorMysql *> $null
} else {
  Write-Host '    El contenedor no existe: creandolo con infrastructure\docker-compose.yml'
  docker compose -f (Join-Path $Raiz 'infrastructure\docker-compose.yml') up -d db *> $null
}
$claveDb = LeerEnv (Join-Path $Raiz 'app\auth-service\.env') 'DB_PASSWORD' 'password_core_db'
$mysqlListo = Esperar {
  docker exec $ContenedorMysql mysqladmin ping -h 127.0.0.1 -uroot "-p$claveDb" --silent *> $null
  $LASTEXITCODE -eq 0
} $EsperaDockerSeg
if (-not $mysqlListo) {
  Falla "MySQL no respondio. Revise: docker logs $ContenedorMysql"
  exit 1
}
Ok "MySQL listo (contenedor $ContenedorMysql, puerto 3010)"

# --- 4. Servicios con pm2 --------------------------------------------------
Paso 'Servicios del backend (pm2)'
pm2 startOrRestart (Join-Path $Raiz 'ecosystem.config.cjs') *> $null
pm2 save *> $null
$puertos = [ordered]@{
  'auth-service'      = 3001
  'users-service'     = 3002
  'inventary-service' = 3003
  'ot-service'        = 3004
  'api-gateway'       = 3000
}
foreach ($nombre in $puertos.Keys) {
  $puerto = $puertos[$nombre]
  if (Esperar { PuertoAbierto $puerto } $EsperaServiciosSeg) {
    Ok "$nombre escuchando en el puerto $puerto"
  } else {
    Falla "$nombre no responde en el puerto $puerto. Revise: pm2 logs $nombre"
  }
}

# --- 5. Prueba de login ----------------------------------------------------
Paso 'Prueba de login (credenciales de prueba, se espera 401)'
try {
  Invoke-WebRequest -Uri 'http://127.0.0.1:3000/auth/login' -Method Post -UseBasicParsing `
    -ContentType 'application/json' -Body '{"userName":"__prueba__","password":"__prueba__"}' `
    -TimeoutSec 20 | Out-Null
  Aviso 'El login respondio 2xx con credenciales de prueba (inesperado).'
} catch {
  $codigo = $null
  if ($_.Exception.Response) { $codigo = [int]$_.Exception.Response.StatusCode }
  if ($codigo -eq 401) {
    Ok 'El gateway y el auth-service responden correctamente.'
  } elseif ($codigo) {
    Falla "El login respondio $codigo. Revise: pm2 logs api-gateway y pm2 logs auth-service"
  } else {
    Falla "Sin respuesta del gateway: $($_.Exception.Message)"
  }
}

# --- 6. Frontend (IIS) -----------------------------------------------------
Paso "Frontend en IIS (puerto $PuertoFrontend)"
try {
  Invoke-WebRequest -Uri "http://127.0.0.1:$PuertoFrontend/" -UseBasicParsing -TimeoutSec 10 | Out-Null
  Ok "IIS sirve el frontend en http://localhost:$PuertoFrontend"
} catch {
  Aviso "IIS no respondio en el puerto $PuertoFrontend. Revise que el sitio este iniciado en el Administrador de IIS."
}

# --- Resumen ---------------------------------------------------------------
Write-Host ''
pm2 status
Write-Host ''
if ($script:errores -eq 0) {
  Write-Host 'Backend iniciado correctamente.' -ForegroundColor Green
  exit 0
}
Write-Host "Hubo $($script:errores) problema(s). Revise los mensajes de arriba y 'pm2 logs'." -ForegroundColor Red
exit 1
