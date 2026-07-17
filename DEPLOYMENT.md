# Deployment Guide

This guide covers deploying the AI Resume Analyzer to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Render Deployment](#render-deployment)
- [Railway Deployment](#railway-deployment)
- [Environment Variables](#environment-variables)
- [SSL / HTTPS](#ssl--https)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Logging](#monitoring-and-logging)

---

## Prerequisites

| Requirement | Version |
|---|---|
| Docker & Docker Compose | 20.10+ / 2.0+ |
| Python | 3.10+ |
| Node.js | 18+ |
| MongoDB Atlas account (for cloud deployments) | Free tier or above |

---

## Docker Deployment

### 1. Clone and Configure

```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` for production:

```env
MONGODB_URI=mongodb://mongodb:27017
MONGODB_DB_NAME=resume_analyzer
JWT_SECRET_KEY=<generate-a-strong-random-secret>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,docx
CORS_ORIGINS=["https://yourdomain.com"]
RATE_LIMIT_PER_MINUTE=60
HF_TOKEN=<your-huggingface-token>
APP_NAME=AI Resume Analyzer
APP_VERSION=1.0.0
DEBUG=false
```

### 2. Generate a Strong Secret Key

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3. Start Services

```bash
# Build and start all containers
docker-compose up -d --build

# Verify all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Deployment

```bash
# Backend health check
curl http://localhost:8000/docs

# Frontend
curl http://localhost:3000
```

### 5. Stop Services

```bash
docker-compose down          # Stop containers (preserve data)
docker-compose down -v       # Stop containers and remove volumes (deletes data)
```

---

## Render Deployment

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your Render IP (or `0.0.0.0/0` for initial setup)
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/resume_analyzer?retryWrites=true&w=majority
   ```

### Backend (Web Service)

1. Connect your GitHub repository to [Render](https://render.com)
2. Create a new **Web Service**
3. Configure:
   | Setting | Value |
   |---|---|
   | Name | `ai-resume-analyzer-api` |
   | Region | Oregon (or closest to your users) |
   | Runtime | Python 3 |
   | Build Command | `cd backend && pip install -r requirements.txt && python -m spacy download en_core_web_sm` |
   | Start Command | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | Starter (upgrade as needed) |

4. Add environment variables (see [Environment Variables](#environment-variables) below)

### Frontend (Static Site)

1. Create a new **Static Site** on Render
2. Configure:
   | Setting | Value |
   |---|---|
   | Name | `ai-resume-analyzer` |
   | Region | Oregon (or closest to your users) |
   | Build Command | `cd frontend && npm install && npm run build` |
   | Publish Directory | `frontend/dist` |

3. Add environment variable:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://ai-resume-analyzer-api.onrender.com/api` |

4. Configure rewrites for SPA routing:
   - Go to **Settings → Redirects/Rewrites**
   - Add rule: Source `/*` → Type `Rewrite` → Destination `/index.html`

---

## Railway Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Initialize Project

```bash
railway init
```

### 3. Add MongoDB

```bash
railway add --plugin mongodb
```

Railway provides `MONGODB_URI` automatically.

### 4. Deploy Backend

```bash
railway add --service backend

# Set environment variables
railway variables set JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")
railway variables set MONGODB_DB_NAME=resume_analyzer
railway variables set DEBUG=false

railway up
```

### 5. Deploy Frontend

```bash
railway add --service frontend

# Set the API URL to the backend service's public URL
railway variables set VITE_API_URL=https://backend-production.up.railway.app/api

railway up
```

---

## Environment Variables

### Production Checklist

Set these variables in your deployment platform:

**Backend:**

| Variable | Production Value | Notes |
|---|---|---|
| `MONGODB_URI` | Atlas/Railway connection string | Never use localhost in production |
| `MONGODB_DB_NAME` | `resume_analyzer` | |
| `JWT_SECRET_KEY` | Random 64+ character string | Generate with `secrets.token_urlsafe(64)` |
| `JWT_ALGORITHM` | `HS256` | |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | `7` | |
| `UPLOAD_FOLDER` | `./uploads` | Ensure writable directory |
| `MAX_FILE_SIZE_MB` | `10` | |
| `ALLOWED_FILE_TYPES` | `pdf,docx` | |
| `CORS_ORIGINS` | `["https://yourdomain.com"]` | Only your production frontend URL |
| `RATE_LIMIT_PER_MINUTE` | `60` | Adjust based on expected traffic |
| `HF_TOKEN` | Your HuggingFace token | Optional, for enhanced NLP features |
| `APP_NAME` | `AI Resume Analyzer` | |
| `APP_VERSION` | `1.0.0` | |
| `DEBUG` | `false` | Always false in production |

**Frontend:**

| Variable | Production Value |
|---|---|
| `VITE_API_URL` | `https://your-backend-domain.com/api` |
| `VITE_APP_NAME` | `AI Resume Analyzer` |
| `VITE_DEFAULT_THEME` | `system` |

---

## SSL / HTTPS

### Docker with Certbot (Let's Encrypt)

1. Install Certbot on the host machine:
   ```bash
   sudo apt install certbot
   ```

2. Obtain a certificate:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. Mount certificates into Nginx by adding to `docker-compose.yml`:
   ```yaml
   services:
     frontend:
       volumes:
         - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

4. Update `docker/nginx.conf` to include:
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # ... rest of config
   }
   ```

### Cloud-Managed SSL

- **Render**: Automatic HTTPS on all web services and static sites
- **Railway**: Automatic HTTPS on all deployed services
- **Vercel / Netlify**: Automatic SSL via Let's Encrypt

For managed platforms, no manual SSL configuration is required.

---

## Performance Optimization

### Backend

- **Connection Pooling**: Motor is configured with `maxPoolSize=50` and `minPoolSize=10` by default
- **Rate Limiting**: Default 60 requests/minute per IP; adjust `RATE_LIMIT_PER_MINUTE` based on load
- **File Upload Limits**: `MAX_FILE_SIZE_MB=10` prevents abuse
- **CORS**: Restrict `CORS_ORIGINS` to your production domain only

### Frontend

- **Vite Production Build**: Optimized, minified, tree-shaken output
- **Nginx Gzip**: Enabled for text, CSS, JS, JSON, XML, SVG
- **Static Asset Caching**: 30-day cache with immutable headers for hashed assets
- **Lazy Loading**: Route-level code splitting via React Router

### Database (MongoDB)

- **Indexes**: Pre-configured on frequently queried fields (`user_id`, `email`, `resume_id`)
- **Atlas Free Tier Limits**: 512 MB storage, 100 connections — sufficient for small-scale use
- **Upgrade Path**: M10+ for production with dedicated resources

---

## Monitoring and Logging

### Application Logs

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Filter by service and time
docker-compose logs --since 30m backend
```

### Health Checks

The backend exposes the following for monitoring:

- **API Docs**: `GET /docs` (Swagger UI) and `GET /openapi.json`
- **MongoDB Health**: Connection established at startup with ping verification
- **Docker Health Check**: MongoDB container includes built-in health check (`mongosh --eval "db.adminCommand('ping')"`) with 10s intervals

### Recommended Monitoring Tools

| Tool | Purpose | Setup |
|---|---|---|
| [UptimeRobot](https://uptimerobot.com/) | Uptime monitoring | Free tier, monitor `/docs` endpoint |
| [Sentry](https://sentry.io/) | Error tracking | Add `sentry-sdk[fastapi]` to backend |
| [MongoDB Atlas Monitoring](https://www.mongodb.com/atlas) | Database metrics | Built-in with Atlas clusters |
| [Render Metrics](https://render.com/) | CPU, memory, request metrics | Built-in with Render services |

### Log Aggregation

For production, consider:

- **Structured Logging**: Add `structlog` or `loguru` to the backend for JSON-formatted logs
- **Centralized Logging**: Ship logs to a service like [Logtail](https://logtail.com/), [Papertrail](https://www.papertrailapp.com/), or [Grafana Loki](https://grafana.com/oss/loki/)
