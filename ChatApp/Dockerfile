# Multi-stage build for Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create a non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -G appuser -u 1001

# Copy the JAR file from build stage
COPY --from=build /app/target/ChatApp-*.jar app.jar

# Change ownership to non-root user
RUN chown appuser:appuser app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables with defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV MONGODB_URI=""
ENV ALLOWED_ORIGINS=""
ENV PORT=8080

# Run the application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
