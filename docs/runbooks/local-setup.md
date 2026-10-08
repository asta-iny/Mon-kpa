# Runbook: Local setup (M0)

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm 10+
- Docker Desktop (MySQL 8 + Redis)

## Steps

1. Copy environment contract:

   ```bash
   cp .env.example .env
   ```

2. Start infrastructure:

   ```bash
   docker compose up -d mysql redis
   ```

   Default host ports are **3316** (MySQL) and **6380** (Redis) to avoid colliding with
   other local services. Containers still use 3306/6379 internally.

   If you already run MySQL/Redis on the host, set `DATABASE_URL` / `REDIS_URL` in
   local `.env` only (never commit real passwords).

3. Install dependencies:

   ```bash
   npm install
   ```

4. Generate Prisma client and apply migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev
   ```

5. Seed synthetic foundation data (refuses production):

   ```bash
   npm run db:seed
   ```

6. Run API and web (separate terminals):

   ```bash
   npm run dev:api
   npm run dev:web
   ```

7. Health check: `GET http://localhost:3001/api/v1/health`

## Safety

- Local data is synthetic only.
- Seeds refuse `APP_ENV=production`.
- Cloudinary API secret must never be placed in `VITE_*` variables.
