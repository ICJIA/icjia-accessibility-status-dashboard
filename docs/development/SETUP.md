# 🚀 First-Time Setup Guide

This guide walks you through setting up the ICJIA Accessibility Status Portal from scratch on a new Supabase instance.

---

## Prerequisites

- Node.js 20+ (use `nvm use` to automatically switch to the correct version)
- Yarn 1.22.22
- A Supabase account (free tier works fine)

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd icjia-accessibility-status

# Install dependencies
yarn install
```

---

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Project Name**: `icjia-accessibility-portal` (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your users
4. Click **Create new project** (takes 1-2 minutes)

---

## Step 3: Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: Long JWT token starting with `eyJ...`

---

## Step 4: Configure Environment Variables

```bash
# Copy the sample environment file
cp .env.sample .env
```

Edit `.env` and update with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3001/api
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## Step 5: Run Database Migrations

You need to run **TWO required SQL scripts** in order:

### 5.1: STEP 1 - Create Database Schema

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/migrations/01_create_initial_schema.sql`
5. Copy **ALL** contents and paste into SQL Editor
6. Click **Run**

This creates all tables: `admin_users`, `sessions`, `sites`, `score_history`, `app_documentation`, `api_payloads`

### 5.2: STEP 2 - Add API Keys and Scans Support

1. In SQL Editor, click **New Query** again
2. Open `supabase/migrations/02_add_api_keys_and_payloads.sql`
3. Copy **ALL** contents and paste into SQL Editor
4. Click **Run**

This script:

- ✅ Creates the `api_keys` table for API authentication
- ✅ Adds support for API payloads
- ✅ Fixes RLS policies to allow custom cookie-based authentication
- ✅ Allows anonymous users to authenticate and create sessions

**Why this is needed**: The initial schema uses RLS policies designed for Supabase Auth (`auth.uid()`), but this app uses custom cookie-based authentication. This script updates the policies to work with custom auth.

### 5.3: (Optional) Additional Migrations

For additional features like scans and violations:

1. In SQL Editor, click **New Query**
2. Open `supabase/migrations/03_add_scans_and_results.sql`
3. Copy **ALL** contents and paste into SQL Editor
4. Click **Run**

Then optionally run:

- `04_add_scan_violations.sql` - For scan violation tracking
- `05_final_setup_and_cleanup.sql` - Final setup and cleanup

See `/supabase/migrations/README.md` for complete migration documentation.

---

## Step 6: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. Click on `admin_users` table
3. You should see one row:
   - **username**: `admin`
   - **email**: `admin@icjia.illinois.gov`
   - **password_hash**: Should start with `$2b$10$...`

If you see this, setup is complete! ✅

---

## Step 7: Start the Application

```bash
# Start both frontend and backend concurrently
yarn dev
```

This will:

- Start the backend API on `http://localhost:3001` (Express with hot reload)
- Start the frontend on `http://localhost:5173` (Vite dev server with hot reload)
- Automatically open your browser to the frontend

---

## Step 8: Initial Setup

1. Browser should open to `http://localhost:5173`
2. You'll be automatically redirected to the **Initial Setup** page
3. Set a secure password for the admin account (username: `admin`)
4. Password requirements:
   - At least 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
5. Confirm your password and click **Set Password**
6. You'll be redirected to the login page
7. Log in with username `admin` and your new password

You should now have access to the admin dashboard! 🎉

---

## Troubleshooting

### "Admin user NOT found" error

Run the diagnostic script:

```bash
yarn tsx diagnose-auth.ts
```

If it shows "Admin user NOT found", re-run `COMPLETE_FIX.sql` in Supabase SQL Editor.

### "Failed to create session" error

This means RLS policies weren't updated. Re-run `COMPLETE_FIX.sql` or run `FIX_SESSIONS_SIMPLE.sql`.

### Backend won't start

Check that:

- `.env` file exists and has correct Supabase credentials
- Port 3001 is not already in use
- Node.js 20+ is installed (`node --version`)

### Frontend won't start

Check that:

- Port 5173 is not already in use
- Dependencies are installed (`yarn install`)

---

## Essential Files Reference

### Configuration Files

- `.env.sample` - Template for environment variables
- `.nvmrc` - Specifies Node.js version (20)
- `package.json` - Dependencies and scripts
- `ecosystem.config.js` - PM2 configuration for production

### Database Setup Files

- `supabase/migrations/01_create_initial_schema.sql` - Creates all tables and initial RLS policies
- `supabase/migrations/02_add_api_keys_and_payloads.sql` - Adds API keys and payload support
- `supabase/migrations/03_add_scans_and_results.sql` - Adds scan and result tables
- `supabase/migrations/04_add_scan_violations.sql` - Adds scan violation tracking
- `supabase/migrations/05_final_setup_and_cleanup.sql` - Final setup and cleanup

### Diagnostic Tools

- `diagnose-auth.ts` - Test authentication setup
- `seed.ts` - Seed database from Node.js (alternative to SQL)

### Documentation

- `README.md` - Main documentation
- `DEPLOYMENT.md` - Production deployment guide
- `SETUP.md` - This file

---

## Next Steps

After successful setup:

1. **Change the default password** (in production)
2. **Add your sites** via the admin interface
3. **Configure production environment** (see `DEPLOYMENT.md`)
4. **Set up monitoring** for accessibility scores

---

## Security Notes

### Initial Admin Account

- Username: `admin`
- Password: Blank (empty) - **must be set on first login**

**✅ SECURITY**: The blank password approach ensures no default credentials are exposed in the codebase. You will be automatically redirected to set a secure password on first access.

### RLS Policies

The app uses custom authentication with cookie-based sessions. The RLS policies allow anonymous users to:

- Read `admin_users` (for authentication)
- Create/read/delete `sessions` (for login/logout)

This is safe because:

- Passwords are bcrypt-hashed (can't be reversed)
- Session tokens are cryptographically random
- HttpOnly cookies prevent XSS
- HTTPS protects in production

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `yarn tsx diagnose-auth.ts` to diagnose auth issues
3. Check backend logs in the terminal
4. Check browser console for frontend errors

---

**Setup complete!** You're ready to start tracking accessibility scores! 🚀
