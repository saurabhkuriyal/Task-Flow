# TaskFlow — Modern Employee Task Management & AI Telemetry OS

TaskFlow is an enterprise-grade employee task management and autonomous agentic workflow operating system. Built with Next.js 16, React 19, and Tailwind CSS v4, TaskFlow enables high-velocity engineering, product, and operations teams to organize multi-tenant company workspaces, track sprint velocities, manage cross-functional roles, and monitor team telemetry in real time.

---

## 🎯 Project Goal

The primary goal of TaskFlow is to replace cluttered, legacy task trackers with a minimalist, high-performance workspace operating system that offers:
- **Multi-Tenant Organization Management**: Company registration, GST/tax profile tracking, department subdivision, and project charters.
- **Granular Role Hierarchy**: Native distinction between `owner`, `chief` (department/sprint leads), and `employee` roles.
- **Persistent Workspace Shell**: Dedicated organization dashboard featuring a contextual top navigation bar, collapsible sidebar, and route-level state preservation.
- **Production-Grade Architecture**: Strictly following the `API Route -> Service (Axios) -> Custom Hook -> Component -> Page` pattern with Next.js 16 Server-Side Rendering and React 19 hydration safety.

---

## 🛠️ Tech Stack & Libraries

### Core Framework & Runtime
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.4.0` | App Router, Server Components, Route Handlers, Turbopack |
| **React** | `19.3.0` | Frontend UI library with React Server Components & `useSyncExternalStore` |
| **TypeScript** | `^5.0.0` | Static typing and interfaces across models, APIs, and client hooks |
| **Node.js** | `>= 20.x` | Server runtime environment |

### Styling & UI Components
| Library | Purpose |
| :--- | :--- |
| **Tailwind CSS v4** | Modern zero-runtime CSS with OKLCH dynamic color palettes |
| **@tailwindcss/turbopack** | Fast Turbopack-optimized Tailwind compilation |
| **@base-ui/react** | Accessible, unstyled UI primitives (buttons, inputs, tabs) |
| **lucide-react** | Clean, minimalist SVG icons |
| **class-variance-authority (CVA)** | Component variant styling system |
| **tw-animate-css** | Micro-interaction animations and transitions |

### Backend, Database & Security
| Library | Purpose |
| :--- | :--- |
| **Mongoose** (`^9.11.2`) | MongoDB object data modeling, schemas, and queries |
| **jose** (`^6.2.15`) | Lightweight JWT token signing and verification for HTTP-only cookies |
| **bcryptjs** (`^3.0.3`) | Secure password hashing with salt generation |
| **axios** (`^1.7.9`) | Standardized HTTP client for internal services |
| **react-hook-form** (`^7.90.0`) | Performant, lightweight client-side form validation |

---

## 📂 Project Structure

```
taskManagerv1/
└── web/
    ├── src/
    │   ├── app/                                 # Next.js App Router (Pages & Routes)
    │   │   ├── api/                             # Backend REST API Handlers
    │   │   │   ├── auth/
    │   │   │   │   ├── signin/route.ts          # Authentication login & JWT cookie issuance
    │   │   │   │   └── signup/route.ts          # User registration & role initialization
    │   │   │   └── organizations/
    │   │   │       ├── route.ts                 # Fetch organizations by user query
    │   │   │       ├── [orgId]/route.ts         # Query single organization details
    │   │   │       ├── createOrganization/      # Organization registration endpoint
    │   │   │       └── getOrganization/[userId] # User-linked organizations
    │   │   ├── auth/                            # Sign In / Sign Up page views
    │   │   ├── organizations/
    │   │   │   ├── page.tsx                     # Workspaces directory & management
    │   │   │   ├── createOrganization/page.tsx  # Register new company form
    │   │   │   └── [orgId]/                     # Workspace Command Center
    │   │   │       ├── layout.tsx               # Workspace Layout (Top Header & Collapsible Sidebar)
    │   │   │       └── page.tsx                 # Clean workspace content area
    │   │   ├── layout.tsx                       # Root layout (UserProvider, Global Navbar)
    │   │   └── page.tsx                         # TaskFlow landing & marketing hero
    │   ├── components/                          # Modular React UI Components
    │   │   ├── auth/                            # SigninForm & SignupForm
    │   │   ├── home/                            # Marketing hero & task preview widgets
    │   │   ├── navbar.tsx                       # Global marketing navigation bar
    │   │   ├── organization-workspace/          # Organization Dashboard Shell Components
    │   │   │   ├── WorkspaceNavbar.tsx          # Top Header (Product | Company | User & Logout)
    │   │   │   ├── WorkspaceSidebar.tsx         # Collapsible Sidebar (Home, Members, Streams, etc.)
    │   │   │   ├── WorkspaceLayout.tsx          # Layout coordinator
    │   │   │   └── index.ts                     # Barrel exports
    │   │   ├── organizations/                   # CreateOrganizationForm
    │   │   ├── ui/                              # Reusable Base UI components (Button, Badge, Card, etc.)
    │   │   └── workspace/                       # Organization cards, list, and filters
    │   ├── constants/                           # API endpoints, route constants
    │   ├── context/
    │   │   └── UserContext.tsx                  # Hydration-safe global user auth state
    │   ├── hooks/                               # Custom React Hooks
    │   │   ├── auth/                            # useSignin, useSignup
    │   │   ├── organizations/                   # useCreateOrganization
    │   │   └── workspace/                       # useWorkspaces
    │   ├── models/                              # Mongoose Database Models
    │   │   ├── auth.model.ts                    # User schema (roles, auth, organization links)
    │   │   └── organization.model.ts            # Organization schema (departments, projects, members)
    │   ├── services/                            # Axios API service layer (auth, organizations)
    │   ├── types/                               # TypeScript domain contracts
    │   └── utils/
    │       └── db.ts                            # Cached MongoDB connection utility
    ├── package.json
    └── tsconfig.json
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher installed
- **pnpm** (recommended) or `npm`
- **MongoDB Database**: Connection URI from MongoDB Atlas or local MongoDB instance

