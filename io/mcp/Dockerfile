FROM node:20-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript
RUN npm run build

# Verify the build succeeded and health endpoint exists
RUN test -f dist/index.js || exit 1
RUN grep -q "app.get('/health'" src/server.ts || exit 1

EXPOSE 3001

CMD ["node", "dist/index.js"]