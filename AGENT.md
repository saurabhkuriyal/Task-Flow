# AGENTS.md — Project Coding Guidelines

## 1. Project Scope

This project contains a Next.js frontend inside the `web/` directory and may contain a backend and other services in separate directories.

**Frontend-specific rules in this document apply exclusively to `web/`.**

- Use Next.js, TypeScript, React Hook Form, shadcn/ui, and Tailwind CSS according to the rules below only within `web/`.
- Do not apply frontend architecture or styling rules to the backend or other directories.
- Do not modify files outside `web/` unless the user explicitly requests it.
- If a task involves both frontend and backend changes, follow these frontend rules inside `web/` and preserve the existing conventions of the backend.
- Before modifying code, inspect the target file's location and the existing project structure.

## 2. General Coding Principles

- Write clean, maintainable, readable, and type-safe code.
- Follow separation of concerns and keep each module focused on a clear responsibility.
- Prefer simple solutions over unnecessary abstractions.
- Avoid duplicated code when a reusable solution provides a real benefit.
- Do not create files, folders, hooks, utilities, or abstractions without a clear reason.
- Inspect existing code before introducing new patterns.
- Preserve existing functionality unless the user explicitly requests a change.
- Avoid unrelated refactoring.
- Do not install new dependencies without a clear justification.
- Do not invent API endpoints, data structures, or business requirements. Inspect existing implementations and contracts first.

## 3. Frontend Technology Stack — `web/` Only

Use the existing project configuration for:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- React Hook Form for non-trivial forms

Use existing validation libraries, HTTP clients, and utility libraries when already installed and appropriate.

Do not introduce competing UI component libraries or styling frameworks.

## 4. Recommended Frontend Folder Structure

Use this as a guideline, not a requirement to create every folder immediately.

```text
web/
├── AGENTS.md                  # Optional frontend-specific instructions
├── package.json
├── components.json            # shadcn/ui configuration
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── (auth)/
    │       ├── login/
    │       │   └── page.tsx
    │       └── signup/
    │           └── page.tsx
    │
    ├── components/
    │   ├── ui/                # shadcn/ui components
    │   └── auth/              # Feature-specific UI
    │       ├── LoginForm.tsx
    │       └── SignupForm.tsx
    │
    ├── hooks/
    │   └── auth/
    │       ├── useLogin.ts
    │       └── useSignup.ts
    │
    ├── services/
    │   └── auth.service.ts
    │
    ├── types/
    │   └── auth.ts
    │
    ├── constants/
    │   ├── api.ts
    │   └── routes.ts
    │
    └── lib/
        └── utils.ts
```

Rules:

- Adapt to the actual project structure if it differs from this example.
- Do not create empty folders just to match this structure.
- Keep `components/ui/` for shadcn/ui components and follow the existing shadcn configuration.
- Use feature-specific directories when they improve organization.
- Do not move existing files merely to match the example.

## 5. Responsibilities of Frontend Directories

### `app/`

- Defines routes, layouts, loading states, and error boundaries.
- Keep `page.tsx` focused on composing the page.
- Use route groups such as `(auth)` when they improve organization.
- Avoid placing substantial business logic directly in page files.

### `components/`

- Contains reusable UI and feature-specific components.
- Components render UI and handle presentation-related interactions.
- Avoid putting direct API requests or complex business logic in UI components.
- Extract a component when it is reusable, complex, or improves readability.
- Do not split every small JSX element into a separate file unnecessarily.

### `hooks/`

- Contains custom React hooks for client-side state and behavior.
- Use hooks for form management, loading states, submission handling, and client-side side effects when appropriate.
- Do not create a custom hook simply to wrap a trivial function.
- Do not use React hooks in Server Components.

### `services/`

- Contains functions responsible for communicating with backend APIs or external services.
- Keep HTTP request logic out of UI components.
- Use the project's existing HTTP client or `fetch`.
- Handle HTTP errors and return typed data when appropriate.
- Do not put React hooks or UI rendering logic in services.
- Never expose private credentials or secrets in browser-side code.

### `types/`

- Contains shared TypeScript types and interfaces.
- Define request and response types for important or reused API contracts.
- Prefer `import type` when importing types only.
- Avoid redundant types when TypeScript can infer them safely.

### `constants/`

- Contains shared, stable values such as route paths and API endpoint paths.
- Centralize repeated values when doing so improves maintainability.
- Do not create constants for every trivial string.

### `lib/`

- Contains shared utilities and library configuration.
- Keep feature-specific business logic in its appropriate layer.
- Reuse existing utilities before creating duplicates.

## 6. Next.js and React Best Practices

