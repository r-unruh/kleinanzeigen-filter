async function main() {
  // Load HTML
  const res = await fetch(chrome.runtime.getURL('templates.html'));
  const html = await res.text();
  document.querySelector('body').insertAdjacentHTML('beforeend', html);

  // Load filters
  await loadFilters();

  // Setup global components.
  // The sidebar renders client-side, so it may not exist yet at document_idle;
  // wait for it, and never let a missing sidebar abort the rest of the setup
  // (ad filtering is the core feature).
  const sidebarForm = await waitForElement("#browsebox-form");
  // The filter sections live inside one rounded "bg-surface" card; add ours to it.
  const filterCard = sidebarForm
    ?.querySelector("h3.font-strong")
    ?.closest('[class*="bg-surface"]')
    ?? sidebarForm?.closest("aside");
  if (filterCard) {
    new SidebarMenu(filterCard);
  } else {
    // No sidebar to dock into (different layout/viewport); fall back to a
    // floating panel so the filter list is still editable.
    new SidebarMenu(document.body, {floating: true});
  }

  // Setup ad components.
  // Each ad is an <article data-adid> wrapped in an <li>; the data-adid
  // attribute is what marks a genuine user ad (vs. injected banners).
  const elements = [...document.querySelectorAll("article[data-adid]")]
    .map(a => a.closest("li") ?? a.parentElement)
    .filter(Boolean);

  for (const e of elements) {
    try {
      ADS.push(new AdComponent(e));
    } catch (err) {
      console.warn("Kleinanzeigen Filter: skipped an ad item", err);
    }
  }

  applyFilters();

  // Promoted ads are folded by default (in applyFilters) and moved below the
  // organic results.
  for (const ad of ADS) {
    if (ad.isPromoted) {
      ad.adElement.parentNode.appendChild(ad.adElement);
    }
  }
}

main();
