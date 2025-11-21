# API Rate Limiting and Key Rotation Documentation

**Date**: November 11, 2024
**Status**: ✅ Implemented and Production-Ready

---

## Overview

The ICJIA Accessibility Status Portal implements comprehensive rate limiting and API key rotation features to prevent abuse and maintain security.

---

## Rate Limiting

### Overview

Rate limiting is applied at multiple levels to prevent abuse:

1. **Login Rate Limiting** - Prevents brute force attacks
2. **API Key Rate Limiting** - Prevents API abuse per key
3. **Session Creation Rate Limiting** - Prevents session flooding
4. **General API Rate Limiting** - Applies to all endpoints

### Configuration

All rate limits are configurable via environment variables:

```bash
# Login Rate Limiting (default: 5 attempts per 10 minutes)
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5

# API Key Rate Limiting (default: 100 requests per hour)
API_KEY_RATE_LIMIT_WINDOW_MS=3600000
API_KEY_RATE_LIMIT_MAX_REQUESTS=100

# Session Creation Rate Limiting (default: 10 sessions per hour)
SESSION_RATE_LIMIT_WINDOW_MS=3600000
SESSION_RATE_LIMIT_MAX_SESSIONS=10

# General API Rate Limiting (default: 1000 requests per hour)
GENERAL_RATE_LIMIT_WINDOW_MS=3600000
GENERAL_RATE_LIMIT_MAX_REQUESTS=1000
```

### Rate Limit Responses

When a rate limit is exceeded, the API returns a 429 (Too Many Requests) status:

```json
{
  "error": "Too many login attempts. Please try again in 10 minutes.",
  "retryAfter": 1731340800000
}
```

### Rate Limit Headers

All rate-limited responses include standard rate limit headers:

```
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1731340800
```

### Logging

All rate limit violations are logged to the `audit_logs` table with:

- Action: `rate_limit_violation`
- Description: Details about the violation
- Metadata: IP address, user agent, limit type
- Timestamp: When the violation occurred

---

## API Key Rotation

### Overview

API key rotation allows secure key management with a grace period for old keys.

### Manual Rotation

**Endpoint**: `POST /api/api-keys/:id/rotate`

**Authentication**: Required (admin only)

**Request**:

```bash
curl -X POST http://localhost:3001/api/api-keys/key-id-here/rotate \
  -H "Cookie: session_token=your-session-token"
```

**Response** (201 Created):

```json
{
  "message": "API key rotated successfully",
  "newKey": {
    "id": "new-key-id",
    "key_name": "Production API Key",
    "display_key": "sk_live_abc123...xyz789",
    "full_key": "sk_live_abc123...xyz789...full_key_here",
    "scopes": ["sites:write"],
    "created_at": "2024-11-11T12:00:00Z",
    "expires_at": null,
    "notes": "Rotated from key old-key-id"
  },
  "oldKey": {
    "id": "old-key-id",
    "key_name": "Production API Key",
    "grace_period_expires_at": "2024-11-21T12:00:00Z",
    "grace_period_days": 10
  },
  "warning": "This is the only time the new API key will be displayed. Please save it securely. The old key will remain active for 10 days."
}
```

### Grace Period

After rotation:

- **Old key**: Remains active for the grace period (default: 10 days)
- **New key**: Immediately active
- **After grace period**: Old key is automatically deactivated

### Configuration

```bash
# Grace period for old keys after rotation (in days)
API_KEY_ROTATION_GRACE_PERIOD_DAYS=10

# How often to check for and deactivate expired keys (in milliseconds)
KEY_DEACTIVATION_CHECK_INTERVAL_MS=3600000  # 1 hour
```

### Automatic Deactivation

The system automatically deactivates old keys after their grace period expires:

1. **Scheduled Job**: Runs every hour (configurable)
2. **Logging**: Deactivations are logged to `activity_log`
3. **No Manual Action**: Automatic and transparent

### Rotation History

Each rotated key includes:

- `rotated_from_key_id`: Reference to the previous key
- `grace_period_expires_at`: When the old key will be deactivated
- Activity log entries tracking the rotation

---

## API Key Statistics

**Endpoint**: `GET /api/api-keys/stats/rotation`

**Authentication**: Required (admin only)

**Response**:

```json
{
  "stats": {
    "totalKeys": 5,
    "activeKeys": 3,
    "inactiveKeys": 2,
    "keysInGracePeriod": 1,
    "rotatedKeys": 2
  },
  "timestamp": "2024-11-11T12:00:00Z"
}
```

---

## Best Practices

### For Administrators

1. **Regular Rotation**: Rotate API keys every 90 days
2. **Monitor Usage**: Check `last_used_at` and `usage_count` regularly
3. **Review Logs**: Monitor `audit_logs` for unusual patterns
4. **Grace Period**: Use the grace period to update client applications

### For API Consumers

1. **Store Securely**: Never commit API keys to version control
2. **Use Environment Variables**: Store keys in `.env` files
3. **Rotate Regularly**: Implement key rotation in your workflow
4. **Monitor Usage**: Track your API usage to stay within limits
5. **Handle 429 Responses**: Implement exponential backoff for rate limit errors

### Rate Limit Handling

```javascript
// Example: Handling rate limit errors
async function makeApiRequest(url, options) {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = (retryAfter || 60) * 1000;
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        retries++;
        continue;
      }

      return response;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}
```

---

## Monitoring and Alerts

### Audit Log Queries

**Find rate limit violations**:

```sql
SELECT * FROM audit_logs
WHERE action = 'rate_limit_violation'
ORDER BY created_at DESC
LIMIT 20;
```

**Find API key rotations**:

```sql
SELECT * FROM audit_logs
WHERE action = 'api_key_rotation'
ORDER BY created_at DESC
LIMIT 20;
```

**Find failed logins**:

```sql
SELECT * FROM audit_logs
WHERE action = 'failed_login'
ORDER BY created_at DESC
LIMIT 20;
```

### Recommended Alerts

1. **High Rate Limit Violations**: Alert if > 10 violations in 1 hour
2. **Unusual API Usage**: Alert if usage_count > 80% of limit
3. **Failed Logins**: Alert if > 5 failed logins from same IP in 10 minutes
4. **Key Deactivations**: Alert on automatic key deactivations

---

## Troubleshooting

### "Too many login attempts"

**Cause**: Exceeded login rate limit (5 attempts per 10 minutes)

**Solution**:

1. Wait 10 minutes before trying again
2. Check your password
3. Contact administrator if locked out

### "API rate limit exceeded"

**Cause**: Exceeded API key rate limit (100 requests per hour)

**Solution**:

1. Implement exponential backoff in your client
2. Batch requests when possible
3. Contact administrator to increase limit if needed

### "Too many session creation attempts"

**Cause**: Exceeded session creation rate limit (10 sessions per hour)

**Solution**:

1. Reuse existing sessions instead of creating new ones
2. Wait 1 hour before creating more sessions
3. Check for session leaks in your application

---

## Security Considerations

1. **Rate Limits**: Prevent brute force and DoS attacks
2. **Key Rotation**: Limits exposure if a key is compromised
3. **Grace Period**: Allows smooth transition during key rotation
4. **Audit Trail**: All operations logged for compliance
5. **Automatic Cleanup**: Old keys automatically deactivated

---

## Support

For questions or issues with rate limiting and key rotation:

1. Check the audit logs for detailed event information
2. Review this documentation
3. Contact the development team
4. Check the RLS Security Audit for additional security details
