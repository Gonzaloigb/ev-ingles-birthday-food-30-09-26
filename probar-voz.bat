@echo off
REM ============================================================
REM  Comprueba si Microsoft Edge puede leer en ingles.
REM  Doble clic aqui antes de usar el juego por primera vez.
REM ============================================================
cd /d "%~dp0"

set "EDGE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
)

if defined EDGE (
  start "" "%EDGE%" "%~dp0probar-voz.html"
) else (
  echo   No se encontro Microsoft Edge. Abriendo con el navegador por defecto.
  timeout /t 3 >nul
  start "" "probar-voz.html"
)
