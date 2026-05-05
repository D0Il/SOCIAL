import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function walk(dir, predicate, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

for (const file of walk(root, (file) => file.endsWith('.js'))) {
  const rel = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  try {
    new Function(source);
  } catch (error) {
    failures.push(`Syntax failed: ${rel}\n${error.message}`);
  }
}

for (const file of walk(path.join(root, 'pages'), (file) => file.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  if (rel !== path.join('pages', 'community.html') && /<script\b/i.test(html)) {
    failures.push(`Inline <script> found in ${rel}; move page behavior into js/<page>.js.`);
  }
}

const scrollables = fs.readFileSync(path.join(root, 'pages', 'scrollables.html'), 'utf8');
if (/tiktok\.com\/embed\.js/i.test(scrollables)) {
  failures.push('Scrollables page should not inline TikTok embed.js; js/pages.js owns that load.');
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('js/state.js')) failures.push('index.html must load js/state.js before config/app scripts.');

const core = fs.readFileSync(path.join(root, 'js', 'core.js'), 'utf8');
if (!core.includes('_setPageLoading')) failures.push('core.js should expose the shared page loading state.');

if (failures.length) {
  console.error(failures.join('\n\n'));
  process.exit(1);
}

console.log('Lint clean.');

