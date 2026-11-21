# CampusPark FastAPI Backend Launcher
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\backend"
$env:PYTHONPATH = "$scriptDir\backend"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting CampusPark FastAPI Backend on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Connected to Apache CouchDB at http://127.0.0.1:5984" -ForegroundColor Yellow
Write-Host "API Interactive Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

& "$scriptDir\backend\venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port 8000 --reload