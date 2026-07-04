// Remove affiliate ads from site

// Elements to be removed directly
const badElements = [
  ".sticky-advertisement",
  `[id$="-billboard"]`,
  `[data-liberty-position-name$="-middle"]`,
  `[data-liberty-position-name$="-bottom"]`,
];

// Elements whose parent is to be removed
const badChildren = [
  `[data-liberty-position-name$="-top"]`,
  `[data-liberty-position-name$="-top-banner"]`,
  `[data-liberty-position-name*="-result-list-"]`,
];

function removeAds() {
  for (const s of badElements) {
    document.querySelectorAll(s).forEach(e => e.remove());
  }
  for (const s of badChildren) {
    document.querySelectorAll(s).forEach(e => e.parentElement?.remove());
  }
}

removeAds();

// Ad slots keep being injected after load; sweep again (throttled) whenever
// the page mutates.
let sweepScheduled = false;
new MutationObserver(() => {
  if (sweepScheduled) {
    return;
  }
  sweepScheduled = true;
  setTimeout(() => {
    sweepScheduled = false;
    removeAds();
  }, 100);
}).observe(document.documentElement, {childList: true, subtree: true});
