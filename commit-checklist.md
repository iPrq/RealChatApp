# Files to commit to GitHub for Render deployment

# Essential Docker files
ChatApp/Dockerfile
website/Dockerfile
docker-compose.yml
render.yaml

# Configuration files
ChatApp/src/main/resources/application-prod.properties
ChatApp/.env.example
website/nginx.conf

# Scripts (yes, commit the .bat file!)
run-docker.bat
run-docker.sh

# Docker optimization files
ChatApp/.dockerignore
website/.dockerignore

# Health check endpoint
ChatApp/src/main/java/com/ChatApp/HealthController.java

# Documentation
Docker-Deployment-Guide.md
MongoDB-Atlas-Guide.md

# VS Code settings (optional but helpful)
.vscode/settings.json

## DO NOT commit:
# .env (contains real credentials)
# Any files with actual passwords
