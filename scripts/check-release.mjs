import { readFile } from 'node:fs/promises';

// This guard concerns production, not publication of the review HTML.
// No automated check can certify legal compliance or business facts.
const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/services.json', root), 'utf8'));
const html = await readFile(new URL('dist/index.html', root), 'utf8');
const blockers = [];
if (data.preview || !data.siteUrl) blockers.push('Review version: production domain and release approval are not set.');
if (!data.legalReviewApproved) blockers.push('Resolve owner identity, personal-data handling and ozone-service scope; see docs/legal-review.md.');
if (/example\.(ru|invalid)|USERNAME|\[ФИО\]|\[ИНН\]/i.test(html)) blockers.push('Placeholder content found.');
if (blockers.length) {
  console.error(`Production release blocked (review link is separate):\n${blockers.join('\n')}`);
  process.exitCode = 1;
} else console.log('Automated production guard passed. Manual functional and legal approval still required.');
