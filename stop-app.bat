@echo off
echo Stopping Cinelas...
cd /d "%~dp0"
docker compose down
echo.
echo Cinelas stopped.
pause
