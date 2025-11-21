# Authentication Errors

Troubleshooting guide for authentication-related issues.

## Login Issues

### "Invalid credentials" Error

**Problem:** Cannot log in with correct username and password

**Causes:**

- Admin user doesn't exist
- Password is incorrect
- Password hash is corrupted
- Database connection issue

**Solutions:**

1. **Verify admin user exists:**

   ```bash
   # Check Supabase Table Editor
   # Go to admin_users table
   # Should see one row with username: admin
   ```

2. **Check password is set:**

   ```bash
   # Initial admin has blank password
   # Must set password on first login via /setup
   # If password_hash is empty, go to /setup
   ```

3. **Re-run migration:**

   ```bash
   # Go to Supabase SQL Editor
   # Run: supabase/migrations/01_create_initial_schema.sql
   ```

4. **Reset admin password:**
   ```bash
   # Use reset script
   yarn reset:users
   # Then create new admin at /admin
   ```

### "Failed to create session" Error

**Problem:** Login fails when creating session

**Causes:**

- Sessions table doesn't exist
- RLS policies are incorrect
- Database connection issue
- Session table is corrupted

**Solutions:**

1. **Verify sessions table exists:**

   ```bash
   # Check Supabase Table Editor
   # Should see sessions table
   ```

2. **Check RLS policies:**

   ```bash
   # Go to Supabase → Authentication → Policies
   # Verify sessions table has correct policies
   ```

3. **Re-run migrations:**

   ```bash
   # Run step_1 migration again
   # It's safe to run multiple times
   ```

4. **Check database logs:**
   ```bash
   # Go to Supabase → Logs
   # Look for error messages
   ```

## Session Issues

### Session Not Persisting

**Problem:** Logged out after page refresh

**Causes:**

- Cookies not enabled
- Cookie settings incorrect
- Session expired
- Session deleted from database

**Solutions:**

1. **Enable cookies:**

   ```bash
   # Browser settings → Privacy → Cookies
   # Make sure cookies are enabled
   ```

2. **Check cookie settings:**

   ```bash
   # Open DevTools → Application → Cookies
   # Look for session_token cookie
   # Should have HttpOnly, Secure, SameSite flags
   ```

3. **Check session expiration:**

   ```bash
   # Sessions expire after 15 days
   # Log out and log back in to create new session
   ```

4. **Verify credentials: 'include':**
   ```bash
   # Check src/lib/api.ts
   # All fetch requests should have credentials: 'include'
   ```

### "Authentication required" on Valid Session

**Problem:** Getting 401 errors despite being logged in

**Causes:**

- Session expired
- Session deleted from database
- Cookie not being sent
- Session token invalid

**Solutions:**

1. **Check session in database:**

   ```bash
   # Go to Supabase Table Editor
   # Check sessions table
   # Verify session exists and hasn't expired
   ```

2. **Check cookie is being sent:**

   ```bash
   # Open DevTools → Network tab
   # Click on API request
   # Check Request Headers for Cookie
   # Should see: Cookie: session_token=...
   ```

3. **Log out and log back in:**

   ```bash
   # Clear session and create new one
   # Go to /logout then /login
   ```

4. **Check session expiration:**
   ```bash
   # Sessions expire after 15 days
   # Create new session if expired
   ```

## Password Issues

### "Password does not meet requirements" Error

**Problem:** Password rejected during setup or change

**Requirements:**

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character

**Solution:**

```bash
# Create password meeting all requirements
# Example: MyPassword123!

# Verify each requirement:
# - Length: 8+ characters ✓
# - Uppercase: M, P ✓
# - Lowercase: y, a, s, s, w, o, r, d ✓
# - Number: 1, 2, 3 ✓
# - Special: ! ✓
```

### "Current password is incorrect" Error

**Problem:** Cannot change password, current password rejected

**Causes:**

- Typed current password incorrectly
- Password was changed elsewhere
- Session is invalid

**Solutions:**

1. **Verify current password:**

   ```bash
   # Double-check you're typing it correctly
   # Passwords are case-sensitive
   ```

2. **Log out and log back in:**

   ```bash
   # Create new session
   # Then try changing password again
   ```

3. **Reset password:**
   ```bash
   # Use reset script
   yarn reset:users
   # Then create new admin at /admin
   ```

## API Key Issues

### "Invalid API Key" Error

**Problem:** API requests rejected with invalid key error

**Causes:**

- API key is incorrect
- API key has been revoked
- API key has expired
- API key doesn't have required scope

**Solutions:**

1. **Verify API key:**

   ```bash
   # Copy key carefully from admin panel
   # Check for typos or extra spaces
   ```

2. **Check key hasn't been revoked:**

   ```bash
   # Go to /admin/api-keys
   # Verify key is still listed
   # If not, create new key
   ```

3. **Check key hasn't expired:**

   ```bash
   # Go to /admin/api-keys
   # Check expiration date
   # If expired, create new key
   ```

4. **Check key has required scope:**
   ```bash
   # Go to /admin/api-keys
   # Verify key has sites:read or sites:write scope
   # Create new key with correct scopes if needed
   ```

### "Unauthorized" Error with API Key

**Problem:** API requests rejected with 401 Unauthorized

**Causes:**

- Authorization header format incorrect
- API key is invalid
- API key doesn't have required scope

**Solutions:**

1. **Check Authorization header format:**

   ```bash
   # Should be: Authorization: Bearer sk_live_xxxxx
   # Not: Authorization: sk_live_xxxxx
   # Not: Authorization: Bearer xxxxx
   ```

2. **Verify API key is valid:**

   ```bash
   # Check in admin panel
   # Recreate if needed
   ```

3. **Check key has required scope:**
   ```bash
   # For sites:write - need sites:write scope
   # For sites:read - need sites:read scope
   # Create new key with correct scopes
   ```

## Primary Admin Protection

### "Cannot delete primary admin" Error

**Problem:** Cannot delete the first admin user

**Reason:**

- The first admin user (oldest created_at) is protected
- Prevents system lockout
- At least one admin must always exist

**Solution:**

```bash
# Create another admin user first
# Then delete the primary admin
# Or use reset:users script to reset all admins
```

## Troubleshooting Steps

1. **Check the logs**

   - Browser console for frontend errors
   - Terminal for backend errors
   - Supabase logs for database errors

2. **Verify database state**

   - Check admin_users table
   - Check sessions table
   - Check RLS policies

3. **Test with curl**

   ```bash
   # Test login endpoint
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your-password"}'
   ```

4. **Check environment variables**

   ```bash
   # Verify .env file has correct values
   cat .env | grep SUPABASE
   ```

5. **Restart services**

   ```bash
   # Restart all services (frontend + backend)
   yarn dev
   ```

## See Also

- [Common Issues](./common-issues) - General troubleshooting
- [Database Errors](./database-errors) - Database-specific issues
- [Authentication](../authentication) - How auth works
- [Reset Scripts](../reset-scripts) - How to reset users
