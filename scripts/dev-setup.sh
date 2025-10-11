#!/bin/bash

# Development setup script
# Sets up the development environment for Sentinel

echo "🛡️  Sentinel - Development Setup"
echo "================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ is required. Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "⚠️  Some tests failed"
else
  echo "✅ All tests passed"
fi

echo ""

# Create symlink for local testing
echo "🔗 Creating local symlink..."
npm link

if [ $? -ne 0 ]; then
  echo "⚠️  Failed to create symlink (may need sudo)"
else
  echo "✅ Symlink created - you can now use 'sentinel' command globally"
fi

echo ""
echo "✅ Development setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev        - Run with ts-node"
echo "  npm run build      - Build TypeScript"
echo "  npm test           - Run tests"
echo "  npm run lint       - Run linter"
echo "  sentinel           - Use CLI globally (after npm link)"
echo ""
echo "Try: sentinel echo 'Hello, Sentinel!'"
