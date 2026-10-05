@echo off
title JisaMaintenance - Iniciar backend
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-backend.ps1"
echo.
pause
