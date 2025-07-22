#!/bin/bash

# Build and Run Script for Local Development
echo "🐳 Building and running RealChatApp with Docker..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
    echo "✅ Environment variables loaded from .env"
fi

# Build and run with Docker Compose
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "📊 Service status:"
docker-compose ps

echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo "  Health:   http://localhost:8080/health"

echo "📝 To view logs:"
echo "  docker-compose logs -f"

echo "🛑 To stop services:"
echo "  docker-compose down"
