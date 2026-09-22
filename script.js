'use strict';

/* =========================================================
   HabitFlow
   Estados de um hábito: 'seed' -> 'sprout' -> 'bloom'
   Tudo é persistido no localStorage do navegador.
========================================================= */

const STORAGE_KEY = 'habitflow_habits_v1';
const STAGES = ['seed', 'sprout', 'bloom'];
const STAGE_LABELS = { seed: 'Semente', sprout: 'Brotando', bloom: 'Florescendo' };

const els = {
  today: document.getElementById('todayLabel'),
  statTotal: document.getElementById('statTotal'),
  statDone: document.getElementById('statDone'),
  statStreak: document.getElementById('statStreak'),
  newDayBtn: document.getElementById('newDayBtn'),
  lists: {
    seed: document.getElementById('listSeed'),
    sprout: document.getElementById('listSprout'),
    bloom: document.getElementById('listBloom'),
  },
  counts: {
    seed: document.getElementById('countSeed'),
    sprout: document.getElementById('countSprout'),
    bloom: document.getElementById('countBloom'),
  },
  openAddBtn: document.getElementById('openAddBtn'),
  cancelAddBtn: document.getElementById('cancelAddBtn'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  habitForm: document.getElementById('habitForm'),
  habitName: document.getElementById('habitName'),
  habitCategory: document.getElementById('habitCategory'),
  toast: document.getElementById('toast'),
};

let habits = loadHabits();

/* ---------- Persistência ---------- */

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Não foi possível ler o localStorage, começando do zero.', err);
  }
  return demoHabits();
}

function saveHabits() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (err) {
    console.warn('Não foi possível salvar no localStorage.', err);
    showToast('Não foi possível salvar. Verifique o espaço do navegador.');
  }
}

function demoHabits() {
  return [
    { id: cryptoId(), name: 'Beber 2L de água', category: 'Saúde', stage: 'seed', currentStreak: 3, bestStreak: 5, lastCompletedDate: null },
    { id: cryptoId(), name: 'Ler 10 páginas', category: 'Estudo', stage: 'sprout', currentStreak: 1, bestStreak: 4, lastCompletedDate: null },
    { id: cryptoId(), name: 'Alongar pela manhã', category: 'Saúde', stage: 'bloom', currentStreak: 6, bestStreak: 6, lastCompletedDate: todayKey() },
  ];
}

function cryptoId() {
  return 'h_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- Renderização ---------- */

function render() {
  STAGES.forEach((stage) => {
    const container = els.lists[stage];
    container.innerHTML = '';

    const stageHabits = habits.filter((h) => h.stage === stage);
    els.counts[stage].textContent = stageHabits.length;

    if (stageHabits.length === 0) {
      const hint = document.createElement('p');
      hint.className = 'empty-hint';
      hint.textContent = emptyMessage(stage);
      container.appendChild(hint);
      return;
    }

    stageHabits.forEach((habit) => container.appendChild(buildCard(habit)));
  });

  renderStats();
  renderToday();
}

function emptyMessage(stage) {
  if (stage === 'seed') return 'Adicione um hábito para plantar a semente.';
  if (stage === 'sprout') return 'Arraste um hábito da Semente para começar.';
  return 'Nenhum hábito florescido ainda hoje.';
}

function renderStats() {
  els.statTotal.textContent = habits.length;
  els.statDone.textContent = habits.filter((h) => h.stage === 'bloom').length;
  const best = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);
  els.statStreak.textContent = best;
}

function renderToday() {
  const label = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  els.today.textContent = label.charAt(0).toUpperCase() + label.slice(1);
}

