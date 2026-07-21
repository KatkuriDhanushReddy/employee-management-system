# Employee Management System (EMS)

A full-stack Employee Management System with JWT authentication, role-based access control (RBAC), employee CRUD, organizational hierarchy, dashboard analytics, and more.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Validation | express-validator (backend), Zod (frontend) |

## Features

- **Authentication** — Login, logout, JWT-protected routes, password hashing
- **RBAC** — Super Admin, HR Manager, Employee roles with granular permissions
- **Dashboard** — Total/active/inactive employees, department count, charts
- **Employee CRUD** — Full employee lifecycle with profile image upload
- **Org Hierarchy** — Reporting tree, direct reports, circular reporting prevention
- **Search & Filter** — By name/email, department, role, status; sort by name/date
- **Bonus** — Pagination, soft delete, CSV import, dark mode, Docker, unit tests

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Docker)

### 1. Clone & Install

```bash
cd employee-management-system

# Backend
cd backend
npm install
cp .env.example .env   # or use the included .env

# Frontend
cd ../frontend
npm install
```

### 2. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name ems-mongo mongo:7
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@ems.com | Admin@123 |
| HR Manager | hr@ems.com | Hr@12345 |
| Employee | james@ems.com | Emp@12345 |

## Role Permissions

| Action | Super Admin | HR Manager | Employee |
|--------|:-----------:|:----------:|:--------:|
| View Dashboard | ✅ | ✅ | ❌ |
| Create Employee | ✅ | ✅ | ❌ |
| Edit Any Employee | ✅ | ✅ | ❌ |
| Delete Employee | ✅ | ❌ | ❌ |
| Assign Super Admin | ✅ | ❌ | ❌ |
| View All Employees | ✅ | ✅ | Own only |
| Edit Own Profile | ✅ | ✅ | ✅ (limited) |
| View Org Tree | ✅ | ✅ | ✅ |
| CSV Import | ✅ | ✅ | ❌ |

## Docker

```bash
docker-compose up --build
```

Then seed the database:

```bash
docker exec -it ems-backend node src/scripts/seed.js
```

## API Documentation

See [API.md](./API.md) for full endpoint reference.

## Project Structure

```
employee-management-system/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── utils/         # JWT, upload, hierarchy
│   │   ├── validators/    # Request validation
│   │   └── scripts/       # Seed script
│   └── tests/             # Unit tests
├── frontend/
│   └── src/
│       ├── app/           # Next.js pages
│       ├── components/    # React components
│       ├── context/       # Auth & theme providers
│       ├── lib/           # API client
│       └── types/         # TypeScript types
├── docker-compose.yml
├── sample-import.csv
└── README.md
```

## Running Tests

```bash
cd backend
npm test
```

## CSV Import Format

Use the included `sample-import.csv` as a template:

```
employeeId,name,email,phone,password,department,designation,salary,joiningDate,status,role
```

## License

MIT
