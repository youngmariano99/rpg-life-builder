@echo off
echo Iniciando Life RPG Builder...

:: 1. Iniciar Backend en una nueva ventana
echo Arrancando Backend (.NET)...
start "LifeRPG Backend API" cmd /k "cd backend && dotnet watch run"

:: 2. Iniciar Frontend en una nueva ventana
echo Arrancando Frontend (Vite)...
start "LifeRPG Frontend" cmd /k "cd frontend && npm run dev"

echo ¡Todo listo! Las consolas se han abierto.
exit