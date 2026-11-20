# 🚀 Wayfarer Production Deployment Guide

This guide walks you through deploying **Wayfarer** with the **FastAPI backend on Render** and the **Next.js frontend on Vercel**.

---

## Architecture Overview

```
                      ┌────────────────────────────────┐
                      │      Vercel (Frontend)         │
                      │      Next.js 16 (App Router)   │
                      │  https://wayfarer.vercel.app   │
                      └──────────────┬─────────────────┘
                                     │
                     REST API & CORS │ NEXT_PUBLIC_API_URL
                                     │
                      ┌──────────────▼─────────────────┐
                      │      Render (Backend)          │
                      │    FastAPI + Uvicorn + AI      │
                      │  https://*.onrender.com        │
                      └────────────────────────────────┘
```

---

## Step 1: Deploy Backend on Render (Deploy This First)

Deploying the backend first gives you the live URL (`https://<service-name>.onrender.com`) needed for the frontend configuration.

### Option A: 1-Click Render Blueprint (Recommended)
1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect [`render.yaml`](file:///home/divyanshu/Rough/Project%202/render.yaml).
5. Enter your `OPENAI_API_KEY` under Environment Variables.
6. Click **Apply**. Render will automatically build and launch the FastAPI service.

### Option B: Manual Web Service Setup on Render
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name:** `wayfarer-backend`
   - **Language / Runtime:** `Python`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Add Environment Variables:
   - `PYTHON_VERSION` = `3.12.0`
   - `OPENAI_API_KEY` = `sk-proj-...`
   - `OPENAI_CHAT_MODEL` = `gpt-4o-mini`
   - `CORS_ORIGINS` = `http://localhost:3000,http://localhost:3001`
5. Click **Create Web Service**.
6. Once deployed, test the health check:
   ```bash
   curl https://<your-render-url>.onrender.com/health
   # Expected response: {"status":"online","app":"Wayfarer Travel Community API","version":"2.0.0","environment":"production"}
   ```

---

## Step 2: Deploy Frontend on Vercel

### Deploying via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
2. Select your repository.
3. In **Project Settings**:
   - **Framework Preset:** Next.js
   - **Root Directory:** Click "Edit" and choose `frontend` (or leave as root; [`vercel.json`](file:///home/divyanshu/Rough/Project%202/vercel.json) handles both automatically).
4. In **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-render-url>.onrender.com` | Your live Render backend URL |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-domain>.vercel.app` | Your Vercel frontend URL |
   | `OPENAI_API_KEY` | *(Optional)* | Client-side AI fallback |
5. Click **Deploy**.
6. Vercel will build and publish your Next.js application in under 60 seconds!

---

## Step 3: Verify the Live Deployment

1. **User Sign Up & Login:**
   - Go to your Vercel URL: `/signup`.
   - Register a real user account. Real password hashing and session tokens are generated.
2. **Share a Firsthand Trip:**
   - Click **Share Trip & Tips** (`⌘K`).
   - Fill in your destination, dates, hotel price per night, pros & cons, and upload local photos.
   - The trip will immediately publish to the community feed and sync with the Render backend.
3. **Ask a Destination or Hotel Question:**
   - Go to `/qa`.
   - Use the **AI Travel Intel & Hotel Price Estimator** to test live backend retrieval.
   - Post a community question; travelers who have visited the destination can answer with hotel rates.

---

## Local Development Quickstart

To run both services locally on your machine:

```bash
# Terminal 1: Start FastAPI Backend (Port 8001)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start Next.js Frontend (Port 3000/3001)
cd frontend
npm install
npm run dev
```
