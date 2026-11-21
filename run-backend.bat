@echo off
title CampusPark FastAPI Backend
echo ========================================================
echo Starting CampusPark FastAPI Backend on http://127.0.0.1:8000
echo Connected to Apache CouchDB at http://127.0.0.1:5984
echo ========================================================
cd /d "%~dp0backend"
set PYTHONPATH=%~dp0backend
"%~dp0backend\venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port 8000 --reload
pause