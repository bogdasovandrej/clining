(() => {
  const by = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = by(".nav-toggle");
  const nav = by("#navigation");
  const closeMenu = () => {
    nav?.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
  };
  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  all("#navigation a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  let toastTimer;
  const notify = message => {
    const toast = by(".toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6500);
  };
  all("[data-demo]").forEach(button => button.addEventListener("click", () => notify(button.dataset.demo)));

  // The same pages work online and inside the portable, network-free review file.
  all("[data-page]").forEach(link => link.addEventListener("click", event => {
    const dialog = document.getElementById("page-" + link.dataset.page);
    if (!dialog) return;
    event.preventDefault();
    all("dialog[open]").forEach(open => open.close());
    dialog.showModal();
  }));
  all(".dialog-close").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  all("dialog").forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
    all('a[href^="#"]', dialog).forEach(link => {
      if (!link.dataset.page) link.addEventListener("click", () => dialog.close());
    });
  });

  all("[data-filter]").forEach(button => button.addEventListener("click", () => {
    all("[data-filter]").forEach(other => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    all(".service-card").forEach(card => {
      card.hidden = button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter;
    });
  }));

  const calculator = by(".calculator");
  const booking = by("#booking-form");
  if (calculator) {
    const unitServices = new Set(["himchistka-kresel", "himchistka-divanov", "himchistka-matrasov"]);
    const estimate = () => {
      const selected = by("[name=service]", calculator).selectedOptions[0];
      const isUnit = unitServices.has(selected.value);
      by(".quantity-field", calculator).hidden = !isUnit;
      by(".form-grid", calculator).hidden = isUnit;
      const quantity = Number(by("[name=quantity]", calculator).value);
      const valid = !isUnit || (Number.isInteger(quantity) && quantity >= 1 && quantity <= 20);
      const amount = Number(selected.dataset.price) * (isUnit ? quantity : 1);
      by("#estimate", calculator).textContent = valid ? new Intl.NumberFormat("ru-RU").format(amount) : "—";
      by(".calculator-explanation", calculator).textContent = !valid
        ? "Укажите целое количество предметов от 1 до 20."
        : isUnit
          ? "Стартовая цена × количество предметов. Размер, материал и загрязнение уточним по фото."
          : "Площадь и особенности помогают уточнить задачу. Доплаты не рассчитаны: правила согласуем с мастером.";
      by(".calculator-book", calculator).setAttribute("aria-disabled", String(!valid));
      if (booking) by("[name=service]", booking).value = selected.value;
    };
    calculator.addEventListener("submit", event => event.preventDefault());
    all("input, select", calculator).forEach(input => input.addEventListener("input", estimate));
    by(".calculator-book", calculator).addEventListener("click", event => {
      if (event.currentTarget.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        by("[name=quantity]", calculator).reportValidity();
      }
    });
    estimate();
  }
  if (booking) {
    const date = by("[name=date]", booking);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const part = type => parts.find(p => p.type === type).value;
    date.min = part("year") + "-" + part("month") + "-" + part("day");
    booking.addEventListener("submit", event => {
      event.preventDefault();
      by(".form-status", booking).textContent = "Это демонстрация: заявка не отправлена. После согласования подключим запись и подтверждение от мастера.";
    });
  }
})();
