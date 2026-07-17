@echo off
title AI InterviewAI
cd /d "%~dp0"

echo ============================================
echo   AI InterviewAI - Starting...
echo ============================================
echo.

:: Install dependencies silently
pip install -r requirements.txt -q 2>nul

:: Open browser after 2 seconds
start "" /b cmd /c "timeout /t 2 >nul && start http://localhost:5000"

:: Start server (stays open until you press Ctrl+C)
echo   Your site will open automatically...
echo   Press Ctrl+C to stop the server.
echo.
python app.py
pause
