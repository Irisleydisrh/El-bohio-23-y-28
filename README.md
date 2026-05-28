# El Bohío 23 y 28

Sistema POS para restaurante con frontend (React + Vite + TypeScript) y backend (Node.js + Express + TypeORM).

## Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeORM, PostgreSQL (Supabase)
- **Testing**: Vitest (unit), Playwright (E2E), k6 (load)

## Desarrollo

```bash
# Frontend
npm install
npm run dev          # http://localhost:8081

# Backend
cd backend
npm install
npm run dev          # http://localhost:3000
```

## Tests

```bash
# Frontend
npm run test

# Backend
cd backend && npm test

# E2E
npx playwright test

# Load
cd backend && npm run load-test
```
