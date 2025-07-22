@echo off
REM Windows batch script to build and run with Docker

echo 🐳 Building and running RealChatApp with Docker...

REM Check if .env file exists and load variables
if exist .env (
    echo ✅ Loading environment variables from .env...
    for /f "delims=" %%x in (.env) do (set "%%x")
)

REM Build and run with Docker Compose
echo 🔨 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

echo 📊 Service status:
docker-compose ps

echo.
echo 🌐 Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8080
echo   Health:   http://localhost:8080/health
echo.
echo 📝 To view logs:
echo   docker-compose logs -f
echo.
echo 🛑 To stop services:
echo   docker-compose down

pause
