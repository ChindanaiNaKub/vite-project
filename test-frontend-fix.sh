#!/bin/bash

# Frontend 403 Error Debugging Script
# This script will help diagnose and fix authentication issues

echo "=================================================="
echo "🔍 Frontend Authentication Debugger"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:8080"

echo "Step 1: Testing Backend Connectivity"
echo "--------------------------------------"
if curl -s --connect-timeout 5 "$BACKEND_URL/actuator/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is reachable${NC}"
else
    echo -e "${RED}✗ Backend is NOT reachable${NC}"
    echo -e "${YELLOW}  Make sure backend is running on port 8080${NC}"
    exit 1
fi

echo ""
echo "Step 2: Testing Authentication Endpoint"
echo "--------------------------------------"
AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/auth/authenticate" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}')

HTTP_CODE=$(echo "$AUTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$AUTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Authentication successful (HTTP $HTTP_CODE)${NC}"
    
    # Extract tokens using grep and sed (more portable than jq)
    ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
    REFRESH_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"refresh_token":"[^"]*' | sed 's/"refresh_token":"//')
    
    if [ -n "$ACCESS_TOKEN" ]; then
        echo -e "${GREEN}✓ Received access_token: ${ACCESS_TOKEN:0:50}...${NC}"
    else
        echo -e "${RED}✗ No access_token in response${NC}"
        exit 1
    fi
    
    if [ -n "$REFRESH_TOKEN" ]; then
        echo -e "${GREEN}✓ Received refresh_token: ${REFRESH_TOKEN:0:50}...${NC}"
    fi
else
    echo -e "${RED}✗ Authentication failed (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}Response: $RESPONSE_BODY${NC}"
    exit 1
fi

echo ""
echo "Step 3: Testing Auction Creation with Token"
echo "--------------------------------------"
AUCTION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auction-items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "name": "Test Auction",
        "description": "Testing from script",
        "startingPrice": 100,
        "auctionEnd": "2025-10-15T10:00:00"
    }')

AUCTION_HTTP_CODE=$(echo "$AUCTION_RESPONSE" | tail -n1)
AUCTION_BODY=$(echo "$AUCTION_RESPONSE" | sed '$d')

if [ "$AUCTION_HTTP_CODE" -eq 200 ] || [ "$AUCTION_HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Auction created successfully (HTTP $AUCTION_HTTP_CODE)${NC}"
    echo -e "${GREEN}Response: $AUCTION_BODY${NC}"
else
    echo -e "${RED}✗ Auction creation failed (HTTP $AUCTION_HTTP_CODE)${NC}"
    echo -e "${YELLOW}Response: $AUCTION_BODY${NC}"
    exit 1
fi

echo ""
echo "Step 4: Frontend Diagnosis"
echo "--------------------------------------"
echo -e "${BLUE}Backend is working correctly!${NC}"
echo ""
echo -e "${YELLOW}If your frontend is still getting 403 errors, the issue is:${NC}"
echo -e "  1. ${YELLOW}Frontend is not storing the token correctly after login${NC}"
echo -e "  2. ${YELLOW}Frontend is not sending the Authorization header${NC}"
echo -e "  3. ${YELLOW}Old/invalid token is stored in browser localStorage${NC}"
echo ""
echo -e "${BLUE}Solutions:${NC}"
echo -e "  1. Open your browser DevTools (F12)"
echo -e "  2. Go to Console tab"
echo -e "  3. Run: ${GREEN}localStorage.clear(); sessionStorage.clear();${NC}"
echo -e "  4. Hard refresh: ${GREEN}Ctrl+Shift+R${NC}"
echo -e "  5. Login again from your frontend"
echo ""
echo -e "${BLUE}Debug your frontend:${NC}"
echo -e "  1. Open: ${GREEN}test-frontend-auth.html${NC} in your browser"
echo -e "  2. This file has interactive debugging tools"
echo ""
echo -e "${BLUE}Check Network Tab:${NC}"
echo -e "  1. Open DevTools > Network tab"
echo -e "  2. Try to create an auction"
echo -e "  3. Look for the POST request to /auction-items"
echo -e "  4. Check if 'Authorization: Bearer ...' header is present"
echo ""
echo "=================================================="
echo -e "${GREEN}✓ Backend diagnostics complete${NC}"
echo "=================================================="
