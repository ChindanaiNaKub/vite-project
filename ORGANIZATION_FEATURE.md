# Organization Management Feature

This feature allows users to add and manage organizations through a web form interface.

## Files Created/Modified

### 1. Type Definitions
- **`src/type/Organization.ts`**: Defines the Organization interface
- **`src/types.ts`**: Added Organization interface to the main types file

### 2. Service Layer
- **`src/services/OrganizationService.ts`**: Handles API calls for organization operations (GET, POST)

### 3. Views/Components
- **`src/views/OrganizationFormView.vue`**: Form for creating new organizations
- **`src/views/OrganizationListView.vue`**: List view for displaying organizations

### 4. Routing
- **`src/router/index.ts`**: Added routes for organization list and form
  - `/organizations` - Organization list view
  - `/add-organization` - Organization form view

### 5. Navigation
- **`src/App.vue`**: Added navigation links for organization features

## Organization Data Structure

```typescript
interface Organization {
  id: number
  name: string
  description: string
  address: string
  contactPerson: string
  email: string
  phone: string
  website?: string
  establishedDate: string
}
```

## Features

### 1. Organization Form (`/add-organization`)
- Complete form with validation
- Required fields: name, contactPerson, email
- Optional fields: website
- Form styling matches existing event form
- Success/error handling with user feedback
- Automatic redirection after successful creation

### 2. Organization List (`/organizations`)
- Grid layout for displaying organizations
- Handles empty state when no organizations exist
- Graceful error handling when backend endpoint isn't available
- Quick link to add new organization

## Backend Requirements

The frontend expects the following backend endpoints:

1. **POST `/organizations`** - Create new organization
   - Accepts Organization object (without id)
   - Returns created organization with generated id

2. **GET `/organizations`** - List organizations
   - Supports pagination with `_limit` and `_page` query parameters
   - Returns array of organizations

## Usage

1. Navigate to "Organizations" in the main navigation
2. Click "Add New Organization" to create a new organization
3. Fill out the form with organization details
4. Submit to save to the database (requires backend implementation)

## Notes

- The frontend is fully implemented and ready to use
- Backend endpoints for organizations need to be implemented as per lab instructions
- Error handling is in place for when backend endpoints are not yet available
- Form validation ensures required fields are filled
- Success messages provide user feedback
