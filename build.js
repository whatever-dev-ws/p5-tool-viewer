import fs from 'fs';
import crypto from 'crypto';
import { minify } from 'html-minifier-terser';

const html = fs.readFileSync('src/index.html', 'utf8');

const minified = await minify(html, {
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
});

const scriptMatch = minified.match(/<script>(.*?)<\/script>/g);

const scriptContent = scriptMatch ? scriptMatch[scriptMatch.length - 1].replace(/<\/?script>/g, '') : '';

const scriptHash = crypto.createHash('sha256').update(scriptContent).digest('base64');

const headers = `/*
  Content-Security-Policy: default-src 'none'; script-src https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com 'sha256-${scriptHash}' https://whatever-dev-ws.github.io 'unsafe-eval' blob:; connect-src https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com data:; img-src data:; font-src https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://fonts.gstatic.com; style-src 'unsafe-inline'; worker-src blob:; base-uri 'none'; form-action 'none'; frame-ancestors https://whatever-dev-ws.github.io
  X-Content-Type-Options: nosniff`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', minified);
fs.writeFileSync('dist/_headers', headers);

console.log('Build complete');
console.log('Script hash:', scriptHash);
