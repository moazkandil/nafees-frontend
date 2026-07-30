const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../frontend-server');

let server;
let base;

test.before(async () => {
  server = createServer().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('serves home, clean routes and admin login', async () => {
  for (const route of ['/', '/shop', '/contact', '/account', '/admin']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type'), /text\/html/);
  }
});

test('returns the custom page with a real 404 status', async () => {
  const response = await fetch(`${base}/not-a-real-page`);
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Page not found/i);
});

test('sets production security and cache headers', async () => {
  const page = await fetch(`${base}/`);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(page.headers.get('strict-transport-security'), /max-age=31536000/);
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');

  const image = await fetch(`${base}/Images/logo.jpg`, { method: 'HEAD' });
  assert.match(image.headers.get('cache-control'), /max-age=2592000/);
});

test('rejects unsupported methods without processing form data', async () => {
  const response = await fetch(`${base}/contact.html`, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});

test('loads the API client before storefront application code', async () => {
  for (const route of ['/', '/shop', '/contact', '/checkout', '/account']) {
    const html = await (await fetch(`${base}${route}`)).text();
    const apiClient = html.indexOf('JS/api-client.js');
    const application = html.indexOf('JS/app.js');
    assert.ok(apiClient >= 0, `${route} includes the API client`);
    assert.ok(apiClient < application, `${route} loads the API client first`);
  }
});

test('account forms never expose credentials in a query string fallback', async () => {
  const html = await (await fetch(`${base}/account`)).text();
  assert.match(html, /id="customer-login"[^>]+method="post"/);
  assert.match(html, /id="customer-register"[^>]+method="post"/);
  assert.match(html, /JS\/api-client\.js\?v=/);
  assert.match(html, /CSS\/style\.css\?v=/);
});

test('offers page is a focused discounted-product catalogue', async () => {
  const html = await (await fetch(`${base}/offers`)).text();
  assert.match(html, /id="offer-products"/);
  assert.doesNotMatch(html, /class="offer-card"/);
  assert.doesNotMatch(html, /discovery set/i);
});

test('mobile navigation keeps cart outside the menu', () => {
  const css = require('fs').readFileSync(require('path').join(__dirname, '..', 'CSS', 'responsive.css'), 'utf8');
  assert.doesNotMatch(css, /\.nav-actions a\[href="cart\.html"\]\s*\{\s*display:\s*none/);
  assert.match(css, /\.nav-links \.mobile-only-link\[href="cart\.html"\]\s*\{\s*display:\s*none/);
});

test('shop exposes an accessible collapsible mobile filter', async () => {
  const html = await (await fetch(`${base}/shop`)).text();
  assert.match(html, /id="filter-toggle"[^>]+aria-controls="shop-filters"[^>]+aria-expanded="false"/);
  assert.match(html, /id="shop-filters"/);
});
