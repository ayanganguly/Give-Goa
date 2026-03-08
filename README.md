<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GiveGoa ERP – Rotary Club of Panjim

Centralized resource allocation and social impact request management.

## Architecture

- **Frontend**: React 19 + Vite + Tailwind (port 3000)
- **Backend**: Express + Node.js (port 4000)
- **Data**: JSON file storage (in `server/data/`)
- **AI**: Google Gemini (classify, score, allocate) – runs on backend only

All data and logic are driven by the backend. The frontend uses REST APIs for auth, requests, resources, audit logs, and AI operations.

## Run Locally

**Prerequisites:** Node.js

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Environment variables

Create `.env` in the project root (or copy from `.env.example`):

```env
# Optional – defaults to http://localhost:4000/api
VITE_API_URL=http://localhost:4000/api

# Backend
PORT=4000
JWT_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
```

For backend-only env (server folder), you can create `server/.env` with `GEMINI_API_KEY` and `JWT_SECRET`.

### 3. Run the app

**Option A – Run both frontend and backend:**

```bash
npm run dev:all
```

**Option B – Run separately:**

```bash
# Terminal 1 – Backend
npm run dev:server

# Terminal 2 – Frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Demo accounts (password: `password`)

| Email                    | Role                |
|--------------------------|---------------------|
| admin@rotarypanjim.org   | ADMIN               |
| pm@rotarypanjim.org      | PROJECT_MANAGER     |
| jane@volunteer.org       | VOLUNTEER           |
| member@goa.com           | COMMUNITY_REQUESTER |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login (email, password) |
| GET | /api/auth/me | Current user (requires token) |
| GET | /api/requests | List all requests |
| POST | /api/requests | Create request |
| PATCH | /api/requests/:id | Update request |
| PUT | /api/requests/batch | Batch update requests |
| GET | /api/resources | List resources |
| PUT | /api/resources | Update resources |
| GET | /api/logs | Audit logs |
| POST | /api/logs | Add audit log |
| GET | /api/weights | Priority weights |
| POST | /api/ai/classify | AI classify request |
| POST | /api/ai/score | AI priority score |
| POST | /api/ai/allocate | AI resource allocation |
