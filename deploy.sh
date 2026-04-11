#!/bin/bash
# 🚀 Deploy script for game designer portfolio

echo "🎮 Deploying Abhishek's Game Designer Portfolio..."

# Colors for output
GREEN='\033[0;32m'
ORANGE='\033[0;33m' 
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${ORANGE}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "portfolio/package.json" ]; then
    print_error "portfolio/package.json not found. Run this script from the career-workspace root."
    exit 1
fi

# Build and test locally first
print_status "Building portfolio locally..."
cd portfolio

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    npm install
fi

# Run build
if npm run build; then
    print_status "Local build successful!"
else
    print_error "Local build failed. Fix errors before deploying."
    exit 1
fi

cd ..

# Check git status
if [[ -n $(git status --porcelain) ]]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    
    # Prompt for commit message
    echo "Enter commit message (or press Enter for default):"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update portfolio content and deploy"
    fi
    
    git commit -m "$commit_message"
    print_status "Changes committed!"
fi

# Push to GitHub (triggers Vercel deployment)
print_status "Pushing to GitHub..."
if git push origin main; then
    print_status "🎉 Code pushed to GitHub!"
    print_status "🚀 Vercel will automatically deploy your changes"
    print_status "📱 Check your deployment status at: https://vercel.com/dashboard"
else
    print_error "Failed to push to GitHub. Check your remote repository setup."
    exit 1
fi

echo ""
print_status "🎮 Deployment initiated successfully!"
echo -e "${ORANGE}⏱️  Your portfolio will be live in 2-3 minutes${NC}"
echo -e "${GREEN}🌐 Live URL: Check Vercel dashboard for your live URL${NC}"