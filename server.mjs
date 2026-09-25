import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const ROOT = normalize(dirname(fileURLToPath(import.meta.url)));
const ROOT_LC = ROOT.toLowerCase();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function isInside(target) {
  const lower = target.toLowerCase();
  return lower === ROOT_LC || lower.startsWith(ROOT_LC + sep);
}

async function resolveFile(pathname) {
  let clean;
  try {
    clean = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  clean = clean.replace(/\\/g, '/');
  if (clean.split('/').some((seg) => seg.startsWith('.'))) return null;

  const target = normalize(join(ROOT, clean));
  if (!isInside(target)) return null;

  const candidates = [];
  if (!extname(target)) {
    candidates.push(target + '.html', join(target, 'index.html'));
  } else {
    candidates.push(target);
  }

  for (const candidate of candidates) {
    if (!isInside(candidate)) continue;
    try {
      const s = await stat(candidate);
      if (s.isFile()) return candidate;
    } catch {
      /* segue para o próximo candidato */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = await resolveFile(pathname === '/' ? '/index.html' : pathname);

  if (file) {
    try {
      const data = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
      return;
    } catch {
      /* cai no 404 abaixo */
    }
  }

  try {
    const notFound = await readFile(join(ROOT, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(notFound);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - not found');
  }
});

const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
const startPort = Number(
  process.env.PORT || (portArgIndex >= 0 ? args[portArgIndex + 1] : 0) || 5500
);
const shouldOpen = args.includes('--open');

function listen(port, attempt = 0) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT && attempt < 10) {
      console.log(`  porta ${port} ocupada, tentando ${port + 1}...`);
      listen(port + 1, attempt + 1);
    } else {
      console.error(`  erro ao iniciar: ${err.message}`);
      process.exit(1);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    const url = `http://localhost:${port}`;
    console.log('');
    console.log('  YES — Your Easy Site · servidor local');
    console.log('  ────────────────────────────────────');
    console.log(`  ${url}`);
    console.log('  Ctrl+C para parar');
    console.log('');
    if (shouldOpen) {
      exec(`start "" "${url}"`, { shell: 'cmd.exe' });
    }
  });
}

listen(startPort);
