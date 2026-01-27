# Clinic Management Application - Development Guidelines

This document provides comprehensive guidelines for developing and maintaining the Clinic Management application. It covers architecture, patterns, and best practices to ensure consistency and maintainability.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Design System & Styling](#design-system--styling)
4. [Authentication & Authorization](#authentication--authorization)
5. [Database Access Patterns](#database-access-patterns)
6. [Server Actions](#server-actions)
7. [Error Handling](#error-handling)
8. [Component Development](#component-development)
9. [Adding New Features](#adding-new-features)
10. [Security Checklist](#security-checklist)
11. [Branch-Level Feature Management](#branch-level-feature-management)

---

## Architecture Overview

The application is built with:

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **NextAuth.js** for authentication (Google OAuth)
- **TailwindCSS** for styling

### Two Main Sections

1. **Public Website** (`app/(site)/`) - Marketing pages, contact forms
2. **Management Console** (`app/(management)/`) - Admin dashboard, CRUD operations

Both sections share components and utilities but have distinct layouts and styling approaches.

---

## Project Structure

```
clinic-mgmt/
├── app/
│   ├── (management)/          # Management console (protected)
│   │   ├── layout.tsx         # Auth-protected layout
│   │   └── management/        # Management pages
│   │       ├── users/
│   │       ├── roles/
│   │       ├── branches/
│   │       └── ...
│   ├── (site)/                # Public website
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Homepage
│   │   └── ...
│   ├── actions/               # Server actions
│   │   ├── branches.ts
│   │   ├── roles.ts
│   │   ├── users.ts
│   │   └── send-email.ts
│   ├── api/                   # API routes
│   └── globals.css            # Global styles
├── components/
│   ├── management/            # Management-specific components
│   ├── providers/             # Context providers
│   ├── ui/                    # Reusable UI components
│   └── ...                    # Website components
├── config/
│   ├── site.ts                # Site configuration
│   └── links.ts               # Navigation links
├── hooks/                     # Custom React hooks
├── lib/
│   ├── auth-utils.ts          # Authentication utilities
│   ├── db.ts                  # Database connection
│   ├── design-tokens.ts       # Centralized design tokens
│   ├── errors.ts              # Error handling framework
│   ├── permissions.ts         # Permission checking
│   ├── schema.ts              # Drizzle schema
│   └── data-access/           # Data access layer
│       ├── users.ts
│       ├── branches.ts
│       └── roles.ts
├── types/                     # TypeScript type definitions
└── middleware.ts              # Route middleware
```

---

## Design System & Styling

### Centralized Design Tokens

All colors, spacing, and styling constants are defined in `lib/design-tokens.ts`. This ensures consistency across the application.

```typescript
import { colors, managementStyles, websiteStyles } from '@/lib/design-tokens'
```

### Color Palette

#### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `brand.primary` | `#FF4D00` | Primary actions, CTAs |
| `brand.secondary` | `#00A3FF` | Accents, links |

#### Management App (Light Theme)
| Token | Value | Usage |
|-------|-------|-------|
| `management.background` | `#F9FAFB` | Page background |
| `management.primary` | `#4F46E5` | Primary buttons, active states |
| `management.text.primary` | `#111827` | Main text |

#### Website (Dark Theme)
| Token | Value | Usage |
|-------|-------|-------|
| `surface.base` | `#0A0A0A` | Page background |
| `surface.card` | `#1A1A1A` | Card backgrounds |

### Using Tailwind Classes

For the **Management Console**, use the predefined style classes:

```typescript
import { managementStyles } from '@/lib/design-tokens'

// In your component
<div className={managementStyles.card}>
  <h1 className={managementStyles.pageTitle}>Users</h1>
  <button className={managementStyles.buttonPrimary}>Add User</button>
</div>
```

For the **Website**, use the website styles:

```typescript
import { websiteStyles } from '@/lib/design-tokens'

<section className={websiteStyles.section}>
  <h2 className={websiteStyles.sectionTitle}>Our Services</h2>
</section>
```

### Common Style Classes

#### Management Console
- `managementStyles.card` - Card container
- `managementStyles.buttonPrimary` - Primary action button
- `managementStyles.buttonSecondary` - Secondary button
- `managementStyles.buttonDanger` - Destructive action button
- `managementStyles.input` - Form input
- `managementStyles.label` - Form label
- `managementStyles.alertError` - Error alert
- `managementStyles.alertSuccess` - Success alert

---

## Authentication & Authorization

### Authentication Flow

Authentication is handled by NextAuth.js with Google OAuth. The configuration is in `auth.ts`.

### Using Auth Utilities

Always use the centralized auth utilities from `lib/auth-utils.ts`:

```typescript
import { 
  requireAuth,           // Requires any authenticated user
  requireSuperUser,      // Requires admin role
  requirePermission,     // Requires specific feature permission
  requireBranchAccess,   // Requires access to specific branch
  getAuthContext,        // Gets full auth context with permissions
} from '@/lib/auth-utils'
```

### In Server Actions

```typescript
"use server"

import { requirePermission } from '@/lib/auth-utils'

export async function createBranch(data: BranchData) {
  // This will throw if user doesn't have permission
  await requirePermission("branches", "add")
  
  // ... rest of the action
}
```

### Permission Levels

1. **Super User (ADMIN)** - Full access to all features and branches
2. **Branch Staff** - Access based on role permissions within assigned branches

### Permission Actions

Each feature supports four permission actions:
- `view` - Can see the feature/data
- `add` - Can create new records
- `edit` - Can modify existing records
- `delete` - Can remove records

---

## Database Access Patterns

### Schema Definition

Database schema is defined in `lib/schema.ts` using Drizzle ORM.

### Data Access Layer

Use the data access layer in `lib/data-access/` for database operations:

```typescript
import { getUsersWithBranchRoles, getUserById } from '@/lib/data-access'

// Optimized query with batch loading
const { users, branches, roles } = await getUsersWithBranchRoles({
  branchId: currentBranchId,
  isSuperUser: false,
})
```

### Query Optimization Guidelines

1. **Avoid N+1 Queries** - Batch fetch related data
2. **Use Lookup Maps** - Create maps for frequently accessed data
3. **Select Only Needed Columns** - Use `columns` option when possible
4. **Use Transactions** - For multi-step operations

```typescript
// Good: Batch fetch with lookup maps
const userIds = users.map(u => u.id)
const mappings = await db.select().from(userBranchRoles)
  .where(inArray(userBranchRoles.userId, userIds))

const branchMap = new Map(branches.map(b => [b.id, b.name]))

// Bad: N+1 query pattern
for (const user of users) {
  const branches = await db.query.userBranchRoles.findMany({
    where: eq(userBranchRoles.userId, user.id)
  })
}
```

---

## Server Actions

### Action Structure

All server actions should follow this pattern:

```typescript
"use server"

import { requirePermission } from '@/lib/auth-utils'
import { 
  ActionResult, 
  success, 
  handleActionError,
  ValidationError,
  NotFoundError,
} from '@/lib/errors'
import { revalidatePath } from 'next/cache'

export async function createResource(data: ResourceData): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Check permissions
    await requirePermission("resources", "add")
    
    // 2. Validate input
    if (!data.name?.trim()) {
      throw new ValidationError("Name is required")
    }
    
    // 3. Check for conflicts
    const existing = await db.query.resources.findFirst({
      where: eq(resources.name, data.name)
    })
    if (existing) {
      throw new ConflictError("Resource already exists")
    }
    
    // 4. Perform operation
    const [newResource] = await db.insert(resources)
      .values({ name: data.name.trim() })
      .returning()
    
    // 5. Revalidate cache
    revalidatePath("/management/resources")
    
    // 6. Return success
    return success({ id: newResource.id })
    
  } catch (error) {
    return handleActionError(error)
  }
}
```

### Action Return Types

Always use `ActionResult<T>` for consistent error handling:

```typescript
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode; details?: Record<string, unknown> }
```

---

## Error Handling

### Error Classes

Use the error classes from `lib/errors.ts`:

```typescript
import {
  ValidationError,      // Invalid input (400)
  AuthenticationError,  // Not logged in (401)
  AuthorizationError,   // No permission (403)
  NotFoundError,        // Resource not found (404)
  ConflictError,        // Already exists (409)
  DatabaseError,        // DB operation failed (500)
} from '@/lib/errors'
```

### In Server Actions

```typescript
// Throw specific errors
if (!data.email) {
  throw new ValidationError("Email is required")
}

if (!existingUser) {
  throw new NotFoundError("User")
}

// Use handleActionError to convert any error to ActionResult
catch (error) {
  return handleActionError(error)
}
```

### In Client Components

Use the `useActionState` hook and `Alert` component:

```typescript
import { useActionState } from '@/hooks/useActionState'
import { ActionError } from '@/components/ui'

function MyComponent() {
  const { execute, isLoading, error, clearError } = useActionState()
  
  const handleSubmit = async () => {
    const result = await execute(createResource(data))
    if (result?.success) {
      // Handle success
    }
  }
  
  return (
    <div>
      <ActionError error={error} onDismiss={clearError} />
      <button disabled={isLoading} onClick={handleSubmit}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
```

---

## Component Development

### Component Types

1. **Server Components** (default) - For data fetching and static content
2. **Client Components** (`"use client"`) - For interactivity

### Management Component Pattern

```typescript
// Page (Server Component) - app/(management)/management/resources/page.tsx
import { getResources } from '@/app/actions/resources'
import ResourcesClient from '@/components/management/ResourcesClient'

export default async function ResourcesPage() {
  const resources = await getResources()
  return <ResourcesClient resources={resources} />
}

// Client Component - components/management/ResourcesClient.tsx
"use client"

import { useState } from 'react'
import { useActionState } from '@/hooks/useActionState'
import { ActionError } from '@/components/ui'
import { managementStyles } from '@/lib/design-tokens'

export default function ResourcesClient({ resources }) {
  const { execute, isLoading, error, clearError } = useActionState()
  // ... component logic
}
```

### UI Components

Reusable UI components are in `components/ui/`:

```typescript
import { Alert, ActionError, FieldError } from '@/components/ui'

// Alert variants: error, success, warning, info
<Alert variant="success" title="Saved">
  Your changes have been saved.
</Alert>

// For action errors
<ActionError error={error} onDismiss={clearError} />

// For form field errors
<FieldError error={formErrors.email} />
```

---

## Adding New Features

### Step-by-Step Guide

#### 1. Define the Database Schema

Add the table definition to `lib/schema.ts`:

```typescript
export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})
```

#### 2. Add Feature to Features Table

Insert a record in the `features` table:

```sql
INSERT INTO features (name, key, description, available_actions)
VALUES ('Resources', 'resources', 'Manage resources', '["view", "add", "edit", "delete"]');
```

#### 3. Create Server Actions

Create `app/actions/resources.ts`:

```typescript
"use server"

import { requireAuth, requirePermission } from '@/lib/auth-utils'
import { ActionResult, success, handleActionError, ValidationError } from '@/lib/errors'
// ... implement CRUD operations following the pattern above
```

#### 4. Create Data Access Functions (Optional)

For complex queries, add to `lib/data-access/resources.ts`:

```typescript
export async function getResourcesWithRelations(branchId?: string) {
  // Optimized query logic
}
```

#### 5. Create the Page

Create `app/(management)/management/resources/page.tsx`:

```typescript
import { getResources } from '@/app/actions/resources'
import ResourcesClient from '@/components/management/ResourcesClient'

export default async function ResourcesPage() {
  const resources = await getResources()
  return <ResourcesClient resources={resources} />
}
```

#### 6. Create the Client Component

Create `components/management/ResourcesClient.tsx` with:
- List/table view
- Create/edit modal
- Delete confirmation
- Error handling with `useActionState`

#### 7. Add to Navigation

Update `components/management/Sidebar.tsx`:

```typescript
const navigation = [
  // ... existing items
  { name: "Resources", href: "/management/resources", icon: Box, key: "resources" },
]
```

#### 8. Set Up Permissions

Assign permissions to roles via the Roles management page or seed script.

---

## Security Checklist

When adding new features, verify:

- [ ] **Authentication** - All server actions call `requireAuth()` or `requirePermission()`
- [ ] **Authorization** - Permission checks use the correct feature key and action
- [ ] **Input Validation** - All user input is validated before use
- [ ] **SQL Injection** - Using Drizzle ORM parameterized queries (automatic)
- [ ] **XSS Prevention** - React handles this by default; avoid `dangerouslySetInnerHTML`
- [ ] **CSRF Protection** - Server actions have built-in CSRF protection
- [ ] **Data Scoping** - Users only see data they have access to (branch-scoped queries)
- [ ] **Error Messages** - Don't expose sensitive information in error messages
- [ ] **Audit Trail** - Consider logging sensitive operations

### Common Security Patterns

```typescript
// Always verify resource ownership/access
const resource = await db.query.resources.findFirst({
  where: and(
    eq(resources.id, resourceId),
    eq(resources.branchId, branchId)  // Scope to user's branch
  )
})

if (!resource) {
  throw new NotFoundError("Resource")  // Don't reveal if it exists in another branch
}
```

---

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Application
ADMIN_ROLE=ADMIN
ALLOW_REGISTRATION=false
ALLOWED_ADMIN_EMAILS=admin@example.com

# Email (optional)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

---

## Testing Recommendations

1. **Unit Tests** - Test utility functions and data access layer
2. **Integration Tests** - Test server actions with database
3. **E2E Tests** - Test critical user flows (login, CRUD operations)

### Testing Server Actions

```typescript
import { createResource } from '@/app/actions/resources'

// Mock auth
jest.mock('@/lib/auth-utils', () => ({
  requirePermission: jest.fn().mockResolvedValue({ id: 'user-1' })
}))

test('createResource validates input', async () => {
  const result = await createResource({ name: '' })
  expect(result.success).toBe(false)
  expect(result.code).toBe('VALIDATION_ERROR')
})
```

---

## Deployment Notes

1. Run database migrations before deploying
2. Ensure all environment variables are set
3. Seed the features table if adding new features
4. Update role permissions for new features

---

## Getting Help

- Check existing implementations in similar features
- Review the error logs for debugging
- Ensure database schema is up to date
- Verify environment variables are correctly set

---

## Branch-Level Feature Management

The application supports enabling/disabling features on a per-branch basis. This allows different branches to have different capabilities based on their needs.

### How It Works

1. **Features Table** - Contains all available features in the system
2. **Branch Features Table** - Junction table that maps which features are enabled for each branch
3. **Role Permissions** - When creating/editing roles for a branch, only features enabled for that branch are shown

### Database Schema

```sql
-- Features available in the system
CREATE TABLE features (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    key TEXT NOT NULL UNIQUE,
    description TEXT,
    available_actions JSONB DEFAULT '["view", "add", "edit", "delete"]'
);

-- Which features are enabled per branch
CREATE TABLE branch_features (
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    PRIMARY KEY (branch_id, feature_id)
);
```

### Creating a Branch with Features

When creating a branch, you can specify which features to enable:

```typescript
import { createBranch } from '@/app/actions/branches'

const result = await createBranch({
    name: "New Branch",
    address: "123 Main St",
    featureAssignments: [
        { featureId: "feature-uuid-1", isEnabled: true },
        { featureId: "feature-uuid-2", isEnabled: true },
        { featureId: "feature-uuid-3", isEnabled: false },
    ]
})
```

### Querying Enabled Features

```typescript
import { getEnabledFeaturesForBranch } from '@/app/actions/branches'

// Get only features enabled for a specific branch
const enabledFeatures = await getEnabledFeaturesForBranch(branchId)
```

### Role Management Integration

When managing roles for a branch, the system automatically filters features:

- **Super Users** - See all features when managing global roles
- **Branch Users** - Only see features enabled for their branch

```typescript
// In roles page
let features
if (isSuperUser) {
    features = await getFeatures() // All features
} else if (branchId) {
    features = await getEnabledFeaturesForBranch(branchId) // Branch-specific
}
```

### UI Components

The `BranchesClient` component includes a feature selection interface:

- Checkbox grid for selecting features
- "Select All" / "Deselect All" quick actions
- Visual indicator showing enabled feature count
- Features are loaded when editing an existing branch

### Best Practices

1. **Default Features** - When creating a new branch, consider enabling all features by default
2. **Feature Dependencies** - If features have dependencies, handle them in the UI or validation
3. **Super User Access** - Super users always have access to all features regardless of branch settings
4. **Migration** - When adding new features, consider whether to auto-enable them for existing branches
