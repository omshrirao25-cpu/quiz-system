const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

db.init();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: list quizzes
app.get('/api/quizzes', (req, res) => {
  const quizzes = db.listQuizzes();
  res.json(quizzes);
});

// API: get one quiz (without answers)
app.get('/api/quizzes/:id', (req, res) => {
  const q = db.getQuiz(parseInt(req.params.id, 10));
  if (!q) return res.status(404).json({ error: 'Quiz not found' });
  res.json(q);
});

// API: create quiz (simple)
app.post('/api/quizzes', (req, res) => {
  /**
   * Expected body:
   * {
   *   title: "Title",
   *   description: "desc",
   *   questions: [
   *     { text: "Q1", options: [{ text: "A", isCorrect: true }, { text: "B", isCorrect: false }] },
   *     ...
   *   ]
   * }
   */
  const payload = req.body;
  if (!payload || !payload.title || !Array.isArray(payload.questions)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const created = db.createQuiz(payload);
  res.status(201).json(created);
});

// API: submit answers
app.post('/api/quizzes/:id/submit', (req, res) => {
  const quizId = parseInt(req.params.id, 10);
  const answers = req.body.answers; // [{ questionId, optionId }]
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers must be an array' });
  const result = db.submitAnswers(quizId, answers);
  if (!result) return res.status(404).json({ error: 'Quiz not found' });
  res.json(result);
});

// fallback to index.html for SPA navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Quiz System running at http://localhost:${PORT}`);
});

module.exports = app;