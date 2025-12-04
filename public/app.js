async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw err;
  }
  return res.json();
}

async function loadQuizzes() {
  const listEl = document.getElementById('quizzes');
  listEl.innerHTML = 'Loading...';
  try {
    const quizzes = await fetchJSON('/api/quizzes');
    if (quizzes.length === 0) listEl.innerHTML = '<p>No quizzes yet.</p>';
    else {
      listEl.innerHTML = '';
      quizzes.forEach(q => {
        const el = document.createElement('div');
        el.className = 'quiz';
        el.innerHTML = `<strong>${q.title}</strong><p>${q.description || ''}</p><button data-id="${q.id}">Take quiz</button>`;
        el.querySelector('button').addEventListener('click', () => openQuiz(q.id));
        listEl.appendChild(el);
      });
    }
  } catch (err) {
    listEl.innerHTML = '<p>Error loading quizzes</p>';
    console.error(err);
  }
}

async function openQuiz(id) {
  const q = await fetchJSON('/api/quizzes/' + id);
  document.getElementById('quiz-list').style.display = 'none';
  const taker = document.getElementById('quiz-taker');
  document.getElementById('quiz-title').textContent = q.title;
  const form = document.getElementById('quiz-form');
  form.innerHTML = '';
  q.questions.forEach((question, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question';
    qDiv.innerHTML = `<p><strong>${idx + 1}. ${question.text}</strong></p>`;
    question.options.forEach(opt => {
      const id = 'opt-' + opt.id;
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="${question.id}" value="${opt.id}" id="${id}" /> ${opt.text}`;
      qDiv.appendChild(label);
      qDiv.appendChild(document.createElement('br'));
    });
    form.appendChild(qDiv);
  });
  document.getElementById('submit').onclick = async () => {
    const answers = q.questions.map(qst => {
      const el = form.querySelector(`input[name="${qst.id}"]:checked`);
      return { questionId: qst.id, optionId: el ? parseInt(el.value, 10) : null };
    });
    try {
      const res = await fetchJSON('/api/quizzes/' + id + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      showResult(res);
    } catch (err) {
      alert('Submission failed');
      console.error(err);
    }
  };
  document.getElementById('back').onclick = () => {
    taker.style.display = 'none';
    document.getElementById('quiz-list').style.display = '';
    document.getElementById('result').innerHTML = '';
  };
  taker.style.display = '';
}

function showResult(res) {
  const el = document.getElementById('result');
  el.innerHTML = `<h3>Score: ${res.score} / ${res.total}</h3>`;
  res.details.forEach(d => {
    const div = document.createElement('div');
    div.innerHTML = `Question ${d.questionId}: ${d.isCorrect ? '<span class="result-correct">Correct</span>' : '<span class="result-wrong">Wrong</span>'}`;
    el.appendChild(div);
  });
}

loadQuizzes();