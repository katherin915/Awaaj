# Multi-stage build for Awaaz Frontend

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Install simple-http-server
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => {if (res.statusCode !== 200) throw new Error(res.statusCode)})"

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
