#!/bin/bash

################################################################################
# Laravel Forge Automated Deployment Script
# For: ICJIA Accessibility Status Portal (accessibility.icjia.app)
#
# This script is executed by Laravel Forge when a GitHub webhook is triggered.
# It handles the complete deployment workflow:
# 1. Pull latest code from main branch
# 2. Install/update dependencies
# 3. Build frontend and documentation
# 4. Restart PM2 services
# 5. Verify deployment success
#
# ============================================================================
# LARAVEL FORGE SETUP INSTRUCTIONS
# ============================================================================
#
# WHAT TO ADD TO FORGE'S DEPLOYMENT SCRIPT:
# ==========================================
# In Laravel Forge, go to: Site Details → Deployment Script
# Replace the default script with THIS EXACT SCRIPT:
#
#   #!/bin/bash
#   cd /home/forge/accessibility.icjia.app
#   bash deploy-forge.sh
#
# This simple wrapper calls this comprehensive deployment script.
#
# WHY THIS APPROACH:
# - Forge's deployment script field has character limits
# - This script contains all the logic (12 steps, error handling, verification)
# - The wrapper keeps Forge's script simple and maintainable
# - All deployment logic is version-controlled in this file
#
# DEPLOYMENT FLOW:
# ================
# 1. Developer pushes to main branch on GitHub
# 2. GitHub sends webhook to Laravel Forge
# 3. Forge executes the deployment script (the wrapper above)
# 4. Wrapper navigates to site directory and calls: bash deploy-forge.sh
# 5. This script runs all 12 deployment steps
# 6. Services are restarted and verified
# 7. New version is live at accessibility.icjia.app
#
# SETUP CHECKLIST:
# ================
# [ ] Upload this file to: /home/forge/accessibility.icjia.app/deploy-forge.sh
# [ ] Make executable: chmod +x /home/forge/accessibility.icjia.app/deploy-forge.sh
# [ ] In Forge, go to Site Details → Deployment Script
# [ ] Replace default script with the wrapper script above
# [ ] In Forge, go to Site Details → Deployment
# [ ] Enable GitHub Webhook for main branch
# [ ] Test by pushing a commit to main branch
# [ ] Monitor deployment in Forge → Deployment History
#
# MANUAL DEPLOYMENT (if needed):
# ==============================
# ssh forge@your-server-ip
# cd /home/forge/accessibility.icjia.app
# bash deploy-forge.sh
#
# MONITORING:
# ===========
# View deployment history: Forge → Site Details → Deployment History
# View logs: ssh and run: pm2 logs
# View deployment log: tail -f /home/forge/.pm2/logs/deployment.log
#
################################################################################

set -e  # Exit on first error

# Configuration
SITE_DIR="/home/forge/accessibility.icjia.app"
DEPLOYMENT_LOG="/home/forge/.pm2/logs/deployment.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Logging Functions
################################################################################

