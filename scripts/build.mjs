import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const out = new URL("../dist/", import.meta.url);
const data = JSON.parse(await readFile(new URL("data/services.json", root), "utf8"));
const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const money = amount => new Intl.NumberFormat("ru-RU").format(amount);
const phoneHref = `tel:+${data.phone.replace(/\D/g, "")}`;
const telegramHref = `https://t.me/+${data.phone.replace(/\D/g, "")}`;
const price = service => service.unit === "₽/час"
    ? `${money(service.price)} ₽/час`
    : `от ${money(service.price)} ₽`;
const category = service => service.slug.startsWith("himchistka") ? "furniture"
  : ["master-na-chas", "ozonirovanie"].includes(service.slug) ? "other" : "home";
const cards = data.services.map(service => `
  <article class="service-card" data-category="${category(service)}">
    <h3>${escape(service.name)}</h3>
    ${service.slug === "glazhka" ? `<p class="price">${money(service.price)} ₽ за час</p>` : service.price === null ? "" : `<p class="price">${escape(price(service))}</p>`}
    ${service.slug === "master-na-chas" ? '<p class="service-note">Стоимость услуги «Мастер на час» уточняйте по телефону.</p>' : ""}
  </article>`).join("");
const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#2458d3">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="description" content="НавитЭко: уборка квартир, химчистка мебели, глажка и бытовые услуги в Екатеринбурге. Услуги и цены, график и телефон.">
  <title>НавитЭко — уборка и химчистка в Екатеринбурге</title>
  <link rel="icon" href="./assets/brand-mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./assets/site.css">
</head>
<body>
  <a class="skip-link" href="#main">К содержанию</a>
  <header class="site-header container">
    <a class="brand" href="#main" aria-label="НавитЭко — на главную"><img src="./assets/brand-mark.svg" width="34" height="34" alt=""><span>НавитЭко</span></a>
    <nav aria-label="Основная навигация"><a href="#services">Услуги и цены</a><a href="#how">Как записаться</a><a class="header-phone" href="${phoneHref}">${escape(data.phone)}</a></nav>
  </header>
  <main id="main">
    <section class="hero container">
      <p class="eyebrow">Екатеринбург · все районы</p>
      <h1>Уборка квартир<br>и химчистка мебели</h1>
      <p class="hero-lead">Поддерживающая и генеральная уборка, уборка после ремонта, чистка мебели и дополнительные услуги по дому. Работаю ежедневно с 8:00 до 20:00.</p>
      <div class="hero-actions"><a class="button" href="#services">Посмотреть цены</a><a class="button button-outline" href="${phoneHref}">Позвонить</a><a class="button button-outline" href="${telegramHref}" target="_blank" rel="noopener noreferrer">Написать в Telegram</a></div>
    </section>
    <div class="facts container"><span>Выезд по всему Екатеринбургу</span><span>Ежедневно, 8:00–20:00</span><span>Стоимость согласую до начала работы</span></div>
    <section class="section container" id="services">
      <div class="section-heading"><p class="eyebrow">Услуги и цены</p><h2>Чем могу помочь</h2><p>Указаны стартовые цены. Итоговая стоимость зависит от объёма и состояния помещения или вещи.</p></div>
      <div class="filters" role="group" aria-label="Категории услуг"><button type="button" class="active" data-filter="all" aria-pressed="true">Все услуги</button><button type="button" data-filter="home" aria-pressed="false">Уборка и дом</button><button type="button" data-filter="furniture" aria-pressed="false">Химчистка</button><button type="button" data-filter="other" aria-pressed="false">Другие услуги</button></div>
      <div class="service-grid">${cards}</div>
    </section>
    <section class="section process-section" id="how"><div class="container">
      <p class="eyebrow">Как записаться</p><h2>Выберите удобную дату</h2>
      <div class="steps"><div><span>01</span><h3>Позвоните или напишите</h3><p>Расскажите, какая услуга нужна, и назовите желаемую дату.</p></div><div><span>02</span><h3>Оценка работы</h3><p>Поддерживающую уборку оценю по фото. Перед генеральной и послестроительной приеду на осмотр.</p></div><div><span>03</span><h3>Подтверждение визита</h3><p>Согласую стоимость и время. После подтверждения внесу запись в календарь.</p></div></div>
      <div class="contact-actions"><a class="button" href="${phoneHref}">Позвонить ${escape(data.phone)}</a><a class="button button-outline" href="${telegramHref}" target="_blank" rel="noopener noreferrer">Написать в Telegram</a></div>
      <div class="future-channels" aria-label="Будущие способы записи"><a role="link" aria-disabled="true">Запись через Telegram-бота · скоро</a><a role="link" aria-disabled="true">Запись через MAX-бота · скоро</a></div>
    </div></section>
    <section class="section container contact-section" id="contacts"><p class="eyebrow">Контакты</p><h2>НавитЭко</h2><p>Выезжаю во все районы Екатеринбурга. Ежедневно, 8:00–20:00.</p><a class="contact-phone" href="${phoneHref}">${escape(data.phone)}</a><p>Позвоните или <a class="inline-link" href="${telegramHref}" target="_blank" rel="noopener noreferrer">напишите мне в Telegram</a>, чтобы обсудить задачу и желаемую дату.</p></section>
  </main>
  <footer><div class="container footer-inner"><span>НавитЭко · Екатеринбург</span><a href="${phoneHref}">${escape(data.phone)}</a></div></footer>
  <div class="mobile-cta"><a href="${phoneHref}">Позвонить</a><a href="${telegramHref}" target="_blank" rel="noopener noreferrer">Написать в Telegram</a></div>
  <script src="./assets/site.js" defer></script>
</body>
</html>`;

await mkdir(new URL("assets/", out), { recursive: true });
await mkdir(new URL("review/", root), { recursive: true });
const css = await readFile(new URL("assets/site.css", root), "utf8");
const js = await readFile(new URL("assets/site.js", root), "utf8");
const logo = await readFile(new URL("assets/brand-mark.svg", root));
const logoUrl = `data:image/svg+xml;base64,${logo.toString("base64")}`;
const portable = html
  .replace('<link rel="stylesheet" href="./assets/site.css">', `<style>${css}</style>`)
  .replace('<script src="./assets/site.js" defer></script>', `<script>${js}</script>`)
  .replaceAll("./assets/brand-mark.svg", logoUrl);
await writeFile(new URL("index.html", out), html);
await writeFile(new URL("assets/site.css", out), css);
await writeFile(new URL("assets/site.js", out), js);
await writeFile(new URL("assets/brand-mark.svg", out), logo);
await writeFile(new URL("preview.html", out), portable);
await writeFile(new URL("review/preview.html", root), portable);
await writeFile(new URL("review/README.txt", root), "НавитЭко · версия для согласования\n\nОткройте preview.html в браузере. Сайт показывает услуги, стартовые цены и рабочий телефон.\n");
await writeFile(new URL("robots.txt", out), "User-agent: *\nDisallow: /\n");
console.log(`Built ${data.services.length} services and portable review/preview.html.`);
