# TaskFlow — Team Task Manager

A full-stack Team Task Management application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

- **User Authentication** — Signup/Login with JWT
- **Project Management** — Create projects, invite members with roles
- **Role-Based Access** — Admin vs Member permissions
- **Task Management** — Kanban board with To Do / In Progress / Done columns
- **Task Assignment** — Assign tasks to team members
- **Dashboard** — Stats, overdue tasks, team workload overview
- **My Tasks** — Personal task list with status updates
- **Responsive UI** — Works on mobile and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |
| Deployment | Railway |

## Project Structure

```
team-task-manager/
├── backend/
│   ├── models/         # Mongoose schemas (User, Project, Task)
│   ├── routes/         # Express API routes
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # Entry point
│   └── .env.example    # Environment variables template
└── frontend/
    ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context (Auth)
│   │   ├── pages/      # Page components
│   │   ├── utils/      # API client
│   │   └── App.jsx     # Root with routing
    └── index.html
```

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, Backend at `http://localhost:5000`.

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment on Railway

### 1. Create Railway Account
Go to [railway.app](https://railway.app) and sign up.

### 2. Deploy MongoDB
- Click **New Project** → **Database** → **MongoDB**
- Copy the `MONGO_PUBLIC_URL`

### 3. Deploy Backend
- Click **New Service** → **GitHub Repo** → Select your repo
- Set **Root Directory** to `backend`
- Add environment variables:
  - `MONGO_URI` = your MongoDB URL from step 2
  - `JWT_SECRET` = a long random string
  - `FRONTEND_URL` = your frontend Railway URL (add after deploying frontend)
- Railway auto-detects Node.js and runs `npm start`

### 4. Deploy Frontend
- Click **New Service** → **GitHub Repo** → Select your repo
- Set **Root Directory** to `frontend`
- Add environment variables:
  - `VITE_API_URL` = your backend Railway URL + `/api`
- Railway runs `npm run build` and serves the static files

### 5. Update CORS
Go back to backend service → update `FRONTEND_URL` with the actual frontend Railway URL.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/projects` | List user's projects | All |
| POST | `/api/projects` | Create project | All |
| GET | `/api/projects/:id` | Get project + tasks | Member |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| POST | `/api/projects/:id/members` | Add member | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/tasks` | Create task | Admin |
| GET | `/api/tasks/my-tasks` | My assigned tasks | All |
| PUT | `/api/tasks/:id` | Update task | Admin/Assigned |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated stats |

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update assigned task status | ✅ | ✅ |
| View project & tasks | ✅ | ✅ |
