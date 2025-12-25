# Multi-stage build for minimal image size
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy yarn workspace files
COPY yarn.lock package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

# Install dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the backend (Turbo will handle dependencies)
RUN yarn run build --filter=@connected-repo/backend

# Production stage
FROM node:22-alpine AS runtime

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/apps/backend/dist ./dist

# Copy node_modules for production (only production dependencies)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Expose port (default 3000, configurable via env.PORT)
EXPOSE 3000

# Health check (optional, for Coolify)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["yarn", "run", "start"]