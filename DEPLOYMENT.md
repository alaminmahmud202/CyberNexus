# CyberNexus - Deployment Guide

This guide covers deploying the CyberNexus platform to production.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│    MongoDB      │
│   (Netlify)     │     │  (Railway/      │     │  (MongoDB       │
│                 │     │   Render/       │     │   Atlas/        │
│   Next.js 14    │     │   Fly.io)       │     │   Self-hosted)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                      ┌─────────────────┐
                      │  External APIs  │
                      │  (VirusTotal,   │
                      │   AbuseIPDB,    │
                      │   Gemini)       │
                      └─────────────────┘
```

## Backend Deployment

### Option 1: Railway (Recommended)

1. Push your backend code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. Select the `backend` folder as the root directory
5. Add environment variables from `.env.example`
6. Add a MongoDB database (Railway provides one-click MongoDB)
7. Deploy!

**Required Environment Variables:**
```env
APP_NAME=CyberNexus
DEBUG=false
SECRET_KEY=your-32-char-minimum-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MONGODB_URI=mongodb://...
MONGODB_DB_NAME=cybernexus
VIRUSTOTAL_API_KEY=your-key
ABUSEIPDB_API_KEY=your-key
GEMINI_API_KEY=your-key
AI_MODEL=gemini-1.5-flash
CORS_ORIGINS=https://your-netlify-domain.netlify.app
```

### Option 2: Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

### Option 3: Fly.io

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in the backend directory
3. Configure `fly.toml` for your app
4. Set secrets: `fly secrets set SECRET_KEY=... MONGODB_URI=...` etc.
5. Deploy: `fly deploy`

## Frontend Deployment (Netlify)

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` = your backend URL (e.g., `https://cybernexus-api.railway.app`)
6. Deploy!

### Manual Deployment

```bash
cd frontend
npm install
npm run build
# Deploy the .next folder to Netlify manually
```

### Netlify Configuration

The `netlify.toml` file handles:
- API proxy redirects (`/api/*` → backend)
- SPA routing for Next.js App Router
- Security headers
- Static asset caching

**Important**: Update the `YOUR_BACKEND_URL` placeholder in `netlify.toml` with your actual backend URL.

## Database Setup (MongoDB)

### MongoDB Atlas (Cloud - Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all, or specific IPs)
5. Get connection string
6. Use in `MONGODB_URI` environment variable

### Self-hosted MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Connection string
MONGODB_URI=mongodb://admin:password@localhost:27017
```

## External API Keys

### VirusTotal
1. Sign up at [VirusTotal](https://www.virustotal.com/)
2. Get API key from My API Key section
3. Add to `VIRUSTOTAL_API_KEY`

### AbuseIPDB
1. Sign up at [AbuseIPDB](https://www.abuseipdb.com/)
2. Get API key from API section
3. Add to `ABUSEIPDB_API_KEY`

### Google Gemini
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Add to `GEMINI_API_KEY`

## Security Checklist

- [ ] Generate strong `SECRET_KEY` (32+ chars): `openssl rand -hex 32`
- [ ] Set `DEBUG=false` in production
- [ ] Restrict `CORS_ORIGINS` to your frontend domain only
- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Enable MongoDB authentication
- [ ] Rotate API keys periodically
- [ ] Use HTTPS everywhere (Netlify/Railway provide this automatically)
- [ ] Set up monitoring and alerts

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your backend URL
npm run dev
```

## Troubleshooting

### CORS Errors
Ensure `CORS_ORIGINS` in backend includes your frontend URL exactly (including protocol).

### API Connection Failed
Check `NEXT_PUBLIC_API_BASE_URL` in frontend matches your backend URL.

### MongoDB Connection Failed
Verify `MONGODB_URI` is correct and IP whitelist includes your backend host.

### Build Failures
- Clear cache: `rm -rf .next node_modules && npm install`
- Check Node version: `node --version` (requires 18+)

## Support

For issues, check:
- Backend logs: Railway/Render/Fly.io dashboard
- Frontend logs: Netlify build logs
- Browser console for frontend errors
- Network tab for API request/response details