# Authentication System

The ICJIA Accessibility Portal uses a **custom cookie-based authentication system** (not Supabase Auth).

## Overview

**Authentication Method**: Cookie-based sessions with bcrypt password hashing

**NOT using:**

- ❌ JWT tokens in localStorage
- ❌ Supabase Auth
- ❌ Bearer tokens
- ❌ OAuth providers

**Using:**

- ✅ HttpOnly cookies for session tokens
- ✅ Custom `admin_users` table for user accounts
- ✅ Custom `sessions` table for session management
- ✅ bcrypt for password hashing (10 salt rounds)
- ✅ Supabase as a PostgreSQL database (not for auth)

## How It Works

### Login Flow

1. User submits username and password
2. Backend queries `admin_users` table
3. Password compared with bcrypt hash
4. Cryptographically random session token generated
5. Session stored in database (expires in 15 days)
6. HttpOnly cookie set with session token
7. Browser automatically sends cookie with every request

### Session Validation

1. Backend extracts session token from cookie
2. Queries `sessions` table
3. Checks if session exists and is not expired
4. Attaches user_id to request
5. Continues to protected route

### Logout Flow

1. Session token extracted from cookie
2. Session deleted from database
3. Cookie cleared
4. User redirected to login page

## Initial Setup

### Blank Password Approach

The initial admin account is created with a **blank/empty password**. This approach:

- ✅ Prevents hardcoded passwords in the repository
- ✅ Eliminates default credential risks
- ✅ Forces immediate password setup
- ✅ Protects against GitHub exposure
- ✅ One-time use only

### Automatic Detection

When you first open the app:

1. App detects blank admin password
2. User is automatically redirected to `/setup`
3. User sets a secure password
4. User is redirected to login page
5. User logs in with new credentials

### Password Requirements

- ✅ Cannot be blank/empty
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character

## Password Changes

After initial setup, users can change their password:

1. User navigates to password change page
2. Enters current password (for verification)
3. Enters new password (must meet requirements)
4. Confirms new password
5. All existing sessions are cleared (forces re-login)
6. User logs in with new password

## Security Features

### Password Security

- ✅ **bcrypt hashing** with 10 salt rounds
- ✅ Passwords never stored in plain text
- ✅ Hashes cannot be reversed

### Session Security

- ✅ **Cryptographically random tokens** (32 bytes = 256 bits)
- ✅ **HttpOnly cookies** - JavaScript cannot access (XSS protection)
- ✅ **Secure flag** in production - HTTPS only
- ✅ **SameSite: lax** - CSRF protection
- ✅ **15-day expiration** - Sessions automatically expire
- ✅ **Server-side validation** - Every request validates against database

### Database Security

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Prepared statements** via Supabase client (SQL injection protection)
- ✅ **Anon key** has limited permissions

## Primary Admin Protection

The first admin user created (oldest `created_at` timestamp) is protected from deletion:

- ✅ Cannot be deleted via API
- ✅ Cannot be deleted via admin panel
- ✅ UI shows "Primary Admin" badge
- ✅ Delete button is disabled for primary admin
- ✅ Prevents system lockout

**Why?** If the primary admin is deleted, no one can access the system. This protection ensures at least one admin always exists.

## API Key Authentication

API keys are separate from user authentication:

- ✅ API keys stored in `api_keys` table
- ✅ Each key has specific scopes (read, write, delete)
- ✅ Keys can be revoked at any time
- ✅ Usage tracked in activity log
- ✅ IP address and user agent logged for audit trail

## Troubleshooting

### "Invalid credentials" error

- Check that the migration file was run
- The initial admin account has a BLANK password
- You must set it on first login via the Initial Setup page
- Run `yarn tsx diagnose-auth.ts` to check database

### "Failed to create session" error

- Database migration may not have completed successfully
- Re-run `supabase/migrations/01_create_initial_schema.sql`
- RLS policies are pre-configured in the migration file

### Session not persisting across page refreshes

- Check that `credentials: 'include'` is set in fetch requests
- Verify cookies are enabled in browser
- Check that backend is setting cookies correctly

### "Authentication required" on valid session

- Session may have expired (15 days)
- Session may have been deleted from database
- Cookie may have been cleared by browser

## Key Files

- **`server/routes/auth.ts`** - Login, logout, session validation endpoints
- **`server/middleware/auth.ts`** - `requireAuth` middleware for protected routes
- **`src/contexts/AuthContext.tsx`** - Frontend authentication state management
- **`src/lib/api.ts`** - API client with `credentials: 'include'`
- **`server/utils/supabase.ts`** - Supabase client configuration

## See Also

- [Setup Guide](./setup-guide) - How to set up the system
- [Reset Scripts](./reset-scripts) - How to reset admin users
- [Troubleshooting](./troubleshooting/common-issues) - Common issues and solutions
