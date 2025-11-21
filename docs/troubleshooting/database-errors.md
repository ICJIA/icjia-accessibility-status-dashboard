# Database Errors

Troubleshooting guide for database-related issues.

## Connection Issues

### "Failed to connect to database" Error

**Problem:** Cannot connect to Supabase database

**Causes:**

- Incorrect Supabase credentials
- Network connectivity issue
- Supabase project is paused
- Database is down

**Solutions:**

1. **Verify Supabase credentials:**

   ```bash
   # Check .env file
   cat .env | grep SUPABASE

   # Should have:
   # VITE_SUPABASE_URL=https://your-project-id.supabase.co
   # VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Test connection:**

   ```bash
   # Test with curl
   curl https://your-project-id.supabase.co/rest/v1/

   # Should return 200 OK
   ```

3. **Check Supabase project status:**

   ```bash
   # Go to Supabase dashboard
   # Verify project is active (not paused)
   # Check project status page
   ```

4. **Check network connectivity:**

   ```bash
   # Test internet connection
   ping google.com

   # Test Supabase connectivity
   ping your-project-id.supabase.co
   ```

5. **Restart services:**
   ```bash
   # Restart all services (frontend + backend)
   yarn dev
   ```

## Table Issues

### "Relation does not exist" Error

**Problem:** Table not found in database

**Causes:**

- Migrations haven't been run
- Table was deleted
- Table name is incorrect
- Wrong database selected

**Solutions:**

1. **Verify migrations were run:**

   ```bash
   # Go to Supabase SQL Editor
   # Check if tables exist:
   # - admin_users
   # - sessions
   # - sites
   # - score_history
   # - api_keys
   # - activity_log
   ```

2. **Run migrations:**

   ```bash
   # Go to Supabase SQL Editor
   # Copy and run: supabase/migrations/01_create_initial_schema.sql
   # Then run: supabase/migrations/02_add_api_keys_and_payloads.sql
   ```

3. **Check table names:**

   ```bash
   # Verify table names in code match database
   # Check server/db/schema.ts
   # Compare with Supabase Table Editor
   ```

4. **Verify correct database:**
   ```bash
   # Check VITE_SUPABASE_URL in .env
   # Make sure it points to correct project
   ```

### "Column does not exist" Error

**Problem:** Column not found in table

**Causes:**

- Column wasn't created by migration
- Column was deleted
- Column name is incorrect
- Wrong table selected

**Solutions:**

1. **Check column exists:**

   ```bash
   # Go to Supabase Table Editor
   # Click on table
   # Verify column exists
   ```

2. **Re-run migrations:**

   ```bash
   # Go to Supabase SQL Editor
   # Run migration files again
   # Safe to run multiple times
   ```

3. **Check column names:**
   ```bash
   # Verify column names in code match database
   # Check server/db/schema.ts
   # Compare with Supabase Table Editor
   ```

## RLS Policy Issues

### "Permission denied" Error

**Problem:** Query blocked by Row Level Security (RLS) policy

**Causes:**

- RLS policy is too restrictive
- User doesn't have required role
- RLS policy is missing
- RLS policy has incorrect conditions

**Solutions:**

1. **Check RLS policies:**

   ```bash
   # Go to Supabase → Authentication → Policies
   # Verify policies exist for each table
   # Check policy conditions
   ```

2. **Verify user role:**

   ```bash
   # Check user has correct role
   # Go to Supabase SQL Editor
   # Run: SELECT * FROM admin_users WHERE username = 'admin';
   ```

3. **Re-run migrations:**

   ```bash
   # Go to Supabase SQL Editor
   # Run 02_add_api_keys_and_payloads.sql migration to fix RLS policies
   ```

4. **Check policy conditions:**
   ```bash
   # Go to Supabase → Authentication → Policies
   # Click on policy to view conditions
   # Verify conditions are correct
   ```

## Data Issues

### "Duplicate key value violates unique constraint" Error

**Problem:** Trying to insert duplicate data

**Causes:**

- Record already exists
- Unique constraint violation
- Primary key conflict

**Solutions:**

1. **Check if record exists:**

   ```bash
   # Go to Supabase Table Editor
   # Search for existing record
   # Delete if duplicate
   ```

2. **Use different value:**

   ```bash
   # If creating new record, use unique value
   # For example, different username or URL
   ```

3. **Check unique constraints:**
   ```bash
   # Go to Supabase Table Editor
   # Click on table
   # Check which columns have unique constraints
   ```

### "Foreign key constraint violation" Error

**Problem:** Referenced record doesn't exist

**Causes:**

- Referenced record was deleted
- Foreign key value is incorrect
- Referenced table doesn't exist

**Solutions:**

1. **Verify referenced record exists:**

   ```bash
   # Go to Supabase Table Editor
   # Check if referenced record exists
   # Create if missing
   ```

2. **Check foreign key value:**

   ```bash
   # Verify foreign key value is correct
   # Should match primary key of referenced table
   ```

3. **Check referenced table:**
   ```bash
   # Verify referenced table exists
   # Run migrations if missing
   ```

## Query Issues

### "Syntax error" in SQL Query

**Problem:** SQL query has syntax error

**Causes:**

- Incorrect SQL syntax
- Missing quotes or parentheses
- Invalid column or table name

**Solutions:**

1. **Check SQL syntax:**

   ```bash
   # Go to Supabase SQL Editor
   # Verify SQL syntax is correct
   # Use proper quotes and parentheses
   ```

2. **Test query:**

   ```bash
   # Run query in SQL Editor first
   # Fix any errors
   # Then use in code
   ```

3. **Check column/table names:**
   ```bash
   # Verify column and table names are correct
   # Use quotes if names have special characters
   ```

## Performance Issues

### Slow Queries

**Problem:** Database queries are slow

**Causes:**

- Missing indexes
- Large result sets
- Complex joins
- No pagination

**Solutions:**

1. **Add indexes:**

   ```bash
   # Go to Supabase SQL Editor
   # Create indexes on frequently queried columns
   # Example: CREATE INDEX idx_sites_name ON sites(name);
   ```

2. **Use pagination:**

   ```bash
   # Limit result sets
   # Use LIMIT and OFFSET
   # Example: SELECT * FROM sites LIMIT 10 OFFSET 0;
   ```

3. **Optimize queries:**

   ```bash
   # Avoid SELECT *
   # Select only needed columns
   # Use WHERE clauses to filter
   ```

4. **Check query performance:**
   ```bash
   # Go to Supabase → Logs
   # Check query execution times
   # Identify slow queries
   ```

## Backup and Recovery

### Restore from Backup

**Problem:** Need to restore database from backup

**Solution:**

```bash
# Go to Supabase Dashboard
# Click on project
# Go to Backups
# Select backup to restore
# Click Restore
```

### Export Database

**Problem:** Need to export database data

**Solution:**

```bash
# Go to Supabase SQL Editor
# Run: SELECT * FROM table_name;
# Export results as CSV or JSON
```

## Troubleshooting Steps

1. **Check Supabase status**

   - Go to Supabase dashboard
   - Verify project is active
   - Check status page

2. **Verify credentials**

   - Check .env file
   - Verify URL and key are correct
   - Test connection with curl

3. **Check database state**

   - Go to Supabase Table Editor
   - Verify tables exist
   - Check data is present

4. **Review logs**

   - Go to Supabase → Logs
   - Look for error messages
   - Check query execution times

5. **Run migrations**
   - Go to Supabase SQL Editor
   - Run migration files
   - Safe to run multiple times

## See Also

- [Common Issues](./common-issues) - General troubleshooting
- [Authentication Errors](./authentication-errors) - Auth-specific issues
- [Setup Guide](../setup-guide) - Setup instructions
- [API Documentation](../api/overview) - API reference
