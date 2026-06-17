@echo off
cd /d "%~dp0"
echo ==========================================
echo   Wellness System Starting...
echo ==========================================
echo.
echo [1/3] Starting backend server...
start /b node backend\server.cjs > wellness.log 2>&1
timeout /t 4 /nobreak >nul
echo [2/3] Server started!
echo [3/3] Opening browser...
start http://localhost:3001
echo.
echo ==========================================
echo   System started! Browser is opening...
echo   Do NOT close this window!
echo ==========================================
pause
