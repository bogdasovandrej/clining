import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/services.json', root), 'utf8'));
const html = await readFile(new URL('dist/index.html', root), 'utf8');
const portable = await readFile(new URL('review/preview.html', root), 'utf8');
const productionHtml = await readFile(new URL('dist/standalone/index.html', root), 'utf8');
const publicSite = !data.preview && Boolean(data.siteUrl) && data.legalReviewApproved === true;
const expectedRobots = publicSite ? 'index,follow' : 'noindex,nofollow,noarchive';
assert.deepEqual(Object.fromEntries(data.services.map(({slug, price}) => [slug, price])), {
  'podderzhivayushchaya-uborka':2500, 'generalnaya-uborka':5000, 'posle-remonta':10000,
  'moyka-okon':800, 'himchistka-divanov':3500, 'himchistka-kresel':800,
  'himchistka-kovrov':2000, 'himchistka-matrasov':2000, 'ozonirovanie':1500,
  'eco-uborka':2500, 'master-na-chas':null, 'glazhka':500
}, 'Confirmed service prices must not change inadvertently');
assert.equal(data.services.find(service => service.slug === 'glazhka').unit, '₽/час');
assert.equal(data.phone, '+7 992 007-01-81');
assert.equal(data.hours, 'Ежедневно, 8:00–20:00');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
for (const [,href] of html.matchAll(/href="#([^"]*)"/g)) assert.ok(ids.includes(href), `Broken anchor: ${href}`);
for (const [,id] of html.matchAll(/aria-(?:labelledby|controls)="([^"]+)"/g)) assert.ok(ids.includes(id), `Broken ARIA reference: ${id}`);
for (const [,src] of html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) await readFile(new URL(src, new URL('dist/', root)));
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((html.match(/class="service-card"/g) || []).length, 12);
assert.equal((html.match(/<a class="service-card" href="#contacts"/g) || []).length, 12, 'Every service card must lead to direct contacts');
assert.equal((html.match(/class="service-card-action"/g) || []).length, 12, 'Clickable cards need a visible action');
assert.equal((html.match(/<figure class="review-card">/g) || []).length, 3);
assert.ok(!/<details class="service-card"|id="work"|class="photo-dialog"/.test(html), 'Rejected accordion and photo gallery must stay removed');
assert.ok(!/\b0[1-4] \/ (?:Услуги|Фото|Как|Перед)/.test(html), 'Section numbering must stay removed');
for (const service of data.services) {
  assert.ok(html.includes(`id="${service.slug}"`));
  assert.ok(html.includes(service.name));
  assert.ok(service.description?.length > 10);
  assert.ok(!service.duration && !service.includes, 'Do not publish unconfirmed timing or inclusions');
}
const master = html.match(/<a class="service-card"[^>]*id="master-na-chas"[\s\S]*?<\/a>/)?.[0];
assert.ok(master && !master.includes('₽'), 'Do not invent a handyman price');
assert.ok(master && !master.includes('Стоимость по телефону'), 'Do not duplicate the handyman contact note');
for (const page of [html, portable, productionHtml]) {
  assert.equal((page.match(/Стоимость услуги «Мастер на час» уточняйте по телефону\./g) || []).length, 1, 'Handyman price note must occur exactly once');
  assert.ok(!page.includes('Для услуги «Мастер на час» цену уточняйте по телефону.'), 'Do not repeat the handyman price note below the cards');
  assert.ok(page.includes('href="tel:+79920070181"'));
  assert.ok(page.includes('href="https://t.me/+79920070181"'));
  assert.ok(page.includes('500 ₽ за час'));
  assert.ok(page.includes('Соколова Елена Викторовна'));
  assert.ok(page.includes('Стоимость рассчитаю по фото или после предварительного осмотра объекта.'));
  assert.ok(page.includes(`name="robots" content="${expectedRobots}"`));
  assert.ok(!/<form\b|<iframe\b|<input\b/.test(page), 'No unconfigured data collection');
  assert.ok(!/Telegram-бота|MAX-бота|свободного времени в календаре на сайте нет|Отзывы с присланных скриншотов Авито/.test(page), 'Rejected text and bot placeholders must stay removed');
  assert.ok(!/USERNAME|example\.(ru|invalid)|Самозанятая специалистка|После подтверждения внесу запись в календарь|Работаю ежедневно|Выезжаю во все районы/.test(page));
  for (const [,href] of page.matchAll(/href="([^"]+)"/g)) {
    assert.ok(href.startsWith('#') || href.startsWith('./assets/') || href.startsWith('data:image/png;') || href === '/favicon.png?v=20260928-png' || (publicSite && href === new URL('/', data.siteUrl).href) || href === 'tel:+79920070181' || href === 'https://t.me/+79920070181', `Unexpected link: ${href.slice(0, 100)}`);
  }
}
assert.ok(!/src="\.\/|rel="stylesheet"|<script[^>]*src=|url\(https?:/.test(portable), 'Preview must not depend on remote assets');
assert.equal((portable.match(/data:image\/webp;base64,/g) || []).length, 1, 'Client logo must appear once');
assert.ok(/<img class="hero-logo"[^>]+>[\s\S]*?<h1 id="hero-title">/.test(html), 'Client logo must precede the main headline');
assert.ok(!html.match(/<a class="brand"[^>]*>[\s\S]*?<\/a>/)?.[0].includes('<img'), 'Do not duplicate the logo in the header');
assert.equal((portable.match(/data:image\/png;base64,/g) || []).length, 1, 'Portable favicon must be embedded once');
assert.ok(portable.includes('--blue:#347847'), 'Green palette must remain in the client preview');
assert.ok(Buffer.byteLength(portable) < 250_000, 'Portable preview exceeded size budget');
assert.equal(portable, await readFile(new URL('dist/preview.html', root), 'utf8'));
assert.ok(productionHtml.includes('href="/favicon.png?v=20260928-png"'), 'Production favicon must be crawlable and cache-busted');
assert.ok(!productionHtml.includes('href="data:image/png;base64,'), 'Production favicon must not be embedded');
assert.ok(Buffer.byteLength(productionHtml) < 250_000, 'Production HTML exceeded size budget');
for (const format of ['png', 'ico', 'svg']) {
  assert.deepEqual(await readFile(new URL(`dist/favicon.${format}`, root)), await readFile(new URL(`assets/favicon.${format}`, root)));
}
const robots = await readFile(new URL('dist/robots.txt', root), 'utf8');
const sitemap = await readFile(new URL('dist/sitemap.xml', root), 'utf8');
if (publicSite) {
  assert.ok(robots.includes(`Sitemap: ${new URL('/', data.siteUrl).href}sitemap.xml`));
  assert.ok(sitemap.includes(`<loc>${new URL('/', data.siteUrl).href}</loc>`));
} else {
  assert.equal(robots, 'User-agent: *\nDisallow: /\n');
  assert.equal(sitemap, '');
}
const js = await readFile(new URL('assets/site.js', root), 'utf8');
assert.ok(!/fetch\(|XMLHttpRequest|localStorage|document\.cookie|innerHTML\s*=|eval\(/.test(js), 'Unexpected network, persistence or unsafe HTML');
console.log('PASS: confirmed prices, service content, unique IDs, all anchors, ARIA references, assets, direct contacts, no bots, no data collection and portable size.');