---

### 1. Installation

Navigate to the `web` application folder:

```bash
cd web
pnpm install
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `web/` directory with the following configuration:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Authentication Secret Key
secret_key=your_super_secret_jwt_signing_key_here
```

---

### 3. Build & Development Commands

Inside the `web/` folder, run the following scripts:

| Command | Description |
| :--- | :--- |
| **`pnpm dev`** | Starts Next.js development server with Turbopack at `http://localhost:3000` |
| **`pnpm build`** | Generates an optimized production build |
| **`pnpm start`** | Starts the production server using the compiled build |
| **`pnpm lint`** | Runs ESLint 9 across all TypeScript and React files |
| **`npx tsc --noEmit`** | Performs full TypeScript type-checking without emitting files |

---

## 🔐 Core Features & Workflow

### 1. Authentication & Hydration Safety
- Password hashing with **`bcryptjs`** and stateless session authentication with **`jose`** JWT cookies.
- **Hydration-Safe State**: User authentication state in `UserContext.tsx` uses React 19's **`useSyncExternalStore`**, preventing any SSR-to-client mismatch when reading from browser `localStorage`.

### 2. Multi-Tenant Organizations
- Create and administer organizations with metadata including **GST No**, **Established Year**, **Team Size**, **MRR**, and **ARR**.
- Browse organizations with search, role filters (`Owner` vs `Member`), and favorites.

### 3. Dedicated Workspace Shell (`/organizations/[orgId]`)
- **Route-Level Layout (`layout.tsx`)**: Mounted once at the route level to eliminate flickering when switching between tabs or views.
- **Workspace Header (`WorkspaceNavbar`)**:
  - Left: Product logo and brand link (`TaskFlow`).
  - Center: Live company name loaded directly from MongoDB.
  - Right: Logged-in user badge with status indicator and a **Log Out** button.
- **Collapsible Sidebar (`WorkspaceSidebar`)**:
  - Toggle between expanded (`w-60`) and icon-only collapsed (`w-16`) states.
  - Quick access: **Home**, **Members**, **Streams**, **Profile**, **Reports**, **Settings**, and **Logout**.

---

## 🌐 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Registers a new user with default `"owner"` role. |
| `/api/auth/signin` | `POST` | Authenticates credentials and sets an HTTP-only JWT cookie. |
| `/api/organizations` | `GET` | Retrieves organizations linked to a specific `userId`. |
| `/api/organizations/createOrganization` | `POST` | Registers a new organization under the authenticated user. |
| `/api/organizations/[orgId]` | `GET` | Fetches a single organization by its MongoDB ObjectId. |

---

## 📄 License

Private & proprietary repository for **TaskFlow**. All rights reserved.
