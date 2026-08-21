# GirGuard AI

GirGuard AI is a comprehensive wildlife protection and management system designed to mitigate human-wildlife conflict around the Gir National Park. The platform provides real-time alerts, incident tracking, livestock loss compensation claims, and AI-powered risk assessment to ensure the safety of both local communities and the Asiatic lion population.

## Features
- **Public User Portal:** Report sightings, log livestock losses, and view local safety alerts.
- **Department Verification Desk:** Review incoming sighting reports, assign verification teams, and confirm wildlife presence.
- **Incident & Response Management:** Track conflicts, dispatch rapid response teams, and monitor resolution status.
- **AI Risk Assessment:** Automatically calculate conflict risk based on historical data, village proximity, and recent sightings.
- **Role-Based Authentication:** Secure access control for Public Users, Department Members, and System Administrators.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python, Flask, SQLAlchemy, JWT Authentication
- **Database:** PostgreSQL (Hosted on Supabase)

## Local Development Setup

### 1. Database Setup
1. Create a PostgreSQL database on [Supabase](https://supabase.com/).
2. Run the `backend/supabase_schema.sql` script in the Supabase SQL Editor to create all necessary tables.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder with the following:
```env
DATABASE_URL=postgresql://postgres:YOUR_URL_ENCODED_PASSWORD@db.your-supabase-url.supabase.co:5432/postgres
SECRET_KEY=your_super_secret_key
```
Run the backend:
```bash
flask run --port=5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder with the following:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```
Run the frontend:
```bash
npm run dev
```

## Deployment (Vercel)

### Backend Deployment
1. Import the repository into Vercel.
2. Set the **Root Directory** to `backend`.
3. Add the `DATABASE_URL` and `SECRET_KEY` environment variables.
4. Deploy. Vercel will automatically use `backend/index.py` and `backend/vercel.json` to configure the Flask serverless function.

### Frontend Deployment
1. Import the repository into Vercel again as a new project.
2. Set the **Root Directory** to `frontend`.
3. Add the `VITE_API_BASE_URL` environment variable pointing to your deployed backend URL (e.g., `https://your-backend-app.vercel.app/api/v1`).
4. Deploy. Vercel will automatically configure the Vite SPA using the `frontend/vercel.json`.

## Generating Access Codes
By default, the database is seeded with a master admin account:
- **Email:** `admin@example.com`
- **Password:** `password123`

Log in with this account, navigate to the **Admin Dashboard > Access Management**, and generate one-time registration codes for new Department Members or Administrators.
