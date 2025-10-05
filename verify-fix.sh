#!/bin/bash

# Frontend Token Fix Verification Script
# This script helps verify that the token persistence fix is working correctly

echo "🔍 Frontend Token Fix Verification"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if files were modified
echo "📁 Checking modified files..."
echo ""

if grep -q "initializeAuth" src/stores/auth.ts; then
    echo -e "${GREEN}✅ src/stores/auth.ts${NC} - initializeAuth() method found"
else
    echo -e "${RED}❌ src/stores/auth.ts${NC} - initializeAuth() method NOT found"
fi

if grep -q "authStore.initializeAuth()" src/main.ts; then
    echo -e "${GREEN}✅ src/main.ts${NC} - initializeAuth() call found"
else
    echo -e "${RED}❌ src/main.ts${NC} - initializeAuth() call NOT found"
fi

if grep -q "clearAuth" src/stores/auth.ts; then
    echo -e "${GREEN}✅ src/stores/auth.ts${NC} - clearAuth() method found"
else
    echo -e "${RED}❌ src/stores/auth.ts${NC} - clearAuth() method NOT found"
fi

if grep -q "isAuthenticated" src/stores/auth.ts; then
    echo -e "${GREEN}✅ src/stores/auth.ts${NC} - isAuthenticated getter found"
else
    echo -e "${RED}❌ src/stores/auth.ts${NC} - isAuthenticated getter NOT found"
fi

if [ -f "public/debug-auth.html" ]; then
    echo -e "${GREEN}✅ public/debug-auth.html${NC} - Debug tool exists"
else
    echo -e "${RED}❌ public/debug-auth.html${NC} - Debug tool NOT found"
fi

echo ""
echo "📚 Checking documentation..."
echo ""

if [ -f "FRONTEND_TOKEN_FIX.md" ]; then
    echo -e "${GREEN}✅ FRONTEND_TOKEN_FIX.md${NC} - Detailed docs exist"
else
    echo -e "${YELLOW}⚠️  FRONTEND_TOKEN_FIX.md${NC} - Documentation missing"
fi

if [ -f "QUICK_FIX_GUIDE.md" ]; then
    echo -e "${GREEN}✅ QUICK_FIX_GUIDE.md${NC} - Quick reference exists"
else
    echo -e "${YELLOW}⚠️  QUICK_FIX_GUIDE.md${NC} - Quick reference missing"
fi

if [ -f "FIX_SUMMARY.md" ]; then
    echo -e "${GREEN}✅ FIX_SUMMARY.md${NC} - Summary exists"
else
    echo -e "${YELLOW}⚠️  FIX_SUMMARY.md${NC} - Summary missing"
fi

echo ""
echo "🔧 Checking development environment..."
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules${NC} - Dependencies installed"
else
    echo -e "${RED}❌ node_modules${NC} - Run: npm install"
fi

# Check if dev server might be running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Dev Server${NC} - Running on port 5173"
else
    echo -e "${YELLOW}⚠️  Dev Server${NC} - Not running (run: npm run dev)"
fi

# Check if backend might be running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend${NC} - Running on port 8080"
else
    echo -e "${YELLOW}⚠️  Backend${NC} - Not detected on port 8080"
fi

echo ""
echo "=================================="
echo "📋 Next Steps:"
echo "=================================="
echo ""
echo "1. ${BLUE}Clear Storage:${NC}"
echo "   Open browser → F12 → Console"
echo "   Run: ${YELLOW}localStorage.clear(); sessionStorage.clear();${NC}"
echo ""
echo "2. ${BLUE}Restart Dev Server:${NC}"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. ${BLUE}Test Login:${NC}"
echo "   • Login with your credentials"
echo "   • Watch console for 🔐 ✅ 💾 logs"
echo "   • Refresh page (F5)"
echo "   • Should see 🔄 ✅ logs"
echo "   • Should STILL be logged in!"
echo ""
echo "4. ${BLUE}Test Debug Tool:${NC}"
echo "   Terminal: ${YELLOW}cd public && python3 -m http.server 8888${NC}"
echo "   Browser: ${YELLOW}http://localhost:8888/debug-auth.html${NC}"
echo ""
echo "=================================="
echo "📚 Documentation:"
echo "=================================="
echo ""
echo "• ${BLUE}Detailed Guide:${NC} FRONTEND_TOKEN_FIX.md"
echo "• ${BLUE}Quick Reference:${NC} QUICK_FIX_GUIDE.md"
echo "• ${BLUE}Summary:${NC} FIX_SUMMARY.md"
echo "• ${BLUE}Debug Tool:${NC} public/debug-auth.html"
echo ""
echo "=================================="
echo "🎉 Fix verification complete!"
echo "=================================="
