const request = require('supertest');
const fs = require('fs');
const dbFile = 'quiz.db';

// Start server (require will start since server.js runs listen)
let server;
beforeAll(() => {
  // remove db to get clean slate
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  server = require('../server'); // server.js starts the app
});

afterAll(done => {
  // allow server to close
  setTimeout(done, 500);
});

describe('Quiz API', () => {
  let createdQuiz;
  test('create quiz', async () => {
    const payload = {
      title: 'Sample Quiz',
      description: 'A tiny quiz',
      questions: [
        { text: '2+2?', options: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: true }] }
      ]
    };
    const res = await request('http://localhost:3000').post('/api/quizzes').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdQuiz = res.body;
  });

  test('list quizzes', async () => {
    const res = await request('http://localhost:3000').get('/api/quizzes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('get quiz without answers', async () => {
    const res = await request('http://localhost:3000').get('/api/quizzes/' + createdQuiz.id);
    expect(res.status).toBe(200);
    expect(res.body.questions[0].options[0].text).toBeDefined();
    // no isCorrect field in client view
    expect(res.body.questions[0].options[0].isCorrect).toBeUndefined();
  });

  test('submit answers', async () => {
    const q = await request('http://localhost:3000').get('/api/quizzes/' + createdQuiz.id);
    const question = q.body.questions[0];
    const optionId = question.options[1].id; // expecting second option is correct from creation
    const res = await request('http://localhost:3000').post(`/api/quizzes/${createdQuiz.id}/submit`).send({
      answers: [{ questionId: question.id, optionId }]
    });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(1);
  });
});