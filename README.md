# Wallet Manager

Personal wallet management dashboard built with React, TypeScript, and Vite. The application stores transactions and budgeting data in a local JSON file (served via `json-server`) and provides tools to monitor balance, budgets, and insights.

## Getting Started

```bash
npm install
npm run server     # starts json-server on http://localhost:4000
npm run dev        # starts Vite on http://localhost:5173
```

During development you can run both with:

```bash
npm start
```

## Environment Variables

Create an `.env` file based on `.env.example` if you need to customise the backend URL. The default value is `http://localhost:4000`.

```bash
cp .env.example .env
```

## Folder Structure

- `data/` — JSON database served by `json-server`
- `src/components/` — shared UI components and layout primitives
- `src/pages/` — route-level screens (Dashboard, Analytics, Budget)
- `src/services/` — API client for interacting with the JSON backend
- `src/types/` — shared TypeScript types
- `src/utils/` — formatting and helper utilities

## Scripts

- `npm run dev` — start Vite development server
- `npm run server` — start JSON API server
- `npm start` — run both servers in parallel
- `npm run build` — build production bundle
- `npm run lint` — run ESLint checks
- `npm run preview` — preview production build locally
