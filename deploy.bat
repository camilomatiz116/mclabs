@echo off
title Despliegue eMCi labs
cls
echo ==========================================
echo        eMCi labs - Deploy a Servidor
echo ==========================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Hubo un problema durante el despliegue.
)
echo.
pause
