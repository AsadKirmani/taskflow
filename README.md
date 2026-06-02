# Taskflow

A Trello-like project management SaaS application with a Node.js/Express backend and an Angular frontend.

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT authentication (via cookies)
- Zod for request validation
- Nodemailer for email

**Frontend**
- Angular 21
- Angular Material + Tailwind CSS
- Lucide icons

## Project Structure

```
taskflow/
├── src/               # Backend source
│   ├── modules/       # Feature modules (auth, workspaces, boards, columns, tasks, comments, activity, archive)
│   ├── middleware/    # Express middleware
│   ├── models/        # Mongoose models
│   ├── config/        # Database, JWT, mailer config
│   └── server.ts      # Entry point
└── frontend/          # Angular app
    └── src/
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Backend

```bash
# Install dependencies
npm install

# Create a .env file
cp .env.example .env   # then fill in the values

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

**Environment variables**

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CORS_ORIGINS` | Comma-separated list of allowed origins |
| `PORT` | Server port (default: `5000`) |

### Frontend

```bash
cd frontend
npm install
npm start        # dev server at http://localhost:4200
npm run build    # production build
```

## API Routes

All API routes are prefixed with `/api/v1`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Welcome message |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/workspaces` | List workspaces |
| `POST` | `/api/v1/workspaces` | Create workspace |
| `GET` | `/api/v1/boards` | List boards |
| `POST` | `/api/v1/boards` | Create board |
| `GET/POST` | `/api/v1/...columns` | Manage columns |
| `GET/POST` | `/api/v1/...tasks` | Manage tasks |
| `GET/POST` | `/api/v1/...comments` | Manage comments |
| `GET` | `/api/v1/...activity` | Activity feed |
| `GET/POST` | `/api/v1/...archive` | Archive |

## License

MIT
