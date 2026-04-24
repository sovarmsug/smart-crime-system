# 🚀 Smart Crime System - Deployment Guide (Supabase + Render + Vercel)

## 📌 Overview
This system uses:
- Backend: Node.js (Express) hosted on Render
- Frontend: React hosted on Vercel
- Database: Supabase (PostgreSQL cloud)

---

# 🗄️ 1. SUPABASE SETUP

## Create Project
Go to https://supabase.com and create a new project.

---

## 🔐 Database Credentials (IMPORTANT)

Use this format:

DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

---

## 🧱 Create Crimes Table

Run in Supabase SQL Editor:

CREATE TABLE crimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  crime_type TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW()
);

---

## ⚠️ RLS (Row Level Security)

For now (development):

ALTER TABLE crimes DISABLE ROW LEVEL SECURITY;

---

# 🚀 2. BACKEND DEPLOYMENT (RENDER)

## Settings:
- Build Command: npm install
- Start Command: node server.js

---

## 🔐 Environment Variables

NODE_ENV=production
PORT=10000

DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

FRONTEND_URL=https://your-vercel-app.vercel.app

---

## ⚠️ IMPORTANT (Supabase Fix in Code)

Your database connection MUST include:

ssl: { rejectUnauthorized: false }

---

# 🌐 3. FRONTEND DEPLOYMENT (VERCEL)

## Settings:
- Framework: React
- Build Command: npm run build
- Output Directory: build

---

## 🔐 Environment Variable

REACT_APP_API_URL=https://your-render-backend.onrender.com

---

# 🌐 4. CORS CONFIG (BACKEND)

app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

---

# ⚠️ 5. IMPORTANT RULES

✔ Use ONLY db.*.supabase.co as host  
✔ NEVER use https://supabase URL in DB connection  
✔ SSL must be enabled for Supabase  
✔ Disable RLS during development  
✔ Enable RLS only after authentication is ready  

---

# 🚀 FINAL ARCHITECTURE

Frontend (Vercel)
        ↓
Backend (Render)
        ↓
Database (Supabase)

---

# 🎯 DONE

If everything is correct:
✔ Backend runs on Render  
✔ Frontend runs on Vercel  
✔ Database connects to Supabase  
✔ Crime data is stored successfully  