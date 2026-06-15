@echo off
cd /d "%~dp0"
echo Starting OMAH Backend Server on port 5000...
node server.js
pause
