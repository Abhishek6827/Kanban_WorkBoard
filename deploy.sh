#!/bin/bash

echo "🚀 WorkBoard Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote repository found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/workboard-app.git"
    exit 1
fi

echo "✅ Git repository found"

# Build frontend
echo "📦 Building frontend..."
cd workboards
npm install
npm run build
cd ..

# Commit changes
echo "💾 Committing changes..."
git add .
git commit -m "Deploy: Prepare for production deployment"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Sign in with GitHub"
echo "3. Create new project from your repository"
echo "4. Deploy backend (workboard folder)"
echo "5. Deploy frontend (workboards folder)"
echo "6. Configure environment variables"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"