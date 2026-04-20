<div align="center">

<img src="https://aset.elitedev.space/favicon.svg" width="60" alt="logo" />

# Aset

**A modern, cloud-native file storage & management platform.**

Securely upload, organize, share, and access your files from anywhere — built with a type-safe, end-to-end TypeScript stack.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](#-license)

</div>

---

## Overview

**Aset** is a full-stack, Google Drive–style file management application. It provides a clean, dashboard-based experience for managing personal files and folders with support for sharing, starring, trash, and more — backed by cloud object storage and a type-safe API layer.

## Features
- **Secure Authentication** — Powered by [Clerk](https://clerk.com/) with protected dashboard routes.
- **File & Folder Management** — Create, browse, rename, move, and delete files and nested folders.
- **Cloud Storage** — Files stored in [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) via presigned URLs.
- **Smart Views** — Dedicated pages for **All Files**, **Recent**, **Starred**, **Shared**, and **Trash**.
- **Type-Safe API** — End-to-end type safety from database to UI using tRPC + Zod.
- **Modern UI** — Built with React 19, Tailwind CSS v4, shadcn/ui, and Radix primitives.
- **Monorepo Architecture** — Clean separation between `frontend`, `backend`, and shared `api` types.

## Tech Stack

<img src="https://res.cloudinary.com/dnvl8mqba/image/upload/v1776704945/Aset/Aset-LLD_l597xy.png" width="1000" alt="lld" />


### Frontend (`apps/frontend`)

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** + **Radix UI**
- **TanStack Query** + **tRPC Client**
- **React Router v7**
- **Clerk** for auth
- **Lucide** / **Hugeicons** for icons

### Backend (`apps/backend`)

- **Node.js** + **Express 5** + **TypeScript**
- **tRPC** server with Zod validation
- **Prisma 7** ORM with **Neon Postgres**
- **Clerk Express** middleware
- **AWS S3 SDK** (Cloudflare R2 compatible)
- **esbuild** for production bundling

### Shared (`packages/api`)

- Shared tRPC router types consumed by the frontend for full type safety.

### Tooling

- **pnpm** workspaces · **ESLint** · **Prettier** · **Husky** · **Vercel** · **Docker** · **Jenkins**

## Project Structure

```text
Aset/
├── apps/
│   ├── backend/          # Express + tRPC API server
│   │   ├── src/
│   │   ├── prisma/       # Database schema & migrations
│   │   ├── Dockerfile
│   │   └── Jenkinsfile
│   └── frontend/         # React + Vite client
│       ├── src/
│       │   ├── pages/    # Home, Dashboard, AllFiles, Shared, Recent, Starred, Trash
│       │   └── shared/   # Auth guards, components, utilities
│       └── vite.config.ts
├── packages/
│   └── api/              # Shared tRPC types
├── pnpm-workspace.yaml
├── vercel.json
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **pnpm** `10.33.0` (enabled via `corepack`)
- **PostgreSQL** database (local or [Neon](https://neon.tech/))
- **Clerk** account for authentication keys
- **Cloudflare R2** bucket for object storage

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Aset.git
cd Aset
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create `apps/backend/.env` with the following keys:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_AUTHORIZED_PARTIES=http://localhost:5173

# Cloudflare R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=aset
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://<public-url>.r2.dev
```

Create `apps/frontend/.env` with your Clerk publishable key and backend URL as needed.

### 4. Set up the database

```bash
pnpm --filter aset-backend gen     # Generate Prisma client
pnpm --filter aset-backend push    # Push schema to database
```

### 5. Run the development servers

```bash
pnpm dev
```

This runs both apps in parallel:

- Frontend → http://localhost:5173
- Backend → http://localhost:5000

Or run them individually:

```bash
pnpm dev:frontend
pnpm dev:backend
```

## Available Scripts

| Script                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `pnpm dev`                | Run frontend and backend in parallel                |
| `pnpm dev:frontend`       | Run the Vite dev server only                        |
| `pnpm dev:backend`        | Run the Express API with hot reload                 |
| `pnpm build`              | Build all workspace packages                        |
| `pnpm build:vercel`       | Build tailored for Vercel deployment                |
| `pnpm lint` / `lint:fix`  | Lint the entire monorepo                            |
| `pnpm format`             | Format all files with Prettier                      |

### Backend-specific

| Script                                    | Description                   |
| ----------------------------------------- | ----------------------------- |
| `pnpm --filter aset-backend studio`       | Open Prisma Studio            |
| `pnpm --filter aset-backend push`         | Push schema to database       |
| `pnpm --filter aset-backend pull`         | Pull schema from database     |
| `pnpm --filter aset-backend typecheck`    | Run TypeScript type checking  |

## Deployment

Aset is deployment-ready for multiple platforms:

- **Vercel** — `vercel.json` is pre-configured for the frontend.
- **Docker** — A `Dockerfile` and `docker-compose.yml` are provided in `apps/backend/`.
- **Jenkins** — A `Jenkinsfile` is included for CI/CD pipelines.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Pre-commit hooks via Husky will automatically run linting and formatting.

## License

Distributed under the **ISC License**.

## Author

**Ashutosh Tiwari**

<div align="center">

If you like this project, please consider giving it a star.

</div>
