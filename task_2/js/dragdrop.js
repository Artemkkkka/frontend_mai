export function enableDragAndDrop(grid, onMove) {
  let draggedId = null;
  let touchActive = false;

  function findWidget(element) {
    if (!element) {
      return null;
    }
    return element.closest('.widget');
  }

  function clearMarks() {
    const marked = grid.querySelectorAll('.drop-target');
    for (let i = 0; i < marked.length; i++) {
      marked[i].classList.remove('drop-target');
    }
  }

  function cleanup() {
    clearMarks();
    draggedId = null;
    touchActive = false;
    const widgets = grid.querySelectorAll('.widget');
    for (let i = 0; i < widgets.length; i++) {
      widgets[i].classList.remove('dragging');
      widgets[i].draggable = false;
    }
  }

  grid.addEventListener('mousedown', function (event) {
    const handle = event.target.closest('.drag-handle');
    if (handle) {
      handle.closest('.widget').draggable = true;
    }
  });

  grid.addEventListener('dragstart', function (event) {
    const widget = findWidget(event.target);
    if (!widget || !widget.draggable) {
      return;
    }
    draggedId = widget.dataset.id;
    widget.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedId);
  });

  grid.addEventListener('dragover', function (event) {
    if (draggedId === null) {
      return;
    }
    event.preventDefault();
    const target = findWidget(event.target);
    clearMarks();
    if (target && target.dataset.id !== draggedId) {
      target.classList.add('drop-target'); 
    }
  });

  grid.addEventListener('drop', function (event) {
    event.preventDefault();
    const target = findWidget(event.target);
    const fromId = draggedId;
    cleanup();
    if (target && fromId !== null && target.dataset.id !== fromId) {
      onMove(fromId, target.dataset.id);
    }
  });

  grid.addEventListener('dragend', cleanup);

  grid.addEventListener('touchstart', function (event) {
    const handle = event.target.closest('.drag-handle');
    if (!handle) {
      return;
    }
    const widget = handle.closest('.widget');
    draggedId = widget.dataset.id;
    touchActive = true;
    widget.classList.add('dragging');
  });

  grid.addEventListener('touchmove', function (event) {
    if (!touchActive) {
      return;
    }
    event.preventDefault();
    const touch = event.touches[0];
    const target = findWidget(document.elementFromPoint(touch.clientX, touch.clientY));
    clearMarks();
    if (target && target.dataset.id !== draggedId) {
      target.classList.add('drop-target');
    }
  }, { passive: false });

  grid.addEventListener('touchend', function (event) {
    if (!touchActive) {
      return;
    }
    const touch = event.changedTouches[0];
    const target = findWidget(document.elementFromPoint(touch.clientX, touch.clientY));
    const fromId = draggedId;
    cleanup();
    if (target && target.dataset.id !== fromId) {
      onMove(fromId, target.dataset.id);
    }
  });

  grid.addEventListener('touchcancel', cleanup);
}
