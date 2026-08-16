@echo off
echo ========================================
echo    Project835 - Django + React
echo ========================================
echo.
echo This will start both Django and React servers
echo.
echo IMPORTANT: Make sure MySQL is running in XAMPP!
echo.
pause

echo.
echo Starting Django Backend...
start "Django Backend" cmd /k "cd /d %~dp0 && venv\Scripts\activate && python manage.py runserver"

timeout /t 3 /nobreak > nul

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Django API: http://127.0.0.1:8000/
echo React App:  http://localhost:5173/
echo.
echo Open http://localhost:5173/ in your browser
echo ========================================
echo.
echo Press any key to close this window...
pause > nul
