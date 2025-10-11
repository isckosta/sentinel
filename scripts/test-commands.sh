#!/bin/bash

# Script para testar comandos do Sentinel manualmente
# Usage: ./scripts/test-commands.sh

echo "🛡️  Sentinel - Test Commands Script"
echo "===================================="
echo ""

# Build first
echo "📦 Building Sentinel..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
echo ""

# Test 1: Safe command
echo "Test 1: Safe command (should execute automatically)"
echo "---------------------------------------------------"
node dist/index.js echo "Hello, Sentinel!"
echo ""

# Test 2: Show stats
echo "Test 2: Show statistics"
echo "----------------------"
node dist/index.js stats
echo ""

# Test 3: Warning level command (interactive - skip in automated tests)
# echo "Test 3: Warning level command"
# echo "-----------------------------"
# node dist/index.js git push --force
# echo ""

echo "✅ All automated tests completed"
echo ""
echo "To test interactive commands, run manually:"
echo "  node dist/index.js git push --force"
echo "  node dist/index.js prisma migrate reset --force"
