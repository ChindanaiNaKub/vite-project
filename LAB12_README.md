# Lab 12: Spring Security with JWT Authentication - Frontend Implementation

**Course**: SE 331 Component Based Software Development  
**Lab**: Lab 12 - Spring Security  
**Status**: ✅ Complete

---

## 📋 Overview

This implementation provides a complete JWT authentication system for the frontend Vue.js application, integrating with a Spring Security backend. Users can log in, access protected routes, and see role-based UI elements.

## 🎯 What's Implemented

### Core Features
- ✅ **Login System**: Form-based authentication with validation
- ✅ **JWT Token Management**: Automatic token storage and injection
- ✅ **Role-Based UI**: Admin-only features and menus
- ✅ **State Persistence**: Auth state survives page reloads
- ✅ **Protected Routes**: API calls include authorization headers
- ✅ **Logout Functionality**: Clean session termination

### Components Created
- `LoginView.vue` - Login page with form validation
- `InputText.vue` - Reusable input component with error display
- `ErrorMessage.vue` - Error message display component
- `SvgIcon.vue` - Material Design Icons component

### Services & Utilities
- `auth.ts` (Pinia Store) - Authentication state management
- `AxiosClient.ts` - Centralized axios instance
- `AxiosInrceptorSetup.ts` - JWT token interceptor
- `UniqueID.ts` - Unique ID generator for form elements

## 📚 Documentation

This implementation includes comprehensive documentation:

1. **[LAB12_SUMMARY.md](./LAB12_SUMMARY.md)**
   - Complete overview of implementation
   - Feature list and status
   - Technology stack
   - Learning outcomes

2. **[LAB12_FRONTEND_COMPLETION.md](./LAB12_FRONTEND_COMPLETION.md)**
   - Detailed completion checklist
   - All tasks and their status
   - Files created and modified
   - Usage instructions

3. **[LAB12_TESTING_GUIDE.md](./LAB12_TESTING_GUIDE.md)**
   - Step-by-step testing scenarios
   - Expected results for each test
   - Common issues and solutions
   - Verification checklist

4. **[LAB12_QUICK_REFERENCE.md](./LAB12_QUICK_REFERENCE.md)**
   - Quick access to test credentials
   - Code snippets
   - Debugging tips
   - Common issues

5. **[LAB12_ARCHITECTURE.md](./LAB12_ARCHITECTURE.md)**
   - System architecture diagrams
   - Authentication flow
   - Component hierarchy
   - Security layers

## 🚀 Quick Start

### Prerequisites
```bash
# Backend must be running with Spring Security configured
# Port: 8080 (default)
```

### Installation
```bash
# All dependencies already installed
npm install
```

### Start Development Server
```bash
npm run dev
```

### Access the Application
- **URL**: http://localhost:5173
- **Login Page**: http://localhost:5173/login

### Test Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin` | Admin | Full access + "New Event" menu |
| `user` | `user` | User | Standard access only |

## 🔑 Key Features Demonstration

### 1. Login Flow
```
Visit /login → Enter credentials → Validate → Store token → Redirect to home
```

### 2. Protected API Calls
```
All API requests automatically include:
Authorization: Bearer <jwt-token>
```

### 3. Role-Based UI
```
Admin users see: Event | Organizations | About | New Event | User Menu
Regular users see: Event | Organizations | About | User Menu
Not logged in: Event | Organizations | About | Login | Sign Up
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ErrorMessage.vue          # NEW
│   ├── InputText.vue             # NEW
│   ├── SvgIcon.vue               # NEW
│   └── ImageUpload.vue           # UPDATED
├── features/
│   └── UniqueID.ts               # NEW
├── services/
│   ├── AxiosClient.ts            # NEW
│   ├── AxiosInrceptorSetup.ts   # NEW
│   └── [All services]            # UPDATED
├── stores/
│   └── auth.ts                   # NEW
├── views/
│   └── LoginView.vue             # NEW
├── App.vue                       # UPDATED
├── main.ts                       # UPDATED
├── router/index.ts               # UPDATED
└── types.ts                      # UPDATED
```

## 🔐 Security Features

1. **JWT Token Authentication**
   - Tokens stored in localStorage
   - Automatic injection in all requests
   - Bearer token scheme

2. **Role-Based Access Control**
   - UI elements show/hide based on roles
   - Backend validates permissions
   - Admin-only features protected

