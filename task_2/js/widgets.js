import { loadChartData } from './api.js';

export function createWidgetData(type) {
  if (type === 'note') {
    return { text: '' };
  }
  if (type === 'counter') {
    return { value: 0, step: 1 };
  }
  if (type === 'tasks') {
    return { tasks: [] };
  }
  if (type === 'chart') {
    return { values: [], loaded: false };
  }
  return {};
}

export function createId() {
  return 'id' + Date.now() + '_' + Math.floor(Math.random() * 100000);
}

export function createWidgetElement(widget, onChange, onDelete) {
  const article = document.createElement('article');
  article.className = 'widget';
  article.dataset.id = widget.id;

  const header = document.createElement('header');
  header.className = 'widget-header';

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.textContent = '⠿';
  handle.setAttribute('aria-label', 'Перетащить виджет');

  const titleInput = document.createElement('input');
  titleInput.className = 'widget-title';
  titleInput.value = widget.title;
  titleInput.setAttribute('aria-label', 'Заголовок виджета');
  titleInput.addEventListener('input', function () {
    if (titleInput.value.trim() !== '') {
      widget.title = titleInput.value;
      onChange();
    }
  });
  titleInput.addEventListener('blur', function () {
    titleInput.value = widget.title;
  });

  const collapseButton = document.createElement('button');
  collapseButton.type = 'button';
  collapseButton.setAttribute('aria-label', 'Свернуть или развернуть');
  collapseButton.setAttribute('aria-expanded', String(!widget.collapsed));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '✕';
  deleteButton.setAttribute('aria-label', 'Удалить виджет');
  deleteButton.addEventListener('click', function () {
    onDelete(widget.id);
  });

  const body = document.createElement('div');
  body.className = 'widget-body';
  body.hidden = widget.collapsed;

  function updateCollapseText() {
    collapseButton.textContent = widget.collapsed ? '▸' : '▾';
  }
  updateCollapseText();
  collapseButton.addEventListener('click', function () {
    widget.collapsed = !widget.collapsed;
    body.hidden = widget.collapsed;
    collapseButton.setAttribute('aria-expanded', String(!widget.collapsed));
    updateCollapseText();
    onChange();
  });

  header.appendChild(handle);
  header.appendChild(titleInput);
  header.appendChild(collapseButton);
  header.appendChild(deleteButton);
  article.appendChild(header);
  article.appendChild(body);

  if (widget.type === 'note') {
    fillNote(body, widget, onChange);
  } else if (widget.type === 'counter') {
    fillCounter(body, widget, onChange);
  } else if (widget.type === 'tasks') {
    fillTasks(body, widget, onChange);
  } else if (widget.type === 'chart') {
    fillChart(body, widget, onChange);
  }
  return article;
}

function fillNote(body, widget, onChange) {
  const text = document.createElement('p');
  text.className = 'note-text';
  text.tabIndex = 0;

  function showText() {
    if (widget.data.text === '') {
      text.textContent = 'Двойной клик (или Enter), чтобы редактировать';
    } else {
      text.textContent = widget.data.text;
    }
  }

  function startEditing() {
    const area = document.createElement('textarea');
    area.rows = 5;
    area.value = widget.data.text;
    body.replaceChild(area, text);
    area.focus();
    area.addEventListener('blur', function () {
      if (area.parentNode !== body) {
        return;
      }
      widget.data.text = area.value;
      onChange();
      showText();
      body.replaceChild(text, area);
    });
  }

  text.addEventListener('dblclick', startEditing);
  text.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      startEditing();
    }
  });
  showText();
  body.appendChild(text);
}

function fillCounter(body, widget, onChange) {
  const valueElement = document.createElement('div');
  valueElement.className = 'counter-value';
  valueElement.setAttribute('aria-live', 'polite');
  valueElement.textContent = widget.data.value;

  const buttons = document.createElement('div');
  buttons.className = 'counter-buttons';
  const minusButton = document.createElement('button');
  minusButton.type = 'button';
  minusButton.textContent = '−';
  minusButton.setAttribute('aria-label', 'Уменьшить');
  const plusButton = document.createElement('button');
  plusButton.type = 'button';
  plusButton.textContent = '+';
  plusButton.setAttribute('aria-label', 'Увеличить');
  buttons.appendChild(minusButton);
  buttons.appendChild(plusButton);

  const stepLabel = document.createElement('label');
  stepLabel.textContent = 'Шаг: ';
  const stepInput = document.createElement('input');
  stepInput.type = 'number';
  stepInput.min = '1';
  stepInput.className = 'step-input';
  stepInput.value = widget.data.step;
  stepLabel.appendChild(stepInput);

  minusButton.addEventListener('click', function () {
    widget.data.value = widget.data.value - widget.data.step;
    valueElement.textContent = widget.data.value;
    onChange();
  });
  plusButton.addEventListener('click', function () {
    widget.data.value = widget.data.value + widget.data.step;
    valueElement.textContent = widget.data.value;
    onChange();
  });
  stepInput.addEventListener('change', function () {
    const number = Number(stepInput.value);
    if (number >= 1) {
      widget.data.step = number;
      onChange();
    } else {
      stepInput.value = widget.data.step;
    }
  });

  body.appendChild(valueElement);
  body.appendChild(buttons);
  body.appendChild(stepLabel);
}

