# Debug Guide - Session Expired Issue

## 🔍 Added Comprehensive Logging

I've added detailed console logging to help us understand exactly what's happening when you get logged out.

## 📊 What to Check

### Step 1: Open Browser Console
1. Press `F12` or right-click → Inspect
2. Go to **Console** tab
3. Clear the console (trash icon)

### Step 2: Try Creating an Auction
1. Make sure you're logged in as **admin**
2. Navigate to "New Auction"
3. Fill in the form
4. Click "Create Auction Item"
5. **Watch the console output**

### Step 3: Look for These Console Messages

#### ✅ **Normal Flow (Success)**
```
Attempting to save auction item: {description: "...", type: "...", ...}
Event saved successfully: {id: 6, ...}
```

#### ❌ **If Token Refresh Triggered**
```
Axios interceptor caught error: {status: 403, url: "/auction-items", method: "post"}
Token check: {hasToken: true, status: 403}
Attempting to refresh token...
Refresh token check: {hasRefreshToken: true}
Calling /api/v1/auth/refresh endpoint...
```

Then either:
- **Success**: `Refresh successful, updating tokens` → `Token refreshed successfully, retrying request`
- **Failure**: `Token refresh failed with error:` → `Logging out user...`

## 🐛 Common Issues and Solutions

### Issue 1: No Admin Role
**Symptom**: You don't see "New Event" or "New Auction" links

**Check**:
```javascript
// In console, type:
localStorage.getItem('user')
```

**Should see**:
```json
{"id":1,"name":"admin","email":"admin@admin.com","roles":["ROLE_ADMIN"]}
```

**Solution**: Make sure you login with an admin account

### Issue 2: Token Not Being Sent
**Symptom**: Console shows "403 error with no token"

**Check**:
```javascript
// In console, type:
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

**Should see**: Long strings (JWT tokens)

**Solution**: Login again

### Issue 3: Backend Not Accepting Token
**Symptom**: Request gets 403 even with valid token

**Check**: Backend logs or test with curl:
```bash
# Get your token from console
TOKEN="your_token_here"

# Test the request
curl -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"test","type":"Electronics","successfulBid":0}'
```

**Expected**: 200 OK or 201 Created  
**If 403**: Backend issue - check backend logs

### Issue 4: Refresh Token Expired
**Symptom**: "No refresh token available" in console

**Solution**: 
1. Logout completely
2. Login again
3. Try creating auction

### Issue 5: CORS or Network Issues
**Symptom**: Network error before 403

**Check**: Network tab in DevTools
- Look for failed requests
- Check if OPTIONS (preflight) requests succeed
- Verify backend is running on port 8080

## 🧪 Test Sequence

### Test 1: Verify Login Status
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('user') || '{}')
const token = localStorage.getItem('access_token')
const refreshToken = localStorage.getItem('refresh_token')

console.log({
  isLoggedIn: !!user.id,
  isAdmin: user.roles?.includes('ROLE_ADMIN'),
  hasToken: !!token,
  hasRefreshToken: !!refreshToken,
  userName: user.name
})
```

**Expected Output**:
```javascript
{
  isLoggedIn: true,
  isAdmin: true,
  hasToken: true,
  hasRefreshToken: true,
  userName: "admin"
}
```

### Test 2: Test Auction Creation API Directly
```javascript
// In browser console (while logged in):
const token = localStorage.getItem('access_token')

fetch('http://localhost:8080/auction-items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    description: 'Test auction from console',
    type: 'Electronics',
    successfulBid: 100
  })
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err))
```

### Test 3: Check Backend Health
```bash
# Test if backend is running
curl http://localhost:8080/events

# Test authentication endpoint
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@admin.com","password":"admin"}'
```

## 📝 What the Logs Tell Us

### Log Pattern 1: Token Refresh Loop
```
Axios interceptor caught error: {status: 403, ...}
Attempting to refresh token...
Refresh token check: {hasRefreshToken: true}
Calling /api/v1/auth/refresh endpoint...
Token refresh failed with error: ...
Logging out user...
```
**Meaning**: Refresh token is invalid or expired  
**Solution**: Logout and login again

### Log Pattern 2: No Token
```
Axios interceptor caught error: {status: 403, ...}
Token check: {hasToken: false, status: 403}
403 error with no token - user not authenticated
```
**Meaning**: Not logged in  
**Solution**: Login first

### Log Pattern 3: Immediate Logout
```
Axios interceptor caught error: {status: 403, ...}
Token refresh already attempted, logging out...
Failed request details: {url: "/auction-items", ...}
```
**Meaning**: Token refresh was already tried and failed  
**Solution**: Check if refresh endpoint is working

### Log Pattern 4: Success
```
Attempting to save auction item: ...
Auction item saved successfully: ...
Successfully created auction item: ...
```
**Meaning**: Everything working!  
**No action needed** ✅

## 🔧 Quick Fixes

### Fix 1: Clear Everything and Start Fresh
```javascript
// In browser console:
localStorage.clear()
// Then reload page and login again
```

### Fix 2: Force Logout and Login
1. Click "Logout" button
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again with admin credentials

### Fix 3: Check Backend Token Configuration
The backend might have very short token expiry times. Check backend configuration for:
- Access token expiry (should be 15-30 minutes)
- Refresh token expiry (should be days/weeks)

## 📞 Report Back With

If still having issues, share these details:

1. **Console logs** when creating auction (copy all red errors)
2. **Network tab** - screenshot of failed requests
3. **localStorage values**:
   ```javascript
   {
     user: localStorage.getItem('user'),
     hasToken: !!localStorage.getItem('access_token'),
     hasRefreshToken: !!localStorage.getItem('refresh_token')
   }
   ```
4. **Backend logs** if accessible

## 🎯 Most Likely Causes

Based on the symptom "logout after creating auction":

1. **Backend rejects the POST** (70% likely)
   - Token format issue
   - Backend not accepting the token
   - CORS issue

2. **Refresh token invalid** (20% likely)
   - Refresh endpoint failing
   - Refresh token expired

3. **Race condition** (10% likely)
   - Multiple requests triggering multiple refresh attempts
   - Timing issue between create and redirect

The new logging will help us identify which one it is!
