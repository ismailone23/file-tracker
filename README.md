# File Tracking System

A full-stack ready frontend application built with Next.js (App Router) + TypeScript for managing a multi-stage file workflow.

Files move across workflow stages (Reception -> Officer Desk -> Manager Review -> Final Records), and authorized officers can:

- Approve & Forward (adds signature + timestamp)
- Forward Only (skip signature)
- View file history and current stage status

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- React Context API + custom hooks

## Project Setup

### 1. Initialize project (already done in this workspace)

```bash
npx create-next-app@latest file-tracker --typescript --tailwind --app --use-npm
cd file-tracker
```

### 2. Install UI dependencies

```bash
npx shadcn@latest init -d
npx shadcn@latest add button badge card table dialog input select textarea -y
```

### 3. Install packages (if needed)

```bash
npm install
```

### 4. Run development server

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` - Start local development server
- `npm run lint` - Run ESLint
- `npm run build` - Build production app
- `npm run start` - Run production server

## Folder Structure

```text
.
|-- app/
|   |-- dashboard/page.tsx
|   |-- stages/[stage]/page.tsx
|   |-- layout.tsx
|   |-- page.tsx
|   `-- providers.tsx
|-- components/
|   |-- shared/
|   `-- ui/
|-- context/
|   `-- FileContext.tsx
|-- hooks/
|   `-- useFiles.ts
|-- lib/
|   |-- mock-data.ts
|   `-- utils.ts
|-- styles/
|   `-- animations.css
`-- types/
	`-- file.ts
```

## Data Model

Each file uses the `TrackedFile` model:

- `id`
- `title`
- `description`
- `currentStage`
- `assignedTo`
- `status`
- `history[]` (who acted, when, from/to stage, signature)

## Implemented Features

- Multi-stage workflow (4 stages)
- Stage-wise file table view
- Status badges (`Pending`, `Approved`, `Forwarded`)
- Signature modal dialog for approval
- Forward-only action
- Officer role simulation (switch active officer)
- Stage sidebar with live file counts
- Search/filter within stage tables
- Reusable components and modular logic

## Notes

- The project currently uses mock data (`lib/mock-data.ts`) and no backend.
- Context and hooks are structured so a backend/API layer can be plugged in later.
- Final stage blocks forwarding actions by design.

