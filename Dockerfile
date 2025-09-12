# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
# Try bun first, fallback to npm if bun is not available
RUN npm install -g bun || true
RUN bun install 2>/dev/null || npm install

# Copy source code
COPY . .

# Create .env from .env.example if .env doesn't exist
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose port 8080
EXPOSE 8080

# Start development server
CMD ["npm", "run", "dev"]
