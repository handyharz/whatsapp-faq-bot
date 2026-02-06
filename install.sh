#!/bin/bash

# Install script for WhatsApp FAQ Bot
# This ensures dependencies are installed correctly

set -e

echo "🚀 Installing WhatsApp FAQ Bot dependencies..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the whatsapp-faq-bot directory?"
    exit 1
fi

# Remove any existing node_modules to start fresh
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Remove pnpm workspace files if they exist
if [ -f "pnpm-lock.yaml" ]; then
    echo "🧹 Removing pnpm-lock.yaml..."
    rm -f pnpm-lock.yaml
fi

# Try npm first
if command -v npm &> /dev/null; then
    echo "📦 Installing with npm..."
    npm install --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Create .env file (if not exists):"
        echo "   cp .env.example .env"
        echo "2. Edit .env and set ADMIN_NUMBERS to your phone number"
        echo "3. Run: npm run dev"
        exit 0
    fi
fi

# Fallback to pnpm
if command -v pnpm &> /dev/null; then
    echo "📦 Installing with pnpm (standalone)..."
    pnpm install --no-workspace
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Create .env file (if not exists):"
        echo "   cp .env.example .env"
        echo "2. Edit .env and set ADMIN_NUMBERS to your phone number"
        echo "3. Run: npm run dev"
        exit 0
    fi
fi

echo "❌ Error: Could not install dependencies. Please install npm or pnpm."
exit 1
