#!/bin/bash

echo "🧪 Backend Permission Test - Detailed Version"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "📡 Test 1: Checking if backend is running..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" == "000" ]; then
    echo -e "${RED}❌ Backend is NOT running on http://localhost:8080${NC}"
    echo "   Please start your Spring Boot backend first!"
    exit 1
elif [ "$HEALTH_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend responded with status: $HEALTH_CHECK${NC}"
fi

echo ""
echo "📋 Test 2: Get your access token"
echo "   Open browser console (F12) and run:"
echo "   ${YELLOW}localStorage.getItem('access_token')${NC}"
echo ""
read -p "Paste your token here: " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No token provided!${NC}"
    exit 1
fi

echo ""
echo "🔍 Test 3: Decoding token..."
PAYLOAD=$(echo $TOKEN | cut -d. -f2)
# Add padding if needed
PADDING=$((4 - ${#PAYLOAD} % 4))
if [ $PADDING -ne 4 ]; then
    PAYLOAD="${PAYLOAD}$(printf '='%.0s $(seq 1 $PADDING))"
fi

# Decode based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    DECODED=$(echo $PAYLOAD | base64 -D 2>/dev/null)
else
    DECODED=$(echo $PAYLOAD | base64 -d 2>/dev/null)
fi

echo "$DECODED" | jq '.' 2>/dev/null || echo "$DECODED"

echo ""
echo "🚀 Test 4: Testing POST to /auction-items..."
echo "   Endpoint: http://localhost:8080/auction-items"
echo "   Method: POST"
echo "   Headers: Authorization: Bearer <token>"
echo ""

RESPONSE=$(curl -v -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Auction Item",
    "type": "Electronics",
    "successfulBid": 100
  }' 2>&1)

HTTP_STATUS=$(echo "$RESPONSE" | grep "< HTTP" | awk '{print $3}')
echo ""
echo "📊 Results:"
echo "==========="
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" == "403" ]; then
    echo -e "${RED}❌ 403 FORBIDDEN - Backend is rejecting the request!${NC}"
    echo ""
    echo "Possible causes:"
    echo "1. JWT roles are not being extracted correctly"
    echo "2. The role format doesn't match what Spring Security expects"
    echo "3. JwtAuthenticationFilter has an issue"
    echo ""
    echo "🔧 Check your JwtAuthenticationFilter:"
    echo "   - Does it extract 'roles' from the JWT?"
    echo "   - Does it convert them to Spring Security GrantedAuthorities?"
    echo "   - Are the authorities prefixed with 'ROLE_'?"
    
elif [ "$HTTP_STATUS" == "201" ] || [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! Backend accepted the request!${NC}"
    echo ""
    echo "The backend is working correctly."
    echo "If you're still getting 403 in the browser, check:"
    echo "1. Are you sending the request to the right URL?"
    echo "2. Is there a proxy or different backend being used?"
    
elif [ "$HTTP_STATUS" == "401" ]; then
    echo -e "${RED}❌ 401 UNAUTHORIZED - Token is not being recognized!${NC}"
    echo ""
    echo "Possible causes:"
    echo "1. JWT secret key mismatch"
    echo "2. Token signature is invalid"
    echo "3. JwtAuthenticationFilter is not processing the token"
    
else
    echo -e "${YELLOW}⚠️  Unexpected status: $HTTP_STATUS${NC}"
fi

echo ""
echo "Full response details:"
echo "======================"
echo "$RESPONSE" | grep -E "(< HTTP|< WWW-Authenticate|< Access-Control|Authorization|error)"
