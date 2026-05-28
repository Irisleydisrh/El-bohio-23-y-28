# Dockerfile para El Bohío Backend
# Usando node:20 slim para reducir tamaño

FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment variables (set in production)
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]