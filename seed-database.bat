@echo off
title CampusPark CouchDB Database Seeder
echo ========================================================
echo Seeding Apache CouchDB collections with demo records...
echo ========================================================
cd /d "%~dp0backend"
set PYTHONPATH=%~dp0backend
"%~dp0backend\venv\Scripts\python.exe" -m app.scripts.seed_database
pause