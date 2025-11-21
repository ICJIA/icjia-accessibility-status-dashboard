# Development Setup

Guide for setting up your development environment.

## Prerequisites

- Node.js 20+ (use `nvm use` to switch versions automatically)
- Yarn 1.22.22 (specified in `package.json`)
- Git
- A code editor (VS Code recommended)

## Installation

```bash
# Clone the repository
git clone https://github.com/ICJIA/icjia-accessibility-status.git
cd icjia-accessibility-status

# Install dependencies
yarn install
```

## Development Commands

### Running All Services

```bash
# Start frontend and backend concurrently
yarn dev
```

This starts:

- Frontend: http://localhost:5173 (Vite dev server with hot reload)
- Backend: http://localhost:3001 (Express API with hot reload)

### Running Individual Services

```bash
# Frontend only
yarn dev:frontend

# Backend only
yarn dev:backend
```

### Building

```bash
# Build frontend for production
yarn build
```

### Testing Production Build

```bash
# Test production build without PM2 (useful for debugging)
yarn production:simple
```

This starts:

- Frontend: http://localhost:5173 (production build preview)
- Backend: http://localhost:3001 (Express with production environment)

### Production Deployment

```bash
# Full production deployment with PM2
yarn start

# This will:
# - Build frontend for production
# - Start/restart services with PM2
# - Save PM2 process list
```

### Code Quality

```bash
# Run ESLint
yarn lint

# Run TypeScript type checking
yarn typecheck

# Run both
yarn lint && yarn typecheck
```

## Project Structure

```
icjia-accessibility-status/
├── src/                          # React frontend
│   ├── components/              # Reusable React components
│   ├── pages/                   # Page components
│   ├── contexts/                # React context providers
│   ├── lib/                     # Utility functions
│   └── App.tsx                  # Main app component
├── server/                       # Express backend
│   ├── routes/                  # API route handlers
│   ├── middleware/              # Express middleware
│   ├── utils/                   # Utility functions
│   └── index.ts                 # Server entry point
├── supabase/                     # Database migrations
│   └── migrations/              # SQL migration files
├── scripts/                      # Utility scripts
│   ├── reset-users.js           # Reset admin users
│   └── reset-app.js             # Complete database wipe
├── docs/                         # Documentation (Markdown files)
├── package.json                  # Root package.json
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── .env.sample                  # Environment variables template
```

## Environment Variables

Copy `.env.sample` to `.env` and configure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Server Configuration
PORT=3001

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

## Database Setup

See [Setup Guide](./setup-guide) for complete database setup instructions.

Quick summary:

1. Create Supabase project
2. Run migration files in SQL Editor
3. Verify tables were created

## Hot Module Replacement (HMR)

Both frontend and backend support hot module replacement:

- **Frontend**: Changes to React components automatically reload
- **Backend**: Changes to Express routes automatically restart the server
- **Docs**: Changes to documentation automatically reload

## Debugging

### Frontend Debugging

1. Open browser DevTools (F12)
2. Use React DevTools extension for component inspection
3. Check Console tab for errors
4. Use Network tab to inspect API calls

### Backend Debugging

1. Check terminal output for logs
2. Add `console.log()` statements for debugging
3. Use VS Code debugger with breakpoints
4. Check `/api` endpoints with curl or Postman

### Database Debugging

1. Use Supabase SQL Editor to run queries
2. Check Table Editor to view data
3. Use Supabase Logs to see database activity

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Navigation.tsx`

### Adding a New API Endpoint

1. Create route handler in `server/routes/`
2. Import and use in `server/index.ts`
3. Add API client method in `src/lib/api.ts`

### Adding Documentation

1. Create markdown file in `docs/docs/`
2. Add to sidebar in `docs/sidebars.ts`
3. Documentation automatically appears in docs site

## Testing

See [Testing Guide](./testing) for information on running tests.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
yarn install
```

### TypeScript Errors

```bash
# Run type checking
yarn typecheck

# Fix common issues
yarn lint --fix
```

## Next Steps

- Read [Quick Start](./quick-start) to get running
- Check [API Documentation](./api/overview) for API reference
- See [Deployment Guide](./deployment/overview) for production setup
