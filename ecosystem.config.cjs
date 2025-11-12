/**
 * ============================================================================
 * PM2 ECOSYSTEM CONFIGURATION FILE
 * ============================================================================
 *
 * This file configures PM2 to manage three services for the ICJIA Accessibility
 * Status application:
 *
 * 1. BACKEND SERVICE (Express API)
 *    - Runs on port 3001
 *    - Handles API requests
 *    - Uses tsx runtime for TypeScript execution
 *
 * 2. DOCUMENTATION SERVICE (Docusaurus)
 *    - Runs on port 3002
 *    - Serves documentation site
 *    - Runs via Yarn workspace
 *
 * 3. FRONTEND SERVICE (React + Vite)
 *    - Built to dist/ directory
 *    - Served by Nginx reverse proxy
 *    - Not managed by PM2 (static files)
 *
 * ============================================================================
 * QUICK START GUIDE - HOW TO GET PM2 RUNNING
 * ============================================================================
 *
 * STEP 1: Install PM2 globally (one-time setup)
 * ─────────────────────────────────────────────
 *   npm install -g pm2
 *   OR
 *   yarn global add pm2
 *
 * STEP 2: Verify PM2 is installed
 * ────────────────────────────────
 *   pm2 --version
 *   Expected output: v5.x.x or higher
 *
 * STEP 3: Start all services using this config file
 * ──────────────────────────────────────────────────
 *   pm2 start ecosystem.config.js
 *
 *   This command will:
 *   - Start the backend service (port 3001)
 *   - Start the documentation service (port 3002)
 *   - Create logs in ./logs/ directory
 *   - Enable auto-restart on crash
 *
 * STEP 4: Verify services are running
 * ────────────────────────────────────
 *   pm2 status
 *
 *   Expected output:
 *   ┌─────────────────────────────┬─────┬─────────┬──────┬────────┐
 *   │ id │ name                    │ mode│ status  │ ↺    │ uptime │
 *   ├─────────────────────────────┼─────┼─────────┼──────┼────────┤
 *   │ 0  │ icjia-accessibility-backend │ fork│ online  │ 0    │ 1m     │
 *   │ 1  │ icjia-accessibility-docs    │ fork│ online  │ 0    │ 1m     │
 *   └─────────────────────────────┴─────┴─────────┴──────┴────────┘
 *
 * STEP 5: View logs to verify services started correctly
 * ───────────────────────────────────────────────────────
 *   pm2 logs
 *
 *   Or view specific service logs:
 *   pm2 logs icjia-accessibility-backend
 *   pm2 logs icjia-accessibility-docs
 *
 * STEP 6: Test the services
 * ──────────────────────────
 *   # Test backend API
 *   curl http://localhost:3001/api/health
 *
 *   # Test documentation
 *   curl http://localhost:3002
 *
 * STEP 7: Setup auto-start on server reboot (optional but recommended)
 * ────────────────────────────────────────────────────────────────────
 *   pm2 startup
 *   pm2 save
 *
 *   This ensures services restart automatically if the server reboots.
 *
 * ============================================================================
 * COMMON PM2 COMMANDS
 * ============================================================================
 *
 * pm2 start ecosystem.config.js      # Start all services
 * pm2 stop ecosystem.config.js       # Stop all services
 * pm2 restart ecosystem.config.js    # Restart all services
 * pm2 delete ecosystem.config.js     # Delete all services
 * pm2 status                         # Show status of all services
 * pm2 logs                           # Show logs from all services
 * pm2 logs [service-name]            # Show logs from specific service
 * pm2 monit                          # Monitor services in real-time
 * pm2 save                           # Save current process list
 * pm2 startup                        # Setup auto-start on reboot
 * pm2 kill                           # Kill PM2 daemon
 *
 * ============================================================================
 * CONFIGURATION STRUCTURE
 * ============================================================================
 */

