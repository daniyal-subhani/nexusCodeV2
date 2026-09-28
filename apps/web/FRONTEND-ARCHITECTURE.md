# NexusCore V2 — Frontend Architecture

> Architecture blueprint for the NexusCore V2 web application.

---

## 1. Overview

NexusCore V2 uses a **feature/domain-oriented frontend architecture**.

The backend is divided into independently deployable microservices, while the frontend is organized around the **business features and user-facing domains** those services provide.

### Backend

```text
Auth Service
User Service
Notification Service
Chat Service
```

### Frontend

```text
Auth
User
Notification
Chat
```

The frontend should **not mirror the backend microservice structure one-to-one**.

Instead:

```text
                    NexusCore V2
                         │
             ┌───────────┴───────────┐
             │                       │
          Backend                 Frontend
             │                       │
       Microservices              Features
             │                       │
     ┌───────┼────────┐       ┌──────┼──────┐
     │       │        │       │      │      │
    Auth    User   Notification Auth  User  Chat
             │                       │
           Chat                 Notification
```

---

# 2. High-Level Architecture

The frontend communicates with the backend through the **Gateway Service**.

```text
┌─────────────────────────────┐
│        Next.js Web App      │
│                             │
│  App Router                 │
│  Features                   │
│  Components                 │
│  API Client                 │
└──────────────┬──────────────┘
               │
               │ HTTP / WebSocket
               ▼
┌─────────────────────────────┐
│       Gateway Service       │
└──────────────┬──────────────┘
               │
       ┌───────┼───────────────┐
       │       │               │
       ▼       ▼               ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│   Auth   │ │   User   │ │ Notification │
│ Service  │ │ Service  │ │   Service    │
└──────────┘ └──────────┘ └──────────────┘
               │
               ▼
         ┌──────────┐
         │   Chat   │
         │ Service  │
         └──────────┘
```

### Important boundary

The frontend knows about:

```text
Gateway API
```

The frontend should not depend on:

```text
Auth Service internal implementation
User Service internal implementation
RabbitMQ infrastructure
Service databases
```

The frontend consumes APIs/contracts, not backend implementation details.

---

# 3. Target Project Structure

```text
apps/
└── web/
    │
    ├── public/
    │
    ├── src/
    │   │
    │   ├── app/
    │   │   │
    │   │   ├── (auth)/
    │   │   │   ├── sign-in/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── sign-up/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── verify-email/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── verify-otp/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── forgot-password/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── reset-password/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   └── oauth/
    │   │   │       └── callback/
    │   │   │           └── page.tsx
    │   │   │
    │   │   ├── (dashboard)/
    │   │   │   ├── layout.tsx
    │   │   │   │
    │   │   │   ├── dashboard/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── profile/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   ├── settings/
    │   │   │   │   └── page.tsx
    │   │   │   │
    │   │   │   └── chat/
    │   │   │       └── page.tsx
    │   │   │
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── loading.tsx
    │   │   ├── error.tsx
    │   │   └── not-found.tsx
    │   │
    │   ├── features/
    │   │   │
    │   │   ├── auth/
    │   │   │   ├── api/
    │   │   │   ├── components/
    │   │   │   ├── hooks/
    │   │   │   ├── schemas/
    │   │   │   ├── stores/
    │   │   │   ├── types/
    │   │   │   └── index.ts
    │   │   │
    │   │   ├── user/
    │   │   │   ├── api/
    │   │   │   ├── components/
    │   │   │   ├── hooks/
    │   │   │   ├── schemas/
    │   │   │   ├── types/
    │   │   │   └── index.ts
    │   │   │
    │   │   ├── notification/
    │   │   │   ├── api/
    │   │   │   ├── components/
    │   │   │   ├── hooks/
    │   │   │   ├── realtime/
    │   │   │   ├── types/
    │   │   │   └── index.ts
    │   │   │
    │   │   └── chat/
    │   │       ├── api/
    │   │       ├── components/
    │   │       ├── hooks/
    │   │       ├── realtime/
    │   │       ├── schemas/
    │   │       ├── stores/
    │   │       ├── types/
    │   │       └── index.ts
    │   │
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── layout/
    │   │   └── shared/
    │   │
    │   ├── lib/
    │   │   ├── api/
    │   │   ├── auth/
    │   │   ├── http/
    │   │   └── utils/
    │   │
    │   ├── hooks/
    │   ├── providers/
    │   ├── stores/
    │   ├── types/
    │   └── config/
    │
    ├── FRONTEND-ARCHITECTURE.md
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── eslint.config.mjs
    └── ...
```

