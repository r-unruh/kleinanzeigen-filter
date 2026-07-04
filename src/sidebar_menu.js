class SidebarMenu {
  constructor(container, {floating = false} = {}) {
    // Create element
    this.element = document
      .querySelector("#vimuser-sidebar-menu")
      .content.firstElementChild.cloneNode(true);

    if (floating) {
      // Some layouts/viewports render no filter sidebar to dock into. Mount the
      // same menu as a collapsible panel pinned to the corner instead.
      const panel = document.createElement("div");
      panel.className = "vimuser-floating vimuser-floating-collapsed";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "vimuser-floating-toggle";
      toggle.textContent = "Filter";
      toggle.addEventListener("click",
        () => panel.classList.toggle("vimuser-floating-collapsed"));

      this.element.querySelector("header")?.remove(); // the toggle is the title
      panel.append(toggle, this.element);
      document.body.append(panel);
    } else {
      // Add as another section inside the filter card
      container.append(this.element);
    }

    // Load data
    this.textarea = this.element.querySelector("textarea");
    this.textarea.value = [...FILTERS.words].join("\n");

    // Bind events. We use a plain button (not a <form>) to avoid nesting a form
    // inside the site's own #browsebox-form.
    this.button = this.element.querySelector(".vimuser-menu-button");
    this.button.addEventListener("click", e => {
      e.preventDefault();
      this.save();
    });

    // Ctrl/Shift + Enter saves too (Enter alone keeps adding lines).
    this.textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) {
        e.preventDefault();
        this.save();
      }
    });
  }

  async save() {
    this.textarea.value = this.textarea.value.toLowerCase();
    FILTERS.words = new Set(
      this.textarea.value.split("\n").map(w => w.trim()).filter(Boolean));
    applyFilters();
    await saveWords();
  }
}
