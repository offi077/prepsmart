# Mission Control 🚀
**Competitive Exam Preparation Platform** — NestJS backend + React frontend

---

## Project Structure

```
mission-control/
├── mission-backend/   # NestJS API (port 3000)
├── mvp/               # React + Vite frontend (port 5173)
├── package.json       # Root — run both with one command
└── .gitignore
```

---

## ⚡ Quick Start (run both frontend + backend)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up environment variables
cp mission-backend/.env.example mission-backend/.env
# Edit mission-backend/.env — fill in your DATABASE_URL, JWT_SECRET

# 3. Run database migration
npm run db:migrate

# 4. Run everything (one command!)
npm run dev
```

- **Backend API** → http://localhost:3000/api
- **Frontend** → http://localhost:5173

---

## 🖥️ Local Setup for New Developers

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | v20+ | https://nodejs.org |
| npm | v10+ | (comes with Node) |
| PostgreSQL | v15+ | https://postgresql.org |
| Git | any | https://git-scm.com |

### Step-by-Step

**1. Clone the repository**
```bash
git clone <your-github-repo-url> mission-control
cd mission-control
```

**2. Install all dependencies**
```bash
npm run install:all
```
> This installs packages for both `mission-backend/` and `mvp/`

**3. Create your PostgreSQL database**
```sql
-- In psql or pgAdmin, run:
CREATE DATABASE myapp_db;
```

**4. Configure environment variables**
```bash
cd mission-backend
cp .env.example .env
```
Then open `mission-backend/.env` and update:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/myapp_db"
JWT_SECRET="any-long-random-string-at-least-32-chars"
```

**5. Run database migration**
```bash
# From the root mission-control folder:
npm run db:migrate
```
> When prompted, give the migration a name like `init`

**6. Start the dev servers**
```bash
# From root (runs both frontend AND backend simultaneously):
npm run dev
```

---

## 🔧 Individual Commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs backend + frontend together |
| `npm run dev:backend` | Backend only (watch mode) |
| `npm run dev:frontend` | Frontend only |
| `npm run db:migrate` | Run pending database migrations |
| `npm run db:generate` | Regenerate Prisma client |

---

## 🌐 API Endpoints (Phase 1 & 2 Complete)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api` | Health check |
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Login → returns JWT token |
| `GET` | `/api/auth/profile` | Get current user (requires JWT) |

### Sample Register Request
```json
POST http://localhost:3000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student"
}
```

### Sample Login Request
```json
POST http://localhost:3000/api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
// Response: { "access_token": "eyJ..." }
```

---

## ⚠️ Important Notes

- **Never commit `.env`** — it's in `.gitignore`
- The `generated/prisma/` folder is git-ignored — it's auto-generated, run `npm run db:generate` if missing
- Make sure PostgreSQL is running before `npm run dev`
