# Frontend Debugging Guide - 403 Error Fix

## Current Issue
Your browser console shows: `Request failed with status code 403`

This means: **Your frontend is NOT sending a valid JWT token** to the backend.

## Root Cause
The backend database was wiped and recreated. Your old token stored in the frontend's localStorage/sessionStorage is **no longer valid** because it doesn't exist in the new database.

## Step-by-Step Fix

### Step 1: Clear Frontend Storage (CRITICAL!)

Open your browser's DevTools (F12) and run these commands in the Console tab:

```javascript
// Clear ALL storage
localStorage.clear();
sessionStorage.clear();

// Verify it's cleared
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('SessionStorage keys:', Object.keys(sessionStorage));
```

### Step 2: Verify Backend is Working

Test the backend is responding correctly:

```bash
# In your terminal
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq .
```

You should see:
```json
{
  "user": {
    "id": 1,
    "name": "admin admin",
    "roles": ["ROLE_USER", "ROLE_ADMIN"]
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Step 3: Hard Refresh Your Frontend

1. Close ALL browser tabs with your frontend
2. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) for hard refresh
3. Or use Incognito/Private mode for a clean state

### Step 4: Login Again from Frontend

1. Go to your login page: `http://localhost:5173/login` (or wherever your login is)
2. Enter credentials:
   - **Username**: `admin`
   - **Password**: `admin`
3. Click Login

### Step 5: Verify Token is Stored

After logging in, check in DevTools Console:

```javascript
// Check what's stored (adjust key names based on your app)
console.log('Token:', localStorage.getItem('token'));
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('User:', localStorage.getItem('user'));

// Show all localStorage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}:`, localStorage.getItem(key));
}
```

### Step 6: Check Network Tab

When you try to create an auction, open DevTools Network tab and check:

1. **Find the POST request to `/auction-items`**
2. **Click on it** and check "Headers" tab
3. **Look for "Request Headers"** section
4. **Verify "Authorization" header** is present and looks like:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1VTRVIiLCJST0xFX0FETUlOIl0...
   ```

## Common Issues and Solutions

### Issue 1: No Authorization Header
**Problem**: Network tab shows no `Authorization` header in the request

**Solution**: Your frontend Axios interceptor is not working. Check:
```javascript
// Your Axios interceptor should look like this:
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // or your token key
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Issue 2: Token Format is Wrong
**Problem**: Authorization header exists but doesn't start with "Bearer "

**Solution**: Make sure you're adding "Bearer " prefix:
```javascript
// WRONG
config.headers['Authorization'] = token;

// CORRECT
config.headers['Authorization'] = `Bearer ${token}`;
```

### Issue 3: Token is Expired
**Problem**: Token looks correct but still getting 403

**Solution**: Tokens expire after 1 hour. Login again to get a fresh token.

### Issue 4: CORS Preflight Failing
**Problem**: Network tab shows OPTIONS request failing

**Solution**: Backend CORS is already configured. But if you see CORS errors:
- Check that frontend is running on `http://localhost:5173`
- Don't use `http://127.0.0.1:5173` (different origin!)

## Debug Checklist

Before asking for help, verify ALL of these:

- [ ] Cleared localStorage and sessionStorage
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Logged in again from frontend
- [ ] Token is stored in localStorage/sessionStorage
- [ ] Token starts with "eyJ" (valid JWT format)
- [ ] Network tab shows Authorization header in request
- [ ] Authorization header has "Bearer " prefix
- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 5173
- [ ] No CORS errors in console

## Test Your Axios Setup

Add this to your frontend code temporarily to debug:

```javascript
// Add this BEFORE your API call
axios.interceptors.request.use(request => {
  console.log('🚀 Starting Request:', request);
  console.log('📝 Headers:', request.headers);
  console.log('🔑 Authorization:', request.headers.Authorization);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status);
    return response;
  },
  error => {
    console.log('❌ Error Response:', error.response);
    console.log('❌ Error Status:', error.response?.status);
    console.log('❌ Error Data:', error.response?.data);
    return Promise.reject(error);
  }
);
```

