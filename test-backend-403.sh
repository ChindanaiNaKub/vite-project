#!/bin/bash

echo "🧪 Testing Backend Permission Issue"
echo "===================================="
echo ""

# Get token from localStorage (you'll need to paste it)
echo "📋 Step 1: Get your token from browser localStorage"
echo "   Run this in browser console:"
echo "   localStorage.getItem('access_token')"
echo ""
read -p "Paste your token here: " TOKEN

echo ""
echo "🔍 Step 2: Decoding token to check roles..."
# Decode JWT payload (base64 -d on Linux, base64 -D on Mac)
PAYLOAD=$(echo $TOKEN | cut -d. -f2)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo $PAYLOAD | base64 -D 2>/dev/null | jq '.' || echo $PAYLOAD | base64 -D
else
    echo $PAYLOAD | base64 -d 2>/dev/null | jq '.' || echo $PAYLOAD | base64 -d
fi

echo ""
echo "🚀 Step 3: Testing POST to /auction-items with your token..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Auction Item",
    "type": "Electronics",
    "successfulBid": 0
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo ""
echo "📊 Results:"
echo "==========="
echo "HTTP Status: $HTTP_STATUS"
echo "Response Body: $BODY"
echo ""

if [ "$HTTP_STATUS" == "403" ]; then
    echo "❌ CONFIRMED: Backend is rejecting the request with 403!"
    echo ""
    echo "🔧 Fix Required in Backend SecurityConfig.java:"
    echo "   Add this line:"
    echo "   .requestMatchers(HttpMethod.POST, \"/auction-items\").hasRole(\"ADMIN\")"
    echo ""
elif [ "$HTTP_STATUS" == "201" ] || [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ SUCCESS: Backend accepted the request!"
    echo "   The issue might be something else in your frontend."
else
    echo "⚠️  Unexpected status code: $HTTP_STATUS"
    echo "   Check if backend is running on http://localhost:8080"
fi
