@echo off
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed, installing now...
    timeout /t 5 >nul
    start https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi    
    cls
    echo Please install Node.js using the .msi downloader
    pause
    cls
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

cls

call nodemon -v >nul 2>&1
if %errorlevel% neq 0 (
    echo npm and Node.js are installed, starting the server...
    timeout /t 2 >nul
    cls
    echo nodemon is not installed, starting the server with node...
    timeout /t 2 >nul
    cls
    echo Press CTRL + C to stop the server at any time
    cd ..
    cd src
    call node server.js
    pause
    exit
)

echo npm and Node.js are installed, starting the server...
timeout /t 2 >nul
cls


echo Press CTRL + C to stop the server at any time
cd ..
cd src
call nodemon server.js

pause
