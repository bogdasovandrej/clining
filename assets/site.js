(() => {
  const filters = [...document.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(".service-card")];
  filters.forEach(button => button.addEventListener("click", () => {
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter;
    });
  }));
})();