log_info() {
    echo -e "${BLUE}[${TIMESTAMP}] ℹ️  INFO:${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
    echo -e "${GREEN}[${TIMESTAMP}] ✅ SUCCESS:${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_warning() {
    echo -e "${YELLOW}[${TIMESTAMP}] ⚠️  WARNING:${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
    echo -e "${RED}[${TIMESTAMP}] ❌ ERROR:${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

################################################################################
# Error Handling
################################################################################

handle_error() {
    local line_number=$1
    log_error "Deployment failed at line $line_number"
    log_error "Attempting to restart services from last known good state..."
    
    cd "$SITE_DIR"
    pm2 restart ecosystem.config.js || true
    
    exit 1
}

trap 'handle_error ${LINENO}' ERR

################################################################################
# Deployment Steps
################################################################################

log_info "=========================================="
log_info "Starting Deployment"
log_info "=========================================="
log_info "Site Directory: $SITE_DIR"
log_info "Timestamp: $TIMESTAMP"

# Step 1: Navigate to site directory
log_info "Step 1: Navigating to site directory..."
cd "$SITE_DIR" || exit 1
log_success "Navigated to $SITE_DIR"

# Step 2: Pull latest code from GitHub
log_info "Step 2: Pulling latest code from GitHub..."
if git pull origin main; then
    log_success "Successfully pulled latest code from main branch"
else
    log_error "Failed to pull code from GitHub"
    exit 1
fi

# Step 3: Verify Yarn is installed
log_info "Step 3: Verifying Yarn installation..."
if ! command -v yarn &> /dev/null; then
    log_warning "Yarn not found, installing Yarn 1.22.22..."
    npm install -g yarn@1.22.22
    log_success "Yarn installed"
else
    YARN_VERSION=$(yarn --version)
    log_success "Yarn $YARN_VERSION is installed"
fi

# Step 4: Install dependencies
log_info "Step 4: Installing production dependencies..."
if yarn install --production; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# Step 5: Build frontend and documentation
log_info "Step 5: Building frontend and documentation..."
if yarn build; then
    log_success "Frontend and documentation built successfully"
else
    log_error "Build failed"
    exit 1
fi

# Step 6: Verify build artifacts
log_info "Step 6: Verifying build artifacts..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    log_success "Frontend build verified (size: $DIST_SIZE)"
else
    log_error "Frontend build directory not found"
    exit 1
fi

# Step 7: Verify PM2 is installed
log_info "Step 7: Verifying PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 not found, installing PM2 globally..."
    npm install -g pm2
    log_success "PM2 installed"
else
    PM2_VERSION=$(pm2 --version)
    log_success "PM2 $PM2_VERSION is installed"
fi

# Step 8: Restart PM2 services
log_info "Step 8: Restarting PM2 services..."
if pm2 restart ecosystem.config.cjs; then
    log_success "PM2 services restarted successfully"
else
    log_warning "Services not running, starting them now..."
    if pm2 start ecosystem.config.cjs; then
        log_success "PM2 services started successfully"
    else
        log_error "Failed to start PM2 services"
        exit 1
    fi
fi

# Step 9: Save PM2 process list
log_info "Step 9: Saving PM2 process list..."
if pm2 save; then
    log_success "PM2 process list saved"
else
    log_warning "Failed to save PM2 process list (non-critical)"
fi

# Step 10: Verify services are running
log_info "Step 10: Verifying services are running..."
sleep 2  # Give services time to start

BACKEND_STATUS=$(pm2 status | grep icjia-accessibility-backend | awk '{print $NF}')
DOCS_STATUS=$(pm2 status | grep icjia-accessibility-docs | awk '{print $NF}')

if [[ "$BACKEND_STATUS" == "online" ]]; then
    log_success "Backend service is online"
else
    log_error "Backend service is not online (status: $BACKEND_STATUS)"
    exit 1
fi

if [[ "$DOCS_STATUS" == "online" ]]; then
    log_success "Documentation service is online"
else
    log_error "Documentation service is not online (status: $DOCS_STATUS)"
    exit 1
fi

# Step 11: Verify ports are listening
log_info "Step 11: Verifying services are listening on ports..."
if lsof -i :3001 > /dev/null 2>&1; then
    log_success "Backend is listening on port 3001"
else
    log_error "Backend is not listening on port 3001"
    exit 1
fi

if lsof -i :3002 > /dev/null 2>&1; then
    log_success "Documentation is listening on port 3002"
else
    log_error "Documentation is not listening on port 3002"
    exit 1
fi

# Step 12: Display PM2 status
log_info "Step 12: PM2 Status:"
pm2 status | tee -a "$DEPLOYMENT_LOG"

################################################################################
# Deployment Complete
################################################################################

log_info "=========================================="
log_success "Deployment Completed Successfully!"
log_info "=========================================="
log_info "Frontend: https://accessibility.icjia.app"
log_info "API Health: https://accessibility.icjia.app/api/health"
log_info "Documentation: https://accessibility.icjia.app/docs"
log_info "=========================================="
log_info "Deployment log: $DEPLOYMENT_LOG"

exit 0

