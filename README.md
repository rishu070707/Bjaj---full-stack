# SRM Full Stack Engineering Challenge

A full-stack solution for hierarchical tree processing and analysis.

## Features
- **Hierarchical Tree Building**: Connects nodes based on parent-child relationships.
- **Cycle Detection**: Robustly identifies cycles following the multi-path rule.
- **Duplicate Edge Handling**: Filters repeated edges and tracks them separately.
- **Multi-parent Logic**: Adheres to the "first-occurrence-wins" rule for node parents.
- **Input Validation**: Clean regex-based validation for all string entries.
- **Premium UI**: Modern dark-themed React dashboard with glassmorphism and animations.

## Tech Stack
- **Backend**: Node.js, Express
- **Frontend**: React, Vite, Framer Motion, Lucide React, Tailwind CSS (via custom styling)
- **API**: REST-based POST endpoint

## Project Structure
```
backend/
  controllers/   # Request logic
  routes/        # Route definitions
  utils/         # Tree building algorithm
  server.js      # Entry point
frontend/
  src/
    App.jsx      # Main dashboard
    index.css    # Premium design system
```

## Setup & Running

### 1. Backend
```bash
cd backend
npm install
npm start
```
Starts on [http://localhost:5000](http://localhost:5000)

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Starts on [http://localhost:5173](http://localhost:5173)

---
Developed for the SRM Full Stack Challenge.
