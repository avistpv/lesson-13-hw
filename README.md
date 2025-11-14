# Lesson 13 Homework - Task Management Application

A full-stack TypeScript application with React frontend and Express backend.

## Project Structure

```
lesson-13-hw/
├── backend/          # Express.js + TypeScript backend API
├── frontend/         # React + TypeScript frontend application
└── shared/           # Shared ESLint and Prettier configurations
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will run on `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run on `http://localhost:5173` (or another port if 5173 is taken)

## Features

### Backend
- Express.js REST API
- TypeScript
- Sequelize ORM with PostgreSQL
- Task management endpoints (CRUD operations)
- User management
- Comprehensive integration tests (Jest + Supertest)

### Frontend
- React 19 with TypeScript
- React Router for navigation
- React Hook Form with Zod validation
- Task list, details, and creation pages
- Comprehensive component tests (Vitest + React Testing Library)

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Code Quality

Both projects use shared ESLint and Prettier configurations from the `shared/` directory:

- **Backend**: Node.js + TypeScript ESLint config
- **Frontend**: React + TypeScript + JSX ESLint config
- **Both**: Prettier integration for code formatting

Run linting:
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Sequelize
- PostgreSQL (development) / SQLite (testing)
- Jest + Supertest
- Zod

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- React Hook Form
- Zod
- Vitest + React Testing Library

