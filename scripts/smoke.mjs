import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const index = read('index.html');
for (const page of ['profile', 'scrollables', 'talk', 'community', 'shop', 'music']) {
  assert(index.includes(`id=page-${page}`), `Missing #page-${page} placeholder.`);
  assert(index.includes(`data-page-src="pages/${page}.html"`), `Missing lazy source for ${page}.`);
}
assert(index.indexOf('js/state.js') > index.indexOf('js/core.js'), 'state.js should load after core.js.');
assert(index.indexOf('js/state.js') < index.indexOf('js/config.js'), 'state.js should load before config.js.');

const profile = read('pages/profile.html');
assert(profile.includes('id=latest-post-widget'), 'Profile latest blog widget missing.');
assert(profile.includes('id=feat-desc-text'), 'Profile featured description target missing.');
assert(!profile.includes('<script>'), 'Profile page should not contain inline scripts.');

const scrollables = read('pages/scrollables.html');
assert((scrollables.match(/class=tiktok-embed/g) || []).length >= 10, 'Scrollables should include TikTok embeds.');
assert(scrollables.includes('id=scroll-thumb-grid'), 'Scrollables desktop thumbnail grid missing.');
assert(scrollables.includes('id=scroll-grid-popup-content'), 'Scrollables popup thumbnail grid missing.');
assert(!/<script\b/i.test(scrollables), 'Scrollables page should not contain inline scripts.');

const core = read('js/core.js');
assert(core.includes('_setPageLoading'), 'Page loading helper missing.');
const state = read('js/state.js');
assert(state.includes('window.FD_STATE'), 'Shared state helper missing.');
const app = read('js/app.js');
assert(app.includes('showPage(initialPage)'), 'Startup navigation smoke check failed.');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Smoke checks passed.');

