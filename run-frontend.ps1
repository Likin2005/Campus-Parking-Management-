# CampusPark React Frontend Launcher
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (Test-Path "$scriptDir\frontend") {
    Set-Location "$scriptDir\frontend"
} else {
    Set-Location "$scriptDir\campuspark"
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting CampusPark React Frontend on http://localhost:5173" -ForegroundColor Green
Write-Host "Connecting to FastAPI Backend at http://127.0.0.1:8000/api" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

npm run dev