3. **Form Validation**
   - Client-side validation with vee-validate
   - Immediate feedback on errors
   - Type-safe with TypeScript

4. **State Management**
   - Centralized auth state with Pinia
   - Persistent across page reloads
   - Reactive UI updates

## 🎨 Technologies Used

- **Vue 3** (Composition API)
- **TypeScript** (Type safety)
- **Pinia** (State management)
- **Vue Router** (Navigation)
- **Axios** (HTTP client)
- **Vee-Validate** (Form validation)
- **Yup** (Schema validation)
- **Tailwind CSS** (Styling)
- **Material Design Icons** (UI icons)

## 🧪 Testing

### Manual Testing
Follow the comprehensive guide in [LAB12_TESTING_GUIDE.md](./LAB12_TESTING_GUIDE.md)

### Quick Test
1. Navigate to http://localhost:5173/login
2. Login with `admin` / `admin`
3. Verify:
   - Name "admin" appears in navbar
   - "New Event" menu is visible
   - All API calls include Authorization header
4. Click Logout
5. Verify:
   - Redirected to login
   - Token cleared from localStorage

## 📝 Environment Configuration

Create or update `.env` file:
```env
VITE_BACKEND_URL=http://localhost:8080
VITE_UPLOAD_URL=your_upload_url_here
```

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend allows your frontend origin
- Check SecurityConfiguration.java CORS settings

### 401 Unauthorized
- Verify token is in localStorage
- Check interceptor is imported in main.ts
- Verify token format in request headers

### Login Not Working
- Confirm backend is running on port 8080
- Check VITE_BACKEND_URL in .env
- Verify credentials are correct

### Menu Not Updating
- Check Pinia state in Vue DevTools
- Verify roles array in user object
- Check isAdmin getter logic

## 📊 Implementation Statistics

- **Files Created**: 8
- **Files Modified**: 11
- **Components**: 4 new components
- **Services**: 1 new + 5 updated
- **Lines of Code**: ~800+
- **Dependencies Added**: 3 packages

## ✅ Completion Checklist

- [x] Install dependencies
- [x] Create authentication store
- [x] Implement login page
- [x] Add form validation
- [x] Setup axios interceptor
- [x] Refactor all services
- [x] Update navigation UI
- [x] Add role-based menus
- [x] Implement logout
- [x] Add state persistence
- [x] Update image upload
- [x] Test all features
- [x] Create documentation

## 🎓 Learning Outcomes

After completing this lab, you understand:

1. ✅ JWT authentication in Vue.js
2. ✅ Pinia for state management
3. ✅ Axios interceptors for token injection
4. ✅ Form validation with vee-validate
5. ✅ Role-based access control
6. ✅ LocalStorage for persistence
7. ✅ Secure API communication
8. ✅ Component composition patterns

## 🔜 Future Enhancements

Potential improvements (not required for lab):

- [ ] Registration page implementation
- [ ] Token refresh mechanism
- [ ] Automatic logout on token expiration
- [ ] Remember me functionality
- [ ] Password strength indicator
- [ ] Two-factor authentication
- [ ] Session timeout warning
- [ ] Profile page

## 📞 Support

If you encounter issues:

1. Check the [TESTING_GUIDE](./LAB12_TESTING_GUIDE.md)
2. Review [QUICK_REFERENCE](./LAB12_QUICK_REFERENCE.md)
3. Examine [ARCHITECTURE](./LAB12_ARCHITECTURE.md)
4. Check browser console for errors
5. Verify backend is running correctly

## 🎉 Success Criteria

Your implementation is successful if:

- ✅ You can login with valid credentials
- ✅ Token is stored and persists on reload
- ✅ API calls include Authorization header
- ✅ Admin users see "New Event" menu
- ✅ Regular users don't see "New Event"
- ✅ Logout clears session
- ✅ No console errors
- ✅ All navigation works

## 🏆 Achievement Unlocked

**Congratulations!** You've successfully implemented:
- JWT Authentication System
- Role-Based Access Control
- Secure API Communication
- Form Validation
- State Management
- Token Management

---

## 📄 License

This is an educational project for SE 331 course at Chiang Mai University.

---

**Status**: ✅ Lab 12 Implementation Complete  
**Last Updated**: October 2, 2025  
**Tested**: ✅ Working  
**Documentation**: ✅ Complete

For detailed implementation notes, see the individual documentation files listed above.
