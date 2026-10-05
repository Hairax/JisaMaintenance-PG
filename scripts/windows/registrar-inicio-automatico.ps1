<#
  Registra una tarea programada para que el backend se inicie solo cada vez
  que se inicia sesion en el servidor (Docker Desktop tambien arranca al
  iniciar sesion, si tiene activada esa opcion).
  Ejecutar UNA vez, en PowerShell abierto como administrador:
    powershell -ExecutionPolicy Bypass -File registrar-inicio-automatico.ps1
  Para quitarla:
    Unregister-ScheduledTask -TaskName 'JisaMaintenance - Iniciar backend'
#>
$script = Join-Path $PSScriptRoot 'iniciar-backend.ps1'
$log = Join-Path $PSScriptRoot 'ultimo-inicio.log'
$argumentos = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -Command `"& '$script' *> '$log'`""

$accion = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $argumentos
$disparador = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$disparador.Delay = 'PT1M'   # espera 1 minuto despues de iniciar sesion

Register-ScheduledTask -TaskName 'JisaMaintenance - Iniciar backend' `
  -Action $accion -Trigger $disparador -RunLevel Highest -Force `
  -Description 'Inicia Docker/MySQL y los servicios de JisaMaintenance (pm2).' | Out-Null

Write-Host 'Tarea registrada: el backend se iniciara solo al iniciar sesion.' -ForegroundColor Green
Write-Host "Resultado de cada inicio en: $log"