module.exports = {
  // apps: Array of applications to manage
  // Each app object defines a service to run
  apps: [
    /**
     * ========================================================================
     * SERVICE 1: BACKEND API (Express Server)
     * ========================================================================
     *
     * This service runs the Express backend API server that handles:
     * - API requests from the frontend
     * - Data processing
     * - Database interactions
     * - Authentication/Authorization
     *
     * Port: 3001
     * Language: TypeScript (executed via tsx runtime)
     *
     */
    {
      // Service name - used in PM2 commands and logs
      // Example: pm2 logs icjia-accessibility-backend
      name: "icjia-accessibility-backend",

      // Path to the script to run
      // This is the entry point for the backend service
      // Uses TypeScript file (.ts) instead of JavaScript
      script: "server/index.ts",

      // Interpreter to use for running the script
      // "tsx" is a TypeScript executor that runs .ts files directly
      // without needing to compile to .js first
      // Install: npm install -g tsx
      interpreter: "tsx",

      // Number of instances to run
      // 1 = single instance (recommended for most cases)
      // Can be set to "max" to use all CPU cores
      instances: 1,

      // Execution mode
      // "fork" = single process (default, recommended)
      // "cluster" = multiple processes with load balancing
      exec_mode: "fork",

      // Watch mode - automatically restart on file changes
      // false = disabled (recommended for production)
      // true = enabled (useful for development)
      watch: false,

      // Environment variables for this service
      // These are passed to the Node.js process
      env: {
        // Set Node environment to production
        // This affects how Express and other libraries behave
        NODE_ENV: "production",

        // Port for the backend API server
        // The Express server will listen on this port
        // Nginx reverse proxy forwards requests to this port
        PORT: 3001,
      },

      // Error log file path
      // All stderr output goes here
      // Useful for debugging issues
      error_file: "./logs/backend-error.log",

      // Output log file path
      // All stdout output goes here
      // Contains application logs and console.log() output
      out_file: "./logs/backend-out.log",

      // Date format for log timestamps
      // YYYY-MM-DD HH:mm:ss Z = "2024-01-15 14:30:45 +0000"
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Merge logs from all instances into one file
      // true = all output in one file
      // false = separate files per instance
      merge_logs: true,

      // Auto-restart the service if it crashes
      // true = automatically restart on crash
      // false = do not restart
      autorestart: true,

      // Maximum number of restarts allowed
      // If service crashes more than this, PM2 stops trying to restart
      // 10 = allow up to 10 restart attempts
      max_restarts: 10,

      // Minimum uptime before restart count resets
      // If service runs for at least 10 seconds, restart counter resets
      // This prevents rapid restart loops
      min_uptime: "10s",
    },
    /**
     * ========================================================================
     * SERVICE 2: DOCUMENTATION (Docusaurus)
     * ========================================================================
     *
     * This service runs the Docusaurus documentation site that provides:
     * - Deployment guides
     * - API documentation
     * - Setup instructions
     * - Troubleshooting guides
     *
     * Port: 3002
     * Framework: Docusaurus (React-based static site generator)
     * Package Manager: Yarn (using workspace)
     *
     */
    {
      // Service name - used in PM2 commands and logs
      // Example: pm2 logs icjia-accessibility-docs
      name: "icjia-accessibility-docs",

      // Script to run
      // "yarn" = use Yarn package manager as the command
      // This allows us to run Yarn commands via PM2
      script: "yarn",

      // Arguments to pass to the script
      // "workspace icjia-accessibility-docs start"
      // This tells Yarn to:
      // 1. Use the workspace named "icjia-accessibility-docs"
      // 2. Run the "start" script defined in that workspace's package.json
      //
      // The docs/package.json contains:
      // "start": "docusaurus start"
      // Which starts the Docusaurus development server
      args: "workspace icjia-accessibility-docs start",

      // Number of instances to run
      // 1 = single instance (recommended)
      // Docusaurus doesn't benefit from multiple instances
      instances: 1,

      // Execution mode
      // "fork" = single process (default, recommended)
      // "cluster" = multiple processes (not needed for Docusaurus)
      exec_mode: "fork",

      // Watch mode - automatically restart on file changes
      // false = disabled (recommended for production)
      // Docusaurus has its own hot-reload built-in
      watch: false,

      // Environment variables for this service
      // These are passed to the Docusaurus process
      env: {
        // Set Node environment to production
        // Docusaurus will optimize for production
        NODE_ENV: "production",

        // Port for the documentation server
        // Docusaurus will listen on this port
        // Nginx reverse proxy forwards requests to this port
        PORT: 3002,
      },

      // Error log file path
      // All stderr output goes here
      // Useful for debugging Docusaurus issues
      error_file: "./logs/docs-error.log",

      // Output log file path
      // All stdout output goes here
      // Contains Docusaurus startup messages and logs
      out_file: "./logs/docs-out.log",

      // Date format for log timestamps
      // YYYY-MM-DD HH:mm:ss Z = "2024-01-15 14:30:45 +0000"
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Merge logs from all instances into one file
      // true = all output in one file
      // false = separate files per instance
      merge_logs: true,

      // Auto-restart the service if it crashes
      // true = automatically restart on crash
      // false = do not restart
      autorestart: true,

      // Maximum number of restarts allowed
      // If service crashes more than this, PM2 stops trying to restart
      // 10 = allow up to 10 restart attempts
      max_restarts: 10,

      // Minimum uptime before restart count resets
      // If service runs for at least 10 seconds, restart counter resets
      // This prevents rapid restart loops
      min_uptime: "10s",
    },
  ],
};

