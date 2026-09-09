@echo off
title CuraMed - Launching Development Servers
echo ====================================================================
echo   Starting CuraMed - Full-Stack Healthcare Platform
echo ====================================================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "CuraMed Backend (FastAPI)" cmd /k "py -3 -m uvicorn server.main:app --reload --port 8000"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "CuraMed Frontend (React Vite)" cmd /k "cd client && npm.cmd run dev"

echo.
echo ====================================================================
echo   Both services are starting in separate windows!
echo   - Frontend:    http://localhost:5173
echo   - Backend API: http://localhost:8000/docs
echo ====================================================================