---

# 4. `app/` — Routing Layer

The `app/` directory is the **Next.js App Router layer**.

Its primary responsibility is routing and route-level composition.

It contains:

* Pages
* Layouts
* Route groups
* Loading states
* Error boundaries
* Not-found pages
* Route-level metadata

Example:

```text
app/
└── (auth)/
    └── sign-in/
        └── page.tsx
```

This represents:

```text
/sign-in
```

The page should remain relatively thin.

Example:

```tsx
import { LoginForm } from '@/features/auth/components/login-form';

export default function SignInPage() {
  return <LoginForm />;
}
```

### Rule

Do not turn `page.tsx` into a large business-logic file.

Prefer:

```text
app
 ↓
feature
 ↓
API / hooks / components
```

---

# 5. Route Groups

Next.js route groups allow routes to be organized without affecting the URL.

Example:

```text
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
│
└── (dashboard)/
    ├── dashboard/
    ├── profile/
    └── settings/
```

The parentheses mean the group name is not included in the URL.

Therefore:

```text
(auth)/sign-in
```

becomes:

```text
/sign-in
```

while:

```text
(dashboard)/profile
```

becomes:

```text
/profile
```

Route groups can also provide different layouts.

---

# 6. `features/` — Business Domains

The `features/` directory contains the actual **business/domain functionality** of the frontend.

Each feature owns the code directly related to that domain.

```text
features/
├── auth/
├── user/
├── notification/
└── chat/
```

This is the most important organizational principle of the frontend.

---

# 7. Auth Feature

The Auth feature handles all authentication-related frontend functionality.

Current/planned capabilities:

* Sign up
* Sign in
* Logout
* Email verification
* OTP verification
* Forgot password
* Reset password
* Change password
* OAuth
* Session/authentication state

Target structure:

```text
features/
└── auth/
    ├── api/
    │   ├── login.ts
    │   ├── register.ts
    │   ├── logout.ts
    │   ├── verify-email.ts
    │   ├── verify-otp.ts
    │   ├── forgot-password.ts
    │   ├── reset-password.ts
    │   └── change-password.ts
    │
    ├── components/
    │   ├── login-form.tsx
    │   ├── register-form.tsx
    │   ├── otp-form.tsx
    │   ├── verify-email-form.tsx
    │   ├── forgot-password-form.tsx
    │   ├── reset-password-form.tsx
    │   └── change-password-form.tsx
    │
    ├── hooks/
    │   ├── use-login.ts
    │   ├── use-register.ts
    │   └── use-logout.ts
    │
    ├── schemas/
    │   ├── login.schema.ts
    │   ├── register.schema.ts
    │   └── reset-password.schema.ts
    │
    ├── stores/
    │
    ├── types/
    │   └── auth.types.ts
    │
    └── index.ts
```

Not every file needs to exist immediately.

Create them when the functionality is implemented.

---

# 8. User Feature

The User feature handles user-related functionality.

Potential responsibilities:

* Profile
* Update profile
* Avatar
* Account information
* User preferences
* User settings
* Account deletion

Target:

```text
features/
└── user/
    ├── api/
    │   ├── get-profile.ts
    │   ├── update-profile.ts
    │   ├── upload-avatar.ts
    │   └── delete-account.ts
    │
    ├── components/
    │   ├── profile-card.tsx
    │   ├── profile-form.tsx
    │   └── avatar-upload.tsx
    │
    ├── hooks/
    ├── schemas/
    ├── types/
    └── index.ts
```

---

# 9. Notification Feature

The Notification feature owns notification-related functionality.

Potential responsibilities:

* Notification list
* Notification details
* Mark as read
* Mark all as read
* Notification preferences
* Realtime notifications

Target:

```text
features/
└── notification/
    ├── api/
    │   ├── get-notifications.ts
    │   ├── mark-as-read.ts
    │   └── mark-all-as-read.ts
    │
    ├── components/
    │   ├── notification-bell.tsx
    │   ├── notification-list.tsx
    │   └── notification-item.tsx
    │
    ├── hooks/
    ├── realtime/
    │   └── notification-socket.ts
    │
    ├── types/
    └── index.ts
```

---

# 10. Chat Feature

Chat can become one of the largest frontend domains.

Potential responsibilities:

* Conversations
* Messages
* Sending messages
* Message history
* Realtime messaging
* Typing indicators
* Online/offline status
* Read receipts
* Attachments
* Conversation management

Target:

```text
features/
└── chat/
    ├── api/
    │   ├── get-conversations.ts
    │   ├── get-messages.ts
    │   ├── send-message.ts
    │   └── create-conversation.ts
    │
    ├── components/
    │   ├── chat-layout.tsx
    │   ├── conversation-list.tsx
    │   ├── conversation-item.tsx
    │   ├── message-list.tsx
    │   ├── message-item.tsx
    │   ├── message-input.tsx
    │   └── typing-indicator.tsx
    │
    ├── hooks/
    │   ├── use-conversations.ts
    │   ├── use-messages.ts
    │   └── use-chat-socket.ts
    │
    ├── realtime/
    │   └── chat-socket.ts
    │
    ├── schemas/
    ├── stores/
    ├── types/
    └── index.ts
```

---

# 11. `components/` — Shared UI

The global `components/` directory contains components that are reusable across multiple features.

```text
components/
├── ui/
├── layout/
└── shared/
```

## `components/ui/`

Generic UI primitives.

Examples:

```text
Button
Input
Dialog
Dropdown
Select
Badge
Card
Tooltip
Tabs
```

These components should not contain business-specific logic.

---

## `components/layout/`

Application-wide layout components.

Examples:

```text
Navbar
Sidebar
Footer
MobileNavigation
```

---

## `components/shared/`

Reusable application-level components.

Examples:

```text
Loading
ErrorState
EmptyState
ConfirmDialog
```

---

# 12. Feature Components vs Shared Components

Feature-specific components stay inside their feature.

For example:

```text
LoginForm
```

belongs to:

```text
features/auth/components/
```

not:

```text
components/
```

Similarly:

```text
MessageInput
```

belongs to:

```text
features/chat/components/
```

not:

```text
components/
```

Only move a component into `components/` when it is genuinely shared.

### Example

```text
features/auth/components/login-form.tsx
```

```text
features/chat/components/message-input.tsx
```

```text
components/ui/button.tsx
```

---

# 13. `lib/` — Infrastructure and Utilities

The `lib/` directory contains application infrastructure and reusable technical utilities.

Target:

```text
lib/
├── api/
├── auth/
├── http/
└── utils/
```

---

## `lib/api/`

Central API infrastructure.

Examples:

```text
API client
Request helpers
API configuration
Endpoint utilities
```

Feature API functions can use this infrastructure.

```text
features/auth/api/login.ts
            │
            ▼
      lib/api/client.ts
            │
            ▼
         Gateway
```

---

## `lib/auth/`

Frontend authentication/session infrastructure.

Examples:

```text
session helpers
auth state utilities
route protection helpers
```

Business-specific authentication UI remains inside:

```text
features/auth/
```

---

## `lib/http/`

HTTP-related infrastructure.

Examples:

```text
HTTP errors
Request configuration
Response handling
Headers
```

---

## `lib/utils/`

Generic utilities.

Examples:

```text
Date formatting
String formatting
Class name utilities
General helper functions
```

---

# 14. `hooks/`

The global `hooks/` directory contains hooks that are genuinely application-wide.

Examples:

```text
use-debounce.ts
use-media-query.ts
use-mounted.ts
```

Feature-specific hooks should remain inside their feature.

For example:

```text
features/chat/hooks/use-chat.ts
```

rather than:

```text
hooks/use-chat.ts
```

---

# 15. `providers/`

Contains React providers required across the application.

Potential providers:

```text
QueryProvider
ThemeProvider
AuthProvider
SocketProvider
```

Example:

```text
providers/
├── query-provider.tsx
├── theme-provider.tsx
└── auth-provider.tsx
```

Only create providers when the application actually needs them.

---

# 16. `stores/`