function fillTasks(body, widget, onChange) {
  const form = document.createElement('div');
  form.className = 'task-form';
  const input = document.createElement('input');
  input.setAttribute('aria-label', 'Новая задача');
  input.placeholder = 'Новая задача';
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = 'Добавить';
  form.appendChild(input);
  form.appendChild(addButton);

  const list = document.createElement('ul');
  list.className = 'task-list';

  function createTaskItem(task) {
    const item = document.createElement('li');
    item.className = 'task-item';
    if (task.done) {
      item.classList.add('done');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Выполнено');
    checkbox.addEventListener('change', function () {
      task.done = checkbox.checked;
      item.classList.toggle('done', task.done);
      onChange();
    });

    const text = document.createElement('span');
    text.textContent = task.text;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '✕';
    removeButton.setAttribute('aria-label', 'Удалить задачу');
    removeButton.addEventListener('click', function () {
      const index = widget.data.tasks.indexOf(task);
      widget.data.tasks.splice(index, 1);
      onChange();
      drawList();
    });

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(removeButton);
    return item;
  }

  function drawList() {
    list.innerHTML = '';
    for (let i = 0; i < widget.data.tasks.length; i++) {
      list.appendChild(createTaskItem(widget.data.tasks[i]));
    }
  }

  function addTask() {
    const text = input.value.trim();
    if (text === '') {
      return;
    }
    widget.data.tasks.push({ text: text, done: false });
    input.value = '';
    onChange();
    drawList();
  }

  addButton.addEventListener('click', addTask);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      addTask();
    }
  });

  drawList();
  body.appendChild(form);
  body.appendChild(list);
}

function fillChart(body, widget, onChange) {
  const area = document.createElement('div');
  body.appendChild(area);
  if (widget.data.loaded) {
    drawChart(area, widget, onChange);
  } else {
    startLoading(area, widget, onChange);
  }
}

function startLoading(area, widget, onChange) {
  area.innerHTML = '';
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', 'Загрузка данных');
  area.appendChild(spinner);

  loadChartData()
    .then(function (values) {
      widget.data.values = values;
      widget.data.loaded = true;
      onChange();
      drawChart(area, widget, onChange);
    })
    .catch(function (error) {
      area.innerHTML = '';
      const message = document.createElement('p');
      message.className = 'error';
      message.textContent = error.message;
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.textContent = 'Повторить';
      retryButton.addEventListener('click', function () {
        startLoading(area, widget, onChange);
      });
      area.appendChild(message);
      area.appendChild(retryButton);
    });
}

function drawChart(area, widget, onChange) {
  area.innerHTML = '';
  const values = widget.data.values;

  let max = 1;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > max) {
      max = values[i];
    }
  }

  const bars = document.createElement('div');
  bars.className = 'bars';
  for (let i = 0; i < values.length; i++) {
    const column = document.createElement('div');
    column.className = 'bar-column';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = Math.round((values[i] / max) * 100) + 'px';
    const label = document.createElement('span');
    label.textContent = values[i];
    column.appendChild(bar);
    column.appendChild(label);
    bars.appendChild(column);
  }

  const form = document.createElement('div');
  form.className = 'chart-form';
  const input = document.createElement('input');
  input.setAttribute('aria-label', 'Значения через запятую');
  input.value = values.join(', ');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Обновить';
  form.appendChild(input);
  form.appendChild(button);

  const error = document.createElement('p');
  error.className = 'error';

  button.addEventListener('click', function () {
    const parts = input.value.split(',');
    const numbers = [];
    for (let i = 0; i < parts.length; i++) {
      const piece = parts[i].trim();
      if (piece === '') {
        continue;
      }
      const number = Number(piece);
      if (isNaN(number) || number < 0) {
        error.textContent = 'Введите неотрицательные числа через запятую';
        return;
      }
      numbers.push(number);
    }
    if (numbers.length === 0) {
      error.textContent = 'Введите хотя бы одно число';
      return;
    }
    widget.data.values = numbers;
    onChange();
    drawChart(area, widget, onChange);
  });

  area.appendChild(bars);
  area.appendChild(form);
  area.appendChild(error);
}
