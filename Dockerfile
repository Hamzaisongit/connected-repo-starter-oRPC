# 1. PRUNE STAGE: Extract only the necessary code for the backend
FROM node:22-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @connected-repo/backend --docker

# 2. BUILD STAGE: Install ALL dependencies and compile
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned package files (package.json and yarn.lock)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock

# CRITICAL: We install ALL dependencies here. 
# You cannot run 'tsc' without devDependencies (types, build tools, etc.)
RUN yarn install --frozen-lockfile

# Inject the root node_modules/.bin into the PATH
# This ensures sub-packages find 'tsc' and 'tsc-alias' without global installs
ENV PATH="/app/node_modules/.bin:${PATH}"

# Copy source code and build
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo build --filter=@connected-repo/backend

# 3. RUNTIME STAGE: Final production-ready image
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy the built workspace from the builder stage
COPY --from=builder /app .

# Now we strip out the devDependencies to keep the image slim
# This leaves only the production modules and your 'dist' folders
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

# Expose your backend port
EXPOSE 3000

# Set healthcheck for Coolify
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the app directly using the compiled JS
WORKDIR /app/apps/backend
CMD ["node", "dist/server.js"]