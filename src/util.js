// Globals
const FILTERS = {
  words: new Set(),
  ids: new Set(),
};
const ADS = [];

async function loadFromStorage(key, area = chrome.storage.sync) {
  return new Promise(resolve => {
    area.get(key, result => {
      resolve(result[key]);
    });
  });
}

async function saveToStorage(key, value, area = chrome.storage.sync) {
  return new Promise(resolve => {
    area.set({[key]: value}, resolve);
  });
}

async function loadFilters() {
  FILTERS.words = new Set(await loadFromStorage('badWords') ?? []);

  // Ids live in local storage; sync storage items are too small for them.
  let ids = await loadFromStorage('ids', chrome.storage.local);
  if (ids === undefined) {
    // One-time migration; earlier versions kept ids in sync storage
    ids = await loadFromStorage('ids') ?? [];
    await saveToStorage('ids', ids, chrome.storage.local);
    chrome.storage.sync.remove('ids');
  }
  FILTERS.ids = new Set(ids);
}

async function saveFilters() {
  // Limit max number of ids, evicting oldest first
  while (FILTERS.ids.size > 10000) {
    FILTERS.ids.delete(FILTERS.ids.values().next().value);
  }

  await saveToStorage('ids', [...FILTERS.ids], chrome.storage.local);
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
