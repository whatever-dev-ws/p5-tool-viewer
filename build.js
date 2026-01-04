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

const styleMatch = minified.match(/<style>(.*?)<\/style>/);
const scriptMatch = minified.match(/<script>(.*?)<\/script>/g);

const styleContent = styleMatch ? styleMatch[1] : '';
const scriptContent = scriptMatch ? scriptMatch[scriptMatch.length - 1].replace(/<\/?script>/g, '') : '';

const styleHash = crypto.createHash('sha256').update(styleContent).digest('base64');
const scriptHash = crypto.createHash('sha256').update(scriptContent).digest('base64');

const headers = `/*
  Content-Security-Policy: default-src 'none'; script-src https://cdn.jsdelivr.net 'sha256-${scriptHash}' https://whatever-dev-ws.github.io; style-src 'sha256-${styleHash}'; base-uri 'none'; form-action 'none'; frame-ancestors https://whatever-dev-ws.github.io
  X-Content-Type-Options: nosniff`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', minified);
fs.writeFileSync('dist/_headers', headers);

console.log('Build complete');
console.log('Style hash:', styleHash);
console.log('Script hash:', scriptHash);
