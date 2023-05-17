@echo off
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    pause
    exit
)

call npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed.
    pause
    exit
)

echo npm and Node.js are installed, starting the server...
timeout /t 1 >nul
cls


echo Press CTRL + C to stop the server at any time
call nodemon server.js

pause
