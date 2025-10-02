# How to Create New Events - Navigation Guide

## 🎯 Quick Answer

To create a new event, you need to:
1. **Be logged in as an ADMIN user**
2. Click the **"New Event"** link in the navigation menu
3. Fill out the event form
4. Submit

---

## 📍 Where is the "New Event" Page?

### URL
```
http://localhost:5174/add-event
```

### Route Configuration
```typescript
{
  path: '/add-event',
  name: 'add-event',
  component: AddEventView  // Located at src/views/event/EventFormView.vue
}
```

---

## 🔐 Access Control

### Who Can See "New Event"?

The "New Event" link is **ONLY visible to ADMIN users**.

In your navigation (App.vue):
```vue
<span v-if="authStore.isAdmin">
  <RouterLink :to="{ name: 'add-event' }">
    New Event
  </RouterLink>
</span>
```

### Test Users

| Username | Password | Role | Can Create Events? |
|----------|----------|------|-------------------|
| `admin` | `admin` | ROLE_ADMIN | ✅ YES - See "New Event" menu |
| `user` | `user` | ROLE_USER | ❌ NO - Menu hidden |

---

## 🧭 How to Access "New Event"

### Option 1: Navigation Menu (Recommended)
1. Login as admin (`admin`/`admin`)
2. Look at the top navigation bar
3. You should see: **Event | Organizations | About | New Event | Auctions**
4. Click **"New Event"**
5. Fill out the form

### Option 2: Direct URL
1. Login as admin
2. Navigate directly to: `http://localhost:5174/add-event`

### Option 3: Programmatic Navigation
```typescript
import { useRouter } from 'vue-router'

const router = useRouter()
router.push({ name: 'add-event' })
```

---

## 📝 Expected Navigation Menu

### When NOT Logged In
```
Event | Organizations | About | Auctions | [Sign Up] [Login]
```

### When Logged In as Regular User
```
Event | Organizations | About | Auctions | [user icon] [LogOut]
```

### When Logged In as Admin
```
Event | Organizations | About | New Event | Auctions | [admin icon] [LogOut]
                                    ↑
                              THIS APPEARS!
```

---

## 🐛 Troubleshooting

### Issue 1: "New Event" Link Not Visible

**Possible Causes:**
1. Not logged in as admin
2. User doesn't have ROLE_ADMIN
3. authStore.isAdmin is not working

**Solution:**
```typescript
// Check in browser console
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
console.log('User:', authStore.user)
console.log('Roles:', authStore.user?.roles)
console.log('Is Admin:', authStore.isAdmin)
```

Expected output for admin:
```javascript
User: { id: 1, name: "admin", roles: ["ROLE_ADMIN"] }
Roles: ["ROLE_ADMIN"]
Is Admin: true
```

### Issue 2: Can't Access /add-event Even as Admin

**Check Route Guard:**
The route doesn't have a `beforeEnter` guard, so anyone can access it directly if they know the URL. Consider adding protection:

```typescript
{
  path: '/add-event',
  name: 'add-event',
  component: AddEventView,
  beforeEnter: (to, from, next) => {
    const authStore = useAuthStore()
    if (authStore.isAdmin) {
      next()
    } else {
      next('/') // Redirect to home if not admin
    }
  }
}
```

### Issue 3: Form Not Submitting

**Check EventFormView.vue:**
- Verify form has proper validation
- Check EventService is imported
- Ensure backend API is running
- Check for console errors

---

## 🧪 Testing Steps

### Test 1: Admin Can See Link
1. Navigate to http://localhost:5174/login
2. Login with `admin` / `admin`
3. Check navigation bar
4. **Expected**: "New Event" link is visible
5. Click "New Event"
6. **Expected**: Navigate to `/add-event` page

### Test 2: Regular User Cannot See Link
1. Logout (if logged in)
2. Login with `user` / `user`
3. Check navigation bar
4. **Expected**: "New Event" link is NOT visible

### Test 3: Direct URL Access
1. Login as admin
2. Navigate to: http://localhost:5174/add-event
3. **Expected**: Event creation form loads

### Test 4: Create an Event
1. Login as admin
2. Click "New Event"
3. Fill out the form:
   - Title: "Test Event"
   - Description: "This is a test"
   - Location: "Test Location"
   - Date: (future date)
   - Time: "10:00"
   - Category: (select one)
   - Pet Allowed: (check if yes)
4. Submit
5. **Expected**: Event is created and saved to backend

---

## 📁 Related Files

### Navigation
- `src/App.vue` - Contains the navigation menu with "New Event" link

### Routing
- `src/router/index.ts` - Route configuration for `/add-event`

### Component
- `src/views/event/EventFormView.vue` - The actual event creation form

### Store
- `src/stores/auth.ts` - Contains `isAdmin` getter for checking admin role

### Service
- `src/services/EventService.ts` - API calls for creating events

---

## 🎨 UI Components

The event form likely includes:
- Title input
- Description textarea
- Location input
- Date picker
- Time picker
- Category dropdown
- Pet allowed checkbox
- Image upload
- Submit button

---

## 🔄 Alternative: Add Button on Event List

You might want to add a floating action button or "Create Event" button on the event list page for better UX:

```vue
<!-- In EventListView.vue -->
<div v-if="authStore.isAdmin" class="fixed bottom-8 right-8">
  <router-link 
    to="/add-event"
    class="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Create Event
  </router-link>
</div>
```

---

## 📊 Summary

| Aspect | Details |
|--------|---------|
| **Route** | `/add-event` |
| **Component** | `EventFormView.vue` |
| **Access** | Admin only |
| **Visibility** | Role-based (ROLE_ADMIN) |
| **Location** | Navigation menu (when admin) |

---

## ✅ Quick Checklist

To create a new event, ensure:
- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 5174
- [ ] You're logged in
- [ ] Your user has ROLE_ADMIN
- [ ] "New Event" link is visible in navbar
- [ ] Clicking link navigates to `/add-event`
- [ ] Form loads correctly
- [ ] You can submit the form

---

**Status**: ✅ Feature Available  
**Last Updated**: October 3, 2025  
**Access**: Admin Only

**Current Server**: http://localhost:5174/add-event
