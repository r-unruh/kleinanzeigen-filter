class SettingsComponent {
  #saveButton = null;
  #closeButton = null;
  #sortButton = null;
  #textArea = null;
  #topFilterCheckbox = null;
  #events = {'update': []};

  constructor(selector) {
    this.element = document.querySelector(selector)
        .content.firstElementChild.cloneNode(true);
    document.querySelector('body').appendChild(this.element);

    this.#textArea = this.element.querySelector('textarea');
    this.#textArea.addEventListener('input', e => {
      this.#saveButtonHighlighted = true;
    });

    this.#textArea.addEventListener('change', e => {this.#sanitizeTextarea();});

    document.addEventListener('keydown', e => {
      if (document.activeElement !== this.#textArea &&
          !this.element.hidden && e.key === 'Escape')
        this.hide();
    });

    this.#textArea.addEventListener('keydown', async e => {
      if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
        e.preventDefault();
        await this.#saveSettings();
      }
    });

    this.#topFilterCheckbox = this.element.querySelector('input[type="checkbox"]');
    this.#topFilterCheckbox.addEventListener('change', e => {
      this.#saveButtonHighlighted = true;
    });

    this.#saveButton = this.element.querySelector('a[data-save]');
    this.#saveButton.addEventListener('click', async e => {
      e.preventDefault();
      await this.#saveSettings();
    });

    this.#closeButton = this.element.querySelector('a[data-close]');
    this.#closeButton.addEventListener('click', e => {
      e.preventDefault();
      this.hide();
    });

    this.#sortButton = this.element.querySelector('a[data-sort]');
    this.#sortButton.addEventListener('click', e => {
      e.preventDefault();
      this.#sortTextarea();
      this.#saveButtonHighlighted = true;
    });
  }

  #sanitizeTextarea() {
    this.#textArea.value = this.#textArea.value
        .split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(w => w !== '')
        .join('\n');
  }

  async #saveSettings() {
    this.#saveButtonHighlighted = false;
    await setBadWords(this.#badWordsFromTextarea);
    await setHideTopAds(this.#topFilterCheckbox.checked);
    for (const func of this.#events['update'])
      func();
  }

  hide() {this.element.hidden = true;}

  async show() {
    this.#saveButtonHighlighted = false;
    this.element.hidden = false;
    this.#textArea.value = (await getBadWords()).join('\n');
    this.#topFilterCheckbox.checked = await getHideTopAds();
  }

  #sortTextarea() {
    this.#textArea.value = this.#textArea.value.split('\n').sort().join('\n');
  }

  get #badWordsFromTextarea() {
    return this.#textArea.value.split('\n');
  }

  set #saveButtonHighlighted(highlighted) {
    this.#saveButton.classList.toggle('rukaf-button-outline', !highlighted);
    this.#saveButton.classList.toggle('rukaf-button', highlighted);
  }

  addEventListener(type, func) {this.#events[type].push(func);}
}
