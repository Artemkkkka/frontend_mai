const STORAGE_KEY = 'dashboard_state';
const SCHEMA_VERSION = 1;

export function createEmptyState() {
  return { version: SCHEMA_VERSION, theme: 'light', widgets: [] };
}

export function loadState() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text === null) {
      return createEmptyState();
    }
    const state = JSON.parse(text);
    if (state.version !== SCHEMA_VERSION || !Array.isArray(state.widgets)) {
      return createEmptyState();
    }
    return state;
  } catch (error) {
    return createEmptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('Не удалось сохранить состояние', error);
  }
}
