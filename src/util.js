// Globals
const FILTERS = {
  words: new Set(),
  ids: new Set(),
};
const ADS = [];

async function loadFilters() {
  const {badWords} = await chrome.storage.sync.get('badWords');
  FILTERS.words = new Set(badWords ?? []);

  // Ids live in local storage; sync storage items are too small for them.
  let {ids} = await chrome.storage.local.get('ids');
  if (ids === undefined) {
    // One-time migration; earlier versions kept ids in sync storage
    ids = (await chrome.storage.sync.get('ids')).ids ?? [];
    await chrome.storage.local.set({ids});
    chrome.storage.sync.remove('ids');
  }
  FILTERS.ids = new Set(ids);
}

async function saveIds() {
  // Limit max number of ids, evicting oldest first
  while (FILTERS.ids.size > 10000) {
    FILTERS.ids.delete(FILTERS.ids.values().next().value);
  }

  await chrome.storage.local.set({ids: [...FILTERS.ids]});
}

async function saveWords() {
  await chrome.storage.sync.set({badWords: [...FILTERS.words]});
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
