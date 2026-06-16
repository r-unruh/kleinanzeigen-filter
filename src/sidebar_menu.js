class SidebarMenu {
  constructor(container) {
    // Create element
    this.element = document
      .querySelector("#vimuser-sidebar-menu")
      .content.firstElementChild.cloneNode(true);

    // Add as another section inside the filter card
    container.append(this.element);

    // Load data
    this.textarea = this.element.querySelector("textarea");
    this.textarea.value = [...FILTERS.words].join("\n");

    // Bind events. We use a plain button (not a <form>) to avoid nesting a form
    // inside the site's own #browsebox-form.
    this.button = this.element.querySelector(".vimuser-menu-button");
    this.button.addEventListener("click", async e => {
      e.preventDefault();
      this.textarea.value = this.textarea.value.toLowerCase();
      FILTERS.words =
        new Set(this.textarea.value.split("\n").filter(w => w !== ""));
      applyFilters();
      await saveFilters();
    });
  }
}