function buildCard(habit) {
  const card = document.createElement('article');
  card.className = 'card';
  card.draggable = true;
  card.dataset.id = habit.id;
  card.tabIndex = 0;
  card.setAttribute('aria-label', `${habit.name}, estágio ${STAGE_LABELS[habit.stage]}`);

  const top = document.createElement('div');
  top.className = 'card-top';

  const name = document.createElement('span');
  name.className = 'card-name';
  name.textContent = habit.name;
  top.appendChild(name);
  card.appendChild(top);

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const tag = document.createElement('span');
  tag.className = 'card-tag';
  tag.textContent = habit.category;
  meta.appendChild(tag);

  if (habit.currentStreak > 0) {
    const streak = document.createElement('span');
    streak.className = 'card-streak';
    streak.textContent = `🔥 ${habit.currentStreak}`;
    streak.title = `${habit.currentStreak} dia(s) seguidos`;
    meta.appendChild(streak);
  }

  card.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const stageIndex = STAGES.indexOf(habit.stage);

  if (stageIndex > 0) {
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = '◀';
    back.setAttribute('aria-label', 'Mover para o estágio anterior');
    back.addEventListener('click', () => moveHabit(habit.id, STAGES[stageIndex - 1]));
    actions.appendChild(back);
  }

  if (stageIndex < STAGES.length - 1) {
    const forward = document.createElement('button');
    forward.type = 'button';
    forward.textContent = '▶';
    forward.setAttribute('aria-label', 'Mover para o próximo estágio');
    forward.addEventListener('click', () => moveHabit(habit.id, STAGES[stageIndex + 1]));
    actions.appendChild(forward);
  }

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete-btn';
  del.textContent = '✕';
  del.setAttribute('aria-label', `Excluir hábito ${habit.name}`);
  del.addEventListener('click', () => deleteHabit(habit.id));
  actions.appendChild(del);

  card.appendChild(actions);

  card.addEventListener('dragstart', (e) => {
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', habit.id);
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));

  return card;
}

/* ---------- Ações ---------- */

function moveHabit(id, newStage) {
  const habit = habits.find((h) => h.id === id);
  if (!habit || habit.stage === newStage) return;

  habit.stage = newStage;

  if (newStage === 'bloom') {
    const today = todayKey();
    if (habit.lastCompletedDate !== today) {
      habit.currentStreak += 1;
      habit.bestStreak = Math.max(habit.bestStreak || 0, habit.currentStreak);
      habit.lastCompletedDate = today;
    }
  }

  saveHabits();
  render();

  if (newStage === 'bloom') {
    requestAnimationFrame(() => {
      const cardEl = document.querySelector(`.card[data-id="${id}"]`);
      if (cardEl) {
        cardEl.classList.add('is-blooming');
        cardEl.addEventListener('animationend', () => cardEl.classList.remove('is-blooming'), { once: true });
      }
    });
    showToast(`"${habit.name}" floresceu hoje! 🌸`);
  }
}

function deleteHabit(id) {
  const habit = habits.find((h) => h.id === id);
  habits = habits.filter((h) => h.id !== id);
  saveHabits();
  render();
  if (habit) showToast(`"${habit.name}" foi removido.`);
}

function addHabit(name, category) {
  habits.push({
    id: cryptoId(),
    name,
    category,
    stage: 'seed',
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
  });
  saveHabits();
  render();
  showToast('Hábito plantado! 🌱');
}

function startNewDay() {
  habits.forEach((habit) => {
    if (habit.stage !== 'bloom') {
      habit.currentStreak = 0;
    }
    habit.stage = 'seed';
  });
  saveHabits();
  render();
  showToast('Novo dia começou. Boa sorte com seus hábitos!');
}

/* ---------- Toast ---------- */

let toastTimer = null;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
}

/* ---------- Drag and drop nas colunas ---------- */

Object.entries(els.lists).forEach(([stage, list]) => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    list.classList.add('drag-over');
  });

  list.addEventListener('dragleave', () => list.classList.remove('drag-over'));

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    list.classList.remove('drag-over');
    const id = e.dataTransfer.getData('text/plain');
    moveHabit(id, stage);
  });
});

/* ---------- Modal de novo hábito ---------- */

function openModal() {
  els.modalBackdrop.hidden = false;
  els.habitName.value = '';
  els.habitCategory.selectedIndex = 0;
  els.habitName.focus();
}

function closeModal() {
  els.modalBackdrop.hidden = true;
}

els.openAddBtn.addEventListener('click', openModal);
els.cancelAddBtn.addEventListener('click', closeModal);

els.modalBackdrop.addEventListener('click', (e) => {
  if (e.target === els.modalBackdrop) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.modalBackdrop.hidden) closeModal();
});

els.habitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = els.habitName.value.trim();
  if (!name) {
    els.habitName.focus();
    return;
  }
  addHabit(name, els.habitCategory.value);
  closeModal();
});

els.newDayBtn.addEventListener('click', startNewDay);

/* ---------- Início ---------- */

render();