The global `stores/` directory is for truly global client-side state.

Examples:

```text
theme state
global UI state
sidebar state
application preferences
```

Feature-specific state should stay inside the feature:

```text
features/chat/stores/
features/auth/stores/
```

Avoid putting every piece of state into a global store.

Prefer local state when global state is unnecessary.

---

# 17. `types/`

The global `types/` directory contains types shared across multiple unrelated features.

Example:

```text
types/
├── api.ts
├── pagination.ts
└── common.ts
```

Feature-specific types should stay with the feature:

```text
features/auth/types/
features/user/types/
features/chat/types/
```

---

# 18. `config/`

Application-level configuration.

Examples:

```text
API URL
Application metadata
Feature flags
Environment configuration
Navigation configuration
```

Example:

```text
config/
├── env.ts
├── app.ts
└── navigation.ts
```

Do not expose server-only secrets to the client.

---

# 19. API Architecture

Frontend API calls should follow a consistent flow.

```text
Component
    │
    ▼
Hook / Server Action / Feature API
    │
    ▼
lib/api
    │
    ▼
Gateway
    │
    ▼
Microservice
```

Example:

```text
LoginForm
   │
   ▼
useLogin()
   │
   ▼
auth/api/login.ts
   │
   ▼
lib/api/client.ts
   │
   ▼
Gateway
   │
   ▼
Auth Service
```

The frontend should not directly access service databases or RabbitMQ.

---

# 20. Backend Service Mapping

Frontend features correspond conceptually to backend domains, but they are not required to mirror backend services exactly.

```text
Frontend                    Backend

features/auth        →      auth-service

features/user        →      user-service

features/notification →     notification-service

features/chat        →      chat-service
```

This is a conceptual mapping, not a dependency rule.

The frontend normally communicates through:

```text
Frontend → Gateway → Services
```

---

# 21. Authentication Flow

Example login flow:

```text
┌──────────────┐
│ Login Form   │
└──────┬───────┘
       │
       ▼
features/auth/api/login.ts
       │
       ▼
lib/api/client.ts
       │
       ▼
Gateway Service
       │
       ▼
Auth Service
       │
       ▼
Authentication
       │
       ▼
Response / Session
       │
       ▼
Frontend Auth State
```

Signup follows the same general principle:

```text
Sign Up
   ↓
Auth Feature
   ↓
Gateway
   ↓
Auth Service
   ↓
User Created
   ↓
RabbitMQ event
   ↓
User Service
```

The frontend does not need to know how RabbitMQ or the internal event infrastructure works.

---

# 22. Authentication Routes

Current/planned authentication routes:

```text
/sign-in
/sign-up
/verify-email
/verify-otp
/forgot-password
/reset-password
```

Future:

```text
/oauth/callback
```

Potential account security routes:

```text
/change-password
```

Whether these become standalone routes or sections inside `/settings` can be decided when the UI is implemented.

---

# 23. Server vs Client Components

Next.js Server Components should be the default where appropriate.

Use Client Components when browser-side interactivity is required.

Typical Client Components:

```text
Forms
Interactive dialogs
Dropdowns
Chat interface
Realtime UI
Client-side state
Browser APIs
```

Typical Server Components:

```text
Static page composition
Data fetching where appropriate
SEO-oriented content
Server-side rendering
```

Do not add `"use client"` automatically to every component.

Use it only when the component actually requires client-side behavior.

---

# 24. State Management

State should be classified before choosing a solution.

### Local UI state

Use:

```text
React useState / useReducer
```

Examples:

```text
Modal open/close
Input state
Dropdown state
Temporary UI state
```

### Server state

Use an appropriate server-state/data-fetching solution.

Examples:

```text
User profile
Notifications
Conversations
Messages
```

### Global client state

Use a store only when multiple parts of the application genuinely need the same client-side state.

Examples:

```text
Theme
Global UI preferences
Authentication state
Chat connection state
```

Avoid turning the entire application into one giant global store.

---

# 25. Validation

Validation should exist at the appropriate boundaries.

Frontend forms may use schemas for:

```text
Login
Registration
OTP
Password reset
Profile updates
```

Example:

```text
features/auth/schemas/
├── login.schema.ts
├── register.schema.ts
└── reset-password.schema.ts
```

