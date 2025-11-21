# Common Issues and Solutions

Troubleshooting guide for common problems.

## Development Issues

### Port Already in Use

**Problem:** "Port 5173 is already in use" or similar error

**Solution:**

```bash
# Find process using port
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or change port in vite.config.ts
```

### Module Not Found

**Problem:** "Cannot find module" error

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules
yarn install

# Clear cache
yarn cache clean
yarn install
```

### TypeScript Errors

**Problem:** Type checking errors

**Solution:**

```bash
# Run type checking
yarn typecheck

# Fix common issues
yarn lint --fix

# Check specific file
yarn typecheck src/pages/Login.tsx
```

### Hot Module Replacement Not Working

**Problem:** Changes not reflecting in browser

**Solution:**

```bash
# Restart dev server
# Press Ctrl+C and run yarn dev again

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check Vite config
# Verify vite.config.ts has correct settings
```

## Backend Issues

### Backend Won't Start

**Problem:** "Cannot start backend" or connection errors

**Solution:**

```bash
# Check Node.js version
node --version  # Should be 20+

# Check port availability
sudo lsof -i :3001

# Check environment variables
cat .env

# Run with verbose logging
NODE_DEBUG=* yarn dev
```

### API Endpoints Not Responding

**Problem:** "Cannot GET /api/sites" or 404 errors

**Solution:**

```bash
# Verify backend is running
curl http://localhost:3001/api

# Check route definitions
# Look in server/routes/*.ts

# Check middleware
# Verify requireAuth middleware is applied correctly

# Check logs
# Look for error messages in terminal
```

### CORS Errors

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**

```bash
# Check Vite proxy configuration
# vite.config.ts should have:
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}

# Restart dev server
yarn dev
```

## Database Issues

### Database Connection Failed

**Problem:** "Failed to connect to database" or "ECONNREFUSED"

**Solution:**

```bash
# Verify Supabase credentials in .env
cat .env | grep VITE_SUPABASE

# Check Supabase project is active
# Go to Supabase dashboard and verify project status

# Test connection
curl https://your-project-id.supabase.co/rest/v1/

# Restart services
yarn dev
```

### "Admin user NOT found" Error

**Problem:** Cannot log in, admin user not found

**Solution:**

```bash
# Re-run migration file
# Go to Supabase SQL Editor
# Copy and run: supabase/migrations/01_create_initial_schema.sql

# Verify admin user was created
# Check admin_users table in Supabase

# Clear browser cache and try again
```

### "Failed to create session" Error

**Problem:** Login fails with session creation error

**Solution:**

```bash
# Verify migrations were run
# Check all tables exist in Supabase

# Check RLS policies
# Go to Supabase → Authentication → Policies

# Re-run migration files
# Run 01_create_initial_schema.sql and 02_add_api_keys_and_payloads.sql again

# Check database logs
# Look for errors in Supabase logs
```

### Table Not Found

**Problem:** "relation does not exist" error

**Solution:**

```bash
# Verify all migrations were run
# Check Supabase Table Editor

# Run missing migrations
# Go to SQL Editor and run the migration files

# Check table names
# Verify table names match in code and database
```

## Authentication Issues

### "Invalid credentials" Error

**Problem:** Cannot log in with correct username/password

**Solution:**

```bash
# Verify admin user exists
# Check admin_users table in Supabase

# Check password is set
# Initial admin has blank password - must set on first login

# Try initial setup
# Go to http://localhost:5173/setup

# Check password requirements
# Password must be 8+ chars with uppercase, lowercase, number, special char
```

### Session Not Persisting

**Problem:** Logged out after page refresh

**Solution:**

```bash
# Check cookies are enabled
# Browser settings → Privacy → Cookies

# Verify credentials: 'include' in API calls
# Check src/lib/api.ts has credentials: 'include'

# Check cookie settings
# Verify HttpOnly, Secure, SameSite flags

# Restart backend
yarn dev:backend
```

### "Authentication required" on Valid Session

**Problem:** Getting 401 errors despite being logged in

**Solution:**

```bash
# Check session hasn't expired
# Sessions expire after 15 days

# Verify session exists in database
# Check sessions table in Supabase

# Check cookie is being sent
# Open DevTools → Application → Cookies

# Log out and log back in
# Clear session and create new one
```

## Frontend Issues

### Blank Page or White Screen

**Problem:** App loads but shows nothing

**Solution:**

```bash
# Check browser console for errors
# Open DevTools → Console tab

# Check network requests
# Open DevTools → Network tab

# Verify backend is running
curl http://localhost:3001/api

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check React DevTools
# Install React DevTools extension
```

### Styling Issues

**Problem:** CSS not loading or styles look wrong

**Solution:**

```bash
# Check Tailwind CSS is working
# Verify tailwind.config.ts exists

# Rebuild CSS
yarn dev

# Clear browser cache
# Hard refresh: Ctrl+Shift+R

# Check dark mode
# Verify dark mode is enabled in browser
```

### Navigation Not Working

**Problem:** Links don't navigate or routes not working

**Solution:**

```bash
# Check React Router configuration
# Look in src/App.tsx

# Verify routes are defined
# Check all pages have routes

# Check navigation links
# Verify href attributes are correct

# Check browser history
# Try using browser back/forward buttons
```

## Production Issues

### Services Won't Start

**Problem:** PM2 shows "stopped" or "errored"

**Solution:**

```bash
# Check PM2 logs
pm2 logs

# Check error logs
pm2 logs --err

# Verify environment variables
cat .env

# Restart services
pm2 restart all

# Check system resources
pm2 monit
```

### Nginx Not Proxying

**Problem:** Getting "Bad Gateway" or connection refused

**Solution:**

```bash
# Test Nginx configuration
sudo nginx -t

# Check upstream services running
curl http://localhost:5173
curl http://localhost:3001/api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

**Problem:** "SSL certificate problem" or HTTPS not working

**Solution:**

```bash
# Verify certificate exists
sudo ls -la /etc/letsencrypt/live/example.com/

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Check Nginx SSL configuration
sudo nginx -t
```

## Getting Help

If you can't find a solution:

1. **Check the logs**

   - Frontend: Browser DevTools Console
   - Backend: Terminal output or `pm2 logs`
   - Database: Supabase logs

2. **Search documentation**

   - [Setup Guide](../setup-guide)
   - [Authentication](../authentication)
   - [API Documentation](../api/overview)

3. **Report an issue**
   - [GitHub Issues](https://github.com/ICJIA/icjia-accessibility-status/issues)
   - Include error messages and steps to reproduce

## See Also

- [Authentication Errors](./authentication-errors) - Auth-specific issues
- [Database Errors](./database-errors) - Database-specific issues
- [Setup Guide](../setup-guide) - Setup instructions
