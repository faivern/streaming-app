@echo off
echo Starting MovieBucket...
cd /d "%~dp0"
docker compose up -d
echo.
echo ========================================
echo MovieBucket is running!
echo Frontend: http://localhost:3000
echo Backend:  https://localhost:7123
echo ========================================
echo.
pause
