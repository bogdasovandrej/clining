import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const out = new URL('../dist/', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/services.json', root), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const money = amount => new Intl.NumberFormat('ru-RU').format(amount);
const phoneHref = `tel:+${data.phone.replace(/\D/g, '')}`;
const telegramHref = `https://t.me/+${data.phone.replace(/\D/g, '')}`;
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const plus = '<span class="expand-icon" aria-hidden="true"></span>';
const category = service => service.slug.startsWith('himchistka') ? 'furniture' : ['master-na-chas', 'ozonirovanie', 'glazhka'].includes(service.slug) ? 'other' : 'home';
const price = service => service.price === null ? '<span class="price price-on-request">Стоимость по телефону</span>' : `<span class="price">${service.unit === '₽/час' ? `${money(service.price)} ₽ за час` : `от ${money(service.price)} ₽`}</span>`;
const cards = data.services.map(service => `<details class="service-card" data-category="${category(service)}" id="${escape(service.slug)}"><summary><div><h3>${escape(service.name)}</h3>${price(service)}</div>${plus}</summary><div class="service-body"><p>${escape(service.description)}</p><a href="${phoneHref}" aria-label="Обсудить услугу «${escape(service.name)}» по телефону">Обсудить по телефону ${arrow}</a></div></details>`).join('\n');
const workPhotos = [
  { file:'work-chair.jpg', title:'Химчистка кресла', alt:'Кресло до и после чистки' },
  { file:'work-room.jpg', title:'Уборка комнаты', alt:'Комната до и после уборки' }
];
const workCards = workPhotos.map(photo => `<figure class="work-card"><div class="work-image"><img src="./assets/${photo.file}" width="572" height="1280" loading="lazy" decoding="async" alt="${escape(photo.alt)}"><button class="photo-open" type="button" data-photo="${escape(photo.title)}" aria-label="Увеличить: ${escape(photo.title)}" hidden>Открыть фото ${arrow}</button></div><figcaption>${escape(photo.title)}<small>До / после</small></figcaption></figure>`).join('\n');
const faq = [
  ['Как узнать точную стоимость?', 'Поддерживающую уборку оценю по фото. Перед генеральной и послестроительной приеду на осмотр. Объём, итоговую стоимость и время согласую до начала работы.'],
  ['Можно выбрать дату заранее?', 'Да, назовите желаемую дату при звонке или в сообщении. Визит считается согласованным после личного подтверждения — свободного времени в календаре на сайте нет.'],
  ['В каких районах доступна уборка?', 'Все районы Екатеринбурга. Ежедневно, 8:00–20:00. При обращении укажите район и желаемую дату.'],
  ['Как оплатить услугу?', 'Способ и порядок оплаты обсудим при обращении. На сайте нет оплаты и запроса реквизитов банковской карты.'],
  ['Что делать, если Telegram не открывается?', `Позвоните по номеру ${data.phone}. Ссылка на личный Telegram по номеру телефона может не сработать из-за настроек приватности аккаунта или доступности мессенджера.`]
].map(([question, answer]) => `<details class="faq-item"><summary>${escape(question)}${plus}</summary><p>${escape(answer)}</p></details>`).join('\n');
const navLinks = '<a href="#services">Услуги и цены</a><a href="#work">Фото работ</a><a href="#how">Как записаться</a><a href="#contacts">Контакты</a>';
const html = `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#fcfcfa"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'; connect-src 'none'; object-src 'none'">
<meta name="description" content="Уборка квартир и химчистка мебели в Екатеринбурге. НавитЭко: услуги и цены, фото работ, запись по телефону. Ежедневно, 8:00–20:00.">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:title" content="НавитЭко — уборка и химчистка в Екатеринбурге"><meta property="og:description" content="Услуги и цены, фото работ, запись по телефону. Ежедневно, 8:00–20:00.">
<title>НавитЭко — уборка и химчистка в Екатеринбурге</title>
<link rel="icon" href="./assets/brand-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="./assets/site.css">
</head><body>
<a class="skip-link" href="#main">К содержанию</a>
<div class="header-wrap"><header class="site-header container">
<a class="brand" href="#main" aria-label="НавитЭко — на главную"><img src="./assets/brand-mark.svg" width="30" height="30" alt=""><span>НавитЭко</span></a>
<nav class="desktop-nav" aria-label="Основная навигация">${navLinks}<a class="header-phone" href="${phoneHref}">${escape(data.phone)}</a></nav>
<details class="mobile-menu"><summary>Меню <span class="menu-icon" aria-hidden="true">☰</span></summary><nav aria-label="Мобильная навигация">${navLinks}<a href="#faq">Вопросы об уборке</a><a href="${phoneHref}">${escape(data.phone)}</a></nav></details>
</header></div>
<main id="main">
<section class="hero container" aria-labelledby="hero-title"><div>
<p class="eyebrow">Екатеринбург</p><h1 id="hero-title">Уборка квартир<br>и <em>химчистка<br>мебели</em></h1>
<p class="hero-lead">Поддерживающая и генеральная уборка, уборка после ремонта и помощь по дому. Ежедневно с 8:00 до 20:00.</p>
<div class="hero-actions"><a class="button" href="#services" data-category-link="all">Услуги и цены ${arrow}</a><a class="text-link" href="${phoneHref}">Позвонить ${arrow}</a></div>
</div><aside class="hero-directory" aria-label="Быстрый выбор услуги">
<div class="directory-top"><span>НавитЭко / услуги для дома</span><img src="./assets/brand-mark.svg" width="30" height="30" alt=""></div>
<h2>Что нужно<br>сделать?</h2>
<a class="directory-link" href="#services" data-category-link="home"><span><strong>Убрать квартиру</strong><small>Уборка, окна, пар</small></span>${arrow}</a>
<a class="directory-link" href="#services" data-category-link="furniture"><span><strong>Почистить мебель</strong><small>Диваны, кресла, ковры</small></span>${arrow}</a>
<a class="directory-link" href="#services" data-category-link="other"><span><strong>Помочь по дому</strong><small>Глажка, мастер на час</small></span>${arrow}</a>
</aside></section>
<div class="facts container"><div><span class="fact-icon" aria-hidden="true">⌖</span><div><small>Город</small><strong>Екатеринбург</strong></div></div><div><span class="fact-icon" aria-hidden="true">◷</span><div><small>Ежедневно</small><strong>8:00–20:00</strong></div></div><div><span class="fact-icon" aria-hidden="true">✓</span><div><small>До начала работы</small><strong>Согласование стоимости</strong></div></div></div>
<section class="section container" id="services" aria-labelledby="services-title">
<div class="section-heading"><div><p class="eyebrow">01 / Услуги и цены</p><h2 id="services-title">Чем могу помочь</h2></div><p>Выберите услугу, чтобы узнать подробности. Цены с «от» — стартовые: итоговая стоимость зависит от объёма и состояния помещения или вещи.</p></div>
<div class="service-toolbar" hidden><div class="filters" role="group" aria-label="Категории услуг"><button type="button" class="active" data-filter="all" aria-pressed="true" aria-controls="service-list">Все услуги</button><button type="button" data-filter="home" aria-pressed="false" aria-controls="service-list">Уборка и дом</button><button type="button" data-filter="furniture" aria-pressed="false" aria-controls="service-list">Химчистка</button><button type="button" data-filter="other" aria-pressed="false" aria-controls="service-list">Другие услуги</button></div><p class="service-count" id="service-count" role="status" aria-live="polite">Показано: ${data.services.length} из ${data.services.length}</p></div>
<div class="service-grid" id="service-list">${cards}</div><p class="note">Точный перечень работ и стоимость согласую перед заказом. Дополнительные задачи обсудим отдельно.</p>
</section>
<section class="section container work-section" id="work" aria-labelledby="work-title"><div class="section-heading"><div><p class="eyebrow">02 / Фото работ</p><h2 id="work-title">До и после</h2></div><p>Примеры уборки и химчистки. На фото — результат конкретной работы; он зависит от материала и состояния вещи.</p></div><div class="work-grid">${workCards}</div></section>
<section class="section process-section" id="how" aria-labelledby="how-title"><div class="container"><p class="eyebrow">03 / Как записаться</p><h2 id="how-title">Позвоните или напишите</h2><div class="steps"><div><span class="step-number">01</span><h3>Расскажите о задаче</h3><p>Какая услуга нужна, в каком районе и на какую дату. Для поддерживающей уборки приложите фото.</p></div><div><span class="step-number">02</span><h3>Обсудим объём работы</h3><p>Поддерживающую уборку оценю по фото. Перед генеральной и послестроительной приеду на осмотр.</p></div><div><span class="step-number">03</span><h3>Подтвержу дату и цену</h3><p>Согласую стоимость и время. Желаемая дата не считается забронированной до подтверждения.</p></div></div><div class="contact-actions"><a class="button" href="${phoneHref}">Позвонить ${escape(data.phone)}</a><a class="button button-outline" href="${telegramHref}" target="_blank" rel="noopener noreferrer">Написать в Telegram ${arrow}</a></div><div class="future-channels" aria-label="Будущие способы записи"><button type="button" disabled aria-disabled="true">Запись через Telegram-бота · скоро</button><button type="button" disabled aria-disabled="true">Запись через MAX-бота · скоро</button></div></div></section>
<section class="section container faq-layout" id="faq" aria-labelledby="faq-title"><div><p class="eyebrow">04 / Перед заказом</p><h2 id="faq-title">Вопросы<br>об уборке</h2></div><div>${faq}</div></section>
<section class="section container contact-section" id="contacts" aria-labelledby="contacts-title"><div class="contact-panel"><div><p class="eyebrow">Контакты</p><h2 id="contacts-title">Обсудим<br>вашу задачу</h2><p>Все районы Екатеринбурга. Ежедневно, 8:00–20:00.</p></div><div><a class="contact-phone" href="${phoneHref}">${escape(data.phone)}</a><div><a class="button" href="${telegramHref}" target="_blank" rel="noopener noreferrer">Написать мне в Telegram ${arrow}</a></div><p class="contact-caption">Личный Telegram по номеру телефона. Если ссылка не открывается, позвоните.</p></div></div></section>
</main>
<footer class="container footer-inner"><span>НавитЭко · Екатеринбург</span><div class="footer-links"><button type="button" data-info hidden>О сайте и обращениях</button><a href="#main">Наверх ↑</a></div></footer>
<div class="mobile-cta" aria-label="Связаться"><a href="${phoneHref}">Позвонить</a><a href="${telegramHref}" target="_blank" rel="noopener noreferrer">Личный Telegram</a></div>
<dialog class="photo-dialog" id="photo-dialog" aria-labelledby="photo-title"><div class="dialog-head"><h2 id="photo-title">Фото работы</h2><button class="dialog-close" type="button" data-close aria-label="Закрыть фото" autofocus>×</button></div><img alt=""><p>Исходное фото из материалов исполнителя, без изменения результата уборки.</p></dialog>
<dialog id="info-dialog" aria-labelledby="info-title"><div class="dialog-head"><h2 id="info-title">О сайте и обращениях</h2><button class="dialog-close" type="button" data-close aria-label="Закрыть информацию" autofocus>×</button></div><div class="dialog-copy"><h3>Условия заказа</h3><p>На сайте представлены услуги и стартовые цены. Объём работ, итоговая стоимость, дата и способ оплаты согласовываются лично до заказа. Отправка сообщения сама по себе не подтверждает запись.</p><h3>Связь и данные</h3><p>На странице нет формы заявки, оплаты, аналитических счётчиков и рекламных трекеров. Код сайта не устанавливает cookies и не сохраняет введённые данные. При загрузке страницы хостинг получает технические сведения о запросе.</p><p>При переходе в Telegram действует порядок обработки данных этого сервиса. Для обсуждения заказа достаточно описать задачу и желаемую дату; не отправляйте реквизиты карты, документы или лишние личные данные. На фотографиях лучше скрыть лица, документы и другие личные сведения.</p><p>По вопросам услуг и обращениям: <a class="inline-link" href="${phoneHref}">${escape(data.phone)}</a>.</p></div></dialog>
<script src="./assets/site.js" defer></script>
</body></html>`;

await mkdir(new URL('assets/', out), { recursive:true });
await mkdir(new URL('review/', root), { recursive:true });
const css = await readFile(new URL('assets/site.css', root), 'utf8');
const js = await readFile(new URL('assets/site.js', root), 'utf8');
const logo = await readFile(new URL('assets/brand-mark.svg', root));
let portable = html.replace('<link rel="stylesheet" href="./assets/site.css">', `<style>${css}</style>`).replace('<script src="./assets/site.js" defer></script>', `<script>${js}</script>`).replaceAll('./assets/brand-mark.svg', `data:image/svg+xml;base64,${logo.toString('base64')}`);
for (const photo of workPhotos) {
  const image = await readFile(new URL(`assets/${photo.file}`, root));
  portable = portable.replaceAll(`./assets/${photo.file}`, `data:image/jpeg;base64,${image.toString('base64')}`);
  await writeFile(new URL(`assets/${photo.file}`, out), image);
}
await Promise.all([
  writeFile(new URL('index.html', out), html),
  writeFile(new URL('assets/site.css', out), css),
  writeFile(new URL('assets/site.js', out), js),
  writeFile(new URL('assets/brand-mark.svg', out), logo),
  writeFile(new URL('preview.html', out), portable),
  writeFile(new URL('review/preview.html', root), portable),
  writeFile(new URL('review/README.txt', root), 'НавитЭко · версия для согласования\nОткройте preview.html в браузере. Страница автономна: услуги, цены, фотографии, телефон и личный Telegram.\n'),
  writeFile(new URL('robots.txt', out), 'User-agent: *\nDisallow: /\n')
]);
console.log(`Built ${data.services.length} services; portable preview: ${Buffer.byteLength(portable)} bytes.`);
