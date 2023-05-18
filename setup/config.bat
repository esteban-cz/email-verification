@echo off

set "envFile=..\src\.env"
set "tempFile=%temp%\env.tmp"

REM Display the current contents of the .env file
echo Contents of %envFile%:
echo.
type "%envFile%"
echo.

REM Ask the user if they want to modify the variables
set /p "choice=Modify variables? (y/n): "

if /i "%choice%"=="y" (
    cls
    echo Press ENTER to keep current value
    echo.

    REM Read the .env file line by line
    for /f "usebackq tokens=1* delims==" %%a in ("%envFile%") do (
        setlocal enabledelayedexpansion

        REM Display the current variable and its value
        echo Current value of %%a=%%b

        REM Prompt the user for a new value
        set "newValue="
        set /p "newValue=Enter new value for %%a="

        REM Update the variable with the new value if it's not empty
        if defined newValue (
            echo %%a=!newValue!>>"%tempFile%"
		echo Updated value of %%a=!newValue!
        ) else (
            echo %%a=%%b>>"%tempFile%"
		echo Updated value of %%a=%%b
        )

	  echo.

        endlocal
    )

    REM Replace the original .env file with the modified one
    move /y "%tempFile%" "%envFile%" >nul
    echo.
    echo .env file updated.
)

REM Display the modified contents of the .env file
cls
echo Contents of %envFile%:
echo.
type "%envFile%"
echo.

REM Ask the user if they want to modify the variables again
set /p "continue=Exit? (y/n): "
if /i "%continue%"=="n" (
    cls
    call "%~f0"
)
