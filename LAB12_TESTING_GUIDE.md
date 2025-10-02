# Lab 12 Frontend - Testing Guide

## Prerequisites
- Backend server running with Spring Security configured
- Frontend dev server running (`npm run dev`)
- Browser with developer tools

## Test Scenarios

### 1. Test Unauthenticated Access
**Goal**: Verify that protected routes require authentication

1. Open browser to `http://localhost:5173`
2. Open Developer Console > Network tab
3. Try to access event list
4. **Expected**: You should see events if GET /events is public
5. **Expected**: Other API calls should fail with 401 if not authenticated

### 2. Test Login Page Access
**Goal**: Verify login page is accessible

1. Navigate to `http://localhost:5173/login`
2. **Expected**: See login form with email and password fields

### 3. Test Form Validation
**Goal**: Verify client-side validation works

1. On login page, click "Sign in" without entering anything
2. **Expected**: Error messages appear for both fields
3. Enter text in email field (not email format if you had email validation)
4. **Expected**: Email field error disappears when valid

### 4. Test Invalid Login
**Goal**: Verify error handling for wrong credentials

1. Enter invalid username: `wronguser`
2. Enter invalid password: `wrongpass`
3. Click "Sign in"
4. **Expected**: 
   - Flash message appears: "Could not login"
   - Message disappears after 3 seconds
   - User stays on login page

### 5. Test Successful Login (Regular User)
**Goal**: Verify authentication flow for regular user

1. Enter username: `user`
2. Enter password: `user`
3. Click "Sign in"
4. **Expected**:
   - Redirected to event list page
   - Navbar shows user profile with name "user"
   - Logout button visible
   - Login/Signup buttons hidden
   - **"New Event" menu NOT visible** (not admin)

### 6. Test LocalStorage Persistence
**Goal**: Verify auth state persists across page reloads

1. While logged in, open Developer Console > Application tab
2. Check localStorage items:
   - `access_token` should exist
   - `user` should exist with user data
3. Refresh the page (F5)
4. **Expected**:
   - Still logged in
   - User name still visible in navbar
   - No redirect to login page

### 7. Test Authenticated API Calls
**Goal**: Verify JWT token is sent with requests

1. While logged in, open Developer Console > Network tab
2. Navigate to event list
3. Click on any API call (e.g., `/events`)
4. Check Request Headers
5. **Expected**: 
   - `Authorization: Bearer <token>` header present
   - Token matches what's in localStorage

### 8. Test Logout Functionality
**Goal**: Verify logout clears auth state

1. While logged in, click "LogOut" button
2. **Expected**:
   - Redirected to login page
   - Token cleared from localStorage
   - User data cleared from localStorage
   - Navbar shows Login/Signup buttons again

### 9. Test Admin Login
**Goal**: Verify role-based UI for admin users

1. Navigate to `/login`
2. Enter username: `admin`
3. Enter password: `admin`
4. Click "Sign in"
5. **Expected**:
   - Logged in successfully
   - Navbar shows user profile with name "admin"
   - **"New Event" menu IS visible** (admin role)
   - Can access admin-only features

### 10. Test Image Upload Authorization
**Goal**: Verify uploads include auth token

1. Login as any user
2. Navigate to "New Event" page (if admin) or "New Organization"
3. Try to upload an image
4. Open Network tab
5. **Expected**:
   - Upload request includes `Authorization` header
   - Upload succeeds (if backend allows)

### 11. Test Navigation with Auth State
**Goal**: Verify navigation works correctly with auth

**When Logged Out:**
- Home link works
- Organizations link works
- About link works
- Auctions link works
- Login/Signup buttons visible
- New Event hidden

**When Logged In (Regular User):**
- All above links work
- Profile link appears (though page may not exist)
- Logout button works
- New Event still hidden

**When Logged In (Admin):**
- All links work
- New Event link visible and works
- Can create events

### 12. Test Token Expiration (Manual)
**Goal**: Verify behavior when token expires

1. Login successfully
2. Open localStorage in DevTools
3. Manually change or delete `access_token`
4. Try to make an API call
5. **Expected**: Request fails with 401

## Backend Requirements

Make sure your backend has these endpoints configured:

1. `POST /api/v1/auth/authenticate` - accepts username/password
2. Returns JSON with:
   ```json
   {
     "access_token": "jwt-token-here",
     "refresh_token": "refresh-token-here",
     "user": {
       "id": 1,
       "name": "User Name",
       "roles": ["ROLE_USER"] // or ["ROLE_USER", "ROLE_ADMIN"]
     }
   }
   ```

## Test Users (from backend InitApp.java)

| Username | Password | Roles | Enabled |
|----------|----------|-------|---------|
| admin | admin | ROLE_USER, ROLE_ADMIN | true |
| user | user | ROLE_USER | true |
| disableUser | disableUser | ROLE_USER | false |

## Common Issues and Solutions

### Issue: CORS Error
**Solution**: Ensure backend SecurityConfiguration allows your frontend origin

### Issue: 401 on all requests
**Solution**: Check that:
- Token is being stored in localStorage
- Axios interceptor is imported in main.ts
- Token is being added to headers

### Issue: Login button doesn't work
**Solution**: Check:
- Backend is running
- VITE_BACKEND_URL is correct in .env
- Network tab for actual error

### Issue: Navigation doesn't update after login
**Solution**: Check:
- Auth store is properly updating state
- Pinia dev tools to verify state changes
- Vue dev tools to check reactive updates

### Issue: "New Event" visible for non-admin
**Solution**: Check:
- User roles in localStorage
- `isAdmin` getter in auth store
- v-if condition in App.vue

## Verification Checklist

- [ ] Login form renders correctly
- [ ] Form validation works
- [ ] Invalid login shows error
- [ ] Valid login redirects to home
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Navbar updates after login
- [ ] Authorization header in API calls
- [ ] Logout clears auth state
- [ ] Page reload maintains login
- [ ] Admin sees "New Event" menu
- [ ] Regular user doesn't see "New Event"
- [ ] Image uploads include auth header
- [ ] All services use shared axios client

---

**Note**: This guide assumes you've completed all the lab steps and have the backend properly configured with Spring Security and JWT authentication.
