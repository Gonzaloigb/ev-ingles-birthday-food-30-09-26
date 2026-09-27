@echo off
REM ============================================================
REM  Farm Friends - Ingles Unidad 4
REM  Doble clic aqui para jugar. No necesita internet.
REM
REM  Abre en MICROSOFT EDGE a proposito, aunque el navegador por
REM  defecto sea otro: Edge trae las voces neuronales en ingles
REM  (Aria, Jenny, Guy) y la prueba de Marina es auditiva.
REM ============================================================
cd /d "%~dp0"

REM --- Buscar Edge en las dos ubicaciones posibles ---
set "EDGE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
)

REM --- Preparar el juego si hace falta (solo la primera vez) ---
if not exist "dist\index.html" (
  echo.
  echo   Preparando el juego por primera vez...
  echo.

  where npm >nul 2>nul
  if errorlevel 1 (
    echo   [ERROR] Falta Node.js en este equipo.
    echo   Instalalo desde https://nodejs.org y vuelve a intentar.
    echo.
    pause
    exit /b 1
  )

  if not exist "node_modules" call npm install
  call npm run build

  if not exist "dist\index.html" (
    echo.
    echo   [ERROR] No se pudo preparar el juego.
    pause
    exit /b 1
  )
)

REM --- Abrir ---
if defined EDGE (
  start "" "%EDGE%" "%~dp0dist\index.html"
) else (
  echo.
  echo   [AVISO] No se encontro Microsoft Edge en este equipo.
  echo   Se abrira con el navegador por defecto, pero es posible
  echo   que no tenga voces en ingles para la parte auditiva.
  echo.
  timeout /t 4 >nul
  start "" "dist\index.html"
)
