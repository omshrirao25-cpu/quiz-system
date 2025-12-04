# Quiz System — Software Engineering Project

A lightweight full-stack Quiz System built for learning and demonstration purposes. It includes:
- REST API (Node + Express)
- SQLite database (embedded)
- Simple client (vanilla HTML/CSS/JS)
- Basic tests (Jest + Supertest)

Goals:
- Allow admins to create quizzes (title, description, questions, options, correct answer)
- Allow users to browse quizzes, take a quiz, and receive a score
- Keep the code small and easy to expand for coursework or portfolio

Tech stack
- Node.js + Express
- SQLite (better-sqlite3)
- Vanilla JS frontend served from /public
- Jest + Supertest for server tests

Quick start (requires Node.js 16+)
1. Install
   npm install
2. Initialize DB & run
   npm run start
3. Open http://localhost:3000

Project structure
- server.js — Express app and API endpoints
- db.js — SQLite initialization and helper queries
- public/ — static client (index.html, app.js, styles.css)
- tests/ — basic API tests
- package.json — scripts and dependencies

API (basic)
- GET /api/quizzes                 — list quizzes (without correct answers)
- GET /api/quizzes/:id             — get quiz details (questions without correct answers)
- POST /api/quizzes                — create a quiz (admin, accepts JSON)
- POST /api/quizzes/:id/submit     — submit answers and get score

Data model (simplified)
- quizzes(id, title, description)
- questions(id, quiz_id, text)
- options(id, question_id, text, is_correct)

Notes for extension / what you can build next
- Add authentication/authorization for admin vs users
- Add pagination, search, tags for quizzes
- Add timing, per-question feedback, high-score leaderboard
- Replace embedded SQLite with PostgreSQL for production
- Add frontend frameworks (React/Vue) and better UI/UX

License
MIT — see LICENSE file
