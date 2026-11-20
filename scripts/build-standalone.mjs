import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const result = await build({
  root,
  mode: 'standalone',
  base: './',
  build: {
    write: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    modulePreload: false,
    rolldownOptions: {
      output: { codeSplitting: false },
    },
  },
});

const { output } = result;
const page = output?.find((file) => file.type === 'asset' && file.fileName === 'index.html');
const css = output?.find((file) => file.type === 'asset' && file.fileName.endsWith('.css'));
const entry = output?.find((file) => file.type === 'chunk' && file.isEntry);

if (output?.length !== 3 || !page || !css || !entry || entry.imports.length || entry.dynamicImports.length) {
  throw new Error('Expected the standalone build to emit one page, one stylesheet and one self-contained script.');
}

const html = String(page.source);
const scriptTag = html.match(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/i);
const styleTag = html.match(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="(\.\/[^"]+)"[^>]*>/i);

if (scriptTag?.[1] !== './' + entry.fileName || styleTag?.[1] !== './' + css.fileName) {
  throw new Error('Could not find the app script and stylesheet in the generated page.');
}

const icon = await readFile(join(root, 'public', 'icon.svg'));
const favicon = '<link rel="icon" href="data:image/svg+xml;base64,' + icon.toString('base64') + '">';
const standaloneHtml = html
  .replace(/<link\b[^>]*>/gi, (tag) => tag === styleTag[0]
    ? '<style>' + String(css.source).replace(/<\/style/gi, '\\3C /style') + '</style>'
    : '')
  .replace(scriptTag[0], () => '<script type="module">' + entry.code.replace(/<\/script/gi, '<\\/script') + '</script>')
  .replace('</head>', favicon + '\n</head>');

const outputDir = join(root, 'dist-standalone');
const appFile = join(outputDir, 'EuroStruct-1090.html');
await mkdir(outputDir, { recursive: true });
await writeFile(appFile, standaloneHtml, 'utf8');
console.log('Standalone app written to ' + appFile);
