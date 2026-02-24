# CreatorOS Frontend

CreatorOS Frontend is the web client for the CreatorOS platform, built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It provides creator-facing experiences for authentication, onboarding, content management, publishing, connected accounts, and analytics.

## Why this repo exists

This repository provides:

- A modular frontend organized by pages, domain APIs, and reusable UI primitives
- Auth-aware routing and guarded dashboard flows
- A typed API integration layer for the CreatorOS backend gateway
- A production-ready developer experience for local development and cloud deployment

It is built to let frontend teams ship quickly while staying aligned with shared backend contracts.

## Architecture at a glance

- **Runtime:** React 18 + TypeScript + Vite
- **Routing:** React Router with protected routes for authenticated dashboard areas
- **State & data:** Zustand (auth store) + TanStack Query (server-state patterns)
- **API access:** Axios client with token injection + automatic refresh flow
- **UI system:** Tailwind CSS + shadcn/ui + Radix primitives
- **Public backend entry:** API Gateway via `VITE_API_GATEWAY_URL`

## Repository structure

```text
CreatorOS-Frontend/
├─ public/
│  └─ auth/
│     ├─ linkedin/
│     └─ youtube/
├─ src/
│  ├─ components/
│  │  └─ ui/
│  ├─ contexts/
│  ├─ data/
│  ├─ hooks/
│  ├─ layouts/
│  ├─ lib/
│  │  ├─ api/
│  │  ├─ auth/
│  │  ├─ utils/
│  │  └─ validations/
│  ├─ pages/
│  │  ├─ auth/
│  │  └─ dashboard/
│  ├─ stores/
│  └─ types/
├─ index.html
├─ tailwind.config.ts
├─ vite.config.ts
└─ .env.example
```

## Quick start (local)

### Prerequisites

- Node.js 18+
- pnpm 9+
- Running CreatorOS backend API Gateway (local or hosted)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Set at least these values in `.env`:

- `VITE_API_GATEWAY_URL` (API Gateway base URL)
- `VITE_PUBLISHING_BASE_PATH` (publishing route base path)

Default `.env.example` values:

```dotenv
VITE_API_GATEWAY_URL=https://creatoros-api.adharbattulwar.com
VITE_PUBLISHING_BASE_PATH=/publishing
```

### 3) Start development server

```bash
pnpm dev
```

### 4) Verify app startup

- Open `http://localhost:5173`
- Confirm auth pages and dashboard routes render correctly

### 5) Production build preview

```bash
pnpm build
pnpm preview
```

## Route map

| Route | Access | Responsibility |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/forgot-password` | Public | Password reset request |
| `/verify-email` | Public | Email verification flow |
| `/reset-password` | Public | Password reset confirmation |
| `/auth/:provider/callback` | Public | OAuth provider callback handling |
| `/complete-profile` | Authenticated | Profile completion onboarding |
| `/dashboard` | Authenticated + profile complete | Dashboard home |
| `/dashboard/content` | Authenticated + profile complete | Content workflows |
| `/dashboard/publish` | Authenticated + profile complete | Publishing workflows |
| `/dashboard/accounts` | Authenticated + profile complete | Connected accounts |
| `/dashboard/analytics` | Authenticated + profile complete | Analytics views |
| `/dashboard/settings` | Authenticated + profile complete | User settings |

## API domain map

| API module | Purpose |
|---|---|
| `authApi` | Authentication, token lifecycle, identity workflows |
| `profileApi` | Creator profile retrieval and updates |
| `contentApi` | Content CRUD and workflow operations |
| `assetApi` | Authorized asset access/upload interactions |
| `publishingApi` | Connected platform flows and publishing requests |

All modules use a shared Axios client configured with:

- Gateway base URL from `VITE_API_GATEWAY_URL`
- Bearer token attachment for protected requests
- Automatic refresh-token retry on `401` for eligible requests

## Common commands

```bash
# Development
pnpm dev

# Build
pnpm build
pnpm build:dev

# Quality
pnpm lint

# Preview production build
pnpm preview
```

## Contribution workflow

1. Create a feature branch
2. Make focused changes in the relevant page/domain module
3. Validate flows locally (`pnpm lint`, `pnpm build`, manual route checks)
4. Open a pull request with scope, screenshots (if UI), and testing notes

## Deployment notes

- The app is configured for Vite-based static build output
- `vercel.json` is included for Vercel deployment behavior
- Ensure production environment variables are set in your hosting platform

## Related repositories

- CreatorOS Backend (microservices + API Gateway)
- Shared contracts/events (if maintained as separate repos/packages)

## License

Add your project license here.

