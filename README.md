# p5-tool-viewer

A secure viewer for p5.js sketches. This HTML viewer is served via Cloudflare Workers and embedded as a cross-origin iframe in the workshop gallery.

## Overview

The viewer loads p5.js sketches from trusted origins and displays them in an isolated, secure-ish environment. By serving the viewer from a different origin (Cloudflare Workers) than the workshop website (GitHub Pages), it creates a security boundary that isolates tool execution from the main workshop site. This cross-origin iframe approach prevents potentially malicious or buggy p5.js sketches from accessing the parent page's DOM, cookies, or storage.

## Features

- **Cross-Origin Iframe Isolation**: Served from Cloudflare Workers (separate origin from the GitHub Pages workshop site) to create a security boundary
- **Strict Content Security Policy**: Comprehensive CSP headers to prevent XSS and other attacks (at least we are trying)
- **Origin Validation**: Only loads tools from whitelisted origins (`https://whatever-dev-ws.github.io`)
- **Minified Output**: HTML, CSS, and JavaScript are minified for optimal performance
- **Storage Isolation**: Clears localStorage and sessionStorage on load for clean execution

## Build Process

The build process is handled by `build.js` and includes:

### 1. HTML Minification

The build script minifies `src/index.html` using `html-minifier-terser` with the following optimizations:
- Collapses whitespace
- Removes comments
- Minifies inline JavaScript
- Minifies inline CSS

### 2. CSP Hash Generation

The build process calculates a SHA-256 hash of the inline script content to enable strict CSP. This hash is embedded in the Content Security Policy headers, allowing the inline script to execute while blocking all other inline scripts.

### 3. Security Headers

The build generates a `_headers` file for Cloudflare Pages with:

#### Content-Security-Policy Directives

- **`default-src 'none'`**: Blocks all resources by default (deny-all baseline)
- **`script-src`**: 
  - `https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/` - Allows p5.js and p5.sound libraries
  - `'sha256-[hash]'` - Allows the specific inline script (calculated during build)
  - `https://whatever-dev-ws.github.io` - Allows loading tool scripts from the workshop
  - `blob:` - Allows Web Workers created from blob URLs
- **`connect-src`**:
  - `https://cdnjs.cloudflare.com/ajax/libs/topcoat/` - Allows fetching Topcoat resources (mainly for SourceSans font)
  - `https://fonts.googleapis.com` - Allows fetching Google Fonts CSS
  - `data:` - Allows data URIs for fetch/XHR (mainly for base64 images)
- **`img-src data:`**: Allows images from data URIs only
- **`font-src`**:
  - `https://cdnjs.cloudflare.com/ajax/libs/topcoat/` - Allows Topcoat fonts (i.e. SourceSans)
  - `https://fonts.gstatic.com` - Allows Google Fonts files
- **`style-src 'unsafe-inline'`**: Allows inline styles (required for p5.js dynamic styling)
- **`worker-src blob:`**: Allows Web Workers from blob URLs
- **`base-uri 'none'`**: Prevents `<base>` tag injection
- **`form-action 'none'`**: Prevents form submissions
- **`frame-ancestors https://whatever-dev-ws.github.io`**: Only allows embedding in the workshop gallery

#### Additional Headers

- **`X-Content-Type-Options: nosniff`**: Prevents MIME type sniffing

### 4. Output

The build creates a `dist/` directory containing:
- `index.html` - Minified HTML page
- `_headers` - Cloudflare-specific headers file

## Development

### Prerequisites

- Node.js
- pnpm (or npm/yarn)
- Cloudflare account (for deployment)

### Install Dependencies

```bash
pnpm install
```

### Local Development

```bash
pnpm run dev
```

This will:
1. Run the build process
2. Start Wrangler dev server for local testing

### Build Only

```bash
pnpm run build
```

## Deployment to Cloudflare

### Setup

1. Ensure you have a Cloudflare account and are logged in via Wrangler:

```bash
npx wrangler login
```

2. The project is configured via `wrangler.json`:
   - **name**: `p5-tool-viewer`
   - **compatibility_date**: `2026-01-03`
   - **assets**: Serves static files from `./dist`

### Deploy

Deploy to Cloudflare Pages/Workers with:

```bash
pnpm run deploy
```

This command:
1. Runs the build process (minifies HTML, generates CSP headers)
2. Deploys the `dist/` directory to Cloudflare using Wrangler

### Post-Deployment

After deployment, your viewer will be available at:
```
https://p5-tool-viewer.pages.dev
```

Or your custom domain if configured in Cloudflare.

## Usage

Load a tool by passing the `tool` URL parameter:

```
https://p5-tool-viewer.pages.dev/?tool=https://whatever-dev-ws.github.io/path/to/sketch.js
```

The viewer will:
1. Validate the origin is in the allowlist
2. Load p5.js libraries
3. Load and execute the tool script
4. Display any errors if the origin is not allowed

## Security Considerations

- Tools must be hosted on `https://whatever-dev-ws.github.io`
- Storage APIs are cleared on each load to prevent data leakage
- Strict CSP prevents unauthorized script execution
- Only specific CDN resources are whitelisted
- Frame embedding is restricted to the workshop gallery origin

## License

Private project for the whatever-dev workshop.
