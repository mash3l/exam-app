# Elevate Exam App

Next.js 16 student/admin exam platform with NextAuth, TanStack Query, React Hook Form, Zod, and shadcn/ui.

## Stack

- Next.js 16 (App Router, `proxy.ts` route protection)
- NextAuth (JWT credentials)
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS + shadcn/ui
- Sonner toasts

## Setup

```bash
npm install
cp .env.example .env.local   # if present; otherwise create .env.local manually
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth JWT encryption |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_AUTH_LOGIN_IDENTIFIER_KEY` | No | `email` or `username` for login API body (default: `username`) |

API base URL is configured in `src/lib/api-base.ts`. Authenticated browser requests go through the BFF proxy at `/api/backend/*` so access tokens are not exposed to client JavaScript.

## Project structure

- `src/app` — routes (auth, dashboard, admin)
- `src/features` — domain modules (auth, diplomas, exams, admin)
- `src/shared` — UI primitives and layout
- `src/proxy.ts` — route protection and role redirects
- `src/auth.ts` — NextAuth configuration

## Roles

- `STUDENT` — diplomas, exams, account
- `ADMIN` / `SUPER_ADMIN` — admin CRUD, audit log
