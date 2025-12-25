# Deployment Guide

This guide explains how to deploy the backend application using Docker and Coolify.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Deployment on Coolify](#deployment-on-coolify)
- [Local Docker Testing](#local-docker-testing)
- [Troubleshooting](#troubleshooting)

## Environment Variables

The application requires the following environment variables. In Coolify, these are managed through the GUI.

### Required Variables

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
SESSION_SECRET=generate-a-32-character-or-longer-random-string
BETTER_AUTH_SECRET=generate-a-32-character-or-longer-random-string

# API URLs
WEBAPP_URL=https://your-frontend-domain.com
VITE_API_URL=https://your-backend-domain.com

# Internal API Secret (for webhook validation)
INTERNAL_API_SECRET=generate-a-32-character-or-longer-random-string
```

### Optional Variables (Monitoring & Observability)

```bash
# OpenTelemetry Configuration
VITE_OTEL_SERVICE_NAME=connected-repo-backend
OTEL_TRACE_EXPORTER_URL=http://your-otel-collector:4318/v1/traces

# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENV=production
```

### Generating Secrets

Generate secure random secrets using:

```bash
# On Linux/macOS
openssl rand -base64 32

# On Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deployment on Coolify

Coolify automatically builds and deploys your application using the Dockerfile.

### Setup Steps

1. **Connect Repository**
	 - Add your Git repository to Coolify
	 - Coolify will auto-detect the Dockerfile in the root

2. **Configure Environment Variables**
	 - Go to your application settings in Coolify
	 - Add all required environment variables through the GUI
	 - Coolify manages these securely and injects them at runtime

3. **Build Configuration**
	 - Build context: `/` (root directory)
	 - Dockerfile path: `Dockerfile`
	 - Port: `3000`

4. **Database Setup**
	 - Option A: Use Coolify's PostgreSQL service
	 - Option B: Use external managed database (recommended for production)
	 - Update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` accordingly

5. **Deploy**
	 - Push changes to your repository
	 - Coolify automatically triggers a build and deployment
	 - Monitor the build logs for any errors

### Database Migrations

Before the first deployment, run migrations:

```bash
# SSH into your Coolify container or use Coolify's terminal
cd /app/apps/backend
# Run migration commands here if you have them
```

## Local Docker Testing

Test the Docker build locally before deploying:

### Build and Run

```bash
# Build the Docker image
docker build -t connected-repo-backend .

# Run with environment variables from file
docker run --rm \
	--env-file apps/backend/.env \
	-p 3000:3000 \
	connected-repo-backend
```

### Using Docker Compose

The project includes a `docker-compose.yml` for local development with PostgreSQL:

```bash
# Start PostgreSQL only (for local development)
docker-compose up -d postgres

# Or uncomment the backend service in docker-compose.yml and run both
docker-compose up -d
```

### Test the Build Process

```bash
# Test the full build process
docker build --no-cache -t connected-repo-backend .

# Check the image size
docker images connected-repo-backend

# Inspect the built image
docker run --rm connected-repo-backend ls -la /app/apps/backend/dist
```

## Dockerfile Architecture

The Dockerfile uses a multi-stage build process:

### Stage 1: Builder
- Installs all dependencies (including devDependencies)
- Builds zod-schemas package (dependency of backend)
- Compiles TypeScript to JavaScript
- Creates optimized production build

### Stage 2: Runner
- Installs only production dependencies
- Copies compiled code from builder stage
- Creates minimal runtime image
- Runs the application with Node.js

### Key Features
- **Multi-stage build**: Keeps final image size small
- **Layer caching**: Optimizes rebuild times
- **Health checks**: Integrated for Coolify monitoring
- **Production optimized**: Only includes necessary files

## Troubleshooting

### Build Fails with TypeScript Errors

**Issue**: Missing type declarations during build

**Solution**: The Dockerfile now installs all devDependencies during build stage. If errors persist:

1. Check that all `@types/*` packages are in `devDependencies`
2. Verify `tsconfig.json` paths are correct
3. Ensure all workspace dependencies are properly linked

### Application Won't Start

**Issue**: Container exits immediately after starting

**Solution**: 
1. Check environment variables are set correctly
2. Verify database connection (DB_HOST, DB_PORT, credentials)
3. Check logs: `docker logs <container-name>`
4. Ensure `dist/server.js` exists in the container

### Database Connection Failed

**Issue**: Cannot connect to PostgreSQL

**Solution**:
1. Verify `DB_HOST` points to correct database server
2. If using Coolify's PostgreSQL, use the internal service name
3. Check firewall rules allow connection on `DB_PORT`
4. Verify credentials are correct

### Health Check Failing

**Issue**: Coolify shows unhealthy status

**Solution**:
1. Verify application is listening on port 3000
2. Check if application responds to HTTP GET on root path
3. Increase `start_period` in health check if app needs more startup time
4. Review application logs for startup errors

### Port Already in Use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
1. Change the PORT environment variable
2. Stop other services using port 3000
3. Update Dockerfile EXPOSE directive if needed

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured in Coolify
- [ ] Secrets generated with strong random values
- [ ] Database properly set up and accessible
- [ ] `ALLOWED_ORIGINS` configured with frontend domain
- [ ] `WEBAPP_URL` and `VITE_API_URL` set to production URLs
- [ ] Google OAuth credentials configured (production keys)
- [ ] Health check endpoint responding correctly
- [ ] Database migrations executed
- [ ] Monitoring/logging configured (Sentry, OpenTelemetry)
- [ ] SSL/TLS certificates configured (Coolify handles this)
- [ ] Backup strategy in place for database

## Support

For issues or questions:

1. Check the [main README](README.md)
2. Review [backend documentation](apps/backend/AGENTS.md)
3. Check build logs in Coolify
4. Review application logs in Coolify
