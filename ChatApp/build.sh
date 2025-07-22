#!/bin/bash

# Render Build Script for Spring Boot Application
echo "🚀 Starting Spring Boot build on Render..."

# Install Java (Render provides OpenJDK)
echo "☕ Java version:"
java -version

# Build the application using Maven
echo "🔨 Building application with Maven..."
./mvnw clean package -DskipTests

echo "✅ Build completed successfully!"

# List the generated JAR file
echo "📦 Generated JAR files:"
ls -la target/*.jar
