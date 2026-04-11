#!/bin/bash
# 📊 Portfolio status checker

echo "🎮 Checking Abhishek's Portfolio Status..."

# Colors for output
GREEN='\033[0;32m'
ORANGE='\033[0;33m' 
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${ORANGE}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
echo "=================== LOCAL STATUS ==================="

# Check if we're in the right directory
if [ ! -f "portfolio/package.json" ]; then
    print_error "portfolio/package.json not found. Run this script from career-workspace root."
    exit 1
fi

# Check local build
print_info "Testing local build..."
cd portfolio

if [ -d "node_modules" ]; then
    print_status "Dependencies installed"
else
    print_warning "Dependencies missing - run 'npm install'"
fi

if [ -f ".next/BUILD_ID" ]; then
    print_status "Local build exists"
else
    print_warning "No local build found - run 'npm run build'"
fi

cd ..

# Check git status
echo ""
print_info "Git Repository Status:"

if git status --porcelain | grep -q .; then
    print_warning "You have uncommitted changes:"
    git status --porcelain
else
    print_status "Working directory clean"
fi

# Check if origin remote exists
if git remote -v | grep -q origin; then
    print_status "GitHub remote configured:"
    git remote get-url origin
else
    print_warning "No GitHub remote configured"
fi

# Check current branch
current_branch=$(git branch --show-current)
print_info "Current branch: $current_branch"

echo ""
echo "================== DEPLOYMENT STATUS =================="

# Check if Vercel config exists
if [ -f "vercel.json" ]; then
    print_status "Vercel configuration found"
else
    print_warning "vercel.json missing"
fi

# Check for deployment files
if [ -f "deploy.sh" ]; then
    print_status "Deployment script ready"
else
    print_error "deploy.sh missing"
fi

echo ""
echo "=================== NEXT STEPS ==================="

if ! git remote -v | grep -q origin; then
    echo "1. Create GitHub repository: https://github.com/new"
    echo "2. Add remote: git remote add origin YOUR_REPO_URL"
    echo "3. Push code: git push -u origin main"
    echo "4. Deploy on Vercel: https://vercel.com/new"
else
    echo "1. Run: ./deploy.sh (to deploy changes)"
    echo "2. Or manually: git push origin main" 
    echo "3. Check Vercel dashboard for deployment status"
fi

echo ""
echo "📱 Local dev server: cd portfolio && npm run dev"
echo "🌐 Live portfolio: Check Vercel dashboard for URL"
echo ""

print_status "Status check complete!"