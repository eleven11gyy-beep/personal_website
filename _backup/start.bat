@echo off
echo ===============================
echo   星图 · Star Atlas
echo   启动本地服务器...
echo ===============================
echo.
cd /d "%~dp0"
echo 正在启动服务器，请稍候...
echo.
echo 打开浏览器访问: http://localhost:8080
echo 按 Ctrl+C 停止服务器
echo.
npx --yes http-server -p 8080 -c-1 -s
pause
