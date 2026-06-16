// Globals
const FILTERS = {
  words: new Set(),
  ids: new Set(),
};
const ADS = [];

async function loadFromStorage(key) {
  return new Promise(resolve => {
    chrome.storage.sync.get(key, result => {
      resolve(result[key]);
    });
  });
}

async function saveToStorage(key, value) {
  return new Promise(resolve => {
    chrome.storage.sync.set({[key]: value}, resolve);
  });
}

async function loadFilters() {
  FILTERS.words = new Set(await loadFromStorage('badWords') ?? []);
  FILTERS.ids = new Set(await loadFromStorage('ids') ?? []);
}

async function saveFilters() {
  // Limit max number of ids
  while (FILTERS.ids.size > 1000) {
      FILTERS.ids.delete(FILTERS.ids.values().next().value);
  }

  await saveToStorage('ids', [...FILTERS.ids]);
  await saveToStorage('badWords', [...FILTERS.words]);
}

function applyFilters() {
  for (const ad of ADS) {
    ad.applyFilters();
  }
}

// Resolve once `selector` is in the DOM, or with null after `timeout` ms.
// The results page renders/hydrates client-side, so elements we depend on may
// not exist yet at document_idle.
function waitForElement(selector, timeout = 5000) {
  return new Promise(resolve => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(document.querySelector(selector));
    }, timeout);
  });
}
