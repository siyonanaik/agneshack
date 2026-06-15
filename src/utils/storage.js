const HISTORY_KEY = 'mediclear_history';
const LANGUAGE_KEY = 'mediclear_language';
const MAX_HISTORY_ITEMS = 50;

// Language persistence
export function getSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'English';
  } catch {
    return 'English';
  }
}

export function saveLanguage(lang) {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // Silently fail
  }
}

export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry) {
  try {
    const history = getHistory();
    history.unshift(entry);
    // Limit history to MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function removeFromHistory(id) {
  try {
    const history = getHistory().filter((entry) => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silently fail
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LANGUAGE_KEY);
  } catch {
    // Silently fail
  }
}
