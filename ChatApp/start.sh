#!/bin/bash

# Render Start Script for Spring Boot Application
echo "🌟 Starting Chat Application on Render..."

# Set the active profile to production
export SPRING_PROFILES_ACTIVE=prod

# Start the Spring Boot application
echo "🚀 Starting Spring Boot application..."
java -jar target/ChatApp-0.0.1-SNAPSHOT.jar

echo "✅ Application started successfully!"
