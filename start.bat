@echo off
chcp 65001 >nul
echo ==========================================
echo   养生馆经营跟进系统正在启动...
echo ==========================================
echo.
cd /d "%~dp0"
echo [1/3] 正在启动后端服务...
start /b node backend\server.cjs > wellness.log 2>&1
timeout /t 4 /nobreak >nul
echo [2/3] 服务已启动！
echo [3/3] 正在打开浏览器...
start http://localhost:3001
echo.
echo ==========================================
echo   系统已启动，浏览器正在打开...
echo   请勿关闭此窗口！
echo ==========================================
pause
