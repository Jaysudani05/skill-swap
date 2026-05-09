# Skill Swap Platform

A full-stack skill exchange platform where users connect, swap skills, chat in real time, and discover smart matches using an AI service.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1) Backend Setup](#1-backend-setup)
  - [2) AI Service Setup](#2-ai-service-setup)
  - [3) Frontend Setup](#3-frontend-setup)
  - [4) Run the Full System](#4-run-the-full-system)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Socket.IO Events](#socketio-events)
- [Scripts](#scripts)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Skill Swap Platform enables users to:

- Create and manage profiles (skills offered / skills to learn)
- Send and manage swap requests
- Chat in real time after request acceptance
- Receive notifications and activity updates
- View analytics and platform statistics
- Use AI-powered matching to discover relevant skill partners

This repository is a **monorepo** with:

- `SkillSwap-Frontend` (React + Vite)
- `SkillSwap-Backend` (Node.js + Express + MongoDB + Socket.IO)
- `SkillSwap-AI` (FastAPI + sentence-transformers)

---

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Axios
- Socket.IO client
- Heroicons + Lucide Icons

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Cookie Parser + CORS + Morgan

### AI Service

- FastAPI
- Uvicorn
- sentence-transformers
- NumPy / scikit-learn

---

## Monorepo Structure

```text
skill-swap-platform/
├─ SkillSwap-Frontend/      # React app (UI, routing, services)
├─ SkillSwap-Backend/       # Express API + Socket.IO + MongoDB
└─ SkillSwap-AI/            # FastAPI semantic matching service
```

---

## Core Features

- **Authentication**: Register, login, logout, auth check
- **Profile Management**: personal info, skills, education, experience, availability
- **Public Profiles**: browse discoverable users
- **Swap Requests**: send, receive, accept/reject/cancel requests
- **Chat**: one-to-one chat threads for accepted swaps
- **Voice/Video Call Signaling**: Socket-driven call flow events
- **Notifications**: unread/read state, mark all as read, list/history
- **Analytics**: user activity and engagement insights
- **Help Center**: FAQs and support form UI
- **AI Matchmaking**: semantic matching between seeker intent and candidate skills

---

## System Architecture

1. **Frontend** calls Express APIs (`/api/...`) using Axios.
2. **Backend** handles auth, profile CRUD, swap, chat, notifications, analytics.
3. **Socket.IO** provides real-time chat + call signaling events.
4. **Backend AI route** forwards matching requests to FastAPI service.
5. **AI service** computes semantic similarity and returns ranked matches.

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (or compatible)
- Python 3.10+ (for AI service)
- MongoDB (Atlas or local)

---

### 1) Backend Setup

```bash
cd SkillSwap-Backend
npm install
```

Create `SkillSwap-Backend/.env`:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=*
AI_SERVICE_URL=http://127.0.0.1:8000
```

Run backend:

```bash
npm run dev
```

Default backend URL: `http://localhost:3000`

---

### 2) AI Service Setup

```bash
cd SkillSwap-AI
python -m venv .venv
```

Activate virtual env:

- Windows (PowerShell):
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- Windows (CMD):
  ```cmd
  .venv\Scripts\activate.bat
  ```
- macOS/Linux:
  ```bash
  source .venv/bin/activate
  ```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run AI service:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health check: `http://localhost:8000/health`

---

### 3) Frontend Setup

```bash
cd SkillSwap-Frontend
npm install
```

Create `SkillSwap-Frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Run frontend:

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

---

### 4) Run the Full System

Run all three services in separate terminals:

1. Backend (`npm run dev`)
2. AI service (`uvicorn main:app --host 0.0.0.0 --port 8000 --reload`)
3. Frontend (`npm run dev`)

---

## Environment Variables

### Backend (`SkillSwap-Backend/.env`)

- `MONGO_URL` – MongoDB connection string
- `JWT_SECRET` – JWT signing secret
- `FRONTEND_URL` – primary frontend origin
- `CORS_ORIGIN` – set `*` to allow all (dev), otherwise explicit origin
- `AI_SERVICE_URL` – FastAPI URL (default local service)

### Frontend (`SkillSwap-Frontend/.env`)

- `VITE_BACKEND_URL` – backend base URL (without `/api`)
- optional `VITE_API_BASE_URL` – explicit API base URL (if used)
- optional `VITE_SOCKET_URL` – Socket.IO endpoint override

### AI (`SkillSwap-AI` environment)

- optional `EMBEDDING_MODEL` – custom sentence-transformer model
- optional `MAX_CANDIDATES` – cap for matching candidate pool

---

## API Overview

Base URL: `http://localhost:3000/api`

### Auth (`/auth`)
- `POST /register`
- `POST /login`
- `GET /logout`
- `GET /me` (protected)

### Profile (`/profile`)
- `POST /create` (protected)
- `GET /user/:userId` (protected)
- `PUT /user/:userId` (protected)
- `DELETE /user/:userId` (protected)
- `GET /public` (public)
- experience/education/time-credits/visibility sub-routes

### Swap Requests (`/swap-requests`) (protected)
- `POST /`
- `GET /`
- `PATCH /:requestId/respond`
- `DELETE /:requestId`

### Chats (`/chats`) (protected)
- `POST /`
- `GET /`
- `GET /:chatId`
- `POST /:chatId/messages`
- `GET /:chatId/messages`
- `PATCH /:chatId/messages/:messageId/read`
- `PATCH /:chatId/archive`
- `DELETE /:chatId`

### Calls (`/calls`) (protected)
- `POST /start`
- `POST /:callId/answer`
- `POST /:callId/end`
- `GET /active`
- `GET /history`
- `POST /:callId/signaling`

### Analytics (`/analytics`) (protected)
- `GET /`

### Notifications (`/notifications`) (protected)
- `GET /recent/:userId`
- `GET /:userId`
- `GET /count/:userId`
- `POST /`
- `PUT /:notificationId/read`
- `PUT /:userId/read-all`
- `DELETE /:notificationId`

### AI (`/ai`) (protected)
- `POST /match-skills`

---

## Socket.IO Events

### Chat
- `join_chat`, `leave_chat`
- `new_message` -> broadcasts `message_received`
- `typing_start` -> `user_typing`
- `typing_stop` -> `user_stopped_typing`

### Calls
- `call:initiate` -> `call:incoming`
- `call:accepted`
- `call:rejected`
- `call:offer`
- `call:answer`
- `call:ice-candidate`
- `call:end` -> `call:ended`

---

## Scripts

### Backend
- `npm run dev` – run with nodemon
- `npm start` – run production server

### Frontend
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – run ESLint

### AI
- Run via Uvicorn command (see setup section)

---

## Deployment Notes

- Deploy frontend and backend on separate hosts if needed.
- Set exact CORS origins in production (avoid `*` if possible).
- Use strong secrets for `JWT_SECRET`.
- Ensure backend can reach AI service URL (`AI_SERVICE_URL`).
- For Socket.IO production, set `VITE_SOCKET_URL` / backend socket URL correctly.

---

## Troubleshooting

- **Frontend cannot call API**  
  Check `VITE_BACKEND_URL` and confirm backend is running on port 3000.

- **Mongo connection fails**  
  Verify `MONGO_URL`, network access, and database credentials.

- **401 Unauthorized**  
  Re-login and verify JWT token is present in local storage/cookies.

- **AI matching fails**  
  Ensure FastAPI service is running and `AI_SERVICE_URL` is correct.

- **Socket not connecting**  
  Validate token auth and socket endpoint/origin configuration.

---

## Security Notes

- Do not commit real secrets to GitHub (`.env` files must stay private).
- Rotate any credentials that may have been exposed.
- Use HTTPS and secure cookies in production.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request with clear description and screenshots (if UI changes)

---

## License

No explicit open-source license is currently defined at the repository root.  
If you plan to open-source this project, add a `LICENSE` file.

