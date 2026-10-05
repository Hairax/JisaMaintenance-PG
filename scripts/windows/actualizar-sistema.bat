@echo off
title JisaMaintenance - Actualizar sistema
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar-sistema.ps1"
echo.
pause
