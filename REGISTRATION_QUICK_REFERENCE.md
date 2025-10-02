# Registration Feature - Quick Reference

## 🚀 Quick Start

### Access Registration
- **URL**: http://localhost:5173/register
- **From Login**: Click "Try to register here"
- **From Navbar**: Click "Sign Up" (when logged out)

## 📝 Test Registration

### Sample Valid Data
```
Username:        testuser123
Email:           test.user@example.com
First Name:      Test
Last Name:       User
Password:        password123
Confirm Password: password123
```

### Expected Result
- ✅ Success message: "Registration successful! Welcome!"
- ✅ Redirected to: `/events`
- ✅ User name in navbar: "Test User"
- ✅ Token in localStorage
- ✅ Auto-refresh enabled

## 🔧 Backend Endpoint

```bash
# Registration endpoint
POST http://localhost:8080/api/v1/auth/register

# Request body
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstname": "Test",
  "lastname": "User"
}

# Response
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Test User",
    "roles": ["ROLE_USER"]
  }
}
```

## ✅ Validation Rules

| Field | Required | Min Length | Max Length | Format |
|-------|----------|------------|------------|--------|
| Username | Yes | 3 | 50 | Any |
| Email | Yes | - | - | Valid email |
| First Name | Yes | - | 50 | Any |
| Last Name | Yes | - | 50 | Any |
| Password | Yes | 6 | 100 | Any |
| Confirm Password | Yes | - | - | Must match password |

## 🧪 Test Scenarios

### 1. Valid Registration
```
✓ Fill all fields with valid data
✓ Click "Sign up"
✓ See success message
✓ Redirected to events
✓ User name in navbar
```

### 2. Validation Errors
```
✗ Empty fields → "Field is required"
✗ Invalid email → "Must be a valid email address"
✗ Short username → "Username must be at least 3 characters"
✗ Short password → "Password must be at least 6 characters"
✗ Password mismatch → "Passwords must match"
```

### 3. Backend Errors
```
✗ Duplicate username → "Username already exists"
✗ Duplicate email → "Email already exists"
✗ Invalid data → Backend error message
```

## 🗂️ Files Modified/Created

### Created
- `src/views/RegisterView.vue` - Registration page component

### Modified
- `src/stores/auth.ts` - Added `register()` action
- `src/router/index.ts` - Added `/register` route
- `src/views/LoginView.vue` - Added register link

## 🔍 Debug Checklist

### Registration Not Working?

1. **Check Backend**
   ```bash
   # Verify backend is running
   curl http://localhost:8080/actuator/health
   ```

2. **Check Environment**
   ```bash
   # Check .env file
   VITE_BACKEND_URL=http://localhost:8080
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls

4. **Check LocalStorage**
   - Open DevTools → Application → Local Storage
   - Verify tokens are stored after registration

5. **Check Auth Store**
   - Install Vue DevTools
   - Check Pinia store state
   - Verify token, refreshToken, and user are set

## 💻 Code Snippets

### Using Register in Component
```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function handleRegister() {
  authStore.register({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'User'
  })
  .then(() => {
    console.log('Registration successful')
  })
  .catch((error) => {
    console.error('Registration failed:', error)
  })
}
</script>
```

### Check Registration State
```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

console.log('Is logged in:', !!authStore.token)
console.log('User:', authStore.user)
console.log('Username:', authStore.currentUserName)
```

## 🎯 API Testing

### Using cURL
```bash
# Test registration endpoint
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstname": "Test",
    "lastname": "User"
  }'
```

### Using HTTPie
```bash
# Test registration endpoint
http POST http://localhost:8080/api/v1/auth/register \
  username=testuser \
  email=test@example.com \
  password=password123 \
  firstname=Test \
  lastname=User
```

## 🐛 Common Issues

### Issue: "Registration failed"
**Solution**: Check backend logs, verify endpoint exists

### Issue: "Username already exists"
**Solution**: Use a different username

### Issue: "Email already exists"
**Solution**: Use a different email

### Issue: Not redirected after registration
**Solution**: Check router configuration, verify `/events` route exists

### Issue: User not logged in after registration
**Solution**: Check auth store, verify tokens are stored

## 📱 Mobile Testing

Access from mobile device on same network:
```
http://YOUR_IP_ADDRESS:5173/register

Example:
http://192.168.1.100:5173/register
```

## 🎨 UI Components Used

- `InputText.vue` - Text input with validation
- `ErrorMessage.vue` - Error message display (built-in to InputText)
- `SvgIcon.vue` - Material Design Icons
- Tailwind CSS - Styling

## 📈 Success Metrics

✅ **Registration works if:**
- Form submits successfully
- No validation errors with valid data
- Backend creates user account
- JWT tokens returned and stored
- User automatically logged in
- Redirected to events page
- User name appears in navbar
- No console errors

---

**Quick Links:**
- [Full Documentation](./REGISTRATION_FEATURE.md)
- [Testing Guide](./LAB12_TESTING_GUIDE.md)
- [Lab 12 README](./LAB12_README.md)

**Status**: ✅ Ready to Use  
**Last Updated**: October 3, 2025
