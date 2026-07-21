@echo off
title Nicholas Marriott - Edit Site
cd /d "%~dp0"

echo ==============================================
echo   Nicholas Marriott - local edit mode
echo ==============================================
echo.

if not exist "node_modules\" (
  echo First run: installing dependencies. This can take a minute...
  call npm install
  echo.
)

echo Starting the content studio ^(saves your text edits^)...
start "NPJM Studio" cmd /k "npm run studio"

echo Starting the website...
start "NPJM Dev" cmd /k "npm run dev"

echo Waiting for the site to come up, then opening your browser...
timeout /t 7 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ---------------------------------------------------------
echo  The site is running at http://localhost:3000
echo  Click "edit text" at the bottom of the page, make your
echo  changes, then click "save".
echo.
echo  To stop: close the two windows titled
echo  "NPJM Dev" and "NPJM Studio".
echo ---------------------------------------------------------
echo.
echo You can close THIS window now.
pause >nul
