@echo off
echo Starting RecipeSnap...

echo Starting backend server...
start "Backend" cmd /k "npm start"

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers started.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000

pause 