Frontend validation improves UX.

Backend validation remains authoritative.

```text
Frontend validation
        +
Backend validation
```

Never assume frontend validation is a security boundary.

---

# 26. Error Handling

API errors should be handled consistently.

General flow:

```text
Backend Error
      ↓
Gateway
      ↓
API Client
      ↓
Normalized Error
      ↓
Feature
      ↓
UI
```

Feature-specific UI decides how to display the error.

Examples:

```text
Invalid credentials
Email already exists
OTP expired
Password reset token expired
Unauthorized
Forbidden
Rate limited
Server unavailable
```

---

# 27. Realtime Architecture

Realtime functionality should be isolated from normal HTTP API code.

For example:

```text
features/chat/
├── api/
│   └── ...
│
├── realtime/
│   └── chat-socket.ts
│
└── components/
```

General architecture:

```text
             HTTP
Frontend ───────────────► Gateway
   │                         │
   │                         ▼
   │                    Chat Service
   │
   │ WebSocket / Realtime
   └────────────────────► Gateway
                              │
                              ▼
                         Chat Service
```

The exact realtime transport can be selected later.

---

# 28. Feature Encapsulation

Each feature should own its internal implementation.

For example:

```text
features/auth/
```

should contain authentication-specific:

```text
components
hooks
API functions
schemas
types
state
```

Other features should consume the feature through a clean public interface where appropriate.

This prevents unrelated parts of the application from becoming tightly coupled.

---

# 29. Barrel Exports

Each feature may expose selected public APIs through:

```text
features/auth/index.ts
```

Example:

```text
features/auth/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
└── index.ts
```

The `index.ts` file should expose only what other parts of the application are expected to use.

Do not export every internal implementation detail automatically.

---

# 30. Dependency Direction

The preferred dependency direction is:

```text
app
 ↓
features
 ↓
lib
```

Shared components can be consumed by features:

```text
features
   ↓
components
```

But avoid circular dependencies.

Example:

```text
features/auth
      ↓
components/ui
      ↓
      ❌
features/auth
```

The shared UI layer should not depend on a business feature.

---

# 31. What NOT to Do

### Do not mirror backend services literally

Avoid:

```text
src/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── chat-service/
│   └── notification-service/
```

The frontend is not another copy of the backend architecture.

---

### Do not create one giant components folder

Avoid:

```text
components/
├── LoginForm.tsx
├── RegisterForm.tsx
├── Profile.tsx
├── Chat.tsx
├── Message.tsx
├── Notification.tsx
├── ...
```

Prefer domain ownership:

```text
features/auth/components/
features/user/components/
features/chat/components/
features/notification/components/
```

---

### Do not create everything upfront

The documented architecture is a **target architecture**.

It does not mean all directories and files must exist immediately.

Start small.

Expand when the feature requires it.

---

# 32. Initial Implementation Structure

At the beginning of the project, the actual codebase can be much smaller:

```text
src/
├── app/
├── components/
├── features/
└── lib/
```

Then, when authentication is implemented:

```text
src/
├── app/
│   └── (auth)/
│       ├── sign-in/
│       └── sign-up/
│
├── features/
│   └── auth/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       └── types/
│
├── components/
│   └── ui/
│
└── lib/
    └── api/
```

Later, as User functionality is implemented:

```text
features/
├── auth/
└── user/
```

Then:

```text
features/
├── auth/
├── user/
├── notification/
└── chat/
```

The architecture grows **with the application**.

---

# 33. Development Principle

Do not build the folder structure first and then try to find a purpose for each folder.

Instead:

```text
Requirement
    ↓
Feature
    ↓
Route
    ↓
Component
    ↓
API
    ↓
Hook / State / Schema
```

Create only the files required by that feature.

Example:

```text
Requirement:
User can sign in
```

Then create:

```text
app/(auth)/sign-in/page.tsx

features/auth/
├── api/login.ts
├── components/login-form.tsx
├── schemas/login.schema.ts
└── ...
```

When OTP is implemented, add:

```text
app/(auth)/verify-otp/page.tsx

features/auth/
├── api/verify-otp.ts
├── components/otp-form.tsx
└── ...
```

---

# 34. Monorepo Relationship

NexusCore V2 is a pnpm monorepo.

