const Database = require('better-sqlite3');
const db = new Database('quiz.db');

function init() {
  // quizzes table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT
    )
  `).run();

  // questions
  db.prepare(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `).run();

  // options
  db.prepare(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `).run();
}

function createQuiz({ title, description, questions }) {
  const insertQuiz = db.prepare('INSERT INTO quizzes (title, description) VALUES (?, ?)');
  const result = insertQuiz.run(title, description || '');
  const quizId = result.lastInsertRowid;

  const insertQuestion = db.prepare('INSERT INTO questions (quiz_id, text) VALUES (?, ?)');
  const insertOption = db.prepare('INSERT INTO options (question_id, text, is_correct) VALUES (?, ?, ?)');

  const qInsert = db.transaction((questions) => {
    for (const q of questions) {
      const r = insertQuestion.run(quizId, q.text);
      const qId = r.lastInsertRowid;
      for (const opt of q.options) {
        insertOption.run(qId, opt.text, opt.isCorrect ? 1 : 0);
      }
    }
  });

  qInsert(questions || []);
  return getQuiz(quizId);
}

function listQuizzes() {
  const rows = db.prepare('SELECT id, title, description FROM quizzes ORDER BY id DESC').all();
  return rows;
}

function getQuiz(quizId) {
  const quiz = db.prepare('SELECT id, title, description FROM quizzes WHERE id = ?').get(quizId);
  if (!quiz) return null;
  const questions = db.prepare('SELECT id, text FROM questions WHERE quiz_id = ?').all(quizId).map(q => {
    const options = db.prepare('SELECT id, text FROM options WHERE question_id = ?').all(q.id);
    return { id: q.id, text: q.text, options };
  });
  quiz.questions = questions;
  return quiz;
}

function getQuizWithAnswers(quizId) {
  const quiz = db.prepare('SELECT id, title, description FROM quizzes WHERE id = ?').get(quizId);
  if (!quiz) return null;
  const questions = db.prepare('SELECT id, text FROM questions WHERE quiz_id = ?').all(quizId).map(q => {
    const options = db.prepare('SELECT id, text FROM options WHERE question_id = ?').all(q.id);
    return { id: q.id, text: q.text, options };
  });
  quiz.questions = questions;
  return quiz;
}

function submitAnswers(quizId, answers) {
  // answers: [{ questionId, optionId }, ...]
  const quiz = getQuizWithAnswers(quizId);
  if (!quiz) return null;
  let score = 0;
  let total = quiz.questions.length;
  const details = [];
  for (const q of quiz.questions) {
    const given = answers.find(a => a.questionId === q.id);
    const correctOption = q.options.find(o => o.isCorrect);
    const correctId = correctOption ? correctOption.id : null;
    const isCorrect = given && given.optionId === correctId;
    if (isCorrect) score++;
    details.push({
      questionId: q.id,
      correctOptionId: correctId,
      givenOptionId: given ? given.optionId : null,
      isCorrect: !!isCorrect
    });
  }
  return { score, total, details };
}

module.exports = {
  init,
  createQuiz,
  listQuizzes,
  getQuiz,
  getQuizWithAnswers,
  submitAnswers
};