/**
 * ============================================================================
 * FRONTEND SERVICE (React + Vite)
 * ============================================================================
 *
 * NOTE: The frontend is NOT managed by PM2 in this configuration.
 *
 * Why? The frontend is built to static files (dist/) and served by Nginx.
 *
 * Build Process:
 * 1. Run: yarn build
 * 2. This creates dist/ directory with static HTML/CSS/JS files
 * 3. Nginx serves these files directly (no Node.js process needed)
 * 4. Nginx also acts as reverse proxy for backend (3001) and docs (3002)
 *
 * Nginx Configuration:
 * - / → serves frontend from dist/
 * - /api/* → proxies to backend on port 3001
 * - /docs/* → proxies to docs on port 3002
 *
 * ============================================================================
 * ARCHITECTURE OVERVIEW
 * ============================================================================
 *
 * User Request
 *     ↓
 * Nginx (port 80/443)
 *     ├─ / → Frontend (static files from dist/)
 *     ├─ /api/* → Backend (port 3001, managed by PM2)
 *     └─ /docs/* → Docs (port 3002, managed by PM2)
 *
 * ============================================================================
 * DEPLOYMENT WORKFLOW
 * ============================================================================
 *
 * 1. INITIAL SETUP (one-time)
 *    ─────────────────────────
 *    npm install -g pm2
 *    pm2 start ecosystem.config.js
 *    pm2 save
 *    pm2 startup
 *
 * 2. DEPLOYMENT (on each code push)
 *    ──────────────────────────────
 *    git pull origin main
 *    yarn install --production
 *    yarn build
 *    pm2 restart ecosystem.config.js
 *
 * 3. MONITORING
 *    ──────────
 *    pm2 status
 *    pm2 logs
 *    pm2 monit
 *
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 *
 * Q: Services won't start
 * A: Check logs with: pm2 logs
 *    Verify ports 3001 and 3002 are available: lsof -i :3001
 *    Check environment variables are set correctly
 *
 * Q: Services keep restarting
 * A: Check error logs: pm2 logs [service-name]
 *    Verify dependencies are installed: yarn install
 *    Check if ports are already in use
 *
 * Q: How do I see what's happening?
 * A: Use: pm2 logs
 *    Or: pm2 monit (real-time monitoring)
 *    Or: tail -f ./logs/backend-out.log
 *
 * Q: How do I stop services?
 * A: pm2 stop ecosystem.config.js
 *    Or: pm2 delete ecosystem.config.js (removes from PM2)
 *
 * Q: How do I restart services?
 * A: pm2 restart ecosystem.config.js
 *    Or: pm2 restart [service-id]
 *
 * ============================================================================
 */
