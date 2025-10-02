# Lab 12 Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                      (Vue 3 + TypeScript)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Views      │    │  Components  │    │   Stores     │
│              │    │              │    │              │
│ LoginView    │───▶│ InputText    │    │ Auth Store   │
│ EventList    │    │ ErrorMessage │◀───│ - token      │
│ About        │    │ SvgIcon      │    │ - user       │
│ ...          │    │ ImageUpload  │    │ - login()    │
└──────────────┘    └──────────────┘    │ - logout()   │
                                        └──────────────┘
                                               │
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │   Services       │
                                    │                  │
                                    │ EventService     │
                                    │ OrganizerService │
                                    │ AuctionService   │
                                    │ ...              │
                                    └──────────────────┘
                                               │
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │  AxiosClient     │
                                    │  (Shared)        │
                                    └──────────────────┘
                                               │
                                               │
                              ┌────────────────┴────────────────┐
                              │                                 │
                              ▼                                 ▼
                   ┌────────────────────┐         ┌────────────────────┐
                   │ Axios Interceptor  │         │   LocalStorage     │
                   │                    │         │                    │
                   │ Request:           │         │ - access_token     │
                   │ Add Authorization  │◀────────│ - user             │
                   │ Bearer <token>     │         │                    │
                   └────────────────────┘         └────────────────────┘
                              │
                              │ HTTP Requests with JWT
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                             ▼                                  │
│                      ┌──────────────┐                          │
│                      │   Backend    │                          │
│                      │ Spring Boot  │                          │
│                      │   + Spring   │                          │
│                      │   Security   │                          │
│                      └──────────────┘                          │
│                             │                                  │
│    ┌────────────────────────┼────────────────────────┐        │
│    │                        │                        │        │
│    ▼                        ▼                        ▼        │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│ │ JWT          │  │ REST         │  │ Database     │        │
│ │ Authentication│  │ Controllers  │  │              │        │
│ │              │  │              │  │ - Users      │        │
│ │ - Validate   │  │ - Events     │  │ - Events     │        │
│ │ - Generate   │  │ - Organizers │  │ - Organizers │        │
│ │ - Refresh    │  │ - ...        │  │ - ...        │        │
│ └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                              ┌──────────┐
│  User    │                                              │ Backend  │
└────┬─────┘                                              └────┬─────┘
     │                                                         │
     │ 1. Visit /login                                         │
     ├──────────────────────────┐                             │
     │                          │                             │
     │                   ┌──────▼──────┐                      │
     │                   │ LoginView   │                      │
     │                   └──────┬──────┘                      │
     │                          │                             │
     │ 2. Enter credentials     │                             │
     │ ───────────────────────► │                             │
     │                          │                             │
     │                   ┌──────▼──────┐                      │
     │                   │ Validation  │                      │
     │                   │ (vee-validate)│                    │
     │                   └──────┬──────┘                      │
     │                          │                             │
     │                   ┌──────▼──────┐                      │
     │                   │ Auth Store  │                      │
     │                   │ login()     │                      │
     │                   └──────┬──────┘                      │
     │                          │                             │
     │                          │ POST /auth/authenticate     │
     │                          ├────────────────────────────►│
     │                          │                             │
     │                          │         ┌───────────────────┤
     │                          │         │ Validate          │
     │                          │         │ Credentials       │
     │                          │         └───────────────────┤
     │                          │                             │
     │                          │ {token, user}               │
     │                          │◄────────────────────────────┤
     │                          │                             │
     │                   ┌──────▼──────┐                      │
     │                   │ Save to     │                      │
     │                   │ localStorage│                      │
     │                   │ - token     │                      │
     │                   │ - user      │                      │
     │                   └──────┬──────┘                      │
     │                          │                             │
     │                   ┌──────▼──────┐                      │
     │                   │ Update State│                      │
     │                   │ - this.token│                      │
     │                   │ - this.user │                      │
     │                   └──────┬──────┘                      │
     │                          │                             │
     │ 3. Redirect to /         │                             │
     │◄─────────────────────────┤                             │
     │                                                         │
```

## API Request Flow

```
┌─────────────┐
│ Component   │
│ (EventList) │
└──────┬──────┘
       │
       │ EventService.getEvents()
       │
       ▼
┌──────────────┐
│EventService  │
└──────┬───────┘
       │
       │ apiClient.get('/events')
       │
       ▼
┌──────────────┐
│ AxiosClient  │
│  (Shared)    │
└──────┬───────┘
       │
       │ Request Interceptor Triggered
       │
       ▼
