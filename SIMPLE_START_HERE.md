# 🚀 Quick Start - Simplified Lab 12 Frontend

## ✨ What Changed?

Your frontend has been simplified to match Lab 12 requirements:
- ❌ Removed complex token refresh mechanism
- ❌ Removed auto-logout on errors
- ❌ Removed session expiry detection
- ✅ Simple login/logout with localStorage persistence
- ✅ Basic JWT token injection in API calls
- ✅ Role-based UI (admin vs user)

---

## 🏃 Quick Start (3 Steps)

### Step 1: Clear Old Data (30 seconds)
Open browser console (F12) and run:
```javascript
localStorage.clear()
sessionStorage.clear()
```

### Step 2: Start Dev Server (if not running)
```bash
npm run dev
```

### Step 3: Test Login (1 minute)
1. Go to http://localhost:5173/login
2. Login with: `admin` / `admin`
3. Should redirect to event list
4. Should see "admin" in navbar
5. Should see "New Event" menu
6. Press F5 - should stay logged in! ✅

---

## 🧪 Test Checklist

- [ ] ✅ Login works
- [ ] ✅ Page refresh keeps you logged in
- [ ] ✅ API calls include Authorization header
- [ ] ✅ Admin sees "New Event" menu
- [ ] ✅ Regular user doesn't see "New Event"
- [ ] ✅ Logout clears everything
- [ ] ✅ Can login again after logout

---

## 🎓 Test Accounts

| Username | Password | Role | Special Access |
|----------|----------|------|----------------|
| `admin` | `admin` | Admin | ✅ New Event menu |
| `user` | `user` | User | ❌ No New Event |

---

## 🔍 How It Works Now

### Login Process
```
User enters credentials
    ↓
POST /api/v1/auth/authenticate
    ↓
Receive: { access_token, user }
    ↓
Save to localStorage + Pinia
    ↓
Redirect to event list
```

### API Requests
```
User makes request
    ↓
Interceptor adds: Authorization: Bearer <token>
    ↓
Request sent to backend
    ↓
Response received
```

### Page Refresh
```
App loads
    ↓
Read token + user from localStorage
    ↓
Load into Pinia store
    ↓
User stays logged in ✅
```

---

## 🐛 Troubleshooting

### Problem: Not staying logged in after refresh
**Solution:**
```javascript
// Clear everything
localStorage.clear()
sessionStorage.clear()
// Refresh
location.reload()
// Login again
```

### Problem: 403 errors on API calls
**Solution:**
```javascript
// Clear old tokens
localStorage.clear()
sessionStorage.clear()
// Login again
```

### Problem: Can't see "New Event" menu
**Check:**
- Logged in as `admin` (not `user`)
- Token is valid in localStorage
- User object has ROLE_ADMIN

---

## 📊 Verify Token in Console

```javascript
// Check if logged in
localStorage.getItem('access_token') ? '✅ Logged in' : '❌ Not logged in'

// Check user
JSON.parse(localStorage.getItem('user'))

// Check token (first 50 chars)
localStorage.getItem('access_token')?.substring(0, 50)
```

---

## 🎯 What's Different from Before

| Feature | Before (Complex) | Now (Simple) |
|---------|------------------|--------------|
| Token refresh | ✅ Auto every 55 min | ❌ None |
| Session expiry | ✅ Auto-detect | ❌ Manual clear if needed |
| 401/403 handling | ✅ Auto-logout | ❌ Show error |
| Lines of code | ~700+ | ~200 |
| Complexity | High | Low |
| Lab compliance | Extra features | Exact match ✅ |

---

## ✅ Success Indicators

You'll know it works when:

1. ✅ Login redirects to event list
2. ✅ User name appears in navbar
3. ✅ Admin sees "New Event" menu
4. ✅ F5 refresh keeps you logged in
5. ✅ API calls have Authorization header
6. ✅ Logout clears everything
7. ✅ No console errors

---

## 📚 Quick Reference

### Login
```
URL: http://localhost:5173/login
Credentials: admin / admin
Expected: Redirect to event list
```

### Check Auth State (Console)
```javascript
// Import store in browser console won't work,
// but you can check localStorage:
console.log('Token:', localStorage.getItem('access_token') ? '✅' : '❌')
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'))
```

### Manual Logout (Console)
```javascript
localStorage.removeItem('access_token')
localStorage.removeItem('user')
location.reload()
```

---

## 🎉 You're Ready!

Your frontend is now simplified and matches Lab 12 requirements exactly:
- ✅ Simple and clean code
- ✅ Easy to understand
- ✅ Fewer bugs
- ✅ Perfect for learning JWT basics

Just follow the 3 steps at the top and you're good to go!

---

## 📖 More Information

- **Full Changes**: See `SIMPLIFICATION_SUMMARY.md`
- **Lab Requirements**: See `lab12.md`
- **Architecture**: See `LAB12_ARCHITECTURE.md`

---

**Status**: ✅ Simplified & Ready  
**Time to Test**: 2 minutes  
**Complexity**: Low (as intended for lab)
