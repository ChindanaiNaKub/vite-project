# Event Creation and Navigation Issues - FIXED

## Issues Fixed

### 1. **Event "neymar" Not Showing After Creation**
**Root Cause**: Backend returned `403 Forbidden` when trying to create the event. This means **you need to be logged in** to create events.

**Why the event wasn't created**:
- The backend requires authentication (JWT token) to create events
- When you tried to create "neymar" event, the request was rejected with 403 error
- The interceptor should have redirected you to login, but the error handling wasn't clear enough

**Solution Implemented**:
- Enhanced error handling in `EventFormView.vue` to detect 401/403 errors
- Now shows a clear message: "You must be logged in to create an event"
- Automatically redirects to login page after 2 seconds
- After login, you can return to create the event

### 2. **Page Frozen/Stuck - Navigation Not Working**
**Root Cause**: The `watchEffect` hook was running continuously and creating infinite loops, blocking navigation.

**Why navigation was broken**:
- `watchEffect` runs immediately and whenever ANY reactive dependency changes
- It was watching page, pageSize, keyword, and even the events data itself
- This created circular dependencies that prevented route changes

**Solution Implemented**:
- Replaced `watchEffect` with explicit `watch` statements
- Created a dedicated `fetchEvents()` function
- Now watches specific values: `[page, pageSize]` and `keyword` separately
- Navigation is no longer blocked

## Changes Made

### File: `src/views/EventListView.vue`

#### Before (BROKEN):
```typescript
import { ref, onMounted, computed, watchEffect } from 'vue'

onMounted(() => {
  watchEffect(() => {  // ❌ Runs continuously, blocks navigation
    EventService.getEvents(1, page.value)  // ❌ Wrong pageSize
      .then((response) => {
        events.value = response.data
        totalEvents.value = Number(response.headers['x-total-count'])
      })
    updateKeyword(keyword.value)  // ❌ Duplicate fetch
  })  
})
```

#### After (FIXED):
```typescript
import { ref, onMounted, computed, watch } from 'vue'

function fetchEvents() {
  if (keyword.value === '') {
    EventService.getEvents(pageSize.value, page.value)
      .then((response) => {
        events.value = response.data
        totalEvents.value = Number(response.headers['x-total-count'])
      })
  } else {
    updateKeyword(keyword.value)
  }
}

onMounted(() => {
  fetchEvents()
})

// Watch for changes in page and pageSize
watch([page, pageSize], () => {
  fetchEvents()
})

// Watch for changes in keyword
watch(keyword, () => {
  fetchEvents()
})
```

### File: `src/views/event/EventFormView.vue`

#### Before:
```typescript
.catch((error) => {
  console.error('Error saving event:', error);
  router.push({ name: 'network-error-view' })  // ❌ No clear error message
})
```

#### After:
```typescript
.catch((error) => {
  console.error('Error saving event:', error);
  
  // Handle authentication errors
  if (error.response?.status === 401 || error.response?.status === 403) {
    store.updateMessage('You must be logged in to create an event')
    setTimeout(() => {
      store.restMessage()
      router.push({ name: 'login', query: { redirect: '/add-event' } })
    }, 2000)
  } else {
    router.push({ name: 'network-error-view' })
  }
})
```

## How to Test

### Test 1: Navigation Issue Fixed
1. Go to event list page
2. Click on "About" or "Organizations" in the navigation
3. ✅ Page should navigate immediately (no freeze)
4. Click back to "Event" 
5. ✅ Should work smoothly
6. Try changing page size or searching
7. ✅ All should work without freezing

### Test 2: Create Event (Authentication Required)
1. **Make sure you're logged in first** (click Login in the header)
2. Go to "New Event" 
3. Fill in the event form:
   - Category: "Sports"
   - Title: "neymar"
   - Description: "Soccer event"
   - Location: "Stadium"
   - Date: "15th Oct"
   - Time: "7-9 pm"
   - Select an organizer
4. Click Submit
5. ✅ Should redirect to event list
6. ✅ "neymar" event should appear in the list

### Test 3: Create Event Without Login
1. **Log out** if you're logged in
2. Go to "New Event"
3. Fill in the form and submit
4. ✅ Should show message: "You must be logged in to create an event"
5. ✅ Should redirect to login page after 2 seconds
6. Log in
7. ✅ Can now create events successfully

## Why "neymar" Event Wasn't Created

The "neymar" event you tried to create was **rejected by the backend** because:
1. You were not logged in (or your token expired)
2. Backend returned 403 Forbidden
3. The event was never saved to the database

**To create "neymar" event now**:
1. Log in to your account
2. Go to "New Event"
3. Fill in the form with "neymar" details
4. Submit
5. It should now work! ✅

## Technical Details

### Authentication Flow
- Backend requires JWT token for POST /events
- Token is stored in localStorage as 'access_token'
- AxiosInterceptor automatically adds: `Authorization: Bearer <token>`
- If token is missing/expired: 401/403 error
- Interceptor tries to refresh token automatically
- If refresh fails: redirects to login

### Navigation Flow
- Router changes trigger prop changes (page, pageSize)
- `watch([page, pageSize])` detects the change
- Calls `fetchEvents()` to load new data
- No blocking or infinite loops

### Pagination Flow
- Default: page=1, pageSize=2
- Data fetched with correct parameters
- Total count from `x-total-count` header
- Shows "Next Page" only when more data available

## Backend Endpoints
- `GET /events` - Public, no auth required ✅
- `POST /events` - Requires authentication 🔒
- `PUT /events/:id` - Requires authentication 🔒
- `DELETE /events/:id` - Requires authentication 🔒

## Checklist
- [x] Navigation freeze fixed (replaced watchEffect with watch)
- [x] Pagination shows correct number of items (using pageSize.value)
- [x] Authentication errors handled gracefully
- [x] Clear error message for unauthorized event creation
- [x] Auto-redirect to login for auth errors
- [x] Events reload after successful creation
