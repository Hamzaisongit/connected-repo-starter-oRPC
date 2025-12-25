# 1. PRUNE STAGE: Extract only what's needed for the backend
FROM node:22-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @connected-repo/backend --docker

# 2. BUILD STAGE: Install ALL deps and build
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy pruned package files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
# Install EVERYTHING (dev + prod) to ensure build tools exist
RUN yarn install --frozen-lockfile
# Force the environment to look in the hoisted root node_modules
ENV PATH="/app/node_modules/.bin:${PATH}"
# Copy source and build
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo build --filter=@connected-repo/backend

# 3. RUNTIME STAGE: The final slim image
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production

# Copy everything from builder (including node_modules and built dist)
# Then prune devDependencies to save space
COPY --from=builder /app .
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

EXPOSE 3000
WORKDIR /app/apps/backend
CMD ["node", "dist/server.js"]