# Nexus CRM

A full-stack CRM application with a React frontend and Express backend.

## Project Structure

```
CRM/
├── backend/          ← Express API server (deploy on Render)
│   ├── server.js
│   ├── package.json
│   └── .env          ← SUPABASE_URL, SUPABASE_API_KEY, FRONTEND_URL
│
├── frontend-react/   ← React + Vite frontend (deploy on Vercel)
│   ├── src/
│   ├── vercel.json
│   ├── package.json
│   └── .env          ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│
└── README.md
```

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo → select the `backend/` subfolder as **Root Directory**
3. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_API_KEY`
   - `FRONTEND_URL` (your Vercel URL after deploying frontend)
5. Deploy — copy the Render URL (e.g. `https://nexus-crm-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect GitHub repo → set **Root Directory** to `frontend-react`
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev       # runs on http://localhost:3000

# Frontend
cd frontend-react
npm install
npm run dev       # runs on http://localhost:5173
```
