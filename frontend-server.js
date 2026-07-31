const fs = require('fs');
const http = require('http');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const routes = {
  '/': 'index.html',
  '/shop': 'shop.html',
  '/offers': 'offers.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/cart': 'cart.html',
  '/checkout': 'checkout.html',
  '/wishlist': 'wishlist.html',
  '/account': 'account.html'
};
const types = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function headersFor(file) {
  const extension = path.extname(file).toLowerCase();
  const immutable = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(extension);
  return {
    'Cache-Control': immutable
      ? 'public, max-age=2592000'
      : extension === '.html' || extension === '.js' || extension === '.css'
        ? 'no-cache'
        : 'public, max-age=3600, must-revalidate',
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "connect-src 'self' https://nafees-backend-production.up.railway.app",
      "font-src 'self' https://fonts.gstatic.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
    ].join('; '),
    'Content-Type': types[extension] || 'application/octet-stream',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff'
  };
}

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const route = routes[decoded];
  const requested = route || decoded.replace(/^\/+/, '');
  const candidates = [requested];
  if (!path.extname(requested)) candidates.push(`${requested}.html`);
  for (const candidate of candidates) {
    const absolute = path.resolve(root, candidate);
    if (!absolute.startsWith(`${root}${path.sep}`) && absolute !== root) continue;
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return absolute;
  }
  return null;
}

function createServer() {
  return http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }
  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }
  if (pathname === '/admin') {
    res.writeHead(302, {
      Location: '/Admin/login.html',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end();
    return;
  }
  const file = resolveFile(pathname);
  const target = file || path.join(root, '404.html');
  const status = file ? 200 : 404;
  res.writeHead(status, headersFor(target));
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
    fs.createReadStream(target).pipe(res);
  });
}

if (require.main === module) {
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`NAFEES frontend listening on 0.0.0.0:${port}`);
  });
}

module.exports = { createServer };
