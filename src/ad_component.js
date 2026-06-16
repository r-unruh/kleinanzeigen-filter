class AdComponent {
  constructor(e) {
    this.adElement = e;
    const article = e.querySelector("article");

    // Get ad data (read before we mutate the card below)
    this.id = article.getAttribute("data-adid");
    this.title = (e.querySelector("h3 a") ?? e.querySelector("h3"))
      ?.innerText.trim() ?? "";
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
    this.stubElement.innerHTML = strikeText(this.title, [...FILTERS.words]);

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

// Organic ads always show a posting date ("Heute, 11:56" / "Gestern, 09:38" /
// "12.06.2026"); promoted "Top-Anzeigen" omit it. So an ad with no visible date
// is a promoted one.
const POSTING_DATE = /(?:Heute|Gestern),\s*\d{1,2}:\d{2}|\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/;
function isPromotedAd(item) {
  return !POSTING_DATE.test(item.innerText);
}

function strikeText(text, badWords) {
    const escaped = badWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    return text.replace(regex, "<s>$1</s>");
}
