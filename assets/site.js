(() => {
  const config = window.SITE_CONFIG || {};
  const by = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const request = async (path, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(`${config.apiBase || ""}${path}`, {
        ...options,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timeout); }
  };

  const navToggle = by(".nav-toggle");
  if (navToggle) navToggle.addEventListener("click", () => {
    const nav = by(".site-header nav");
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  const calculator = by(".calculator");
  if (calculator) {
    const estimate = () => {
      const service = by("select[name=service]", calculator).selectedOptions[0];
      const base = Number(service.dataset.price || 0);
      const area = Math.max(1, Number(by("[name=area]", calculator).value || 1));
      const rooms = Number(by("[name=rooms]", calculator).value || 1);
      const extras = (by("[name=windows]", calculator).checked ? 500 : 0) + (by("[name=heavy]", calculator).checked ? Math.round(base * .2) : 0) + (by("[name=urgent]", calculator).checked ? Math.round(base * .15) : 0);
      const total = Math.max(base, Math.round(((base + Math.max(0, area - 40) * 45) * rooms + extras) / 100) * 100);
      by("output span", calculator).textContent = new Intl.NumberFormat("ru-RU").format(total);
      const bookingService = by("#booking-form [name=service]");
      if (bookingService) bookingService.value = service.value;
    };
    all("input, select", calculator).forEach((input) => input.addEventListener("input", estimate));
    estimate();
  }

  const booking = by("#booking-form");
  if (!booking) return;
  const date = by("[name=date]", booking);
  const slot = by("[name=slot]", booking);
  const status = by(".form-status", booking);
  const setStatus = (message, kind = "") => { status.textContent = message; status.className = `form-status ${kind}`; };
  const localISODate = () => {
    const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  };
  date.min = localISODate();
  const fallback = "Попробуйте ещё раз или позвоните / напишите — мы запишем вас вручную.";

  const loadSlots = async () => {
    slot.disabled = true;
    slot.innerHTML = "<option>Загружаем свободное время…</option>";
    if (!date.value) return;
    if (!config.bookingEnabled || !config.apiBase) {
      slot.innerHTML = "<option>Онлайн-запись скоро откроется</option>";
      setStatus("Запись настраивается. Пока можно связаться по телефону или в мессенджере.", "error");
      return;
    }
    try {
      const data = await request(`/slots?date=${encodeURIComponent(date.value)}&service=${encodeURIComponent(by("[name=service]", booking).value)}`);
      if (!Array.isArray(data.slots) || data.slots.length === 0) throw new Error("No slots");
      slot.innerHTML = data.slots.map((value) => `<option value="${String(value).replace(/"/g, "&quot;")}">${String(value)}</option>`).join("");
      slot.disabled = false;
      setStatus("");
    } catch (error) {
      slot.innerHTML = "<option>Не удалось получить время</option>";
      setStatus(`Не удалось загрузить свободные окна. ${fallback}`, "error");
    }
  };
  date.addEventListener("change", loadSlots);
  by("[name=service]", booking).addEventListener("change", () => date.value && loadSlots());

  booking.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!booking.reportValidity()) return;
    if (!config.bookingEnabled || !config.apiBase) {
      setStatus(`Онлайн-запись ещё не подключена. ${fallback}`, "error");
      return;
    }
    const button = by("button[type=submit]", booking);
    const payload = Object.fromEntries(new FormData(booking));
    button.disabled = true;
    button.textContent = "Отправляем…";
    setStatus("Проверяем и создаём запись…");
    try {
      const answer = await request("/book", { method: "POST", body: JSON.stringify(payload) });
      // Never treat a network response or a generic `ok` as a booking confirmation.
      if (answer?.ok !== true || !answer?.id || !answer?.start || !answer?.end) throw new Error("Invalid booking response");
      setStatus(`Готово! Запись №${answer.id} подтверждена на ${answer.start}–${answer.end}.`, "success");
      booking.reset(); slot.disabled = true; slot.innerHTML = "<option>Сначала выберите дату</option>";
    } catch (error) {
      setStatus(`Запись не создана. ${fallback}`, "error");
    } finally {
      button.disabled = false;
      button.innerHTML = "Отправить заявку <span>→</span>";
    }
  });
})();
