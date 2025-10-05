#!/bin/bash

echo "=== Testing Backend Authentication and Auction Creation ==="
echo ""

# Step 1: Login
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@admin.com","password":"admin"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "❌ Failed to get access token. Check if backend is running and credentials are correct."
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Step 2: Decode token to see roles
echo "2. Decoding JWT token to check roles..."
TOKEN_PAYLOAD=$(echo "$ACCESS_TOKEN" | cut -d'.' -f2)
# Add padding if needed
while [ $((${#TOKEN_PAYLOAD} % 4)) -ne 0 ]; do
  TOKEN_PAYLOAD="${TOKEN_PAYLOAD}="
done
DECODED=$(echo "$TOKEN_PAYLOAD" | base64 -d 2>/dev/null)
echo "Token payload:"
echo "$DECODED" | jq '.' 2>/dev/null || echo "$DECODED"
echo ""

# Step 3: Try to create auction
echo "3. Attempting to create auction item with token..."
CREATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test auction from script","type":"Electronics","successfulBid":100}')

HTTP_STATUS=$(echo "$CREATE_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ SUCCESS! Auction created successfully."
elif [ "$HTTP_STATUS" = "403" ]; then
  echo "❌ FAILED: 403 Forbidden - Backend security configuration is blocking this request."
  echo ""
  echo "Possible causes:"
  echo "  1. SecurityConfig doesn't allow ROLE_ADMIN to POST to /auction-items"
  echo "  2. JWT token doesn't contain ROLE_ADMIN (check decoded token above)"
  echo "  3. JWT filter isn't properly extracting roles from token"
  echo ""
  echo "See BACKEND_AI_PROMPT_SHORT.md for fix instructions."
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "❌ FAILED: 401 Unauthorized - Token is invalid or not being processed correctly."
else
  echo "❌ FAILED: Unexpected status code $HTTP_STATUS"
fi

echo ""
echo "=== Test Complete ==="
