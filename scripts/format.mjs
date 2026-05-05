import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exts = new Set(['.html', '.css', '.js', '.mjs', '.json', '.md']);
const skipDirs = new Set(['node_modules', '.git']);
const checkOnly = process.argv.includes('--check');
let changed = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name).toLowerCase())) formatFile(full);
  }
}

function formatFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  let text = original.replace(/\r\n/g, '\n');
  text = text
    .split('\n')
    .map((line) => line.replace(/[\t ]+$/g, ''))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\s*$/g, '\n');

  if (text !== original) {
    changed.push(path.relative(root, file));
    if (!checkOnly) fs.writeFileSync(file, text, 'utf8');
  }
}

walk(root);

if (changed.length) {
  console.log(`${checkOnly ? 'Would format' : 'Formatted'} ${changed.length} file(s):`);
  changed.forEach((file) => console.log(`  ${file}`));
  if (checkOnly) process.exitCode = 1;
} else {
  console.log('Formatting clean.');
}

