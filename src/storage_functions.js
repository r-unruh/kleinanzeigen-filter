async function loadFromStorage(key) {
  return new Promise(resolve => {
    chrome.storage.sync.get(key, result => {resolve(result[key]);});
  });
}

async function saveToStorage(key, value) {
  return new Promise(resolve => {
    chrome.storage.sync.set({[key]: value}, resolve);
  });
}


async function getIsFilterEnabled() {
  return (await loadFromStorage('isEnabled') ?? true);
}

async function setIsFilterEnabled(val) {
  await saveToStorage('isEnabled', val);
}


async function getBadWords() {
  return (await loadFromStorage('badWords')) ?? [];
}

async function setBadWords(words) {
  const filtered = words.filter(word => word !== '');
  await saveToStorage('badWords', filtered);
}


async function getHideTopAds() {
  return (await loadFromStorage('removeProAds')) ?? false;
}

async function setHideTopAds(val) {
  await saveToStorage('removeProAds', val);
}
