import { loadState, saveState } from './storage.js';
import { openModal, openConfirm } from './modal.js';
import { showToast } from './toast.js';
import { createWidgetData, createWidgetElement, createId } from './widgets.js';
import { enableDragAndDrop } from './dragdrop.js';

const state = loadState();

const grid = document.getElementById('grid');
const emptyBlock = document.getElementById('empty');
const countElement = document.getElementById('count');
const themeButton = document.getElementById('theme-button');

function save() {
  saveState(state);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const isDark = state.theme === 'dark';
  themeButton.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
  themeButton.setAttribute('aria-pressed', String(isDark));
}

function render() {
  grid.innerHTML = '';
  for (let i = 0; i < state.widgets.length; i++) {
    grid.appendChild(createWidgetElement(state.widgets[i], save, deleteWidget));
  }
  countElement.textContent = state.widgets.length;
  emptyBlock.hidden = state.widgets.length !== 0;
}

function deleteWidget(id) {
  for (let i = 0; i < state.widgets.length; i++) {
    if (state.widgets[i].id === id) {
      state.widgets.splice(i, 1);
      break;
    }
  }
  save();
  render();
  showToast('Виджет удалён');
}

function findIndexById(id) {
  for (let i = 0; i < state.widgets.length; i++) {
    if (state.widgets[i].id === id) {
      return i;
    }
  }
  return -1;
}

function moveWidget(fromId, toId) {
  const fromIndex = findIndexById(fromId);
  const toIndex = findIndexById(toId);
  if (fromIndex === -1 || toIndex === -1) {
    return;
  }
  const removed = state.widgets.splice(fromIndex, 1)[0];
  state.widgets.splice(toIndex, 0, removed);
  save();
  render();
}

function openAddModal() {
  const box = document.createElement('div');

  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Заголовок';
  titleLabel.htmlFor = 'new-title';
  const titleInput = document.createElement('input');
  titleInput.id = 'new-title';

  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Тип виджета';
  typeLabel.htmlFor = 'new-type';
  const typeSelect = document.createElement('select');
  typeSelect.id = 'new-type';
  const types = [
    { value: 'note', name: 'Текстовая заметка' },
    { value: 'counter', name: 'Счётчик' },
    { value: 'tasks', name: 'Список задач' },
    { value: 'chart', name: 'График' }
  ];
  for (let i = 0; i < types.length; i++) {
    const option = document.createElement('option');
    option.value = types[i].value;
    option.textContent = types[i].name;
    typeSelect.appendChild(option);
  }

  const error = document.createElement('p');
  error.className = 'error';
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = 'Добавить';

  box.appendChild(titleLabel);
  box.appendChild(titleInput);
  box.appendChild(typeLabel);
  box.appendChild(typeSelect);
  box.appendChild(error);
  box.appendChild(addButton);

  const close = openModal('Добавить виджет', box);

  function addWidget() {
    const title = titleInput.value.trim();
    if (title === '') {
      error.textContent = 'Заголовок не может быть пустым';
      titleInput.focus();
      return;
    }
    const type = typeSelect.value;
    state.widgets.push({
      id: createId(),
      type: type,
      title: title,
      collapsed: false,
      data: createWidgetData(type)
    });
    save();
    render();
    close();
    showToast('Виджет добавлен');
  }

  addButton.addEventListener('click', addWidget);
  titleInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      addWidget();
    }
  });
}

document.getElementById('add-button').addEventListener('click', openAddModal);
document.getElementById('empty-add-button').addEventListener('click', openAddModal);

document.getElementById('reset-button').addEventListener('click', function () {
  openConfirm('Сбросить дашборд', 'Удалить все виджеты? Это действие нельзя отменить.', function () {
    state.widgets = [];
    save();
    render();
    showToast('Сброс выполнен');
  });
});

themeButton.addEventListener('click', function () {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  save();
});

enableDragAndDrop(grid, moveWidget);
applyTheme();
render();
