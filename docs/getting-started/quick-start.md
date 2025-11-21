# Quick Start (5 Minutes)

Get the ICJIA Accessibility Portal running locally in just 5 minutes.

## Prerequisites

- **Node.js 20+** (run `nvm use` to automatically switch to the correct version)
- **Yarn 1.22.22** (specified in `package.json`)
- **A Supabase account** (free tier works fine for development)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/ICJIA/icjia-accessibility-status.git
cd icjia-accessibility-status

# Install dependencies
yarn install
```

## Step 2: Configure Environment

```bash
# Copy the sample environment file
cp .env.sample .env

# Edit .env and add your Supabase credentials:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Set Up Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **SQL Editor** → **New query**
3. Copy and run: `supabase/migrations/01_create_initial_schema.sql`
4. Copy and run: `supabase/migrations/02_add_api_keys_and_payloads.sql`

## Step 4: Start Development Servers

```bash
# This runs both services:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001
yarn dev
```

## Step 5: Initial Setup

1. Open your browser to `http://localhost:5173`
2. You'll be redirected to the Initial Setup page
3. Set a secure password for the admin account
4. Log in with username `admin` and your new password

## What's Running?

| Service         | URL                   | Purpose                  |
| --------------- | --------------------- | ------------------------ |
| **Frontend**    | http://localhost:5173 | React app with dashboard |
| **Backend API** | http://localhost:3001 | Express API server       |

## Next Steps

- 📖 Read the [Setup Guide](./setup-guide) for detailed instructions
- 🔑 Create an API key in the admin panel
- 📊 View sample sites on the public dashboard
- 🚀 Deploy to production (see [Deployment Guide](./deployment/overview))

## Troubleshooting

**"Admin user NOT found" error?**

- Re-run the migration file `supabase/migrations/01_create_initial_schema.sql`

**"Failed to create session" error?**

- Check that your `.env` file has correct Supabase credentials
- Verify the migration files were run successfully

**Backend won't start?**

- Check that port 3001 is not in use
- Verify Node.js 20+ is installed: `node --version`

**Database connection errors?**

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Check that your Supabase project is active

See [Troubleshooting](./troubleshooting/common-issues) for more help.
