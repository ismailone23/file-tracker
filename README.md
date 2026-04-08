# File Tracker

File workflow management system with a monorepo architecture:

- Next.js web app
- Hono API server
- Drizzle ORM with Neon PostgreSQL
- JWT authentication with role and stage authorization
- WebSocket real-time updates
- Audit logs and reporting endpoints

## Monorepo Layout

```text
apps/
  web/      # Next.js frontend
  api/      # Hono backend API + WebSocket
packages/
  db/       # Drizzle schema, Neon client, seed scripts
```

## Core Features

- Stage-based workflow: reception -> officer -> manager -> final
- Approve-and-forward and forward-only actions
- Role-based access with stage restrictions
- Persistent storage in PostgreSQL (Neon)
- Real-time updates from backend events over WebSocket
- Audit log records for file creation and transitions
- Reporting endpoint for stage distribution

## Stack

- Web: Next.js 16, React 19, TypeScript, Tailwind
- API: Hono + Node server + WebSocket support
- DB: Drizzle ORM + Neon serverless Postgres
- Auth: JWT (HS256), bcrypt password verification

## Environment

Copy example env files and fill your Neon connection string:

- apps/api/.env.example -> apps/api/.env
- apps/web/.env.example -> apps/web/.env.local

Required API env values:

- DATABASE_URL
- JWT_SECRET
- CORS_ORIGIN
- PORT

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Push schema to your Neon database

```bash
npm run db:migrate
```

3. Seed demo users/files

```bash
npm run db:seed
```

4. Run web + api together

```bash
npm run dev
```

Web runs at http://localhost:3000 and API at http://localhost:4000.

## Workspace Scripts

- npm run dev
- npm run dev:web
- npm run dev:api
- npm run build
- npm run lint
- npm run db:generate
- npm run db:migrate
- npm run db:seed
