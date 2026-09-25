import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const data = JSON.parse(await readFile(new URL("data/services.json", root), "utf8"));
const html = await readFile(new URL("dist/index.html", root), "utf8");
const portable = await readFile(new URL("review/preview.html", root), "utf8");
const prices = Object.fromEntries(data.services.map(({ slug, price }) => [slug, price]));
assert.deepEqual(prices, {
  "podderzhivayushchaya-uborka": 2500,
  "generalnaya-uborka": 5000,
  "posle-remonta": 10000,
  "moyka-okon": 800,
  "himchistka-divanov": 3500,
  "himchistka-kresel": 800,
  "himchistka-kovrov": 2000,
  "himchistka-matrasov": 2000,
  "ozonirovanie": 1500,
  "eco-uborka": 2500,
  "master-na-chas": null,
  "glazhka": 500
});
assert.equal(data.services.find(service => service.slug === "glazhka").unit, "₽/час");
assert.equal(data.hours, "Ежедневно, 8:00–20:00");
assert.equal(data.phone, "+7 992 007-01-81");
assert.equal(data.reviewsAvailable, true);
for (const service of data.services) {
  assert.ok(html.includes(service.name), `${service.name} missing from site`);
}
for (const page of [html, portable]) {
  assert.ok(page.includes("500 ₽ за час"));
  assert.ok(page.includes("Стоимость услуги «Мастер на час» уточняйте по телефону."));
  assert.match(page, /<h3>Мастер на час<\/h3>\s*<p class="service-note">/, "Master hourly service must not display an invented price");
  assert.ok(page.includes('href="tel:+79920070181"'));
  assert.ok(page.includes('href="https://t.me/+79920070181"'));
  assert.ok(!page.includes("Самозанятая специалистка"));
  assert.ok(page.includes("послестроительной приеду на осмотр"));
  assert.ok(page.includes("Позвоните или напишите"));
  assert.ok(page.includes('<p class="eyebrow">Екатеринбург</p>'));
  assert.ok(page.includes("Ежедневно с 8:00 до 20:00."));
  assert.ok(page.includes("Все районы Екатеринбурга. Ежедневно, 8:00–20:00."));
  assert.ok(!page.includes("Выезжаю во все районы Екатеринбурга"));
  assert.ok(!page.includes("После подтверждения внесу запись в календарь"));
  assert.ok(!page.includes("Работаю ежедневно"));
  assert.ok(page.includes('aria-disabled="true">Запись через Telegram-бота · скоро'));
  assert.ok(page.includes('aria-disabled="true">Запись через MAX-бота · скоро'));
  assert.ok(page.includes('id="work"'));
  assert.equal((page.match(/<figure class="work-card">/g) || []).length, 2);
  assert.ok(!/USERNAME|example\.(ru|invalid)|Демонстрационный режим|Концепция 01|Иллюстрация интерьера|· ИИ|Telegram \+ MAX · скоро|Отзывы клиентов|name="name"|name="phone"/i.test(page));
}
assert.ok(!/src="\.\/|rel="stylesheet"/.test(portable), "Public preview must be self-contained");
assert.ok(portable.includes("data:image/svg+xml;base64,"));
assert.equal((portable.match(/src="data:image\/jpeg;base64,/g) || []).length, 2);
console.log("PASS: 12 services, confirmed prices, real phone and self-contained preview.");
