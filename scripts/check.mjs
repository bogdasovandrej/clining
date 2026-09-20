import { access, readFile, readdir } from "node:fs/promises";
const required = ["index.html", "privacy.html", "robots.txt", "sitemap.xml", "assets/site.css", "assets/site.js", "assets/hero-interior.webp"];
for (const file of required) await access(new URL(`../dist/${file}`, import.meta.url));
const services = JSON.parse(await readFile(new URL("../data/services.json", import.meta.url), "utf8")).services;
for (const service of services) {
  const html = await readFile(new URL(`../dist/${service.slug}.html`, import.meta.url), "utf8");
  if (!html.includes(service.name) || !html.includes('application/ld+json')) throw new Error(`Broken landing page: ${service.slug}`);
}
const root = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
for (const token of ["FAQPage", "HouseCleaningService", "booking-form", "hero-interior.webp"]) if (!root.includes(token)) throw new Error(`Missing ${token}`);
if ((await readdir(new URL("../dist/", import.meta.url))).length < 12) throw new Error("Expected landing pages were not built");
console.log(`Checks passed: ${services.length} services, schema, booking UI, optimized hero asset.`);
