# 🐳 Docker Setup Guide for CareerPathak

This guide will help your teammates run the CareerPathak application using Docker, ensuring a consistent development environment across all systems.

## 📋 Prerequisites

- **Docker** installed on your system
- **Docker Compose** (usually comes with Docker Desktop)
- **Git** for cloning the repository

### Install Docker:
- **Windows/Mac**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Follow [official Docker installation guide](https://docs.docker.com/engine/install/)

## 🚀 Quick Start (For Teammates)

### 1. Clone the Repository
```bash
git clone https://github.com/AmartyaKumar11/CareerPathak.git
cd CareerPathak
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Google OAuth Client ID
# Use your preferred text editor
notepad .env       # Windows
nano .env          # Linux/Mac
code .env          # VS Code
```

**Important:** Add your Google OAuth Client ID to the `.env` file:
```
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 3. Run with Docker Compose
```bash
# Start the development server
docker-compose up

# Or run in background (detached mode)
docker-compose up -d

# View logs (if running in background)
docker-compose logs -f
```

### 4. Access the Application
- **Development**: http://localhost:8080
- The application will automatically reload when you make code changes

### 5. Stop the Application
```bash
# Stop the containers
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v
```

## 🛠️ Available Commands

### Development Commands
```bash
# Start development server
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f careerpathak-web

# Stop services
docker-compose down

# Rebuild containers (after dependency changes)
docker-compose up --build

# Clean everything and start fresh
docker-compose down -v --rmi all
docker-compose up --build
```

### Production Commands
```bash
# Build and run production version
docker-compose -f docker-compose.prod.yml up --build

# Run production in background
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Commands
```bash
# View running containers
docker ps

# Access container shell
docker-compose exec careerpathak-web sh

# View container logs
docker logs <container_id>

# Remove all unused Docker data
docker system prune -a
```

## 📁 Project Structure with Docker

```
CareerPathak/
├── Dockerfile                 # Development Docker image
├── Dockerfile.prod           # Production Docker image
├── docker-compose.yml        # Development configuration
├── docker-compose.prod.yml   # Production configuration
├── nginx.conf               # Nginx configuration for production
├── .dockerignore           # Files to exclude from Docker build
├── .env.example            # Environment template
└── src/                    # Application source code
```

## 🔧 Configuration Options

### Environment Variables
Create a `.env` file with:
```bash
# Required: Your Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_client_id_here

# Optional: Development settings
NODE_ENV=development
PORT=8080
```

### Port Configuration
To change the port, edit `docker-compose.yml`:
```yaml
ports:
  - "3000:8080"  # Access on localhost:3000
```

### Volume Mounting
The development setup mounts your source code for hot reloading:
```yaml
volumes:
  - .:/app
  - /app/node_modules
```

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Check what's using port 8080
netstat -tulpn | grep :8080

# Change port in docker-compose.yml
ports:
  - "3000:8080"  # Use port 3000 instead
```

**2. Permission errors (Linux/Mac):**
```bash
sudo chown -R $USER:$USER .
```

**3. Container won't start:**
```bash
# Check logs
docker-compose logs careerpathak-web

# Rebuild without cache
docker-compose build --no-cache
```

**4. Environment variables not loaded:**
- Ensure `.env` file exists in project root
- Check that `.env` is not in `.gitignore`
- Restart containers after changing `.env`

**5. Google OAuth not working:**
- Ensure your Google OAuth Client ID is correct
- Add `http://localhost:8080` to authorized origins in Google Cloud Console

### Reset Everything
```bash
# Complete clean reset
docker-compose down -v --rmi all
docker system prune -a
docker-compose up --build
```

## 🚀 Production Deployment

### Using Production Docker Compose
```bash
# Build and start production version
docker-compose -f docker-compose.prod.yml up --build -d

# Access at http://localhost:8080
```

### Manual Production Build
```bash
# Build production image
docker build -f Dockerfile.prod -t careerpathak:prod .

# Run production container
docker run -p 80:80 careerpathak:prod
```

## 👥 Team Collaboration

### For Team Leaders
1. Ensure `.env` is in `.gitignore`
2. Update `.env.example` with required variables
3. Share Google OAuth setup instructions
4. Document any additional environment variables

### For Team Members
1. Always use `cp .env.example .env` to create environment file
2. Never commit `.env` file to git
3. Ask for Google OAuth Client ID if needed
4. Use `docker-compose up --build` after pulling new changes

## 📝 Notes

- **Hot Reload**: Code changes will automatically reload the application
- **Dependencies**: New packages require rebuilding: `docker-compose up --build`
- **Database**: Add database services to `docker-compose.yml` if needed
- **SSL**: For HTTPS, configure reverse proxy (nginx) with SSL certificates

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify Docker**: `docker --version && docker-compose --version`
3. **Clean rebuild**: `docker-compose down -v && docker-compose up --build`
4. **Check ports**: `netstat -tulpn | grep :8080`

**Need help?** Contact the project maintainer or create an issue on GitHub.

---

**Happy Coding! 🚀**
