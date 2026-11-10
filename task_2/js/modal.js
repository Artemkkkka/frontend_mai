export function openModal(title, contentElement) {
  const previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const dialog = document.createElement('div');
  dialog.className = 'modal';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'modal-title');

  const header = document.createElement('div');
  header.className = 'modal-header';
  const heading = document.createElement('h2');
  heading.id = 'modal-title';
  heading.textContent = title;
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Закрыть окно');
  header.appendChild(heading);
  header.appendChild(closeButton);

  dialog.appendChild(header);
  dialog.appendChild(contentElement);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');

  function close() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    document.body.classList.remove('no-scroll');
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key === 'Tab') {
      const items = dialog.querySelectorAll('button, input, select, textarea');
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  overlay.addEventListener('mousedown', function (event) {
    if (event.target === overlay) {
      close();
    }
  });
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', onKeyDown);

  const firstInside = contentElement.querySelector('input, select, button');
  if (firstInside) {
    firstInside.focus();
  } else {
    closeButton.focus();
  }

  return close;
}

export function openConfirm(title, text, onYes) {
  const box = document.createElement('div');
  const message = document.createElement('p');
  message.textContent = text;
  const buttons = document.createElement('div');
  buttons.className = 'modal-buttons';
  const yesButton = document.createElement('button');
  yesButton.type = 'button';
  yesButton.textContent = 'Да';
  const noButton = document.createElement('button');
  noButton.type = 'button';
  noButton.textContent = 'Отмена';
  buttons.appendChild(yesButton);
  buttons.appendChild(noButton);
  box.appendChild(message);
  box.appendChild(buttons);

  const close = openModal(title, box);
  yesButton.addEventListener('click', function () {
    close();
    onYes();
  });
  noButton.addEventListener('click', close);
}
