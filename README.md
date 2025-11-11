# ICJIA Accessibility Status

A comprehensive web accessibility tracking system for the Illinois Criminal Justice Information Authority, designed to monitor progress toward April 2026 compliance goals across all ICJIA web properties.

> 📚 **[Complete Documentation](https://accessibility.icjia.app/docs)** | **[Local Docs](http://localhost:3002)** (when running `yarn dev`)

## ⚡ Quick Start

### Local Development (5 Minutes)

```bash
# 1. Clone and install
git clone https://github.com/ICJIA/icjia-accessibility-status.git
cd icjia-accessibility-status
yarn install

# 2. Configure environment
cp .env.sample .env
# Edit .env and add your Supabase credentials:
#   VITE_SUPABASE_URL=your-project-url
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Run database migrations
# Go to Supabase Dashboard → SQL Editor → New query
# Copy and run: supabase/migrations/step_1_create_initial_schema.sql
# Then run: supabase/migrations/step_2_api_keys_and_rls_fixes.sql

# 4. Start development server
yarn dev

# 5. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001/api
# Docs: http://localhost:3002
# Admin: http://localhost:5173/admin (username: admin, password: blank - set on first login)
```

### Available Commands

```bash
yarn dev              # Start all services (frontend, backend, docs)
yarn dev:frontend     # Frontend only
yarn dev:backend      # Backend only
yarn dev:docs         # Documentation only
yarn build            # Build for production
yarn seed             # Populate database with sample data
yarn lint             # Run ESLint
yarn typecheck        # Run TypeScript type checking
```

## 🚀 Production Deployment

### Laravel Forge

For detailed Laravel Forge deployment instructions, see the **[Deployment Guide](https://accessibility.icjia.app/docs/deployment/laravel-forge)** in the documentation.

**Quick steps:**

1. Create a new site in Laravel Forge
2. Set Node.js version to 20+
3. Configure environment variables from `.env.sample`
4. Run database migrations
5. Deploy using Git

### Coolify

For detailed Coolify deployment instructions, see the **[Deployment Guide](https://accessibility.icjia.app/docs/deployment/coolify)** in the documentation.

**Quick steps:**

1. Create a new application in Coolify
2. Connect your Git repository
3. Set Node.js version to 20+
4. Configure environment variables
5. Run database migrations
6. Deploy

## 📚 Documentation

**Complete documentation is available at:**

- **Production**: https://accessibility.icjia.app/docs
- **Local**: http://localhost:3002 (when running `yarn dev`)

The documentation includes:

- Getting started guides
- API reference
- Database schema
- Authentication system
- Deployment options
- Troubleshooting
- And more

## Prerequisites

- **Node.js 20+** (specified in `.nvmrc`)
- **Yarn 1.22.22** (specified in `package.json`)
- **Supabase account** (free tier works fine)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Express, Node.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Cookie-based sessions with bcrypt
- **Documentation**: Docusaurus 3

## License

See LICENSE file for details. |
| `backend.nodeVersion` | string | Node.js version running the backend |
| `backend.environment` | string | Environment: `development`, `production`, etc. |
| `database.status` | string | Database status: `connected`, `partial`, `disconnected`, `error` |
| `database.supabaseUrl` | string | Whether Supabase URL is configured: `configured` or `missing` |
| `database.tables` | object | Status of individual database tables |
| `database.tables.*.status` | string | Table status: `ok` or `error` |
| `database.tables.*.responseTime` | number | Response time for table check in milliseconds |
| `database.tables.*.error` | string | Error message if table check failed (optional) |
| `database.error` | string | Overall database error message (optional) |
| `checks` | array | Array of individual health checks performed |
| `checks[].name` | string | Name of the check (e.g., `sites_table`) |
| `checks[].status` | string | Check result: `pass` or `fail` |
| `checks[].error` | string | Error message if check failed (optional) |
| `responseTime` | number | Total health check response time in milliseconds |

### Status Definitions

**Overall Status** (`status` field):

- **`healthy`** - All checks passed, system is fully operational
- **`degraded`** - Some checks failed, but system is partially operational
- **`unhealthy`** - Critical checks failed, system may not be operational

**Database Status** (`database.status` field):

- **`connected`** - All database table checks passed
- **`partial`** - Some table checks passed, some failed
- **`disconnected`** - All database table checks failed
- **`error`** - Database connection error occurred

### Use Cases

#### 1. Load Balancer Health Checks

Configure your load balancer to check `/api/health`:

```nginx
# Nginx upstream health check
upstream backend {
    server backend1.example.com:3001;
    server backend2.example.com:3001;
}

# Health check configuration
location /api/health {
    proxy_pass http://backend;
    proxy_next_upstream error timeout http_503;
}
```

#### 2. Monitoring & Alerting

Use the health check endpoint with monitoring tools:

```bash
# Simple uptime monitoring script
#!/bin/bash
# Set your domain or use localhost for development
HEALTH_URL="${API_URL:-http://localhost:3001}/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -eq 200 ]; then
    echo "✅ System is healthy"
else
    echo "❌ System is unhealthy (HTTP $response)"
    # Send alert notification
fi
```

#### 3. CI/CD Pipeline Checks

Verify deployment health in your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Health Check
  run: |
    # Use environment variable for production URL
    HEALTH_URL="${{ secrets.PRODUCTION_URL }}/api/health"
    response=$(curl -s $HEALTH_URL)
    status=$(echo $response | jq -r '.status')
    if [ "$status" != "healthy" ]; then
      echo "Deployment health check failed"
      exit 1
    fi
```

#### 4. Frontend Health Dashboard

The application includes a built-in health check dashboard at:

```
https://your-domain.com/health
```

This page provides a visual interface showing:

- ✅ Real-time system status with color-coded indicators
- ✅ Backend API uptime and version information
- ✅ Database connectivity status
- ✅ Individual table health checks with response times
- ✅ Detailed error messages when issues are detected
- ✅ Manual refresh button to re-run health checks

**Access**: Public (no authentication required)

### Troubleshooting

If the health check endpoint returns `unhealthy` or `degraded`:

1. **Check Backend Logs**: Review server logs for error messages
2. **Verify Database Connection**: Ensure Supabase credentials are correct in `.env`
3. **Check Network Connectivity**: Verify the server can reach Supabase
4. **Review Table Errors**: Check individual table errors in the response
5. **Restart Services**: Try restarting the backend server

**Common Issues**:

- **`database.status: "disconnected"`** - Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- **High response times** - May indicate database performance issues
- **Specific table errors** - Check RLS policies and table permissions in Supabase

## JSON Import Format

### Single Site Upload

```json
{
  "title": "Site Name",
  "description": "Site description",
  "url": "https://example.gov",
  "documentation_url": "https://example.gov/accessibility",
  "axe_score": 85,
  "lighthouse_score": 90,
  "axe_last_updated": "2024-11-01",
  "lighthouse_last_updated": "2024-11-01",
  "score_history": [
    {
      "axe_score": 70,
      "lighthouse_score": 75,
      "recorded_at": "2024-08-01"
    }
  ]
}
```

### Bulk Upload

Upload an array of sites:

```json
[
  {
    /* site 1 */
  },
  {
    /* site 2 */
  }
]
```

## Project Structure

```
/
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication middleware
│   └── utils/           # Supabase client and utilities
├── src/                 # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── lib/             # API client
│   └── types/           # TypeScript type definitions
└── seed.ts              # Database seeding script
```

## Key Features Implemented

✅ Supabase database with RLS policies
✅ Authentication with persistent sessions
✅ Public accessibility dashboard
✅ Detailed site pages with charts (line charts, gauge charts)
✅ Historical score tracking
✅ Multi-format exports (JSON, CSV, Markdown)
✅ API-only data ingestion with API key authentication
✅ API Upload History with payload viewing (admin only)
✅ Activity Log tracking all significant events
✅ Git commit-style messages for API uploads (`payload_description`)
✅ Comprehensive audit trail (API key, IP address, user agent)
✅ Light/dark mode toggle
✅ ICJIA branding and navigation
✅ Responsive design
✅ Score badges with color coding
✅ Progress tracking toward April 2026 deadline

## Upcoming Features

- PDF export generation
- Additional admin pages (user management UI, documentation editor)
- Site CRUD forms (add/edit sites through UI)
- Email report functionality (placeholder included)

## Deployment Options

This application can be deployed in multiple ways depending on your infrastructure and requirements. Choose the deployment method that best fits your needs:

1. **[Development Environment](#development-environment-deployment)** - Local development setup
2. **[Ubuntu Server with PM2 & Nginx](#ubuntu-server-deployment-with-pm2--nginx)** - Traditional VPS deployment
3. **[Coolify](#coolify-deployment)** - Self-hosted PaaS platform
4. **[Vercel](#vercel-deployment)** - Serverless deployment platform
5. **[Laravel Forge](#laravel-forge-deployment)** - Managed server deployment

---

## 📚 Documentation Index

All documentation has been organized into logical folders for easy navigation:

### 📋 Deployment Documentation (`/docs/deployment/`)

- **[COOLIFY_QUICK_START.md](docs/deployment/COOLIFY_QUICK_START.md)** - Quick start guide for Coolify deployment
- **[DEPLOYMENT_CHECKLIST.md](docs/deployment/DEPLOYMENT_CHECKLIST.md)** - Pre and post-deployment verification checklist
- **[LARAVEL_FORGE_DEPLOYMENT_SUMMARY.md](docs/deployment/LARAVEL_FORGE_DEPLOYMENT_SUMMARY.md)** - Summary of Laravel Forge deployment options
- **[DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md)** - General deployment guidelines

### 🔒 Security Documentation (`/docs/security/`)

- **[SECURITY_AUDIT.md](docs/security/SECURITY_AUDIT.md)** - Security audit report and recommendations
- **[RLS_SECURITY_AUDIT.md](docs/security/RLS_SECURITY_AUDIT.md)** - Comprehensive Row Level Security (RLS) policy audit and verification

### 👨‍💻 Development Documentation (`/docs/development/`)

- **[SETUP.md](docs/development/SETUP.md)** - Complete development environment setup guide
- **[API_DOCUMENTATION.md](docs/development/API_DOCUMENTATION.md)** - API endpoints and usage documentation
- **[QUICK_START_SETUP_SUMMARY.md](docs/development/QUICK_START_SETUP_SUMMARY.md)** - Quick Start and migration setup summary for new developers

### 📊 Project Documentation (`/docs/project/`)

- **[FUTURE_ROADMAP.md](docs/project/FUTURE_ROADMAP.md)** - Feature roadmap and planned enhancements
- **[ROADMAP_SYNC_GUIDE.md](docs/project/ROADMAP_SYNC_GUIDE.md)** - Guide for keeping roadmap synchronized
- **[FEATURE_SUMMARY.md](docs/project/FEATURE_SUMMARY.md)** - Summary of implemented features
- **[DOCUMENTATION_REORGANIZATION_SUMMARY.md](docs/project/DOCUMENTATION_REORGANIZATION_SUMMARY.md)** - Summary of documentation reorganization and Coolify deployment guide

---

## Development Environment Deployment

For local development, see the [Development](#development) section above.

---

## Ubuntu Server Deployment with PM2 & Nginx

This application consists of two parts that need to be deployed: the React frontend (static files) and the Express backend (Node.js API server).

### Prerequisites

- **Ubuntu 20.04+ or Debian 11+** server with root access
- **Node.js 20+** installed (use nvm for easy version management)
- **Yarn 1.22.22** installed (`npm install -g yarn@1.22.22`)
- **Nginx** installed (`sudo apt install nginx`)
- **PM2** for process management (`yarn global add pm2`)
- **Supabase project** created with all three migrations run (see [Complete Setup Guide](#-complete-setup-guide-for-new-developers))
- **DNS A records** configured (see DNS Setup below)

> **⚠️ Important**: Make sure you've completed the [Complete Setup Guide](#-complete-setup-guide-for-new-developers) first, including creating your Supabase project and running all three database migrations.

### Step 1: Install Node.js and Yarn on Ubuntu

If you don't have Node.js 20+ and Yarn installed on your Ubuntu server:

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify Node.js installation
node --version  # Should show v20.x.x

# Install Yarn globally
npm install -g yarn@1.22.22

# Verify Yarn installation
yarn --version  # Should show 1.22.22

# Install PM2 globally
yarn global add pm2

# Verify PM2 installation
pm2 --version
```

### Step 2: DNS Setup

Before deployment, configure your DNS A records to point to your server's IP address:

**For ICJIA deployment:**

- `accessibility.icjia.app` → Your server IP (e.g., `123.45.67.89`)
- `accessibility.icjia-api.cloud` → Your server IP (e.g., `123.45.67.89`)

**DNS Configuration Steps:**

1. Log into your DNS provider (e.g., Cloudflare, Route53, etc.)
2. Create an A record for `accessibility.icjia.app` pointing to your server IP
3. Create an A record for `accessibility.icjia-api.cloud` pointing to your server IP
4. Wait for DNS propagation (can take 5-60 minutes)
5. Verify with: `dig accessibility.icjia.app` or `nslookup accessibility.icjia.app`

### Step 3: Build the Application Locally

On your **local development machine** (not the server):

```bash
# Install dependencies
yarn install

# Build the frontend (outputs to dist/)
yarn build
```

This creates an optimized production build in the `dist/` directory.

### Step 4: Deploy Files to Server

1. **Create application directory on server**:

```bash
ssh user@your-server
sudo mkdir -p /var/www/icjia-accessibility
sudo chown -R $USER:$USER /var/www/icjia-accessibility
```

2. **Upload application files** (from your local machine):

```bash
# Upload backend and configuration files
rsync -av --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  --exclude 'logs/*.log' \
  ./ user@your-server:/var/www/icjia-accessibility/

# Upload frontend build
rsync -av dist/ user@your-server:/var/www/icjia-accessibility/dist/
```

3. **Install dependencies on server**:

```bash
ssh user@your-server
cd /var/www/icjia-accessibility
yarn install --production
```

### Step 5: Configure Environment Variables

Create `.env` file on the server with your Supabase credentials:

```bash
cd /var/www/icjia-accessibility
nano .env
```

**For separate domain setup (ICJIA configuration):**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# API Configuration - Backend domain
VITE_API_URL=https://accessibility.icjia-api.cloud/api

# Server Configuration
PORT=3001

# Frontend Configuration - Frontend domain
FRONTEND_URL=https://accessibility.icjia.app
```

**For single domain setup:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# API Configuration - Same domain
VITE_API_URL=https://yourdomain.com/api

# Server Configuration
PORT=3001

# Frontend Configuration - Same domain
FRONTEND_URL=https://yourdomain.com
```

### Step 6: Start Backend with PM2

The project includes an `ecosystem.config.js` file for PM2 configuration.

```bash
cd /var/www/icjia-accessibility

# Start the backend using the ecosystem file
yarn start
# or
pm2 start ecosystem.config.js

# Verify the process is running
pm2 status

# View logs
pm2 logs icjia-accessibility-api

# Save PM2 process list (so it persists across reboots)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed by the command (usually requires running a command with sudo)
```

### PM2 Management Commands

```bash
# Check status
yarn status
# or
pm2 status

# View logs
yarn logs
# or
pm2 logs icjia-accessibility-backend

# Restart backend
yarn restart
# or
pm2 restart icjia-accessibility-backend

# Stop backend
yarn stop
# or
pm2 stop icjia-accessibility-backend

# Monitor in real-time
pm2 monit

# View detailed info
pm2 show icjia-accessibility-backend
```

### Step 7: Configure Nginx

You have two options for Nginx configuration:

1. **Separate Domains** (ICJIA setup): Frontend and backend on different domains
2. **Single Domain**: Both frontend and backend on the same domain

> **💡 Tip**: The separate domains approach is recommended for production as it provides better separation of concerns and easier SSL certificate management.

#### Option 1: Separate Domains (ICJIA Configuration)

This setup uses:

- **Frontend**: `accessibility.icjia.app` (serves static files)
- **Backend API**: `accessibility.icjia-api.cloud` (proxies to Express)

##### Backend API Configuration

Create the backend API Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/accessibility-api
```

Add the following configuration:

```nginx
# Redirect HTTP to HTTPS for API domain
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.icjia-api.cloud;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration for Backend API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accessibility.icjia-api.cloud;

    # SSL Configuration (Let's Encrypt certificates)
    ssl_certificate /etc/letsencrypt/live/accessibility.icjia-api.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accessibility.icjia-api.cloud/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CORS Headers (allow frontend domain)
    add_header Access-Control-Allow-Origin "https://accessibility.icjia.app" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Proxy all requests to Express backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

##### Frontend Configuration

Create the frontend Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/accessibility-frontend
```

Add the following configuration:

```nginx
# Redirect HTTP to HTTPS for frontend domain
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.icjia.app;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration for Frontend
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accessibility.icjia.app;

    # SSL Configuration (Let's Encrypt certificates)
    ssl_certificate /etc/letsencrypt/live/accessibility.icjia.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accessibility.icjia.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Serve React frontend (static files)
    root /var/www/icjia-accessibility/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Frontend: serve static files and handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

##### Enable Separate Domain Sites

```bash
# Enable backend API site
sudo ln -s /etc/nginx/sites-available/accessibility-api /etc/nginx/sites-enabled/

# Enable frontend site
sudo ln -s /etc/nginx/sites-available/accessibility-frontend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

##### Step 8: SSL Certificates for Separate Domains

Install Let's Encrypt SSL certificates for HTTPS:

```bash
# Install certbot (if not already installed)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate for backend API domain (replace with your actual domain)
sudo certbot --nginx -d your-api-domain.com

# Obtain certificate for frontend domain (replace with your actual domain)
sudo certbot --nginx -d your-frontend-domain.com

# Auto-renewal is configured automatically by certbot
# Test renewal with:
sudo certbot renew --dry-run

# Verify certificates are installed
sudo certbot certificates
```

**What certbot does:**

- Automatically obtains SSL certificates from Let's Encrypt
- Modifies your Nginx configuration to use HTTPS
- Sets up automatic renewal (certificates expire every 90 days)
- Redirects HTTP to HTTPS automatically

#### Option 2: Single Domain Configuration

This setup serves both frontend and backend from the same domain (e.g., `yourdomain.com`).

Create the Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/accessibility-portal
```

Add the following configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Let's Encrypt certificates)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Serve React frontend (static files)
    root /var/www/icjia-accessibility/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Backend API: proxy to Express server
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend: serve static files and handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

##### Enable Single Domain Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/accessibility-portal /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

##### SSL Certificate for Single Domain

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

### Testing Nginx Configuration

After making any changes to Nginx configuration:

```bash
# Test configuration syntax
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# View error logs if issues occur
sudo tail -f /var/log/nginx/error.log
```

### Architecture Summary

**Separate Domains (Option 1):**

- **Frontend**: Nginx serves static files from `/var/www/icjia-accessibility/dist/` at `accessibility.icjia.app`
- **Backend API**: Nginx proxies all requests to `http://localhost:3001` at `accessibility.icjia-api.cloud`
- CORS headers configured to allow cross-domain requests

**Single Domain (Option 2):**

- **Frontend**: Nginx serves static files from `/var/www/icjia-accessibility/dist/`
- **Backend API**: Nginx proxies `/api/*` requests to `http://localhost:3001/api/`
- No CORS issues since both are on the same domain

Both setups provide:

- SSL/HTTPS termination at Nginx
- Static file serving with caching
- API reverse proxy with proper headers
- Gzip compression
- Security headers

### Monitoring and Maintenance

```bash
# Check backend status
yarn status
# or
pm2 status

# View backend logs
yarn logs
# or
pm2 logs icjia-accessibility-backend

# Restart backend
yarn restart
# or
pm2 restart icjia-accessibility-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
tail -f /var/www/icjia-accessibility/logs/backend-error.log
tail -f /var/www/icjia-accessibility/logs/backend-out.log
```

### Updating the Application

#### Update Frontend

```bash
# On your local machine: build new version
yarn build

# Deploy frontend
rsync -av dist/ user@your-server:/var/www/icjia-accessibility/dist/

# No server restart needed - Nginx serves static files
```

#### Update Backend

```bash
# Deploy backend (if changed)
rsync -av --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  --exclude 'logs/*.log' \
  server/ user@your-server:/var/www/icjia-accessibility/server/

# On the server: restart backend
ssh user@your-server
cd /var/www/icjia-accessibility
yarn restart
```

#### Update Dependencies

```bash
# On server
ssh user@your-server
cd /var/www/icjia-accessibility
yarn install --production
yarn restart
```

---

## Advanced Production Deployment with Nginx Reverse Proxy

This comprehensive guide covers advanced production deployment scenarios using Nginx as a reverse proxy. This section is designed for production environments where you need fine-grained control over your infrastructure, SSL certificates, and domain configuration.

### 📋 Overview

In a production environment, Nginx acts as a **reverse proxy** that sits in front of your application services:

```
Internet → Nginx (Port 80/443) → Backend API (Port 3001)
                                → Frontend Static Files (dist/)
```

**Benefits of using Nginx as a reverse proxy:**

- ✅ SSL/TLS termination (HTTPS)
- ✅ Load balancing capabilities
- ✅ Static file serving with caching
- ✅ Security headers and DDoS protection
- ✅ Gzip compression
- ✅ Request rate limiting
- ✅ Multiple domain/subdomain support

---

### 🌐 Deployment Architecture Options

This guide covers three common production deployment scenarios:

| Scenario                       | Frontend Domain             | Backend API Domain              | Complexity | CORS Required |
| ------------------------------ | --------------------------- | ------------------------------- | ---------- | ------------- |
| **Option 1**: Separate Domains | `accessibility.icjia.app`   | `accessibility.icjia-api.cloud` | Medium     | Yes           |
| **Option 2**: Subdomains       | `app.icjia.cloud`           | `api.icjia.cloud`               | Medium     | Yes           |
| **Option 3**: Single Domain    | `accessibility.icjia.cloud` | `accessibility.icjia.cloud/api` | Low        | No            |

**Recommendation**: Option 1 (Separate Domains) provides the best separation of concerns and is used in the examples below.

---

### 🚀 Complete Step-by-Step Production Deployment

This guide assumes you've already completed the [Ubuntu Server Deployment](#ubuntu-server-deployment-with-pm2--nginx) section and have:

- ✅ Node.js 20+ and Yarn installed
- ✅ Application files deployed to `/var/www/icjia-accessibility`
- ✅ Backend running with PM2
- ✅ Nginx installed

---

### Step 1: DNS Configuration

Before configuring Nginx, you need to set up DNS records pointing to your server's IP address.

#### DNS Setup for Separate Domains (Option 1)

**Example domains:**

- Frontend: `accessibility.icjia.app`
- Backend API: `accessibility.icjia-api.cloud`

**DNS Records to Create:**

| Type | Name                            | Value                           | TTL  |
| ---- | ------------------------------- | ------------------------------- | ---- |
| A    | `accessibility.icjia.app`       | `123.45.67.89` (your server IP) | 3600 |
| A    | `accessibility.icjia-api.cloud` | `123.45.67.89` (your server IP) | 3600 |

**Alternative: Using CNAME Records**

If you want to use CNAME records instead (useful if your server IP might change):

1. First, create an A record for your main server:

   ```
   Type: A
   Name: server.icjia.cloud
   Value: 123.45.67.89
   ```

2. Then create CNAME records pointing to it:

   ```
   Type: CNAME
   Name: accessibility.icjia.app
   Value: server.icjia.cloud

   Type: CNAME
   Name: accessibility.icjia-api.cloud
   Value: server.icjia.cloud
   ```

**DNS Provider Instructions:**

<details>
<summary><strong>Cloudflare</strong></summary>

1. Log into Cloudflare dashboard
2. Select your domain (e.g., `icjia.app`)
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Select **A** record type
6. Enter subdomain name (e.g., `accessibility`)
7. Enter your server IP address
8. Set **Proxy status** to **DNS only** (gray cloud) initially
9. Click **Save**
10. Repeat for the API domain

</details>

<details>
<summary><strong>AWS Route 53</strong></summary>

1. Log into AWS Console → Route 53
2. Select your hosted zone
3. Click **Create record**
4. Enter subdomain name (e.g., `accessibility`)
5. Select **A** record type
6. Enter your server IP address
7. Click **Create records**
8. Repeat for the API domain

</details>

<details>
<summary><strong>Google Cloud DNS</strong></summary>

1. Log into Google Cloud Console → Cloud DNS
2. Select your DNS zone
3. Click **Add record set**
4. Enter subdomain name (e.g., `accessibility`)
5. Select **A** record type
6. Enter your server IP address
7. Click **Create**
8. Repeat for the API domain

</details>

**Verify DNS Propagation:**

```bash
# Check if DNS is resolving correctly
dig accessibility.icjia.app
dig accessibility.icjia-api.cloud

# Or use nslookup
nslookup accessibility.icjia.app
nslookup accessibility.icjia-api.cloud

# Online tool (from your browser)
# Visit: https://dnschecker.org
```

**Note**: DNS propagation can take 5-60 minutes. Wait until both domains resolve to your server IP before proceeding.

---

### Step 2: Environment Variables for Production

Update your `.env` file on the server with production domain values.

#### Environment Variables Explained

| Variable                 | Development Value                  | Production Value (Separate Domains)         | Changes? |
| ------------------------ | ---------------------------------- | ------------------------------------------- | -------- |
| `VITE_SUPABASE_URL`      | `https://your-project.supabase.co` | `https://your-project.supabase.co`          | ❌ No    |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key`                    | `your_anon_key`                             | ❌ No    |
| `VITE_API_URL`           | `http://localhost:3001/api`        | `https://accessibility.icjia-api.cloud/api` | ✅ Yes   |
| `PORT`                   | `3001`                             | `3001`                                      | ❌ No    |
| `FRONTEND_URL`           | `http://localhost:5173`            | `https://accessibility.icjia.app`           | ✅ Yes   |

**Complete `.env` Example for Production (Option 1: Separate Domains):**

```bash
# Supabase Configuration
# These values stay the same in all environments
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_ANON_KEY_HERE

# API Configuration
# IMPORTANT: Update this to your production API domain
VITE_API_URL=https://accessibility.icjia-api.cloud/api

# Server Configuration
# Port stays the same - Nginx proxies to this internal port
PORT=3001

# Frontend Configuration
# IMPORTANT: Update this to your production frontend domain (for CORS)
FRONTEND_URL=https://accessibility.icjia.app
```

**Complete `.env` Example for Production (Option 2: Subdomains):**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
VITE_API_URL=https://api.icjia.cloud/api

# Server Configuration
PORT=3001

# Frontend Configuration
FRONTEND_URL=https://app.icjia.cloud
```

**Complete `.env` Example for Production (Option 3: Single Domain):**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
# Same domain, /api path
VITE_API_URL=https://accessibility.icjia.cloud/api

# Server Configuration
PORT=3001

# Frontend Configuration
# Same domain as frontend
FRONTEND_URL=https://accessibility.icjia.cloud
```

**Update `.env` on Server:**

```bash
ssh user@your-server
cd /var/www/icjia-accessibility
nano .env
# Paste the appropriate configuration above
# Save and exit (Ctrl+X, Y, Enter)

# Restart backend to apply changes
pm2 restart icjia-accessibility-backend
```

---

### Step 3: Nginx Reverse Proxy Configuration

Now we'll configure Nginx to act as a reverse proxy for both the frontend and backend.

#### Understanding Nginx Reverse Proxy

**What is a reverse proxy?**

A reverse proxy sits between clients (browsers) and your application servers. When a client makes a request:

1. **Client** → Makes HTTPS request to `https://accessibility.icjia-api.cloud/api/sites`
2. **Nginx** → Receives request on port 443 (HTTPS)
3. **Nginx** → Forwards request to `http://localhost:3001/api/sites` (your Express backend)
4. **Express** → Processes request and returns response
5. **Nginx** → Sends response back to client

**Benefits:**

- Nginx handles SSL/TLS encryption (HTTPS)
- Your backend only needs to listen on localhost (more secure)
- Nginx can serve static files efficiently
- Nginx adds security headers automatically

---

#### Option 1: Separate Domains Configuration (Recommended)

This configuration uses two separate domains:

- **Frontend**: `accessibility.icjia.app` → Serves static React files
- **Backend API**: `accessibility.icjia-api.cloud` → Proxies to Express on port 3001

##### Backend API Nginx Configuration

> **Note**: The examples below use `accessibility.icjia-api.cloud` as a sample domain. Replace this with your actual API domain name throughout the configuration.

Create the backend API configuration file:

```bash
sudo nano /etc/nginx/sites-available/accessibility-api
```

**Complete Nginx configuration for backend API:**

```nginx
# ============================================================================
# ICJIA Accessibility Status Portal - Backend API
# Domain: accessibility.icjia-api.cloud (REPLACE WITH YOUR API DOMAIN)
# Purpose: Reverse proxy to Express.js API server on port 3001
# ============================================================================

# Redirect all HTTP traffic to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.icjia-api.cloud;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration for Backend API
server {
    # Listen on port 443 with SSL/TLS
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accessibility.icjia-api.cloud;

    # ========================================================================
    # SSL/TLS Configuration
    # ========================================================================
    # Certificates will be automatically configured by certbot
    # These paths will be created when you run: sudo certbot --nginx -d accessibility.icjia-api.cloud
    ssl_certificate /etc/letsencrypt/live/accessibility.icjia-api.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accessibility.icjia-api.cloud/privkey.pem;

    # SSL protocols and ciphers (modern, secure configuration)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # SSL session cache for performance
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ========================================================================
    # Security Headers
    # ========================================================================
    # Prevent clickjacking attacks
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Prevent MIME type sniffing
    add_header X-Content-Type-Options "nosniff" always;

    # Enable XSS protection
    add_header X-XSS-Protection "1; mode=block" always;

    # Control referrer information
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Force HTTPS for 1 year (including subdomains)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ========================================================================
    # CORS Headers (Allow frontend domain to access this API)
    # ========================================================================
    # IMPORTANT: Update this to match your frontend domain
    add_header Access-Control-Allow-Origin "https://accessibility.icjia.app" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://accessibility.icjia.app" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # ========================================================================
    # Gzip Compression
    # ========================================================================
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/xml;

    # ========================================================================
    # Logging
    # ========================================================================
    access_log /var/log/nginx/accessibility-api-access.log;
    error_log /var/log/nginx/accessibility-api-error.log;

    # ========================================================================
    # Reverse Proxy to Express Backend
    # ========================================================================
    # Proxy ALL requests to the Express server running on localhost:3001
    location / {
        # Forward to Express backend
        proxy_pass http://localhost:3001;

        # HTTP version
        proxy_http_version 1.1;

        # WebSocket support (if needed in future)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Pass original host header
        proxy_set_header Host $host;

        # Pass real client IP address
        proxy_set_header X-Real-IP $remote_addr;

        # Pass proxy chain
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Pass protocol (http or https)
        proxy_set_header X-Forwarded-Proto $scheme;

        # Don't cache proxied requests
        proxy_cache_bypass $http_upgrade;

        # Timeouts (adjust based on your API response times)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # ========================================================================
    # Health Check Endpoint (optional)
    # ========================================================================
    # You can add a simple health check that Nginx responds to directly
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**Enable the backend API site:**

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/accessibility-api /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

##### Frontend Nginx Configuration

> **Note**: The examples below use `accessibility.icjia.app` as a sample domain. Replace this with your actual domain name throughout the configuration.

Create the frontend configuration file:

```bash
sudo nano /etc/nginx/sites-available/accessibility-frontend
```

**Complete Nginx configuration for frontend:**

```nginx
# ============================================================================
# ICJIA Accessibility Status Portal - Frontend
# Domain: accessibility.icjia.app (REPLACE WITH YOUR DOMAIN)
# Purpose: Serve React static files with client-side routing support
# ============================================================================

# Redirect all HTTP traffic to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.icjia.app;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration for Frontend
server {
    # Listen on port 443 with SSL/TLS
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accessibility.icjia.app;

    # ========================================================================
    # SSL/TLS Configuration
    # ========================================================================
    # Certificates will be automatically configured by certbot
    # These paths will be created when you run: sudo certbot --nginx -d accessibility.icjia.app
    ssl_certificate /etc/letsencrypt/live/accessibility.icjia.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accessibility.icjia.app/privkey.pem;

    # SSL protocols and ciphers (modern, secure configuration)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # SSL session cache for performance
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ========================================================================
    # Security Headers
    # ========================================================================
    # Prevent clickjacking attacks
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Prevent MIME type sniffing
    add_header X-Content-Type-Options "nosniff" always;

    # Enable XSS protection
    add_header X-XSS-Protection "1; mode=block" always;

    # Control referrer information
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Force HTTPS for 1 year (including subdomains)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ========================================================================
    # Document Root - React Build Output
    # ========================================================================
    # Point to the Vite build output directory
    root /var/www/icjia-accessibility/dist;
    index index.html;

    # ========================================================================
    # Gzip Compression
    # ========================================================================
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/xml;

    # ========================================================================
    # Logging
    # ========================================================================
    access_log /var/log/nginx/accessibility-frontend-access.log;
    error_log /var/log/nginx/accessibility-frontend-error.log;

    # ========================================================================
    # Static File Serving with Client-Side Routing
    # ========================================================================
    # Main location block - handles React Router client-side routing
    location / {
        # Try to serve the file directly, then directory, then fall back to index.html
        # This is CRITICAL for React Router to work properly
        try_files $uri $uri/ /index.html;

        # Add cache control for HTML files (don't cache)
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # ========================================================================
    # Cache Static Assets Aggressively
    # ========================================================================
    # JavaScript and CSS files (Vite adds content hashes to filenames)
    location ~* \.(js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Images and fonts
    location ~* \.(png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ========================================================================
    # Security - Deny Access to Hidden Files
    # ========================================================================
    # Prevent access to .git, .env, etc.
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Prevent access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Enable the frontend site:**

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/accessibility-frontend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

### Step 4: SSL Certificate Setup with Let's Encrypt

Now we'll obtain free SSL certificates from Let's Encrypt using certbot.

#### Install Certbot

```bash
# Update package list
sudo apt update

# Install certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

#### Obtain SSL Certificates

**For Backend API Domain:**

```bash
# Obtain certificate for backend API
sudo certbot --nginx -d accessibility.icjia-api.cloud

# Follow the prompts:
# 1. Enter your email address (for renewal notifications)
# 2. Agree to Terms of Service (Y)
# 3. Choose whether to share email with EFF (optional)
# 4. Certbot will automatically configure Nginx for HTTPS
```

**For Frontend Domain:**

```bash
# Obtain certificate for frontend
sudo certbot --nginx -d accessibility.icjia.app

# Follow the same prompts as above
```

**What certbot does automatically:**

- ✅ Obtains SSL certificate from Let's Encrypt
- ✅ Validates domain ownership
- ✅ Updates Nginx configuration with SSL certificate paths
- ✅ Sets up automatic renewal (certificates expire every 90 days)
- ✅ Configures HTTP to HTTPS redirect

#### Verify SSL Certificates

```bash
# List all certificates
sudo certbot certificates

# Expected output:
# Found the following certs:
#   Certificate Name: accessibility.icjia-api.cloud
#     Domains: accessibility.icjia-api.cloud
#     Expiry Date: 2025-04-10 (VALID: 89 days)
#   Certificate Name: accessibility.icjia.app
#     Domains: accessibility.icjia.app
#     Expiry Date: 2025-04-10 (VALID: 89 days)
```

#### Test Automatic Renewal

```bash
# Dry run to test renewal process
sudo certbot renew --dry-run

# If successful, you'll see:
# Congratulations, all simulated renewals succeeded
```

**Automatic Renewal:**

Certbot automatically sets up a systemd timer to renew certificates. Verify it's enabled:

```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# Should show: Active: active (waiting)
```

#### Manual Renewal (if needed)

```bash
# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name accessibility.icjia-api.cloud

# After renewal, reload Nginx
sudo systemctl reload nginx
```

---

### Step 5: Testing and Verification

After completing the setup, verify everything is working correctly.

#### Test Backend API

```bash
# Test HTTP to HTTPS redirect
curl -I http://accessibility.icjia-api.cloud
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://accessibility.icjia-api.cloud/

# Test HTTPS connection
curl -I https://accessibility.icjia-api.cloud
# Should return: HTTP/2 200

# Test API endpoint (should return 404 for root, which is expected)
curl https://accessibility.icjia-api.cloud/api/sites
# Should return JSON data or authentication error
```

#### Test Frontend

```bash
# Test HTTP to HTTPS redirect
curl -I http://accessibility.icjia.app
# Should return: HTTP/1.1 301 Moved Permanently

# Test HTTPS connection
curl -I https://accessibility.icjia.app
# Should return: HTTP/2 200

# Test that index.html is served
curl https://accessibility.icjia.app
# Should return HTML content
```

#### Test in Browser

1. **Frontend**: Visit `https://accessibility.icjia.app`

   - ✅ Should load without SSL warnings
   - ✅ Should show the login page
   - ✅ Check browser console for errors

2. **Backend API**: Visit `https://accessibility.icjia-api.cloud/api/sites`

   - ✅ Should return JSON data (or authentication error if not logged in)
   - ✅ No SSL warnings

3. **CORS**: Log into the frontend and verify API calls work
   - ✅ Login should work
   - ✅ Dashboard should load site data
   - ✅ No CORS errors in browser console

#### Check SSL Certificate

```bash
# Check SSL certificate details
openssl s_client -connect accessibility.icjia-api.cloud:443 -servername accessibility.icjia-api.cloud < /dev/null

# Or use online tools:
# https://www.ssllabs.com/ssltest/
# Enter your domain and run the test
```

#### Monitor Logs

```bash
# Watch Nginx access logs
sudo tail -f /var/log/nginx/accessibility-api-access.log
sudo tail -f /var/log/nginx/accessibility-frontend-access.log

# Watch Nginx error logs
sudo tail -f /var/log/nginx/accessibility-api-error.log
sudo tail -f /var/log/nginx/accessibility-frontend-error.log

# Watch backend application logs
pm2 logs icjia-accessibility-backend
```

---

### Alternative Deployment Scenarios

#### Option 2: Subdomain Configuration

Use subdomains on the same root domain (e.g., `app.icjia.cloud` and `api.icjia.cloud`).

**Pros:**

- ✅ Easier DNS management (single root domain)
- ✅ Can use wildcard SSL certificate
- ✅ Clear separation between frontend and backend

**Cons:**

- ⚠️ Requires CORS configuration (different subdomains)

**Environment Variables:**

```bash
VITE_API_URL=https://api.icjia.cloud/api
FRONTEND_URL=https://app.icjia.cloud
```

**Nginx Configuration Changes:**

Update `server_name` directives:

- Backend: `server_name api.icjia.cloud;`
- Frontend: `server_name app.icjia.cloud;`

Update CORS headers in backend config:

```nginx
add_header Access-Control-Allow-Origin "https://app.icjia.cloud" always;
```

**SSL Certificate:**

```bash
# Option 1: Separate certificates
sudo certbot --nginx -d api.icjia.cloud
sudo certbot --nginx -d app.icjia.cloud

# Option 2: Wildcard certificate (requires DNS validation)
sudo certbot --nginx -d "*.icjia.cloud" -d icjia.cloud --preferred-challenges dns
```

---

#### Option 3: Single Domain Configuration

Serve both frontend and backend from the same domain (e.g., `accessibility.icjia.cloud`).

**Pros:**

- ✅ No CORS issues (same origin)
- ✅ Single SSL certificate
- ✅ Simpler DNS setup

**Cons:**

- ⚠️ Less separation between frontend and backend
- ⚠️ More complex Nginx configuration

**Environment Variables:**

```bash
VITE_API_URL=https://accessibility.icjia.cloud/api
FRONTEND_URL=https://accessibility.icjia.cloud
```

**Nginx Configuration:**

Create a single configuration file:

```bash
sudo nano /etc/nginx/sites-available/accessibility-portal
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name accessibility.icjia.cloud;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accessibility.icjia.cloud;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/accessibility.icjia.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accessibility.icjia.cloud/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Document root for frontend
    root /var/www/icjia-accessibility/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Backend API - proxy to Express
    # IMPORTANT: This must come BEFORE the frontend location block
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend - serve static files with client-side routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

**Enable and test:**

```bash
sudo ln -s /etc/nginx/sites-available/accessibility-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d accessibility.icjia.cloud
```

---

### Comparison of Deployment Options

| Feature              | Option 1: Separate Domains      | Option 2: Subdomains       | Option 3: Single Domain         |
| -------------------- | ------------------------------- | -------------------------- | ------------------------------- |
| **Frontend URL**     | `accessibility.icjia.app`       | `app.icjia.cloud`          | `accessibility.icjia.cloud`     |
| **Backend URL**      | `accessibility.icjia-api.cloud` | `api.icjia.cloud`          | `accessibility.icjia.cloud/api` |
| **CORS Required**    | Yes                             | Yes                        | No                              |
| **SSL Certificates** | 2 separate                      | 2 separate (or 1 wildcard) | 1 certificate                   |
| **DNS Records**      | 2 A records                     | 2 A records                | 1 A record                      |
| **Nginx Configs**    | 2 files                         | 2 files                    | 1 file                          |
| **Complexity**       | Medium                          | Medium                     | Low                             |
| **Separation**       | Best                            | Good                       | Minimal                         |
| **Recommended For**  | Production                      | Production                 | Development/Small deployments   |

---

### Troubleshooting

#### Issue: 502 Bad Gateway

**Cause**: Nginx can't connect to the backend on port 3001.

**Solution:**

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs icjia-accessibility-backend

# Restart backend
pm2 restart icjia-accessibility-backend

# Verify backend is listening on port 3001
sudo netstat -tlnp | grep 3001
# or
sudo ss -tlnp | grep 3001
```

#### Issue: CORS Errors in Browser Console

**Cause**: CORS headers not configured correctly.

**Solution:**

1. Verify `FRONTEND_URL` in `.env` matches your frontend domain exactly
2. Check Nginx backend config has correct `Access-Control-Allow-Origin` header
3. Restart backend: `pm2 restart icjia-accessibility-backend`
4. Reload Nginx: `sudo systemctl reload nginx`

#### Issue: SSL Certificate Errors

**Cause**: Certificate not installed or expired.

**Solution:**

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

#### Issue: 404 on Frontend Routes

**Cause**: Nginx not configured for client-side routing.

**Solution:**

Ensure frontend Nginx config has:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Issue: Static Assets Not Loading

**Cause**: Incorrect `root` path in Nginx config.

**Solution:**

```bash
# Verify dist directory exists
ls -la /var/www/icjia-accessibility/dist/

# Check Nginx config has correct root
sudo nano /etc/nginx/sites-available/accessibility-frontend
# Should have: root /var/www/icjia-accessibility/dist;

# Reload Nginx
sudo systemctl reload nginx
```

#### Check Nginx Configuration

```bash
# Test configuration syntax
sudo nginx -t

# View active configuration
sudo nginx -T

# Check which config files are loaded
sudo nginx -T | grep "configuration file"
```

#### View Logs

```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Backend logs
pm2 logs icjia-accessibility-backend

# System logs
sudo journalctl -u nginx -f
```

---

### Production Deployment Checklist

Before going live, verify:

- [ ] DNS records configured and propagated
- [ ] `.env` file updated with production domains
- [ ] Backend running with PM2 (`pm2 status`)
- [ ] PM2 configured to start on boot (`pm2 startup`)
- [ ] Nginx configuration files created
- [ ] Nginx configuration tested (`sudo nginx -t`)
- [ ] SSL certificates obtained (`sudo certbot certificates`)
- [ ] SSL auto-renewal tested (`sudo certbot renew --dry-run`)
- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] CORS working (no console errors)
- [ ] Login functionality works
- [ ] Dashboard loads site data
- [ ] SSL Labs test passes (A+ rating)
- [ ] Firewall configured (allow ports 80, 443, 22)
- [ ] Monitoring set up (optional: UptimeRobot, Pingdom)
- [ ] Backups configured for database

---

## Coolify Deployment

[Coolify](https://coolify.io) is an open-source, self-hosted alternative to Heroku/Netlify that simplifies deployment on your own infrastructure. This section covers two distinct deployment architectures for the ICJIA Accessibility Status Portal.

### Prerequisites (Both Architectures)

- **Coolify Server**: Ubuntu 20.04+ with Docker installed
- **Docker & Docker Compose**: Installed on the server
- **Supabase Project**: Already created with credentials
- **GitHub Repository**: Code pushed to main branch
- **Domain Names**: At least one domain (for Option 1) or two domains (for Option 2)

### Initial Coolify Server Setup

#### Step 1: Install Coolify

**Option A: Self-Hosted Installation**

```bash
# SSH into your Ubuntu server
ssh user@your-server.com

# Install Coolify
curl -fsSL https://get.coolify.io | bash

# Follow the installation prompts
# Coolify will be available at https://your-server-ip:3000
```

**Option B: Coolify Cloud (Managed)**

1. Go to [coolify.io](https://coolify.io)
2. Sign up for a free account
3. Create a new server instance
4. Coolify handles infrastructure automatically

#### Step 2: Connect GitHub Repository

1. In Coolify Dashboard, click **"New Project"**
2. Select **"GitHub"**
3. Authorize Coolify to access your GitHub account
4. Select `icjia-accessibility-status` repository
5. Configure:
   - **Branch**: `main`
   - **Root Directory**: `/` (root of repository)

---

### Option 1: Single Domain Deployment (Monolithic)

**Architecture**: Frontend and backend on the same domain with path-based routing.

- **Frontend**: `https://accessibility.icjia.app/` (root path)
- **Backend**: `https://accessibility.icjia.app/api` (path-based)

#### Advantages

✅ Single domain = single SSL certificate
✅ No CORS configuration needed
✅ Simpler deployment pipeline
✅ Lower cost (one domain)
✅ Easier for small teams to manage

#### Disadvantages

❌ Tightly coupled deployments
❌ Shared server resources
❌ Cannot scale independently

#### Step 1: Create Docker Compose Configuration

Create `docker-compose.yml` in your project root:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_API_URL=https://accessibility.icjia.app/api
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### Step 2: Create Dockerfiles

**Dockerfile.backend**:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start backend
CMD ["yarn", "start:backend"]
```

**Dockerfile.frontend**:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build frontend
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to serve static files
RUN yarn global add serve

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start frontend
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Step 3: Create Nginx Configuration

In Coolify, go to **Site Details** → **Files** → **Edit Nginx Configuration**:

```nginx
# Single Domain Deployment
# Frontend: / (root path)
# Backend: /api (path-based)

upstream backend {
    server backend:3001;
    keepalive 64;
}

upstream frontend {
    server frontend:3000;
    keepalive 64;
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;

# Frontend: Serve React SPA from root
location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://frontend;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}

# Backend API: Proxy to Node.js backend
location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;

    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Buffering
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}

# Health check endpoint
location /api/health {
    access_log off;
    proxy_pass http://backend;
}

# Deny access to sensitive files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

#### Step 4: Set Environment Variables

In Coolify, add these environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# API Configuration (local path)
VITE_API_URL=https://accessibility.icjia.app/api

# Backend Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://accessibility.icjia.app
```

#### Step 5: Deploy

1. In Coolify, click **"Deploy"**
2. Coolify will:
   - Pull your code from Git
   - Build Docker images
   - Start containers
   - Configure SSL certificates
   - Set up reverse proxy

#### Step 6: Verify Deployment

```bash
# Check if services are running
docker ps

# Check backend health
curl https://accessibility.icjia.app/api/health

# Check frontend
curl https://accessibility.icjia.app/

# View logs
docker logs <backend-container-id>
docker logs <frontend-container-id>
```

---

### Option 2: Separate Domain Deployment (Microservices)

**Architecture**: Frontend and backend on separate domains.

- **Frontend**: `https://accessibility.icjia.app`
- **Backend**: `https://accessibility.icjia-api.cloud`

#### Advantages

✅ Independent scaling
✅ Flexible deployments
✅ Better separation of concerns
✅ Easier maintenance
✅ Future-proof for microservices

#### Disadvantages

❌ CORS complexity
❌ Multiple SSL certificates
❌ Higher cost (two domains)
❌ More complex DNS
❌ Deployment complexity

#### Step 1: Create Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_API_URL=https://accessibility.icjia-api.cloud/api
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### Step 2: Create Dockerfiles

Same as Option 1 (see above).

#### Step 3: Configure Frontend Nginx

In Coolify for frontend service, go to **Site Details** → **Files** → **Edit Nginx Configuration**:

```nginx
# Frontend Nginx Configuration
# Serves React SPA

upstream frontend {
    server frontend:3000;
    keepalive 64;
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;

# Serve React SPA
location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://frontend;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}

# Deny access to sensitive files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

#### Step 4: Configure Backend Nginx

In Coolify for backend service, go to **Site Details** → **Files** → **Edit Nginx Configuration**:

```nginx
# Backend Nginx Configuration
# Acts as reverse proxy to Node.js backend

upstream backend {
    server backend:3001;
    keepalive 64;
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# CORS headers for frontend domain
add_header 'Access-Control-Allow-Origin' 'https://accessibility.icjia.app' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

# Handle preflight requests
location / {
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    proxy_pass http://backend;
    proxy_http_version 1.1;

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Health check endpoint
location /api/health {
    access_log off;
    proxy_pass http://backend;
}

# Deny access to sensitive files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

#### Step 5: Set Environment Variables

**Frontend Service**:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_URL=https://accessibility.icjia-api.cloud/api
```

**Backend Service**:

```bash
NODE_ENV=production
PORT=3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
FRONTEND_URL=https://accessibility.icjia.app
```

#### Step 6: Deploy Both Services

1. Deploy frontend service first
2. Deploy backend service second
3. Verify both services are running

#### Step 7: Verify Deployment

```bash
# Check frontend
curl https://accessibility.icjia.app/

# Check backend health
curl https://accessibility.icjia-api.cloud/api/health

# Check CORS headers
curl -H "Origin: https://accessibility.icjia.app" \
     -H "Access-Control-Request-Method: GET" \
     https://accessibility.icjia-api.cloud/api/sites
```

---

### Coolify Deployment Recommendation

#### Analysis for ICJIA

**Application Architecture**:

- Frontend: React + Vite (static SPA)
- Backend: Express.js (Node.js API)
- Database: Supabase (managed)
- Authentication: Custom cookie-based

**Comparison Matrix**:

| Factor                      | Option 1 (Single Domain) | Option 2 (Separate Domains) |
| --------------------------- | ------------------------ | --------------------------- |
| **SSL Complexity**          | ✅ Simple (1 cert)       | ❌ Complex (2 certs)        |
| **CORS Configuration**      | ✅ None needed           | ❌ Required                 |
| **Deployment Complexity**   | ✅ Simple (1 service)    | ❌ Complex (2 services)     |
| **Cost**                    | ✅ Lower (1 domain)      | ❌ Higher (2 domains)       |
| **Scaling Flexibility**     | ❌ Limited               | ✅ Excellent                |
| **Maintenance Overhead**    | ✅ Lower                 | ❌ Higher                   |
| **DNS Management**          | ✅ Simpler               | ❌ More complex             |
| **Independent Deployments** | ❌ No                    | ✅ Yes                      |
| **Resource Isolation**      | ❌ Shared                | ✅ Isolated                 |
| **Future Microservices**    | ❌ Difficult             | ✅ Easy                     |

#### 🎯 Recommendation: Option 1 - Single Domain Deployment

**For ICJIA's use case with Coolify, we recommend Option 1: Single Domain Deployment.**

**Why Option 1 is Better**:

1. **Operational Simplicity** (Primary Reason)

   - Single domain = single SSL certificate
   - No CORS configuration needed
   - One deployment pipeline
   - Easier for small DevOps teams
   - Fewer things that can break

2. **Cost Efficiency** (Secondary Reason)

   - One domain instead of two (~$10-15/year savings)
   - Potentially one server (~$5-20/month savings)
   - Reduced DNS management
   - Lower operational overhead

3. **Alignment with Current Architecture** (Tertiary Reason)
   - Monorepo structure suggests monolithic deployment
   - Frontend and backend tightly integrated
   - Deployment script builds both together
   - No independent scaling requirements

**Trade-offs to Accept**:

- Tightly coupled deployments (acceptable for current scale)
- Shared server resources (acceptable for current traffic)
- Cannot scale independently (not needed for current requirements)

**When to Reconsider Option 2**:

- If frontend and backend need independent scaling
- If you need to deploy frontend and backend separately
- If you plan to add additional microservices
- If traffic patterns differ significantly between frontend and backend

---

### Coolify Monitoring & Maintenance

#### Health Checks

Coolify automatically monitors your services:

```bash
# Backend health check
curl https://accessibility.icjia.app/api/health

# Frontend health check
curl https://accessibility.icjia.app/
```

#### Viewing Logs

In Coolify Dashboard:

1. Go to **Services** → Select your service
2. Click **"Logs"** tab
3. View real-time logs
4. Filter by date/time range

#### Auto-Restart Configuration

Coolify automatically restarts failed containers:

```yaml
restart: unless-stopped
```

#### SSL Certificate Management

Coolify automatically:

- Obtains SSL certificates from Let's Encrypt
- Renews certificates before expiration
- Handles HTTPS redirects

#### Scaling

For Option 1 (Single Domain):

- Increase container resources in Coolify
- Restart services

For Option 2 (Separate Domains):

- Scale frontend and backend independently
- Adjust resources per service

---

## Vercel Deployment

[Vercel](https://vercel.com) is a serverless platform optimized for frontend frameworks and serverless functions.

### Prerequisites

- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

### Deployment Architecture

**Important**: Vercel is optimized for serverless functions. For this full-stack application:

- **Frontend**: Deploy as a standard Vite/React app
- **Backend**: Deploy as Vercel Serverless Functions

### Backend Adaptation for Vercel

#### 1. Create Serverless Function Structure

Create `api/` directory in project root and convert Express routes to serverless functions:

**`api/sites.ts`** (example):

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .order("name");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
```

#### 2. Configure `vercel.json`

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "buildCommand": "yarn build",
  "devCommand": "yarn dev",
  "installCommand": "yarn install",
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
  }
}
```

#### 3. Deploy to Vercel

**Via Vercel Dashboard:**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository
4. Configure:

   - **Framework Preset**: Vite
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Install Command**: `yarn install`

5. Add Environment Variables:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   VITE_API_URL=https://your-app.vercel.app/api
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. Click **Deploy**

**Via Vercel CLI:**

```bash
# Install Vercel CLI
yarn global add vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Vercel automatically provisions SSL certificates

### Limitations

- **Serverless Functions**: 10-second execution limit (Hobby plan)
- **No Persistent Connections**: Each request is stateless
- **Cold Starts**: First request may be slower

### Alternative: Vercel + External Backend

Deploy only the frontend on Vercel and keep the backend on a traditional server:

1. Deploy frontend to Vercel
2. Deploy backend to Ubuntu/Coolify/Forge
3. Update `VITE_API_URL` to point to your backend server

---

## Laravel Forge Deployment

[Laravel Forge](https://forge.laravel.com) is a server management tool that simplifies deployment on cloud servers (DigitalOcean, AWS, Linode, etc.). This section covers two distinct deployment architectures for the ICJIA Accessibility Status Portal.

### Prerequisites (Both Architectures)

- Laravel Forge account
- Cloud server (DigitalOcean, AWS, Linode, Vultr, etc.)
- Domain name(s)
- Node.js 20 LTS installed on server
- Yarn package manager installed
- PM2 process manager installed

### Initial Server Setup

Before deploying either architecture, set up your Forge server:

#### 1. Provision Server via Forge

1. Log into [Laravel Forge](https://forge.laravel.com)
2. Click **Create Server**
3. Configure:
   - **Provider**: Choose your cloud provider
   - **Server Size**: At least 1GB RAM recommended (2GB+ for production)
   - **Region**: Choose closest to your users
   - **Server Name**: `icjia-accessibility-server`
   - **PHP Version**: Not critical (we're using Node.js)
   - **Database**: None (using Supabase)
4. Click **Create Server** and wait for provisioning (5-10 minutes)

#### 2. Install Node.js, Yarn, and PM2

SSH into your Forge server and run:

```bash
# SSH into server (credentials in Forge dashboard)
ssh forge@your-server-ip

# Install Node.js 20 LTS
sudo apt-get update --allow-releaseinfo-change && sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update --allow-releaseinfo-change && sudo apt-get install nodejs -y

# Install Yarn
npm install -g yarn

# Install PM2
yarn global add pm2

# Verify installations
node --version
yarn --version
pm2 --version
```

---

## Option 1: Single Domain Deployment (Monolithic)

**Architecture**: Both frontend and backend served from a single domain with path-based routing.

- **Frontend**: `https://accessibility.icjia.app/` (root path)
- **Backend API**: `https://accessibility.icjia.app/api` (path-based)

### Advantages

✅ **Simpler SSL Management**: One domain = one SSL certificate
✅ **Easier CORS**: No cross-origin requests needed
✅ **Single Deployment**: One site to manage in Forge
✅ **Lower Cost**: One domain, one server
✅ **Simpler DNS**: Only one domain to configure

### Disadvantages

❌ **Tightly Coupled**: Frontend and backend deployments are linked
❌ **Shared Resources**: Frontend and backend compete for server resources
❌ **Less Flexible Scaling**: Cannot scale frontend and backend independently
❌ **Monolithic Deployment**: Must deploy both together

### Option 1: Step-by-Step Setup

#### Step 1: Create Single Site in Forge

1. In Forge dashboard, click **New Site**
2. Configure:
   - **Root Domain**: `accessibility.icjia.app`
   - **Project Type**: Static HTML
   - **Web Directory**: `/public`
3. Click **Add Site**

#### Step 2: Configure Git Repository

1. Go to **Site Details** → **Git Repository**
2. Configure:
   - **Provider**: GitHub
   - **Repository**: `ICJIA/icjia-accessibility-status`
   - **Branch**: `main`
   - **Deploy on Push**: Enable
3. Click **Install Repository**

#### Step 3: Configure Environment Variables

Go to **Site Details** → **Environment** and add:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# API Configuration (local path)
VITE_API_URL=https://accessibility.icjia.app/api

# Backend Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://accessibility.icjia.app
```

#### Step 4: Update Deployment Script

Go to **Site Details** → **Deployment Script** and replace with:

```bash
#!/bin/bash
set -e

cd /home/forge/accessibility.icjia.app

# Pull latest code
git pull origin main

# Install dependencies
yarn install --production

# Build frontend
yarn build

# Start/restart backend with PM2
pm2 restart icjia-accessibility-backend || pm2 start ecosystem.config.js
pm2 save

# Verify backend is running
pm2 status
```

#### Step 5: Configure Nginx (Single Domain with Path-Based Routing)

Go to **Site Details** → **Files** → **Edit Nginx Configuration** and replace with:

```nginx
# Single Domain Deployment
# Frontend: / (root path)
# Backend: /api (path-based)

# Upstream backend service
upstream backend {
    server localhost:3001;
    keepalive 64;
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;

# Frontend: Serve React SPA from /dist
location / {
    root /home/forge/accessibility.icjia.app/dist;
    try_files $uri $uri/ /index.html;
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
}

# Cache static assets longer
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    root /home/forge/accessibility.icjia.app/dist;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}

# Backend API: Proxy to Node.js backend
location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;

    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Buffering
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}

# Health check endpoint
location /api/health {
    access_log off;
    proxy_pass http://backend;
}

# Deny access to sensitive files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

#### Step 6: Create PM2 Ecosystem Configuration

Create `/home/forge/accessibility.icjia.app/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "icjia-accessibility-backend",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/home/forge/.pm2/logs/icjia-accessibility-backend-error.log",
      out_file: "/home/forge/.pm2/logs/icjia-accessibility-backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
```

#### Step 7: Enable SSL

1. Go to **Site Details** → **SSL**
2. Click **LetsEncrypt**
3. Enable SSL
4. Forge automatically renews certificates

#### Step 8: Deploy

1. Click **Deploy Now** in Forge dashboard
2. Monitor deployment logs
3. Verify application is running

#### Step 9: Verify Deployment

```bash
# Check frontend
curl https://accessibility.icjia.app

# Check backend
curl https://accessibility.icjia.app/api/health

# Check PM2 status
pm2 status
```

---

## Option 2: Separate Domain Deployment (Microservices)

**Architecture**: Frontend and backend deployed on separate domains with independent scaling.

- **Frontend**: `https://accessibility.icjia.app`
- **Backend API**: `https://accessibility.icjia-api.cloud`

### Advantages

✅ **Independent Scaling**: Scale frontend and backend separately
✅ **Flexible Deployments**: Deploy frontend and backend independently
✅ **Better Separation of Concerns**: Clear microservices architecture
✅ **Easier Maintenance**: Isolate issues to specific service
✅ **Future-Proof**: Easier to add additional services later

### Disadvantages

❌ **CORS Complexity**: Must configure cross-origin headers
❌ **Multiple SSL Certificates**: Need SSL for both domains
❌ **Higher Cost**: Two domains, potentially two servers
❌ **More Complex DNS**: Two domains to configure and manage
❌ **Deployment Complexity**: Two separate deployment pipelines

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│  Frontend Domain     │            │  Backend Domain      │
│ accessibility.      │            │ accessibility.      │
│ icjia.app           │            │ icjia-api.cloud     │
│                     │            │                     │
│ - React App         │            │ - Express API       │
│ - Vite Build        │            │ - Node.js Server    │
│ - Static Files      │            │ - Port 3001         │
└──────────────────────┘            └──────────────────────┘
        ↓                                       ↓
    Nginx                                  Nginx Proxy
    (Static)                               (Reverse Proxy)
        ↓                                       ↓
    /dist                              localhost:3001
                                        (PM2 Process)
        ↓
    ┌───────────────────────────────────┐
    │  Supabase (PostgreSQL)            │
    │  - Shared Database                │
    │  - RLS Policies                   │
    └───────────────────────────────────┘
```

### Step 1: Create Two Sites in Forge

#### Frontend Site

1. In Forge dashboard, click **New Site**
2. Configure:
   - **Root Domain**: `accessibility.icjia.app`
   - **Project Type**: Static HTML
   - **Web Directory**: `/public`
3. Click **Add Site**

#### Backend Site

1. Click **New Site** again
2. Configure:
   - **Root Domain**: `accessibility.icjia-api.cloud`
   - **Project Type**: Static HTML (we'll configure it as a proxy)
   - **Web Directory**: `/public`
3. Click **Add Site**

### Step 2: Configure Frontend Site

#### 2a. Set Up Git Repository

1. Go to **Frontend Site Details** → **Git Repository**
2. Configure:
   - **Provider**: GitHub
   - **Repository**: `your-username/icjia-accessibility-status`
   - **Branch**: `main`
   - **Deploy on Push**: Enable
3. Click **Install Repository**

#### 2b. Update Deployment Script

Go to **Site Details** → **Deployment Script** and replace with:

```bash
cd /home/forge/accessibility.icjia.app

# Pull latest code
git pull origin main

# Install dependencies
yarn install --production

# Build frontend only
yarn build

# Restart backend with PM2 (if running on same server)
pm2 restart icjia-accessibility-backend || true
pm2 save
```

#### 2c. Configure Environment Variables

Go to **Site Details** → **Environment** and add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_URL=https://accessibility.icjia-api.cloud/api
NODE_ENV=production
```

#### 2d. Configure Nginx for Frontend

Go to **Site Details** → **Files** → **Edit Nginx Configuration** and update:

```nginx
# Frontend Nginx Configuration
# Serves React SPA from /dist directory

root /home/forge/accessibility.icjia.app/dist;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# SPA routing - serve index.html for all non-file requests
location / {
    try_files $uri $uri/ /index.html;
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
}

# Cache static assets longer
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}

# Deny access to sensitive files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

### Step 3: Configure Backend Site

#### 3a. Set Up Git Repository

1. Go to **Backend Site Details** → **Git Repository**
2. Configure same as frontend:
   - **Provider**: GitHub
   - **Repository**: `your-username/icjia-accessibility-status`
   - **Branch**: `main`
   - **Deploy on Push**: Enable
3. Click **Install Repository**

#### 3b. Update Deployment Script

Go to **Site Details** → **Deployment Script** and replace with:

```bash
cd /home/forge/accessibility.icjia-api.cloud

# Pull latest code
git pull origin main

# Install dependencies
yarn install --production

# Start/restart backend with PM2
pm2 restart icjia-accessibility-backend || pm2 start ecosystem.config.js
pm2 save

# Verify backend is running
pm2 status
```

#### 3c. Configure Environment Variables

Go to **Site Details** → **Environment** and add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
FRONTEND_URL=https://accessibility.icjia.app
NODE_ENV=production
PORT=3001
```

**Important**: The backend needs `FRONTEND_URL` for CORS configuration.

#### 3d. Configure Nginx for Backend (Reverse Proxy)

Go to **Site Details** → **Files** → **Edit Nginx Configuration** and replace with:

```nginx
# Backend Nginx Configuration
# Acts as reverse proxy to Node.js backend running on localhost:3001

# Upstream backend service
upstream backend {
    server localhost:3001;
    keepalive 64;
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# CORS headers for frontend
add_header 'Access-Control-Allow-Origin' 'https://accessibility.icjia.app' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    return 204;
}

# Proxy all requests to backend
location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;

    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Buffering
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}

# Health check endpoint
location /health {
    access_log off;
    proxy_pass http://backend;
}

# Deny access to sensitive files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

### Step 4: Enable SSL for Both Domains

1. For **Frontend Site**:

   - Go to **Site Details** → **SSL**
   - Click **LetsEncrypt**
   - Enable SSL

2. For **Backend Site**:
   - Go to **Site Details** → **SSL**
   - Click **LetsEncrypt**
   - Enable SSL

Forge automatically renews certificates 30 days before expiration.

### Step 5: Verify Deployment

#### Check Frontend

```bash
# Should load the React app
curl https://accessibility.icjia.app

# Check that it loads index.html
curl -I https://accessibility.icjia.app
```

#### Check Backend

```bash
# Should return health status
curl https://accessibility.icjia-api.cloud/api/health

# Should return: {"status":"ok"}
```

#### Check API Communication

1. Open frontend: `https://accessibility.icjia.app`
2. Open browser DevTools → Network tab
3. Navigate to Dashboard
4. Verify API calls go to `https://accessibility.icjia-api.cloud/api/*`
5. Check that responses are successful (200 status)

### Step 6: Environment Variables Summary

#### Frontend (.env)

```bash
# Frontend environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_URL=https://accessibility.icjia-api.cloud/api
NODE_ENV=production
```

#### Backend (.env)

```bash
# Backend environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
FRONTEND_URL=https://accessibility.icjia.app
NODE_ENV=production
PORT=3001
```

### Step 7: Troubleshooting

#### Frontend shows "Cannot GET /"

**Problem**: Nginx is not serving the React app correctly.

**Solution**:

1. Verify `root` directive points to `/home/forge/accessibility.icjia.app/dist`
2. Verify `try_files $uri $uri/ /index.html;` is in `location /` block
3. Check that `yarn build` completed successfully
4. Verify files exist: `ls -la /home/forge/accessibility.icjia.app/dist/`

#### API calls return CORS errors

**Problem**: Frontend cannot communicate with backend.

**Solution**:

1. Verify `VITE_API_URL` is set to `https://accessibility.icjia-api.cloud/api`
2. Verify backend Nginx has CORS headers:
   ```nginx
   add_header 'Access-Control-Allow-Origin' 'https://accessibility.icjia.app' always;
   ```
3. Verify backend is running: `pm2 status`
4. Check backend logs: `pm2 logs icjia-accessibility-backend`

#### Backend returns 502 Bad Gateway

**Problem**: Nginx cannot connect to backend service.

**Solution**:

1. Verify backend is running: `pm2 status`
2. Verify backend is listening on port 3001: `netstat -tlnp | grep 3001`
3. Check backend logs: `pm2 logs`
4. Verify Nginx upstream is correct: `upstream backend { server localhost:3001; }`

#### SSL certificate not renewing

**Problem**: SSL certificate expired.

**Solution**:

1. In Forge, go to **Site Details** → **SSL**
2. Click **Renew Certificate**
3. Verify renewal completed
4. Check certificate expiration: `openssl s_client -connect accessibility.icjia.app:443 -showcerts`

### Step 8: Monitoring & Maintenance

#### View Logs

```bash
# SSH into Forge server
ssh forge@your-server-ip

# Frontend deployment logs
tail -f /home/forge/.forge/logs/accessibility.icjia.app.log

# Backend PM2 logs
pm2 logs icjia-accessibility-backend

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/accessibility.icjia-api.cloud-access.log
```

#### Monitor Backend Process

```bash
# Check PM2 status
pm2 status

# Monitor in real-time
pm2 monit

# Restart backend
pm2 restart icjia-accessibility-backend

# Stop backend
pm2 stop icjia-accessibility-backend

# Start backend
pm2 start ecosystem.config.js
```

#### Check Disk Space

```bash
# Check disk usage
df -h

# Check specific directory
du -sh /home/forge/accessibility.icjia.app
```

### Step 9: Auto-Deploy on Push

1. In Forge, go to **Frontend Site Details** → **Deployment Trigger URL**
2. Copy the webhook URL
3. Add to GitHub repository:

   - Go to **Settings** → **Webhooks** → **Add webhook**
   - Paste Forge webhook URL
   - Select **Push events**
   - Click **Add webhook**

4. Repeat for **Backend Site**

Now every push to `main` will automatically deploy both frontend and backend!

---

## Laravel Forge Deployment Recommendation

### Analysis: Which Architecture is Right for ICJIA?

After evaluating both deployment architectures in the context of the ICJIA Accessibility Status Portal, here's a comprehensive analysis:

#### Application Architecture Review

The ICJIA Accessibility Status Portal consists of:

- **Frontend**: React + Vite SPA (static files after build)
- **Backend**: Express.js API server (Node.js process)
- **Database**: Supabase PostgreSQL (external, cloud-hosted)
- **Authentication**: Custom cookie-based sessions (not Supabase Auth)
- **Deployment Model**: Monorepo (frontend + backend in same repository)

#### Comparison Matrix

| Factor                      | Option 1 (Single Domain) | Option 2 (Separate Domains) |
| --------------------------- | ------------------------ | --------------------------- |
| **SSL Complexity**          | ✅ Simple (1 cert)       | ❌ Complex (2 certs)        |
| **CORS Configuration**      | ✅ None needed           | ❌ Required                 |
| **Deployment Complexity**   | ✅ Simple (1 site)       | ❌ Complex (2 sites)        |
| **Cost**                    | ✅ Lower (1 domain)      | ❌ Higher (2 domains)       |
| **Scaling Flexibility**     | ❌ Limited               | ✅ Excellent                |
| **Maintenance Overhead**    | ✅ Lower                 | ❌ Higher                   |
| **DNS Management**          | ✅ Simpler               | ❌ More complex             |
| **Independent Deployments** | ❌ No                    | ✅ Yes                      |
| **Resource Isolation**      | ❌ Shared                | ✅ Isolated                 |
| **Future Microservices**    | ❌ Difficult             | ✅ Easy                     |

#### Key Considerations for ICJIA

1. **Current Scale**: The application is a single-purpose accessibility monitoring tool for ICJIA. It's not expected to have massive traffic spikes or require independent scaling of frontend vs. backend.

2. **Maintenance Team**: ICJIA likely has a small DevOps team. Simpler deployment = fewer operational headaches.

3. **Cost Sensitivity**: Government agencies typically operate on fixed budgets. Single domain = lower costs.

4. **Deployment Frequency**: The application is likely deployed infrequently (quarterly or semi-annually). Simplicity is more valuable than flexibility.

5. **Current Architecture**: The monorepo structure (frontend + backend in same repository) suggests a monolithic deployment model.

---

### 🎯 **RECOMMENDATION: Option 1 - Single Domain Deployment (Monolithic)**

**For the ICJIA Accessibility Status Portal, we recommend Option 1: Single Domain Deployment.**

#### Why Option 1 is the Better Choice

**1. Operational Simplicity** (Primary Reason)

- Single domain = single SSL certificate = no CORS configuration needed
- One deployment pipeline instead of two
- Easier for small DevOps teams to manage and troubleshoot
- Fewer moving parts = fewer things that can break

**2. Cost Efficiency** (Secondary Reason)

- One domain instead of two (saves ~$10-15/year)
- Potentially one server instead of two (saves $5-20/month)
- Reduced DNS management complexity
- Lower operational overhead = lower long-term costs

**3. Alignment with Current Architecture** (Tertiary Reason)

- Monorepo structure suggests monolithic deployment
- Frontend and backend are tightly integrated
- Deployment script builds both together
- No independent scaling requirements

#### Trade-offs to Accept

- **Cannot scale frontend and backend independently**: Acceptable because the application doesn't have independent scaling needs
- **Tightly coupled deployments**: Acceptable because frontend and backend are always deployed together anyway
- **Shared server resources**: Acceptable because the application is not resource-intensive

#### When to Reconsider

If ICJIA experiences any of the following, reconsider Option 2:

- **Massive traffic growth**: If frontend traffic overwhelms the backend or vice versa
- **Independent deployment needs**: If frontend and backend need to be deployed on different schedules
- **Microservices expansion**: If ICJIA plans to add additional services (analytics, reporting, etc.)
- **Team growth**: If ICJIA hires a larger DevOps team that prefers microservices architecture

---

### Implementation Path

**For ICJIA, follow these steps:**

1. **Use Option 1 (Single Domain)** for initial production deployment
2. **Monitor performance** for 3-6 months
3. **Collect metrics** on traffic patterns, resource usage, and deployment frequency
4. **Evaluate** if Option 2 becomes necessary based on real-world usage

This approach provides:

- ✅ Immediate production deployment with minimal complexity
- ✅ Time to gather real-world data before making architectural changes
- ✅ Option to migrate to Option 2 later if needed (migration is straightforward)
- ✅ Lower operational burden on the ICJIA team

---

## 🚀 Deployment Guide: Coolify & Vercel

This section provides comprehensive deployment instructions for both **Coolify** (recommended for full control) and **Vercel** (recommended for simplicity).

### Deployment Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)  │  Backend (Express + Node.js)    │
│  - Dashboard              │  - API Routes                   │
│  - Admin Pages            │  - Authentication               │
│  - Charts & Graphs        │  - Database Queries             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL Database)                 │
│  - Sites, Scores, History                                   │
│  - Users, Sessions, API Keys                                │
│  - Activity Log, Payloads                                   │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Comparison

| Feature         | Coolify                      | Vercel                       |
| --------------- | ---------------------------- | ---------------------------- |
| **Cost**        | Free (self-hosted)           | Free tier + paid             |
| **Control**     | Full                         | Limited                      |
| **Setup Time**  | 30-45 min                    | 10-15 min                    |
| **Scaling**     | Manual                       | Automatic                    |
| **Best For**    | Full control, custom domains | Quick deployment, simplicity |
| **Recommended** | ✅ For ICJIA                 | For rapid prototyping        |

---

## Vercel Deployment (Alternative)

Vercel is ideal for quick deployment with minimal configuration. However, it requires splitting frontend and backend.

### Prerequisites

- **Vercel Account**: Free tier available
- **GitHub Repository**: Connected to Vercel
- **Supabase Project**: Already created
- **Backend Hosting**: Separate service (Railway, Render, or Coolify)

### Step 1: Deploy Backend to Railway/Render

Since Vercel doesn't support long-running Node.js processes, deploy backend separately:

#### Option A: Railway.app

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select `icjia-accessibility-status`
4. Configure:
   - **Root Directory**: `/`
   - **Start Command**: `yarn start:backend`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `NODE_ENV`: `production`
6. Deploy

#### Option B: Render.com

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `yarn install`
   - **Start Command**: `yarn start:backend`
   - **Environment**: Node
5. Add environment variables (same as above)
6. Deploy

### Step 2: Deploy Frontend to Vercel

1. **Connect Repository**:

   - Go to [vercel.com](https://vercel.com)
   - Click **"New Project"**
   - Import `icjia-accessibility-status` from GitHub

2. **Configure Build Settings**:

   - **Framework**: Vite
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Install Command**: `yarn install`

3. **Set Environment Variables**:

   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_API_URL`: Your Railway/Render backend URL (e.g., `https://your-backend.railway.app/api`)

4. **Configure Domain**:

   - Add custom domain: `accessibility.icjia.app`
   - Update DNS records as instructed

5. **Deploy**: Click **"Deploy"**

### Step 3: Configure CORS

Update `server/index.ts` to allow Vercel frontend:

```typescript
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### Step 4: Verify Deployment

```bash
# Check frontend
curl https://accessibility.icjia.app

# Check backend
curl https://your-backend.railway.app/api/health
```

### Vercel Monitoring

**View Logs**:

- Dashboard → Deployments → Logs

**Monitor Performance**:

- Dashboard → Analytics

**Auto-Deploy**:

- Enabled by default on push to main

---

## Deployment Comparison Table

| Task                      | Coolify                 | Vercel                       |
| ------------------------- | ----------------------- | ---------------------------- |
| **Frontend Deployment**   | ✅ Easy                 | ✅ Very Easy                 |
| **Backend Deployment**    | ✅ Easy                 | ⚠️ Requires separate service |
| **Database**              | ✅ Supabase             | ✅ Supabase                  |
| **Custom Domain**         | ✅ Yes                  | ✅ Yes                       |
| **SSL Certificate**       | ✅ Auto (Let's Encrypt) | ✅ Auto                      |
| **Environment Variables** | ✅ Dashboard            | ✅ Dashboard                 |
| **Monitoring**            | ✅ Built-in             | ✅ Built-in                  |
| **Cost**                  | Free (self-hosted)      | Free tier + paid             |
| **Scaling**               | Manual                  | Automatic                    |

---

## Troubleshooting Deployment

### Frontend Not Loading

**Problem**: Blank page or 404 errors

**Solution**:

1. Check build output: `yarn build`
2. Verify environment variables are set
3. Check browser console for errors
4. Verify `VITE_API_URL` is correct

### Backend Connection Issues

**Problem**: API calls failing with CORS errors

**Solution**:

1. Verify `FRONTEND_URL` environment variable
2. Check CORS configuration in `server/index.ts`
3. Verify backend is running: `curl https://api.your-domain.com/api/health`
4. Check backend logs for errors

### Database Connection Issues

**Problem**: "Cannot connect to database" errors

**Solution**:

1. Verify `VITE_SUPABASE_URL` is correct
2. Verify `VITE_SUPABASE_ANON_KEY` is correct
3. Check Supabase project is active
4. Verify RLS policies allow anon role

### Environment Variables Not Loading

**Problem**: Variables undefined in application

**Solution**:

1. Verify variables are set in deployment platform
2. For Vite frontend, variables must start with `VITE_`
3. Restart deployment after changing variables
4. Check `.env` file is not committed (should be in `.gitignore`)

---

## Future Features & Improvements

> **📋 Note**: This section is synchronized with `FUTURE_ROADMAP.md`. When updating the roadmap, please update both files to keep them in sync.

### Strategic Vision

Transform the accessibility tracking system from a **monitoring tool** into a **comprehensive compliance and improvement platform** that enables teams to proactively manage accessibility across all ICJIA web properties.

### Priority Matrix

```
HIGH IMPACT, LOW EFFORT (Do First)
├─ Automated Alerts & Notifications
├─ Comparative Analytics Dashboard
└─ Detailed Issue Tracking

HIGH IMPACT, HIGH EFFORT (Plan Carefully)
├─ Predictive Analytics & Forecasting
├─ Multi-User Admin System
├─ Scheduled Automated Testing
└─ Advanced Reporting & Export

LOW IMPACT, LOW EFFORT (Quick Wins)
├─ Performance Optimization
├─ Code Quality Improvements
└─ Documentation Enhancements

LOW IMPACT, HIGH EFFORT (Consider Later)
├─ Mobile App
├─ ML Features
└─ Plugin System
```

### High Priority (Next Quarter)

#### 1. **Predictive Analytics & Forecasting**

- **Goal**: Predict when sites will reach compliance targets
- **Implementation**:
  - Use historical trend data to project future scores
  - Display estimated compliance date based on current improvement rate
  - Alert admins if a site is falling behind projected timeline
- **Benefit**: Helps prioritize resources and identify at-risk sites early

#### 2. **Automated Alerts & Notifications**

- **Goal**: Proactive monitoring and issue detection
- **Implementation**:
  - Email alerts when scores drop below threshold
  - Slack/Teams integration for real-time notifications
  - Configurable alert rules (e.g., "alert if score drops >5 points")
  - Digest emails with weekly/monthly summaries
- **Benefit**: Catch regressions immediately instead of discovering them during reviews

#### 3. **Comparative Analytics Dashboard**

- **Goal**: Compare performance across sites and teams
- **Implementation**:
  - Ranking dashboard showing best/worst performing sites
  - Peer comparison (similar site types)
  - Department/team performance metrics
  - Benchmark against industry standards
- **Benefit**: Identify best practices and share learnings across teams

#### 4. **Detailed Issue Tracking**

- **Goal**: Link specific accessibility issues to scores
- **Implementation**:
  - Store individual Axe violations and Lighthouse issues
  - Track issue resolution over time
  - Categorize issues (WCAG level, issue type, severity)
  - Show which issues are most impactful to scores
- **Benefit**: Developers can see exactly what needs to be fixed

### Medium Priority (Next 2-3 Quarters)

#### 5. **Automated Remediation Suggestions**

- **Goal**: Provide actionable recommendations
- **Implementation**:
  - AI-powered suggestions for fixing common issues
  - Link to WCAG guidelines and best practices
  - Estimate effort/time to fix each issue
  - Prioritize by impact on score
- **Benefit**: Accelerate remediation efforts

#### 6. **Multi-User Admin System**

- **Goal**: Support team-based administration
- **Implementation**:
  - Role-based access control (RBAC)
  - Roles: Admin, Editor, Viewer, Auditor
  - Audit trail showing who made what changes
  - Assign sites to specific teams/departments
- **Benefit**: Better collaboration and accountability

#### 7. **Scheduled Automated Testing**

- **Goal**: Continuous monitoring without manual uploads
- **Implementation**:
  - Scheduled jobs to run Axe and Lighthouse tests
  - Automatic score updates on a schedule (daily/weekly)
  - Integration with CI/CD pipelines
  - Webhook support for external testing services
- **Benefit**: Always up-to-date scores without manual effort

#### 8. **Advanced Reporting & Export**

- **Goal**: Generate compliance reports for stakeholders
- **Implementation**:
  - PDF report generation with charts and metrics
  - Executive summary with key findings
  - Detailed technical reports for developers
  - Scheduled report delivery (email)
  - Custom report templates
- **Benefit**: Easy compliance documentation and stakeholder communication

### Lower Priority (Future Enhancements)

#### 9. **Mobile App**

- Native iOS/Android app for on-the-go monitoring
- Push notifications for alerts
- Offline access to historical data

#### 10. **Advanced Charting & Visualization**

- Heatmaps showing accessibility issues by page
- Network graphs showing site dependencies
- 3D visualizations for large datasets
- Custom dashboard builder

#### 11. **Integration Ecosystem**

- Jira integration for issue tracking
- GitHub integration for PR checks
- Azure DevOps integration
- Datadog/New Relic integration for monitoring

#### 12. **Machine Learning Features**

- Anomaly detection for unusual score changes
- Predictive maintenance (predict when issues will occur)
- Automatic root cause analysis
- Recommendation engine for improvements

### Technical Debt & Refactoring

#### 13. **Performance Optimization**

- Implement data pagination for large datasets
- Add caching layer (Redis) for frequently accessed data
- Optimize database queries with better indexing
- Implement virtual scrolling for large lists

#### 14. **Testing Infrastructure**

- Add comprehensive unit tests (target: 80% coverage)
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing and benchmarking

#### 15. **Code Quality**

- Add ESLint and Prettier configuration
- Implement pre-commit hooks
- Add TypeScript strict mode
- Refactor large components into smaller, reusable pieces

#### 16. **Documentation**

- API documentation with Swagger/OpenAPI
- Architecture decision records (ADRs)
- Developer onboarding guide
- Video tutorials for common tasks

### Community & Ecosystem

#### 17. **Open Source Contributions**

- Publish reusable components as npm packages
- Contribute improvements back to Recharts
- Create accessibility testing best practices guide
- Share learnings with other government agencies

#### 18. **Plugin System**

- Allow custom integrations via plugins
- Plugin marketplace for community contributions
- Standardized plugin API
- Example plugins (Slack, Teams, Jira, etc.)

## Implementation Roadmap

### Phase 1 (Months 1-2): Foundation

**Goal**: Enable proactive monitoring and data-driven decisions

- [ ] **Predictive Analytics** - Forecast compliance dates (2-3 weeks)
- [ ] **Automated Alerts** - Email/Slack notifications (2-3 weeks)
- [ ] **Comparative Analytics** - Benchmark performance (1-2 weeks)

### Phase 2 (Months 3-4): Enhancement

**Goal**: Provide actionable insights and team collaboration

- [ ] **Detailed Issue Tracking** - Link issues to scores (2-3 weeks)
- [ ] **Multi-User Admin** - Role-based access control (3-4 weeks)
- [ ] **Advanced Reporting** - PDF compliance reports (2-3 weeks)

### Phase 3 (Months 5-6): Automation

**Goal**: Reduce manual effort and ensure continuous monitoring

- [ ] **Scheduled Testing** - Automated score updates (2-3 weeks)
- [ ] **Remediation Suggestions** - AI-powered fixes (3-4 weeks)

### Phase 4 (Months 7+): Scale

**Goal**: Expand reach and capabilities

- [ ] **Mobile App** - iOS/Android apps
- [ ] **Advanced Visualizations** - Heatmaps, network graphs
- [ ] **ML Features** - Anomaly detection, predictions
- [ ] **Plugin Ecosystem** - Custom integrations

### Resource Requirements

| Phase   | Duration   | Full-Stack Dev | Specialists        | QA  | PM  |
| ------- | ---------- | -------------- | ------------------ | --- | --- |
| Phase 1 | 6-8 weeks  | 1              | -                  | 1   | 1   |
| Phase 2 | 8-10 weeks | 1              | Backend (1)        | 1   | 1   |
| Phase 3 | 6-8 weeks  | 1              | ML (1), DevOps (1) | 1   | 1   |
| Phase 4 | TBD        | TBD            | TBD                | TBD | TBD |

### Success Criteria

✅ **Phase 1 Complete When**:

- Predictive analytics show 90%+ accuracy
- Alert system catches 100% of regressions
- Comparative dashboard used by 80%+ of admins

✅ **Phase 2 Complete When**:

- Issue tracking reduces remediation time by 30%
- Multi-user system supports 10+ concurrent users
- Reports generated automatically weekly

✅ **Phase 3 Complete When**:

- 100% of sites have automated testing
- Remediation suggestions adopted by 70%+ of teams
- Manual data entry reduced by 90%

## Contributing to Future Features

We welcome contributions! To suggest a feature or report a bug:

1. Check existing issues to avoid duplicates
2. Create a detailed issue with:
   - Clear description of the problem/feature
   - Use cases and benefits
   - Proposed implementation (if applicable)
   - Screenshots or mockups (if applicable)
3. Label appropriately (enhancement, bug, documentation, etc.)

### Keeping Roadmap Updated

The roadmap is maintained in two places to ensure visibility:

- **README.md** (this file) - Quick reference with key phases and features
- **FUTURE_ROADMAP.md** - Comprehensive roadmap with detailed descriptions, effort estimates, and risk mitigation

**When updating the roadmap**:

1. Update `FUTURE_ROADMAP.md` with detailed changes
2. Update the corresponding section in `README.md` to keep them synchronized
3. Both files should reflect the same priorities and phases

## Additional Resources

- **Detailed Deployment Guide**: See `DEPLOYMENT.md` for comprehensive production deployment instructions
- **PM2 Ecosystem Configuration**: See `ecosystem.config.js` for PM2 process management settings

## Support

For questions or issues, contact the ICJIA IT team.

## License

© 2024 Illinois Criminal Justice Information Authority
