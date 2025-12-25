# ========================================
# Multi-stage Docker build for Backend
# ========================================
# This Dockerfile builds only the backend service from the monorepo
# Environment variables should be managed through Coolify's GUI

# 1. BUILD STAGE: Install dependencies and compile TypeScript
FROM node:22-alpine AS builder

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
# We need the root package.json for workspace configuration
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/zod-schemas/package.json ./packages/zod-schemas/package.json

# Install ALL dependencies (including devDependencies for build)
# This is necessary for TypeScript compilation
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy workspace configuration
COPY turbo.json ./

# Copy TypeScript config package
COPY packages/typescript-config ./packages/typescript-config

# Copy zod-schemas package (backend dependency)
COPY packages/zod-schemas ./packages/zod-schemas

# Copy backend source code
COPY apps/backend ./apps/backend

# Use Turbo to build the backend (it will automatically build dependencies first)
RUN yarn run build --filter=@connected-repo/backend

# 2. RUNTIME STAGE: Create minimal production image
FROM node:22-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built artifacts and dependencies from builder
# We need the compiled code and production node_modules

# Copy package files for production install
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/zod-schemas/package.json ./packages/zod-schemas/package.json

# Install only production dependencies
RUN yarn install --production --frozen-lockfile --network-timeout 100000

# Copy built zod-schemas
COPY --from=builder /app/packages/zod-schemas/dist ./packages/zod-schemas/dist
COPY --from=builder /app/packages/zod-schemas/package.json ./packages/zod-schemas/package.json

# Copy built backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Expose port (configurable via PORT env var in Coolify)
EXPOSE 3000

# Health check for Coolify
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
WORKDIR /app/apps/backend
CMD ["node", "dist/server.js"]