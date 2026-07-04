class AdComponent {
  constructor(e) {
    this.adElement = e;
    const article = e.querySelector("article");

    // Get ad data (read before we mutate the card below)
    this.id = article.getAttribute("data-adid");
    // The site A/B-tests two card layouts with different title markup.
    this.title = (
      e.querySelector("h2 a") ?? e.querySelector("h2") ??
      e.querySelector("h3 a") ?? e.querySelector("h3")
    )?.innerText.trim() ?? "";
    this.user = e.querySelector('a[href^="/pro/"] span')?.innerText.trim() ?? "";
    this.isPromoted = isPromotedAd(e);

    // Add fold button
    const foldButton = document
      .querySelector("#vimuser-fold-button")
      .content
      .firstElementChild
      .cloneNode(true);
    article.append(foldButton);
    foldButton.addEventListener("click", async e => {
      // The whole card navigates via data-href; stop that here.
      e.preventDefault();
      e.stopPropagation();
      FILTERS.ids.add(this.id);
      this.fold();
      await saveFilters();
    });

    // Add stub
    this.stubElement = document.querySelector("#vimuser-stub")
        .content.firstElementChild.cloneNode(true);
    this.adElement.append(this.stubElement);
    this.stubElement.innerText = this.title;

    this.stubElement.addEventListener("click", async e => {
      e.preventDefault();
      e.stopPropagation();
      FILTERS.ids.delete(this.id);
      this.unfold();
      await saveFilters();
    });
  }

  applyFilters() {
    let fold = false;

    // Promoted "Top-Anzeigen" are folded by default.
    if (this.isPromoted) {
      this.fold();
      fold = true;
    }

    if (FILTERS.ids.has(this.id)) {
      this.fold();
      fold = true;
    }

    const title = this.title.toLowerCase();
    const user = this.user.toLowerCase();
    for (const word of FILTERS.words) {
      if (title.includes(word) || user.includes(word)) {
        this.fold();
        fold = true;
      }
    }

    // Add strikethrough
    strikeText(this.stubElement, this.title, [...FILTERS.words]);

    if (!fold) {
      this.unfold();
    }
  }

  fold() {
    this.adElement.classList.add("vimuser-folded");
    this.stubElement.classList.remove("vimuser-hidden");
  }

  unfold() {
    this.adElement.classList.remove("vimuser-folded");
    this.stubElement.classList.add("vimuser-hidden");
  }
}

// Promoted "Top-Anzeigen" carry a "TOP" badge. It renders as a text node in
// some categories and as an SVG glyph (no text) in others, so check both.
const TOP_GLYPH_PATH = "M8.168 13H9.62"; // start of the path that draws "TOP"
function isPromotedAd(item) {
  const textBadge = [...item.querySelectorAll("*")].some(
    el => el.childElementCount === 0 && el.textContent.trim() === "TOP");
  return textBadge || !!item.querySelector(`path[d^="${TOP_GLYPH_PATH}"]`);
}

// Write `text` into `element` with occurrences of `badWords` struck through.
// Built from DOM nodes so the title is never parsed as HTML.
function strikeText(element, text, badWords) {
  if (badWords.length === 0) {
    element.replaceChildren(text);
    return;
  }
  const escaped = badWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  // The capture group makes split() keep the matches, at odd indices
  element.replaceChildren(...text.split(regex).map((part, i) => {
    if (i % 2 === 0) {
      return part;
    }
    const s = document.createElement('s');
    s.textContent = part;
    return s;
  }));
}
