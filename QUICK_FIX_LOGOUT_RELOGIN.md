# Quick Test - Logout and Re-login

## What's Happening

Your JWT token in the browser was created **before** we fixed the JWT service to include roles. So it doesn't have roles in it, even though new tokens do.

## Quick Fix

### Step 1: Logout in Browser
1. Click "LogOut" button in the navbar
2. You'll be logged out

### Step 2: Clear Browser Data
Press `F12` to open console, then run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Login Again
1. Go to http://localhost:5173
2. Click "Login"
3. Enter:
   - Email: `admin`
   - Password: `admin`
4. Click "Sign in"

### Step 4: Check Your New Token
Open console (F12) and run:
```javascript
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Roles in token:', payload.roles);
```

You should see:
```
Roles in token: ["ROLE_USER", "ROLE_ADMIN"]
```

### Step 5: Try Creating Auction Again
1. Navigate to "New Auction"
2. Fill in the form
3. Click "Create Auction Item"

## Expected Results

### If Backend Authorization is Fixed ✅
- Auction created successfully
- You see success message
- Redirected to auction list

### If Backend Authorization Still Broken ❌  
- Still get 403 error
- See "Permission denied" message
- This means the backend isn't properly checking roles (see `BACKEND_AUTHORIZATION_FIX.md`)

## Alternative: Use Backend Endpoint Directly to Test

While backend is being fixed, you can verify auction creation works via curl:

```bash
# 1. Get fresh admin token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.access_token')

echo "Token: $TOKEN"

# 2. Decode to verify roles
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.'

# 3. Try to create auction
curl -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test auction","type":"Electronics","successfulBid":100}' | jq '.'
```

If this returns 403, the backend authorization is definitely broken (roles not being checked properly).
If this returns 201 Created, then it's just your old token in the browser!

## Summary

**Your old token in browser doesn't have roles** → Logout and re-login to get new token with roles

Then if it still doesn't work, the backend needs the authorization fix described in `BACKEND_AUTHORIZATION_FIX.md`.