- Prefer Server Components by default.
- Add `"use client"` only when client-side state, event handlers, effects, or browser APIs are required.
- Keep server-only logic, private credentials, and privileged operations on the server.
- Do not import server-only modules into Client Components.
- Use appropriate Next.js routing and rendering conventions.
- Avoid unnecessary client-side JavaScript.
- Avoid repeated data fetching when an existing result can be reused.
- Do not rely on client-side checks alone to protect sensitive resources.
- Follow the project's existing conventions for environment variables and server/client boundaries.

## 7. UI Components — shadcn/ui First

**shadcn/ui is the preferred source for standard UI components inside `web/`.**

Before building a component from scratch:

1. Check whether the appropriate shadcn/ui component already exists in `components/ui/`.
2. Check the project's `components.json` configuration.
3. Reuse the existing component if it meets the requirement.
4. Compose multiple shadcn/ui components if that is the cleanest solution.
5. Add the required shadcn/ui component using the project's existing CLI setup when necessary.
6. Build a custom React component only when existing components cannot reasonably satisfy the requirement.

Prefer shadcn/ui components for:

- Buttons
- Inputs and textareas
- Labels
- Forms
- Cards
- Dialogs and modals
- Dropdown menus
- Selects
- Checkboxes and radio groups
- Tabs
- Alerts
- Tooltips
- Tables
- Popovers
- Other common interface elements

Rules:

- Reuse existing components instead of duplicating them.
- Do not unnecessarily rewrite shadcn/ui source files.
- Follow the project's existing variants, design tokens, and component conventions.
- Do not install a second UI component library for functionality already available in shadcn/ui.

## 8. Styling Rules — Tailwind CSS Only

Inside `web/`, use **shadcn/ui and Tailwind CSS exclusively for UI components and styling**.

Allowed:

- shadcn/ui components
- Tailwind CSS utility classes
- Existing CSS variables and design tokens
- Existing global CSS required by the current Tailwind and shadcn setup
- Minimal custom CSS when Tailwind cannot reasonably express a required effect

Not allowed by default:

- Material UI
- Chakra UI
- Ant Design
- Bootstrap
- styled-components
- Emotion
- Other competing styling frameworks or UI component libraries

Additional rules:

- Use Tailwind for layout, spacing, sizing, typography, borders, colors, and responsive behavior.
- Prefer existing theme variables and design tokens over hardcoded colors.
- Avoid unnecessary custom CSS files.
- Do not introduce inline styles when Tailwind or existing design tokens can handle the requirement.
- Do not install a different styling framework to solve a problem Tailwind can handle.
- Preserve the existing shadcn/ui theme and global styles unless a change is necessary.
- Do not modify Tailwind configuration without a clear reason.

## 9. Design and Accessibility

- Build responsive interfaces for mobile, tablet, and desktop.
- Maintain consistent typography, spacing, colors, borders, and radii.
- Use semantic HTML and accessible shadcn/ui components.
- Associate inputs with labels.
- Include visible keyboard focus states.
- Support keyboard navigation for interactive elements.
- Provide meaningful validation messages.
- Ensure disabled, loading, success, and error states are visually clear.
- Avoid unnecessary animations and excessive visual complexity.
- Do not sacrifice accessibility for visual appearance.


## 10. API Communication

For API-driven frontend features, prefer this flow when appropriate:

```text
page.tsx
    ↓
FeatureForm.tsx
    ↓
useFeature.ts
    ↓
feature.service.ts
    ↓
Backend API
```

This is a recommended pattern, not a requirement to create a hook for every feature.

Rules:

- Keep endpoint paths centralized when appropriate.
- Define request and response types for important API contracts.
- Use axios for making api request
- Handle network failures and unsuccessful HTTP responses.
- Do not hardcode the same backend URL in multiple files.
- Use environment variables for configurable API base URLs.
- Only variables intentionally prefixed with `NEXT_PUBLIC_` should be considered available to browser code.
- Never put private credentials in `NEXT_PUBLIC_` environment variables.
- Do not invent backend response formats or endpoints when the existing contract is available.

## 11. TypeScript and Code Quality

- Avoid `any`; use explicit types or `unknown` when appropriate.
- Avoid unnecessary type assertions and non-null assertions.
- Use descriptive names for variables, functions, types, and files.
- Keep functions focused on one responsibility.
- Reuse existing components and utilities where appropriate.
- Avoid duplicated code.
- Avoid unnecessary dependencies.
- Follow existing import aliases, linting, and formatting conventions.
- Preserve existing functionality during modifications.
- Do not refactor unrelated code without permission.





 