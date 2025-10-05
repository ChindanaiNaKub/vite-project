#!/bin/bash

# Script to help you fix the logout issue after creating auction

echo "=============================================="
echo "🔧 Fix for: Getting Logged Out After Create"
echo "=============================================="
echo ""

echo "📋 Your Problem:"
echo "   • You can create an auction successfully"
echo "   • But then you get logged out immediately"
echo ""

echo "🔍 Root Cause:"
echo "   • Your refresh_token is OLD/INVALID (from before backend reset)"
echo "   • After creating auction, the app tries to refresh the token"
echo "   • Refresh fails because refresh_token is invalid"
echo "   • App logs you out"
echo ""

echo "✅ Solution:"
echo "   1. Clear ALL storage (including refresh_token)"
echo "   2. Login again to get BOTH new tokens"
echo ""

echo "================================================"
echo "🚀 FOLLOW THESE STEPS IN YOUR BROWSER:"
echo "================================================"
echo ""
echo "1. Open DevTools (Press F12)"
echo ""
echo "2. Go to Console tab"
echo ""
echo "3. Run this command:"
echo ""
echo "   localStorage.clear(); sessionStorage.clear();"
echo ""
echo "4. You should see:"
echo "   undefined"
echo ""
echo "5. Verify it's cleared:"
echo ""
echo "   console.log('Storage cleared:', Object.keys(localStorage).length === 0)"
echo ""
echo "6. Should show: Storage cleared: true"
echo ""
echo "7. Hard refresh the page:"
echo "   Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo ""
echo "8. Login again with:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "9. Now try creating an auction"
echo ""
echo "================================================"
echo "✅ After this, you won't be logged out!"
echo "================================================"
echo ""

read -p "Press Enter when you've completed these steps..."

echo ""
echo "🔍 Verifying backend is still working..."
echo ""

# Test backend
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/api/v1/auth/authenticate" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Backend is working correctly"
    echo "✅ You should be able to login now"
else
    echo "❌ Backend might not be running"
    echo "   Make sure backend is on port 8080"
fi

echo ""
echo "================================================"
echo "💡 Why This Happened:"
echo "================================================"
echo ""
echo "When backend database was reset:"
echo "  • Your access_token became invalid"
echo "  • Your refresh_token ALSO became invalid"
echo "  • You only cleared and got new access_token"
echo "  • But refresh_token was still old"
echo "  • When app tried to refresh, it failed"
echo "  • So you got logged out"
echo ""
echo "The fix:"
echo "  • Clear EVERYTHING (both tokens)"
echo "  • Login fresh"
echo "  • Get both new tokens"
echo "  • Everything works! ✅"
echo ""
echo "================================================"
