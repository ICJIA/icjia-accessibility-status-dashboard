# System Architecture

Overview of the ICJIA Accessibility Portal system architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│                    (React + TypeScript)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Nginx Reverse Proxy                      │
│              (Port 80/443 - Production)                     │
├─────────────────────────────────────────────────────────────┤
│  /          →  Frontend (5173)                              │
│  /api/      →  Backend (3001)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │
        ▼                ▼
   Frontend         Backend API
   (Vite)          (Express)
   Port 5173       Port 3001
```

## Frontend Architecture

### Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Directory Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components
├── lib/                # Utility functions
│   ├── api.ts         # API client
│   ├── auth.ts        # Authentication utilities
│   └── ...
├── types/             # TypeScript type definitions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

### Key Features

- ✅ Responsive design
- ✅ Dark mode support
- ✅ Session-based authentication
- ✅ Real-time data updates
- ✅ Accessibility compliance

## Backend Architecture

### Technology Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Runtime**: Node.js 20+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Session-based with bcrypt

### Directory Structure

```
server/
├── routes/            # API route handlers
├── middleware/        # Express middleware
├── db/               # Database utilities
├── types/            # TypeScript types
├── utils/            # Utility functions
└── index.ts          # Server entry point
```

### API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `GET /api/sites` - List sites
- `POST /api/sites` - Create site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site
- `POST /api/sites/import` - Import sites
- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Create API key
- `DELETE /api/api-keys/:id` - Revoke API key

### Authentication Flow

```
1. User submits login form
   ↓
2. Backend validates credentials
   ↓
3. Backend creates session
   ↓
4. Session token sent in HttpOnly cookie
   ↓
5. Frontend stores session in React state
   ↓
6. Subsequent requests include session cookie
```

## Database Architecture

### Database Provider

- **Provider**: Supabase (PostgreSQL)
- **Authentication**: Row Level Security (RLS)
- **Backups**: Automated daily backups

### Core Tables

- `admin_users` - Admin user accounts
- `sessions` - Active user sessions
- `sites` - Monitored websites
- `score_history` - Historical scores
- `api_keys` - API keys for programmatic access
- `audit_logs` - Audit trail
- `api_payloads` - API request payloads

### Security

- ✅ Row Level Security (RLS) policies
- ✅ Bcrypt password hashing
- ✅ HttpOnly session cookies
- ✅ API key hashing
- ✅ Audit logging

## Deployment Architecture

### Development Environment

```
Local Machine
├── Frontend (yarn dev)      → Port 5173 (Vite dev server)
└── Backend (yarn dev)       → Port 3001 (Express with nodemon)
```

### Production Environment

```
Ubuntu Server
├── Nginx (Port 80/443)
│   ├─ / → Frontend (5173, static files from dist/)
│   └─ /api/ → Backend (3001, Express API)
├── PM2 Process Manager
│   └─ icjia-accessibility-backend (Express on port 3001)
└── Supabase Database
    └─ PostgreSQL with RLS
```

## Data Flow

### User Login Flow

```
1. User enters credentials
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend creates session in database
   ↓
5. Backend sends session token in HttpOnly cookie
   ↓
6. Frontend stores session in React state
   ↓
7. User is authenticated
```

### Site Data Flow

```
1. Admin creates/updates site
   ↓
2. Frontend sends POST/PUT /api/sites
   ↓
3. Backend validates request
   ↓
4. Backend stores in database
   ↓
5. Backend logs action in audit_logs
   ↓
6. Frontend updates UI
```

### API Import Flow

```
1. External service sends POST /api/sites/import with API key
   ↓
2. Backend validates API key
   ↓
3. Backend validates request payload
   ↓
4. Backend creates/updates sites
   ↓
5. Backend logs in api_payloads table
   ↓
6. Backend returns response with results
```

## Security Architecture

### Authentication

- ✅ Session-based authentication
- ✅ HttpOnly cookies (prevents XSS)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite flag (CSRF protection)
- ✅ 15-day session expiration

### Authorization

- ✅ Row Level Security (RLS) policies
- ✅ API key scopes (sites:read, sites:write, sites:delete)
- ✅ Primary admin protection
- ✅ Activity logging

### Data Protection

- ✅ Bcrypt password hashing
- ✅ API key hashing
- ✅ HTTPS/TLS encryption
- ✅ Database backups

## Scalability

### Horizontal Scaling

- Multiple frontend instances behind load balancer
- Multiple backend instances with shared database

### Vertical Scaling

- Increase server CPU/RAM
- Optimize database queries
- Add caching layer

## Monitoring

### Application Monitoring

- PM2 process monitoring
- Application logs
- Error tracking

### System Monitoring

- CPU usage
- Memory usage
- Disk space
- Network traffic

### Database Monitoring

- Query performance
- Connection pool
- Backup status

## See Also

- [Setup Guide](./setup-guide) - How to set up the system
- [Development Setup](./development-setup) - Development environment
- [Deployment Overview](./deployment/overview) - Deployment guide
- [Database Schema](./database-schema) - Database structure