┌─────────────────────────┐
│ Axios Interceptor       │
│                         │
│ 1. Get token from       │
│    localStorage         │
│                         │
│ 2. Add to headers:      │
│    Authorization:       │
│    Bearer <token>       │
└──────┬──────────────────┘
       │
       │ HTTP GET /events
       │ Headers:
       │   Authorization: Bearer eyJhbG...
       │
       ▼
┌──────────────┐
│   Backend    │
│              │
│ 1. JWT Filter│───► Validate Token
│    validates │
│              │
│ 2. If valid  │───► Process Request
│              │
│ 3. Return    │───► Send Response
│    data      │
└──────┬───────┘
       │
       │ { events: [...] }
       │
       ▼
┌──────────────┐
│ Component    │
│ Receives Data│
│ Renders UI   │
└──────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────────────┐
│            Pinia Auth Store                    │
│                                                │
│  State:                                        │
│  ┌──────────────────────────────────┐         │
│  │ token: string | null             │         │
│  │ user: Organizer | null           │         │
│  └──────────────────────────────────┘         │
│                                                │
│  Getters:                                      │
│  ┌──────────────────────────────────┐         │
│  │ currentUserName(): string        │         │
│  │ isAdmin(): boolean               │         │
│  │ authorizationHeader(): string    │         │
│  └──────────────────────────────────┘         │
│                                                │
│  Actions:                                      │
│  ┌──────────────────────────────────┐         │
│  │ login(email, password)           │         │
│  │ logout()                         │         │
│  │ reload(token, user)              │         │
│  └──────────────────────────────────┘         │
└────────────────────────────────────────────────┘
         ▲                      │
         │                      │
         │                      ▼
┌────────┴────────┐    ┌────────────────┐
│  Components     │    │ localStorage   │
│  - App.vue      │    │ - access_token │
│  - LoginView    │    │ - user (JSON)  │
│  - ImageUpload  │    └────────────────┘
└─────────────────┘
```

## Component Hierarchy

```
App.vue (Root)
│
├── Header (Navigation)
│   ├── Event Link
│   ├── Organizations Link
│   ├── About Link
│   ├── New Event Link (v-if="authStore.isAdmin")
│   │
│   └── Auth Section
│       ├── (Not Logged In)
│       │   ├── Sign Up Link
│       │   └── Login Link
│       │
│       └── (Logged In)
│           ├── User Profile ({{ authStore.currentUserName }})
│           └── Logout Button
│
└── RouterView
    │
    ├── LoginView
    │   ├── InputText (email)
    │   │   └── ErrorMessage
    │   └── InputText (password)
    │       └── ErrorMessage
    │
    ├── EventListView
    │   └── EventCard (multiple)
    │
    ├── EventFormView (Admin Only)
    │   └── ImageUpload (with auth headers)
    │
    └── ... other views
```

## File Dependencies

```
main.ts
  └── imports AxiosInrceptorSetup.ts
        └── imports AxiosClient.ts

App.vue
  ├── imports auth store
  ├── imports SvgIcon
  └── imports @mdi/js icons

LoginView.vue
  ├── imports InputText.vue
  │     ├── imports ErrorMessage.vue
  │     └── imports UniqueID.ts
  ├── imports auth store
  ├── imports vee-validate
  └── imports yup

EventService.ts
  └── imports AxiosClient.ts

ImageUpload.vue
  └── imports auth store (for headers)
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Layer 1: Frontend UI            │
│  • Hide admin features from non-admins  │
│  • v-if directives based on roles       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Layer 2: HTTP Request Headers        │
│  • Authorization: Bearer <token>        │
│  • Added by Axios Interceptor           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Layer 3: Backend JWT Validation      │
│  • Spring Security filters              │
│  • Token signature verification         │
│  • Token expiration check               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Layer 4: Role-Based Access Control   │
│  • @PreAuthorize annotations            │
│  • hasRole("ADMIN") checks              │
└─────────────────────────────────────────┘
```

## LocalStorage Structure

```
localStorage
├── access_token: "eyJhbGciOiJIUzUxMiJ9..."
└── user: {
      "id": 1,
      "name": "admin",
      "roles": ["ROLE_USER", "ROLE_ADMIN"]
    }
```

## Request Headers

```
GET /events HTTP/1.1
Host: localhost:8080
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwOT...
```

---

This architecture implements:
✅ JWT Authentication
✅ Token Management
✅ Role-Based Access Control
✅ Secure API Communication
✅ State Persistence
✅ Form Validation
✅ Centralized HTTP Client
