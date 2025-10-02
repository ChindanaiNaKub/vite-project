# Lab 12 Quick Reference Card

## 🔑 Test Credentials

| Username | Password | Roles | Can See "New Event" |
|----------|----------|-------|---------------------|
| `admin` | `admin` | ROLE_USER, ROLE_ADMIN | ✅ Yes |
| `user` | `user` | ROLE_USER | ❌ No |

## 🌐 Important URLs

- **Frontend**: `http://localhost:5173`
- **Login Page**: `http://localhost:5173/login`
- **Backend**: `http://localhost:8080` (configure in `.env`)
- **Auth Endpoint**: `http://localhost:8080/api/v1/auth/authenticate`

## 📦 New Files Created

```
src/
├── stores/auth.ts                    # Authentication state
├── services/
│   ├── AxiosClient.ts               # Shared axios instance
│   └── AxiosInrceptorSetup.ts       # JWT token interceptor
├── features/UniqueID.ts              # ID generator utility
├── components/
│   ├── ErrorMessage.vue             # Error display
│   ├── InputText.vue                # Validated input
│   └── SvgIcon.vue                  # Icon component
└── views/LoginView.vue               # Login page
```

## 🔧 Modified Files

```
src/
├── App.vue                          # Auth navigation
├── main.ts                          # Import interceptor
├── router/index.ts                  # Add /login route
├── types.ts                         # Add roles to Organizer
├── components/ImageUpload.vue       # Auth headers
└── services/
    ├── EventService.ts              # Use AxiosClient
    ├── OrganizerService.ts          # Use AxiosClient
    ├── OrganizationService.ts       # Use AxiosClient
    ├── AuctionService.ts            # Use AxiosClient
    └── StudentService.ts            # Use AxiosClient
```

## 💻 Key Code Snippets

### Using Auth Store
```typescript
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

// Check if admin
if (authStore.isAdmin) { /* ... */ }

// Get user name
const userName = authStore.currentUserName

// Login
authStore.login(email, password)

// Logout
authStore.logout()
```

### Protected Navigation
```vue
<!-- Show only to admins -->
<span v-if="authStore.isAdmin">
  <RouterLink :to="{ name: 'add-event' }">
    New Event
  </RouterLink>
</span>

<!-- Show only when not logged in -->
<ul v-if="!authStore.currentUserName">
  <li>Login</li>
  <li>Sign Up</li>
</ul>

<!-- Show only when logged in -->
<ul v-if="authStore.currentUserName">
  <li>{{ authStore.currentUserName }}</li>
  <li>Logout</li>
</ul>
```

### Form Validation
```vue
<script setup lang="ts">
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'

const validationSchema = yup.object({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required')
})

const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: { email: '', password: '' }
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit((values) => {
  // Handle form submission
})
</script>
```

## 🔍 Debugging Tips

### Check Token in Browser
1. Open DevTools → Application Tab
2. LocalStorage → `http://localhost:5173`
3. Look for:
   - `access_token`
   - `user`

### Check API Requests
1. Open DevTools → Network Tab
2. Make an API call
3. Click on the request
4. Headers → Request Headers
5. Look for: `Authorization: Bearer <token>`

### Check Auth State
1. Install Vue DevTools
2. Open DevTools → Vue Tab
3. Pinia → auth store
4. Check: token, user, currentUserName, isAdmin

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| CORS Error | Check backend SecurityConfiguration |
| 401 Unauthorized | Check token in localStorage |
| Login doesn't work | Check backend is running |
| Token not in requests | Check interceptor is imported |
| Menu not updating | Check Pinia state updates |
| Admin menu not showing | Check user roles array |

## 🎯 Testing Checklist

- [ ] Can access login page
- [ ] Form validation works
- [ ] Can login with admin
- [ ] Can login with user
- [ ] Token saved in localStorage
- [ ] Admin sees "New Event"
- [ ] User doesn't see "New Event"
- [ ] API calls include token
- [ ] Can logout successfully
- [ ] Login persists after refresh

## 📚 Dependencies

```json
{
  "dependencies": {
    "vee-validate": "^4.x",
    "yup": "^1.x",
    "@mdi/js": "^7.x"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.x"
  }
}
```

## 🔐 Security Flow

```
1. User Login
   ↓
2. Backend Validates Credentials
   ↓
3. Backend Returns JWT Token + User Data
   ↓
4. Frontend Stores Token in LocalStorage
   ↓
5. Axios Interceptor Adds Token to All Requests
   ↓
6. Backend Validates Token
   ↓
7. Backend Returns Protected Data
```

## 🎨 UI States

### Not Logged In
- Show: Login, Sign Up buttons
- Hide: User name, Logout, New Event (admin)

### Logged In (User)
- Show: User name, Logout
- Hide: Login, Sign Up, New Event

### Logged In (Admin)
- Show: User name, Logout, New Event
- Hide: Login, Sign Up

## 📱 Responsive Navigation

```vue
<nav class="flex justify-between items-center py-6">
  <!-- Left side: Main navigation -->
  <div class="flex space-x-4">
    <RouterLink to="/">Event</RouterLink>
    <RouterLink to="/organizations">Organizations</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink v-if="authStore.isAdmin" to="/add-event">
      New Event
    </RouterLink>
  </div>
  
  <!-- Right side: Auth buttons -->
  <ul class="flex space-x-2">
    <!-- Login/Signup or User/Logout -->
  </ul>
</nav>
```

## 🚀 Quick Start

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173/login

# Login with: admin / admin
# You should see your name in navbar!
```

---

**Need Help?** Check the detailed guides:
- `LAB12_FRONTEND_COMPLETION.md` - Full implementation details
- `LAB12_TESTING_GUIDE.md` - Comprehensive testing instructions
- `LAB12_SUMMARY.md` - Complete overview

✅ **Lab 12 Frontend Complete!**
