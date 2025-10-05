# QUICK PROMPT FOR BACKEND AI

I have a Spring Boot backend with JWT authentication. Admin users are getting **403 Forbidden** when trying to POST to `/auction-items` and `/events`, even though they have valid JWT tokens with ROLE_ADMIN. The `/api/v1/auth/refresh` endpoint is also returning 403.

## Current Issue:
1. Admin logs in successfully and gets JWT token
2. Admin tries to create auction: `POST /auction-items` with `Authorization: Bearer <token>` → **403 Forbidden**
3. Frontend tries to refresh token: `POST /api/v1/auth/refresh` with `{refresh_token: "..."}` → **403 Forbidden**
4. User gets logged out

## What I Need Fixed:

1. **SecurityConfig** - Allow ROLE_ADMIN to POST to `/auction-items` and `/events`
2. **SecurityConfig** - Make sure `/api/v1/auth/refresh` is `permitAll()`
3. **JWT Filter** - Skip authentication for `/api/v1/auth/**` endpoints
4. **CORS** - Allow POST requests with Authorization header from `http://localhost:5173`
5. **Refresh endpoint** - Should NOT require Authorization header, only `refresh_token` in body

Please show me the corrected SecurityConfig, CORS config, and JWT filter code to fix these 403 errors.

## Test commands to verify the fix:
```bash
# Test login (should work)
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@admin.com","password":"admin"}'

# Test create auction (currently 403, should be 201)
curl -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"test","type":"Electronics","successfulBid":100}'

# Test refresh (currently 403, should be 200)
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```
