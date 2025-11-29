@echo off
echo Starting MovieBucket...
cd /d "%~dp0"
docker compose up -d
echo.
echo ========================================
echo MovieBucket is running!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5242
echo ========================================
echo.
pause
