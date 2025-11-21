# Deployment Overview

Guide to deploying the ICJIA Accessibility Portal to production.

## Architecture

The application consists of two services running on different ports:

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 80/443)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  / ──────────────────────→ Frontend (Port 5173)        │
│  /api/ ────────────────────→ Backend (Port 3001)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Services

| Service      | Port | Purpose               | Technology        |
| ------------ | ---- | --------------------- | ----------------- |
| **Frontend** | 5173 | React web application | Vite + React      |
| **Backend**  | 3001 | Express API server    | Node.js + Express |

## Deployment Options

### Option 1: Ubuntu Server (Recommended)

Deploy on a Ubuntu 20.04+ server with:

- Node.js 20+
- Yarn 1.22.22
- Nginx
- PM2 for process management
- SSL/TLS with Let's Encrypt

**See:** [Production Deployment Guide](./production)

### Option 2: Laravel Forge (Recommended for Managed Hosting)

Deploy on Laravel Forge with:

- Managed Ubuntu server
- Automatic SSL/TLS with Let's Encrypt
- One-click GitHub integration
- Built-in monitoring and logs
- Automatic backups
- PM2 process management

**See:** [Laravel Forge Deployment Guide](./laravel-forge)

### Option 3: Cloud Platforms

Deploy to cloud providers:

- **Vercel** - Frontend only
- **Heroku** - Full stack
- **AWS** - Full infrastructure
- **DigitalOcean** - VPS or App Platform

**Coming soon**

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL/TLS certificates obtained
- [ ] Nginx configuration reviewed
- [ ] PM2 ecosystem configuration ready
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Security audit completed

## Environment Variables

Create `.env` file with production values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_URL=https://example.com/api
PORT=3001

# Frontend Configuration
FRONTEND_URL=https://example.com

# Node Environment
NODE_ENV=production
```

## Database Setup

1. Create Supabase project
2. Run all migration files in order:
   - `01_create_initial_schema.sql`
   - `02_add_api_keys_and_payloads.sql`
   - `03_add_scans_and_results.sql`
   - `04_add_scan_violations.sql`
   - `05_final_setup_and_cleanup.sql`
3. Verify all tables created successfully

## Building for Production

```bash
# Install dependencies
yarn install

# Build frontend for production
yarn build

# This creates:
# - dist/ (frontend build)
```

## Running in Production

### With PM2

```bash
# Full production deployment (recommended)
yarn start

# Or manually manage with PM2:
pm2 start ecosystem.config.cjs --env production

# View status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all
```

### With Nginx

```bash
# Copy nginx configuration
sudo cp nginx/icjia-accessibility.conf /etc/nginx/sites-available/

# Enable site
sudo ln -s /etc/nginx/sites-available/icjia-accessibility.conf \
  /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Monitoring

### PM2 Monitoring

```bash
# View real-time monitoring
pm2 monit

# View logs
pm2 logs

# View specific service logs
pm2 logs accessibility-backend
```

### System Monitoring

Monitor server resources:

- CPU usage
- Memory usage
- Disk space
- Network traffic

### Application Monitoring

Monitor application health:

- API response times
- Error rates
- Database connections
- Active sessions

## Backup Strategy

### Database Backups

1. Enable Supabase automated backups
2. Export data regularly
3. Store backups securely
4. Test restore procedures

### Application Backups

1. Version control all code
2. Tag releases in Git
3. Keep deployment scripts
4. Document configuration

## SSL/TLS Certificates

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d example.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Nginx Configuration

See [Nginx Configuration](./nginx) for SSL setup.

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

- Multiple frontend instances
- Multiple backend instances

### Vertical Scaling

Increase server resources:

- More CPU cores
- More RAM
- Faster storage

## Troubleshooting

### Services Won't Start

```bash
# Check PM2 logs
pm2 logs

# Check system logs
sudo journalctl -xe

# Verify ports are available
sudo lsof -i :5173
sudo lsof -i :3001
```

### Nginx Not Proxying

```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify upstream services running
curl http://localhost:5173
curl http://localhost:3001/api
```

### Database Connection Issues

- Verify Supabase credentials
- Check network connectivity
- Verify RLS policies
- Check database logs

## See Also

- [Production Deployment](./production) - Detailed deployment guide
- [Nginx Configuration](./nginx) - Nginx setup
- [PM2 Configuration](./pm2) - Process management
- [Troubleshooting](../troubleshooting/common-issues) - Common issues
