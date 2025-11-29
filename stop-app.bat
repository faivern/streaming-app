@echo off
echo Stopping MovieBucket...
cd /d "%~dp0"
docker compose down
echo.
echo MovieBucket stopped.
pause
