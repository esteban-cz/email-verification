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

set /p "choice=Run config? (y/n): "
if /i "%choice%"=="y" (
    cls
    call config.bat
    cls
)

call nodemon -v >nul 2>&1
if %errorlevel% neq 0 (
    echo npm and Node.js are installed, starting the server...
    timeout /t 2 >nul
    cls
    echo nodemon is not installed, starting the server with node...
    timeout /t 2 >nul
    cls
    echo Press CTRL + C to stop the server at any time
    call node server.js
    pause
    exit
)

echo npm and Node.js are installed, starting the server...
timeout /t 2 >nul
cls


echo Press CTRL + C to stop the server at any time
call nodemon server.js

pause
