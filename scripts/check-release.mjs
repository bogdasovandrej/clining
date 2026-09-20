import { readFile, readdir } from "node:fs/promises";

// Fail before uploading a prototype with known placeholder content.
// This is a release guard, not proof that the backend or legal text is ready.
const dist = new URL("../dist/", import.meta.url);
const files = (await readdir(dist)).filter((name) => name.endsWith(".html") || name.endsWith(".xml") || name === "robots.txt");
files.push("assets/config.js");
const placeholders = /example\.ru|USERNAME|\+7\s*\(000\)|\+70000000000|\[ФИО\]|\[ИНН\]|\[email\]|\[адрес\s*\/\s*email\]/i;
const blocked = [];
for (const file of files) {
  if (placeholders.test(await readFile(new URL(file, dist), "utf8"))) blocked.push(file);
}
const config = await readFile(new URL("assets/config.js", dist), "utf8");
if (/bookingEnabled\s*:\s*false/.test(config) || /apiBase\s*:\s*["']\s*["']/.test(config)) {
  blocked.push("online booking is not configured");
}
if (blocked.length) {
  console.error(`Release blocked: replace placeholder content and configure booking.\n${blocked.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Known release placeholders were not found; complete live acceptance checks before publishing.");
}
