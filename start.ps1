Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Starting CuraMed Healthcare Platform" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Launch FastAPI Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; py -3 -m uvicorn server.main:app --reload --port 8000"

# Launch Vite Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm.cmd run dev"

Write-Host "`nBoth Backend and Frontend have been launched in separate windows!" -ForegroundColor Green
Write-Host "  Frontend URL:    http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend API URL: http://localhost:8000/docs`n" -ForegroundColor Yellow
