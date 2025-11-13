# ICJIA Accessibility Status

> **Last Updated**: November 12, 2025

A comprehensive web accessibility tracking system for the Illinois Criminal Justice Information Authority, designed to monitor progress toward April 2026 compliance goals across all ICJIA web properties.

> 📚 **[Documentation](#-documentation)** | **[GitHub Repository](https://github.com/ICJIA/icjia-accessibility-status)**

## 📥 Export Data

All users can export accessibility data in multiple formats directly from the dashboard - **no authentication required**:

- **JSON** - Complete structured data for programmatic access
- **CSV** - Spreadsheet-compatible format for analysis in Excel/Sheets
- **Markdown** - Formatted report for documentation and sharing

Click the **Export** button on the dashboard to download your preferred format. Perfect for:

- Compliance reporting
- Stakeholder presentations
- Data analysis and trending
- Integration with other tools

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
# Copy and run: supabase/migrations/01_create_initial_schema.sql
# Then run: supabase/migrations/02_add_api_keys_and_payloads.sql

# 4. Start development server
yarn dev

# 5. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001/api
# Admin: http://localhost:5173/admin (username: admin, password: blank - set on first login)
```

### Available Commands

```bash
# Development
yarn dev              # Start frontend and backend concurrently (development mode)
yarn dev:frontend     # Frontend only (Vite dev server on port 5173)
yarn dev:backend      # Backend only (Express on port 3001)

# Production
yarn build            # Build frontend for production
yarn production:simple # Test production build without PM2 (frontend + backend)
yarn production:pm2   # Full production deployment (build + PM2 start)
yarn start            # Start services with PM2 (production mode)

# Utilities
yarn seed             # Populate database with sample data
yarn lint             # Run ESLint
yarn typecheck        # Run TypeScript type checking
```

## 🚀 Production Deployment

### Laravel Forge (Recommended)

For detailed Laravel Forge deployment instructions, see **[docs/deployment/laravel-forge.md](docs/deployment/laravel-forge.md)**.

**Quick steps:**

1. Create a new Node.js site in Laravel Forge
2. Set Node.js version to 20+
3. Configure environment variables from `.env.sample`
4. Run database migrations (01-05 in order)
5. Deploy using Git with PM2 process management

**Deployment Methods:**

- `yarn production:pm2` - Full production deployment with PM2 (recommended)
- `yarn production:simple` - Test production build without PM2

### Other Deployment Options

For other deployment options, see **[docs/deployment/overview.md](docs/deployment/overview.md)**:

- Ubuntu Server with PM2 + Nginx
- Cloud platforms (Vercel, Heroku, AWS, DigitalOcean)

## 📚 Documentation

All documentation is available as Markdown files in the `/docs` directory, organized by topic for easy navigation.

### 🚀 Getting Started

- **[Quick Start Guide](docs/getting-started/quick-start.md)** - Get up and running in 5 minutes
- **[Setup Guide](docs/getting-started/setup-guide.md)** - Complete setup walkthrough
- **[Development Setup](docs/getting-started/development-setup.md)** - Local development environment
- **[Introduction](docs/getting-started/intro.md)** - Project overview

### 🏗️ Architecture & Core Concepts

- **[System Architecture](docs/architecture/architecture.md)** - System architecture overview
- **[Database Schema](docs/architecture/database-schema.md)** - Database structure and relationships
- **[Authentication System](docs/architecture/authentication.md)** - Authentication system details

### 💻 Development

- **[API Overview](docs/api/overview.md)** - Complete API reference
- **[API Authentication](docs/api/authentication.md)** - API authentication guide
- **[Sites Endpoints](docs/api/sites.md)** - Sites API reference
- **[API Keys Management](docs/api/api-keys.md)** - API keys endpoints
- **[Testing Guide](docs/development/testing.md)** - Testing procedures
- **[Reset Scripts](docs/development/reset-scripts.md)** - Database reset utilities
- **[API Rate Limiting](docs/development/API_RATE_LIMITING_AND_ROTATION.md)** - Rate limiting and key rotation
- **[Setup Documentation](docs/development/SETUP.md)** - Development setup details
- **[Quick Start Summary](docs/development/QUICK_START_SETUP_SUMMARY.md)** - Quick reference

### 🚢 Deployment

- **[Deployment Overview](docs/deployment/overview.md)** - Deployment options and strategies
- **[Laravel Forge Setup](docs/deployment/laravel-forge.md)** - Complete Forge deployment guide
- **[PM2 Configuration](docs/deployment/pm2.md)** - PM2 setup and configuration
- **[Nginx Configuration](docs/deployment/nginx.md)** - Nginx reverse proxy setup
- **[Production Deployment](docs/deployment/production.md)** - Production deployment checklist
- **[Health Check Monitoring](docs/deployment/health-check-monitoring.md)** - Monitoring setup
- **[Database Backups](docs/deployment/database-backups.md)** - Backup procedures

### 🔒 Security & Audits

- **[Security Audit Report](docs/security/SECURITY_AUDIT.md)** - Complete security audit
- **[Security Findings](docs/security/security-findings.md)** - Security issues and fixes
- **[RLS Security Audit](docs/security/RLS_SECURITY_AUDIT.md)** - Row-level security audit
- **[Audit Overview](docs/security/audit-overview.md)** - Security audit overview
- **[Critical Issues Fixed](docs/security/critical-issues-fixed.md)** - Critical security fixes

### 🔧 Troubleshooting

- **[Common Issues](docs/troubleshooting/common-issues.md)** - Common problems and solutions
- **[Authentication Errors](docs/troubleshooting/authentication-errors.md)** - Auth troubleshooting
- **[Database Errors](docs/troubleshooting/database-errors.md)** - Database troubleshooting

### 📋 Project Information

- **[Feature Summary](docs/project/FEATURE_SUMMARY.md)** - Current features overview
- **[Project Roadmap](docs/project/FUTURE_ROADMAP.md)** - Future features and roadmap

## Prerequisites

- **Node.js 20+** (specified in `.nvmrc`)
- **Yarn 1.22.22** (specified in `package.json`)
- **Supabase account** (free tier works fine)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Express, Node.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Cookie-based sessions with bcrypt
- **Process Management**: PM2 (production)
- **Documentation**: Markdown files in `/docs` directory

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2025 Illinois Criminal Justice Information Authority (ICJIA). All rights reserved.
