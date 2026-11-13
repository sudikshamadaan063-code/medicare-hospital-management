# MediCare – Production Deployment Guide

This guide provides end-to-end instructions for deploying the **MediCare Hospital Management System** to production using **MongoDB Atlas**, **Render (Backend)**, and **Vercel (Frontend)**.

---

## 1. Database Deployment: MongoDB Atlas

1. **Create an Atlas Account & Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
   - Click **Create Deployment** → select the **M0 Free Tier**.
   - Choose your closest region (e.g., AWS N. Virginia `us-east-1` or Mumbai `ap-south-1`).
   - Cluster Name: `medicare-cluster`.

2. **Configure Security & Network Access**:
   - In **Database Access**:
     - Click **Add New Database User**.
     - Authentication Method: **Password**.
     - Username: `medicare_admin`.
     - Generate a secure password and save it safely.
     - Database User Privileges: `Read and write to any database`.
   - In **Network Access**:
     - Click **Add IP Address**.
     - Choose **Allow Access From Anywhere** (`0.0.0.0/0`) so that Render can connect dynamically.
     - Click **Confirm**.

3. **Get Connection String**:
   - Go to **Database** → click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection URI:
     ```
     mongodb+srv://medicare_admin:<password>@medicare-cluster.xxxx.mongodb.net/medicare_db?retryWrites=true&w=majority&appName=medicare-cluster
     ```
   - Replace `<password>` with your database user password.

4. **Seed Database Remotely (Optional)**:
   - On your local terminal, run:
     ```bash
     cd backend
     MONGODB_URI="mongodb+srv://medicare_admin:<password>@medicare-cluster.xxxx.mongodb.net/medicare_db?retryWrites=true&w=majority" npm run seed
     ```

---

## 2. Backend Deployment: Render

1. **Prepare GitHub Repository**:
   - Commit and push your project to a GitHub repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit of MediCare Full Stack Hospital System"
     git branch -M main
     git remote add origin https://github.com/<your-username>/medicare-hospital-management.git
     git push -u origin main
     ```

2. **Create New Web Service on Render**:
   - Sign in to [Render](https://render.com).
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository.
   - Configure the Web Service:
     - **Name**: `medicare-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Region**: Same region as your MongoDB Atlas cluster
     - **Branch**: `main`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Plan**: `Free`

3. **Set Environment Variables on Render**:
   - In the **Environment Variables** tab, add:
     | Key | Recommended Value | Notes |
     |---|---|---|
     | `PORT` | `10000` | Render defaults to port 10000 |
     | `NODE_ENV` | `production` | Enables production optimizations |
     | `MONGODB_URI` | `mongodb+srv://...` | Connection URI from Atlas |
     | `JWT_SECRET` | `generate-a-strong-random-64-char-secret-key` | Protects auth tokens |
     | `JWT_EXPIRE` | `7d` | Token expiry duration |
     | `CLIENT_URL` | `https://medicare-frontend.vercel.app` | Updated after frontend deployment |

4. **Deploy & Verify**:
   - Click **Deploy Web Service**.
   - Wait 1-2 minutes for build completion.
   - Test health check endpoint:
     ```
     https://medicare-backend.onrender.com/api/health
     ```
     Should respond:
     ```json
     {
       "status": "healthy",
       "timestamp": "2026-11-13T...",
       "service": "MediCare Hospital Management System API"
     }
     ```

---

## 3. Frontend Deployment: Vercel

1. **Sign in to Vercel**:
   - Go to [Vercel](https://vercel.com) and log in with your GitHub account.

2. **Import Project**:
   - Click **Add New...** → **Project**.
   - Select your `medicare-hospital-management` repository.

3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Configure Environment Variables on Vercel**:
   - In the **Environment Variables** section, add:
     | Key | Value |
     |---|---|
     | `VITE_API_URL` | `https://medicare-backend.onrender.com/api` |

5. **Deploy**:
   - Click **Deploy**.
   - Vercel compiles the React application and delivers a global edge CDN URL (e.g. `https://medicare-hospital.vercel.app`).

6. **Update CORS on Render Backend**:
   - Copy your live Vercel URL.
   - Go back to Render → `medicare-backend` → **Environment**.
   - Update `CLIENT_URL` to your live Vercel URL.
   - Save changes (Render will trigger a zero-downtime re-deploy).

---

## 4. Single-Page App (SPA) Routing Note

To prevent 404 errors on browser page refresh on Vercel, the frontend includes standard rewrite configuration. If needed, create `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 5. Post-Deployment Verification Checklist

- [x] Access Home page and verify styles load smoothly.
- [x] Go to `/login` and test 1-Click Demo Accounts (Admin, Doctor, Patient).
- [x] Book a new appointment under Patient portal and check slot blocking.
- [x] Log in as Doctor and verify today's queue, issue a prescription with Rx drugs.
- [x] Log in as Admin and verify real-time charts and Doctor CRUD functions.
