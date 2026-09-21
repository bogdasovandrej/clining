import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const data = JSON.parse(await readFile(new URL("data/services.json", root), "utf8"));
const required = ["index.html","concept.html","privacy.html","robots.txt","sitemap.xml","assets/site.css","assets/site.js","assets/config.js","assets/hero-interior.webp","assets/logo.svg"];
for (const file of required) await access(new URL(file, dist));
assert.equal(data.services.length, 10, "All ten requested services must be included");
assert.equal(new Set(data.services.map(s=>s.slug)).size, data.services.length, "Service slugs must be unique");
const format = n => new Intl.NumberFormat("ru-RU").format(n);
for (const s of data.services) {
  const html = await readFile(new URL(s.slug+".html",dist),"utf8");
  assert.ok(html.includes(s.name) && html.includes(format(s.price)), "Service and price must match catalog: "+s.slug);
}
for (const name of (await readdir(dist)).filter(n=>n.endsWith(".html"))) {
  const html = await readFile(new URL(name,dist),"utf8");
  for (const match of html.matchAll(/(?:href|src)="\.\/([^"#]+)(?:#[^"]*)?"/g)) await access(new URL(match[1],dist));
  assert.ok(!/t\.me\/USERNAME|max\.ru\/USERNAME|tel:\+70000000000/.test(html), "No fake actionable contacts");
  if (data.preview) assert.ok(html.includes('content="noindex,nofollow,noarchive"'), "No indexing of review pages");
}
const html = await readFile(new URL("index.html",dist),"utf8");
assert.ok(html.includes('id="booking-form"') && html.includes('id="calculator"'));
if (data.preview) {
  const portable = await readFile(new URL("review/preview.html",root),"utf8");
  assert.ok(!/<(?:script|img)[^>]+src="(?!data:)/.test(portable), "Portable scripts/images must not depend on a server");
  assert.ok(!/rel="stylesheet"/.test(portable), "Portable styles must be inline");
  assert.ok(portable.includes('id="page-concept"') && portable.includes('id="page-privacy"'));
  assert.ok(/name="name"[^>]+disabled/.test(portable) && /name="phone"[^>]+disabled/.test(portable), "Preview must not collect contact data");
  assert.equal(await readFile(new URL("robots.txt",dist),"utf8"),"User-agent: *\nDisallow: /\n");
}
console.log("PASS: 10 services, catalog prices, local links, review isolation and portable package.");
