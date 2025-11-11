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

See LICENSE file for details.