## Backend Test (Verify Backend Works)

Run this in your terminal to prove backend is working:

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.access_token')

echo "Token: ${TOKEN:0:50}..."

# Create auction
curl -v -X POST http://localhost:8080/auction-items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Backend Test",
    "description": "Testing backend directly",
    "startingPrice": 100,
    "auctionEnd": "2025-10-15T10:00:00"
  }'
```

If this works (returns HTTP 201), then your backend is fine and the issue is purely frontend.

## Quick Frontend Test

In your browser console, test the API directly:

```javascript
// Test login
fetch('http://localhost:8080/api/v1/auth/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin' })
})
.then(r => r.json())
.then(data => {
  console.log('Login successful:', data);
  window.testToken = data.access_token;
  
  // Test create auction
  return fetch('http://localhost:8080/auction-items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.testToken}`
    },
    body: JSON.stringify({
      name: 'Browser Console Test',
      description: 'Testing from console',
      startingPrice: 100,
      auctionEnd: '2025-10-15T10:00:00'
    })
  });
})
.then(r => r.json())
.then(data => console.log('Auction created:', data))
.catch(err => console.error('Error:', err));
```

If this works in the console but not in your app, then your frontend code has an issue with how it's storing/sending the token.

## Expected Behavior

✅ **WORKING**:
1. Login → Get token → Store token
2. Create auction → Send "Authorization: Bearer <token>" header → Get HTTP 201

❌ **NOT WORKING** (Your current state):
1. Login → Get OLD token from storage
2. Create auction → Send old/missing token → Get HTTP 403

## Need More Help?

If you've done ALL the steps above and still getting 403:

1. **Take a screenshot** of:
   - Browser Network tab showing the POST request headers
   - Browser Console showing any errors
   - Browser Application/Storage tab showing localStorage

2. **Share your frontend code** for:
   - Axios interceptor setup
   - Token storage after login
   - API call to create auction

3. **Check backend logs** for any authentication errors:
   ```bash
   tail -f /tmp/backend.log | grep -i "auth\|403\|jwt"
   ```

---

## TL;DR - Quick Fix

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Run**: `localStorage.clear(); sessionStorage.clear();`
4. **Hard refresh**: Press `Ctrl+Shift+R`
5. **Login again** from your frontend with `admin`/`admin`
6. **Try creating auction** - should work now!

If it still doesn't work, your frontend is not storing or sending the token correctly. Check the Axios interceptor.

---

## Checking Your Current Axios Interceptor Setup

Let me verify your current setup:

### Current Files to Check:

1. **`src/services/AxiosInrceptorSetup.ts`** (note the typo in filename)
2. **`src/stores/auth.ts`** - Check how token is stored after login
3. **`src/services/AuctionService.ts`** - Check how API calls are made

### What Should Be Happening:

```typescript
// In AxiosInterceptorSetup.ts (or similar)
import axios from 'axios'

// Request interceptor - adds token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handles 401/403 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid - clear and redirect to login
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Verify Token Storage After Login:

```typescript
// In auth.ts store
export const useAuthStore = defineStore('auth', () => {
  const login = async (username: string, password: string) => {
    const response = await axios.post('/api/v1/auth/authenticate', {
      username,
      password
    })
    
    // CRITICAL: Store the tokens
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    return response.data
  }
  
  return { login }
})
```

---

## Final Troubleshooting Steps

If you're still stuck, run these commands in sequence:

```bash
# 1. Verify backend is running
curl http://localhost:8080/actuator/health

# 2. Test authentication
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 3. Test with the token (replace TOKEN with actual token from step 2)
curl -X GET http://localhost:8080/auction-items \
  -H "Authorization: Bearer TOKEN"
```

If all three work, your backend is fine. The issue is 100% in your frontend token handling.
