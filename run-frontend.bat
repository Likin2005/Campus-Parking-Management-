@echo off
title CampusPark React Frontend
echo ========================================================
echo Starting CampusPark React + Vite Frontend
echo Web Application: http://localhost:5173
echo ========================================================
if exist "%~dp0frontend" (
    cd /d "%~dp0frontend"
) else (
    cd /d "%~dp0campuspark"
)
npm run dev
pause
