(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.service-card')];
  const count = document.querySelector('#service-count');
  function selectCategory(category) {
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
    count.textContent = `Показано: ${cards.filter(card => !card.hidden).length} из ${cards.length}`;
  }
  document.querySelector('.service-toolbar').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.filter)));
  document.querySelectorAll('[data-category-link]').forEach(link => link.addEventListener('click', () => selectCategory(link.dataset.categoryLink)));
  const menu = document.querySelector('.mobile-menu');
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('click', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  // The information dialog uses native focus containment and Escape handling.
  const infoDialog = document.querySelector('#info-dialog');
  if (typeof infoDialog.showModal === 'function') {
    let opener;
    const openDialog = (dialog, button) => {
      opener = button;
      dialog.showModal();
      document.body.classList.add('modal-open');
    };
    const infoButton = document.querySelector('[data-info]');
    infoButton.hidden = false;
    infoButton.addEventListener('click', () => openDialog(infoDialog, infoButton));
    [infoDialog].forEach(dialog => {
      dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    });
  }
  // Progressive enhancement never hides content if JavaScript is unavailable.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('enhanced');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('reveal'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .review-card, .steps > div').forEach(element => observer.observe(element));
  }
})();
