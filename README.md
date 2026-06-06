# Project Management App

A full-stack project management application built with React, Node.js/Express, and MongoDB.

## Features

- ✅ User authentication with JWT
- ✅ Create and manage projects
- ✅ Team collaboration with project members
- ✅ Task management with priority levels
- ✅ Task status tracking (To-Do, In Progress, Completed)
- ✅ Due dates and priority assignments
- ✅ Real-time project updates

## Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 19+
- React Router v7
- Tailwind CSS
- Axios for HTTP requests

## Project Structure

```
.
├── server/              # Express backend
│   ├── models/         # MongoDB schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── middleware/
│   │   └── auth.js     # JWT verification
│   ├── server.js       # Main server file
│   └── package.json
│
└── client/             # React frontend
    ├── src/
    │   ├── pages/      # Page components
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   └── ProjectDetail.js
    │   ├── components/ # Reusable components
    │   ├── contexts/   # React context (Auth)
    │   ├── services/   # API calls
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Setup

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure Environment Variables

From the project root (creates `.env` files with local MongoDB if missing):

```bash
npm run setup:env
```

Or copy manually: `server/.env.example` → `server/.env`, `client/.env.example` → `client/.env`.

Already using Atlas and want to stop adding your IP? Switch to local MongoDB:

```bash
npm run db:local
```

### 3. Start MongoDB

**Windows:** Install [MongoDB Community](https://www.mongodb.com/try/download/community); the `MongoDB` service should be **Running** (Services app).

**Docker (optional):** `docker compose up -d`

**macOS/Linux:** `brew services start mongodb-community`

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all user's projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Usage

1. **Register/Login** - Create an account or sign in
2. **Create Project** - Start a new project from dashboard
3. **Add Tasks** - Click into a project and add tasks
4. **Manage Tasks** - Update status, priority, and due dates
5. **Add Team Members** - Invite collaborators to projects

## File Descriptions

### Server Files
- `server.js` - Main server setup with routes and middleware
- `models/User.js` - User schema with authentication fields
- `models/Project.js` - Project schema with owner and members
- `models/Task.js` - Task schema with status and priority
- `routes/auth.js` - Register and login endpoints
- `routes/projects.js` - Project CRUD and member management
- `routes/tasks.js` - Task CRUD operations
- `middleware/auth.js` - JWT token verification

### Client Files
- `App.js` - Main app with routing
- `contexts/AuthContext.js` - Authentication state management
- `services/api.js` - Axios instance and API calls
- `components/ProtectedRoute.js` - Route protection wrapper
- `pages/Login.js` - Login page
- `pages/Register.js` - Registration page
- `pages/Dashboard.js` - Projects dashboard
- `pages/ProjectDetail.js` - Project and tasks page
