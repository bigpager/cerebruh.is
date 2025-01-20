FROM node:18-slim

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
CMD curl -f http://localhost:3001/health || exit 1

# Default environment variables
ENV NODE_ENV=development
ENV PORT=3001

# Create directory for volume mounting
RUN mkdir -p /app/src

# Command to run the application
CMD ["npm", "start"]

