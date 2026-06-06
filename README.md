# Tickit

Tickit is a full-stack todo application with user authentication, task CRUD, priority, due date/time, color accents, search, sorting, filtering, overdue indicators, and a security-focused cookie authentication flow.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, MUI 9 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT in HttpOnly cookies |
| Security | Helmet, CORS, rate limiting, CSRF protection, request validation, NoSQL sanitization, bcrypt |
| Tests | Jest, Supertest, mongodb-memory-server |

## Project Structure

```text
todo-app/
  backend/
    src/
      app.js
      server.js
      config/db.js
      controllers/
      middleware/
      models/
      routes/
      utils/
      validators/
    tests/
    .env.example
  frontend/
    app/
    components/
    lib/
    public/favicon_io/
    .env.local.example
  doc/
    rapor.html
    implementationplan.html
```

## Security Model

Tickit uses cookie-based JWT authentication:

- The backend sets the JWT in a `token` cookie.
- The `token` cookie is `HttpOnly`, so frontend JavaScript cannot read it.
- The backend also sets a readable `csrfToken` cookie.
- Unsafe requests such as `POST`, `PUT`, and `DELETE` must send `X-CSRF-Token`.
- The frontend Axios client reads `csrfToken` and sends it automatically.
- Axios uses `withCredentials: true` so browser cookies are included in API requests.

Relevant files:

- `backend/src/utils/authCookies.js`
- `backend/src/middleware/csrf.js`
- `backend/src/middleware/auth.js`
- `frontend/lib/api.js`

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/tickit?appName=APP_NAME
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

Create `frontend/.env.local` from `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production with separate frontend/backend domains, use:

```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

If frontend and backend are served under the same site, `COOKIE_SAMESITE=lax` can be used.

## Local Development

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test and Verification

Backend tests:

```bash
cd backend
npm test
```

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend production build:

```bash
cd frontend
npm run build
```

## API Summary

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user and set auth cookies |
| POST | `/api/auth/login` | No | Login user and set auth cookies |
| POST | `/api/auth/logout` | Yes + CSRF | Clear auth cookies |
| GET | `/api/auth/me` | Yes | Return current user |
| GET | `/api/tasks` | Yes | List current user's tasks |
| POST | `/api/tasks` | Yes + CSRF | Create task |
| PUT | `/api/tasks/:id` | Yes + CSRF | Update task |
| DELETE | `/api/tasks/:id` | Yes + CSRF | Delete task |

## Features

- Register and login
- HttpOnly cookie auth
- CSRF protection
- Task create, edit, delete, complete
- Quick task creation with optional details
- Description, priority, due date/time, color
- Overdue task indicator
- Search by title or description
- Filter by all, active, completed
- Sort by newest, oldest, due date, priority
- User greeting and dashboard stats

## Production Deployment

Recommended simple deployment:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or VPS
- Database: MongoDB Atlas

Backend production checklist:

- Use a real database name in `MONGODB_URI`, for example `/tickit`.
- Use a long random `JWT_SECRET`.
- Set `NODE_ENV=production`.
- Set `CLIENT_URL` to the exact frontend origin.
- Set `COOKIE_SECURE=true`.
- Use `COOKIE_SAMESITE=none` for cross-site frontend/backend hosting.
- Restrict MongoDB Atlas network access.
- Use a least-privilege MongoDB user.

Frontend production checklist:

- Set `NEXT_PUBLIC_API_URL` to the deployed backend API URL.
- Ensure the backend supports credentials and the exact frontend origin.
- Test login/register/logout and task mutations after deployment.

## Documentation

Detailed reports are available in:

- `doc/rapor.html`
- `doc/implementationplan.html`

## Known Follow-ups

- Server-side pagination for large task lists
- Category/tag support
- Production structured logging
- E2E tests with Playwright
- Optional migration to same-domain reverse proxy deployment for simpler cookie behavior