```text
nexus-core-v2/
│
├── apps/
│   └── web/                    # Next.js frontend
│
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── notification-service/
│   └── chat-service/
│
└── packages/
    ├── common/                 # Backend infrastructure
    ├── contracts/              # Shared contracts/types (future)
    └── ui/                     # Shared UI package (future, if needed)
```

The frontend should not import backend infrastructure from:

```text
packages/common
```

if that package contains server-side infrastructure such as:

```text
RabbitMQ
Database
Server utilities
Backend-only dependencies
```

If shared API/event contracts become necessary, use a dedicated package:

```text
packages/contracts
```

Potential future structure:

```text
packages/contracts/
├── auth/
├── user/
├── notification/
├── chat/
└── index.ts
```

---

# 35. Frontend-to-Backend Boundary

The architectural boundary should remain clear:

```text
┌───────────────────────────────────┐
│           apps/web                │
│                                   │
│ app → features → lib/api          │
└─────────────────┬─────────────────┘
                  │
                  │ API
                  ▼
┌───────────────────────────────────┐
│         Gateway Service            │
└─────────────────┬─────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Auth      User      Chat
      Service   Service   Service
                  │
                  ▼
             Notification
               Service
```

Frontend responsibilities:

```text
UI
Routing
User interaction
Client state
Server state
API consumption
Validation for UX
Realtime UI
```

Backend responsibilities:

```text
Authentication
Authorization
Business rules
Data persistence
Security
Event processing
Messaging
Service-to-service communication
```

---

# 36. Naming Conventions

Use lowercase kebab-case for files and directories where practical.

Examples:

```text
login-form.tsx
verify-email-form.tsx
use-current-user.ts
get-notifications.ts
notification-item.tsx
```

React components use PascalCase:

```tsx
LoginForm
NotificationItem
MessageInput
```

Functions/hooks use camelCase:

```text
loginUser()
getCurrentUser()
useCurrentUser()
```

Types/interfaces use PascalCase:

```text
User
AuthSession
LoginResponse
Notification
ChatMessage
```

---

# 37. Core Architectural Rules

The following rules should guide future development.

### Rule 1

`app/` is primarily the routing layer.

### Rule 2

Business features belong in `features/`.

### Rule 3

Feature-specific components stay inside their feature.

### Rule 4

Shared UI belongs in `components/`.

### Rule 5

Infrastructure belongs in `lib/`.

### Rule 6

Feature-specific hooks stay inside their feature.

### Rule 7

Do not create global state unless it is genuinely global.

### Rule 8

Frontend communicates with backend through the Gateway.

### Rule 9

Frontend does not access backend databases directly.

### Rule 10

Frontend does not depend on RabbitMQ implementation.

### Rule 11

Backend microservice boundaries should not dictate frontend folder boundaries.

### Rule 12

Do not create future folders/files until they are needed.

---

# 38. Final Mental Model

When deciding where new code belongs, ask:

```text
Is this a URL / route?
        │
        └── YES → app/

Is this business/domain functionality?
        │
        └── YES → features/<domain>/

Is this reusable UI?
        │
        └── YES → components/

Is this application infrastructure/helper?
        │
        └── YES → lib/

Is this truly global state?
        │
        └── YES → stores/

Is this truly global hook?
        │
        └── YES → hooks/

Is this application-wide provider?
        │
        └── YES → providers/

Is this shared type?
        │
        └── YES → types/
```

---

# 39. Target Architecture Summary

```text
apps/web/
│
└── src/
    │
    ├── app/
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   └── ...
    │
    ├── features/
    │   ├── auth/
    │   ├── user/
    │   ├── notification/
    │   └── chat/
    │
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   └── shared/
    │
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   ├── http/
    │   └── utils/
    │
    ├── hooks/
    ├── providers/
    ├── stores/
    ├── types/
    └── config/
```

### Remember

This is a **blueprint, not a checklist of files to create immediately**.

The codebase should evolve from:

```text
Small
  ↓
Feature
  ↓
Feature grows
  ↓
Extract structure
  ↓
Larger domain
```

rather than:

```text
Create 50 folders
        ↓
Create 100 empty files
        ↓
Figure out what they do later
```

The architecture exists to make development easier — not to make the repository look complicated.
