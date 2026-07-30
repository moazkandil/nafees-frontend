(function () {
  'use strict';
  var config = window.NAFEES_CONFIG || {};
  var base = String(config.apiUrl || 'http://localhost:5000/api').replace(/\/$/, '');
  var tokenKey = 'nafeesAdminToken';
  var products = [];
  var categories = [];
  var orders = [];
  var messages = [];

  function esc(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }
  function money(value) {
    return new Intl.NumberFormat(config.locale || 'en-EG', { style: 'currency', currency: config.currency || 'EGP', maximumFractionDigits: 0 }).format(Number(value || 0));
  }
  async function api(path, options) {
    var settings = Object.assign({}, options || {});
    settings.headers = Object.assign({}, settings.headers || {}, { Authorization: 'Bearer ' + (sessionStorage.getItem(tokenKey) || '') });
    if (settings.body && !(settings.body instanceof FormData)) {
      settings.headers['Content-Type'] = 'application/json';
      settings.body = JSON.stringify(settings.body);
    }
    var response = await fetch(base + path, settings);
    var data = response.status === 204 ? null : await response.json().catch(function () { return null; });
    if (!response.ok) {
      if (response.status === 401 && !/login/.test(location.pathname)) {
        sessionStorage.removeItem(tokenKey);
        location.replace('login.html');
      }
      throw new Error(data && data.message || 'Request failed');
    }
    return data;
  }
  function pageName() { return location.pathname.split('/').pop() || 'dashboard.html'; }
  function navigate(href, label, active) { return '<a class="' + (active ? 'active' : '') + '" href="' + href + '">' + label + '</a>'; }
  function mountLayout() {
    var page = pageName();
    var sidebar = document.getElementById('admin-sidebar');
    var header = document.getElementById('admin-top');
    if (sidebar) sidebar.innerHTML = '<a class="admin-logo" href="dashboard.html">NAFEES<span>PERFUMES · ADMIN</span></a><nav><p>Overview</p>' +
      navigate('dashboard.html', 'Dashboard', page === 'dashboard.html') + '<p>Commerce</p>' +
      navigate('products.html', 'Products', page === 'products.html') + navigate('orders.html', 'Orders', page === 'orders.html') +
      navigate('customers.html', 'Customers', page === 'customers.html') + '<p>Engagement</p>' +
      navigate('messages.html', 'Messages', page === 'messages.html') + navigate('analytics.html', 'Analytics', page === 'analytics.html') +
      '<p>System</p>' + navigate('settings.html', 'Settings', page === 'settings.html') + '</nav>';
    if (header) header.innerHTML = '<div><h1>' + esc(header.dataset.title || 'Dashboard') + '</h1><p>' +
      esc(header.dataset.description || '') + '</p></div><div class="admin-user">Administrator <button type="button" data-admin-action="logout">Sign out</button></div>';
  }
  function notice(message) {
    var target = document.getElementById('admin-notice');
    if (target) { target.textContent = message; target.hidden = false; }
  }
  async function loadCatalog() {
    var results = await Promise.all([api('/products?limit=100'), api('/categories')]);
    products = results[0].products || [];
    categories = results[1].categories || [];
    var select = document.getElementById('product-category');
    if (select && categories.length) select.innerHTML = categories.map(function (item) { return '<option value="' + item._id + '">' + esc(item.name) + '</option>'; }).join('');
  }
  function renderProducts() {
    var target = document.getElementById('admin-product-rows');
    if (!target) return;
    var query = ((document.getElementById('admin-product-search') || {}).value || '').toLowerCase();
    var list = products.filter(function (p) { return [p.name, p.slug, p.category && p.category.name, p.gender].join(' ').toLowerCase().includes(query); });
    target.innerHTML = list.map(function (p) {
      var image = p.image && p.image.charAt(0) === '/' ? base.replace(/\/api$/, '') + p.image : (/^https?:/.test(p.image || '') ? p.image : '../' + (p.image || 'Images/product.jpg'));
      return '<tr><td><img class="thumb" src="' + esc(image || '../Images/product.jpg') + '" alt=""><b>' + esc(p.name) + '</b><br><small>' + esc(p.slug) +
        '</small></td><td>' + esc(p.category && p.category.name || '') + ' / ' + esc(p.gender) + '</td><td>' + money(p.price) + '</td><td>' + esc(p.stock) +
        '</td><td><span class="status ' + (p.stock < 8 ? 'red' : 'good') + '">' + (p.stock < 8 ? 'Low stock' : 'Active') +
        '</span></td><td><button class="admin-btn ghost" data-admin-action="edit-product" data-id="' + p._id +
        '">Edit</button> <button class="admin-btn ghost danger" data-admin-action="delete-product" data-id="' + p._id + '">Delete</button></td></tr>';
    }).join('') || '<tr><td colspan="6">No products found.</td></tr>';
  }
  function fillProduct(product) {
    var form = document.getElementById('admin-product-form');
    if (!form) return;
    form.reset();
    product = product || {};
    form.elements.productId.value = product._id || '';
    ['name', 'nameAr', 'gender', 'type', 'size', 'price', 'oldPrice', 'stock', 'image', 'description'].forEach(function (key) {
      if (form.elements[key]) form.elements[key].value = product[key] == null ? '' : product[key];
    });
    if (form.elements.category) form.elements.category.value = product.category && product.category._id || categories[0]?._id || '';
    ['featured', 'bestSeller', 'newArrival', 'onSale'].forEach(function (key) { form.elements[key].checked = Boolean(product[key]); });
    form.querySelector('[data-form-title]').textContent = product._id ? 'Edit product' : 'Add product';
  }
  async function saveProduct(form) {
    var id = form.elements.productId.value;
    var body = {};
    ['name', 'nameAr', 'category', 'gender', 'type', 'size', 'image', 'description'].forEach(function (key) { body[key] = form.elements[key].value.trim(); });
    ['price', 'oldPrice', 'stock'].forEach(function (key) { body[key] = Number(form.elements[key].value || 0); });
    ['featured', 'bestSeller', 'newArrival', 'onSale'].forEach(function (key) { body[key] = form.elements[key].checked; });
    body.slug = (id ? products.find(function (p) { return p._id === id; }).slug : body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + String(Date.now()).slice(-4));
    await api('/products' + (id ? '/' + id : ''), { method: id ? 'PATCH' : 'POST', body: body });
    await loadCatalog(); renderProducts(); fillProduct(null); notice('Product saved successfully.');
  }
  async function loadOrders() { orders = (await api('/orders?limit=100')).orders || []; renderOrders(); }
  async function loadMessages() {
    messages = (await api('/contact?limit=100')).messages || [];
    renderMessages();
  }
  function renderOrders() {
    var target = document.getElementById('admin-order-rows');
    if (!target) return;
    var query = ((document.getElementById('admin-order-search') || {}).value || '').toLowerCase();
    var status = (document.getElementById('admin-order-status') || {}).value || '';
    var list = orders.filter(function (o) { return (!query || [o.number, o.customer.fullName, o.customer.email, o.customer.phone].join(' ').toLowerCase().includes(query)) && (!status || o.status === status); });
    target.innerHTML = list.map(function (o) {
      var options = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(function (value) { return '<option' + (o.status === value ? ' selected' : '') + '>' + value + '</option>'; }).join('');
      return '<tr><td><b>' + esc(o.number) + '</b><br><small>' + new Date(o.createdAt).toLocaleString('en-EG') + '</small></td><td>' +
        esc(o.customer.fullName) + '<br><small>' + esc(o.customer.phone) + '</small></td><td>' + money(o.total) + '</td><td>' + esc(o.payment) +
        '</td><td><select class="admin-select" data-order-status data-id="' + o._id + '">' + options + '</select></td></tr>';
    }).join('') || '<tr><td colspan="5">No orders found.</td></tr>';
  }
  async function renderDashboard() {
    var target = document.getElementById('dashboard-content');
    if (!target) return;
    var s = (await api('/dashboard/statistics')).statistics;
    target.innerHTML = '<section class="metrics"><article class="metric"><span>Products</span><strong>' + s.products +
      '</strong><small>Catalog products</small></article><article class="metric"><span>Orders</span><strong>' + s.orders +
      '</strong><small>All orders</small></article><article class="metric"><span>Revenue</span><strong>' + money(s.revenue) +
      '</strong><small>Excludes cancelled</small></article><article class="metric"><span>Low stock</span><strong>' + s.lowStock +
      '</strong><small>Below 8 units</small></article></section><section class="admin-card"><h2>Recent orders</h2><ul class="mini-list">' +
      s.recentOrders.map(function (o) { return '<li><span><b>' + esc(o.number) + ' · ' + esc(o.customer.fullName) + '</b></span><b>' + money(o.total) + '</b></li>'; }).join('') + '</ul></section>';
  }
  function renderCustomers() {
    var target = document.getElementById('admin-customer-rows');
    if (!target) return;
    var map = {};
    orders.forEach(function (o) { var key = o.customer.email; if (!map[key]) map[key] = { customer: o.customer, count: 0, spent: 0 }; map[key].count++; map[key].spent += o.total; });
    target.innerHTML = Object.values(map).map(function (x) { return '<tr><td><b>' + esc(x.customer.fullName) + '</b></td><td>' + esc(x.customer.phone) + '</td><td>' + esc(x.customer.email) + '</td><td>' + x.count + '</td><td>' + money(x.spent) + '</td></tr>'; }).join('') || '<tr><td colspan="5">No customers yet.</td></tr>';
  }
  function renderMessages() {
    var target = document.getElementById('admin-message-rows');
    if (!target) return;
    var query = ((document.getElementById('admin-message-search') || {}).value || '').toLowerCase();
    var status = (document.getElementById('admin-message-status') || {}).value || '';
    var list = messages.filter(function (message) {
      var haystack = [message.name, message.email, message.phone, message.subject, message.message].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (!status || message.status === status);
    });
    target.innerHTML = list.map(function (message) {
      var statuses = ['New', 'Read', 'Replied', 'Archived'].map(function (value) {
        return '<option' + (message.status === value ? ' selected' : '') + '>' + value + '</option>';
      }).join('');
      return '<tr><td><b>' + esc(message.name) + '</b><br><small>' + esc(message.email) + '<br>' + esc(message.phone) +
        '</small></td><td><b>' + esc(message.subject) + '</b><br><small>' + esc(message.message) +
        '</small></td><td>' + new Date(message.createdAt).toLocaleString('en-EG') +
        '</td><td><select class="admin-select status-select" data-message-status data-id="' + message._id + '">' + statuses +
        '</select></td><td><button class="admin-btn ghost danger" data-admin-action="delete-message" data-id="' +
        message._id + '">Delete</button></td></tr>';
    }).join('') || '<tr><td colspan="5">No messages found.</td></tr>';
  }
  function bind() {
    document.addEventListener('click', async function (event) {
      var action = event.target.closest('[data-admin-action]');
      if (!action) return;
      try {
        if (action.dataset.adminAction === 'logout') { sessionStorage.removeItem(tokenKey); location.href = 'login.html'; }
        if (action.dataset.adminAction === 'new-product') fillProduct();
        if (action.dataset.adminAction === 'edit-product') fillProduct(products.find(function (p) { return p._id === action.dataset.id; }));
        if (action.dataset.adminAction === 'delete-product' && confirm('Delete this product permanently?')) {
          await api('/products/' + action.dataset.id, { method: 'DELETE' }); await loadCatalog(); renderProducts(); notice('Product deleted.');
        }
        if (action.dataset.adminAction === 'delete-message' && confirm('Delete this contact message permanently?')) {
          await api('/contact/' + action.dataset.id, { method: 'DELETE' });
          await loadMessages();
          notice('Message deleted.');
        }
      } catch (error) { notice(error.message); }
    });
    document.addEventListener('change', async function (event) {
      if (event.target.matches('[data-order-status]')) {
        try { await api('/orders/' + event.target.dataset.id, { method: 'PATCH', body: { status: event.target.value } }); notice('Order updated.'); }
        catch (error) { notice(error.message); await loadOrders(); }
      }
      if (event.target.matches('[data-message-status]')) {
        try {
          await api('/contact/' + event.target.dataset.id, { method: 'PATCH', body: { status: event.target.value } });
          notice('Message status updated.');
        } catch (error) {
          notice(error.message);
          await loadMessages();
        }
      }
    });
    var productForm = document.getElementById('admin-product-form');
    if (productForm) productForm.addEventListener('submit', function (event) { event.preventDefault(); saveProduct(productForm).catch(function (e) { notice(e.message); }); });
    var ps = document.getElementById('admin-product-search'); if (ps) ps.addEventListener('input', renderProducts);
    var os = document.getElementById('admin-order-search'); if (os) os.addEventListener('input', renderOrders);
    var sf = document.getElementById('admin-order-status'); if (sf) sf.addEventListener('change', renderOrders);
    var ms = document.getElementById('admin-message-search'); if (ms) ms.addEventListener('input', renderMessages);
    var mf = document.getElementById('admin-message-status'); if (mf) mf.addEventListener('change', renderMessages);
  }
  function setupLogin() {
    var form = document.getElementById('admin-login');
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      try {
        var data = await api('/auth/admin/login', { method: 'POST', body: { email: form.elements.email.value, password: form.elements.password.value } });
        sessionStorage.setItem(tokenKey, data.token);
        location.href = 'dashboard.html';
      } catch (error) { document.getElementById('login-error').textContent = error.message; }
    });
  }
  async function init() {
    if (pageName() === 'login.html') { setupLogin(); return; }
    if (!sessionStorage.getItem(tokenKey)) { location.replace('login.html'); return; }
    mountLayout(); bind();
    try {
      if (document.getElementById('admin-product-rows')) { await loadCatalog(); renderProducts(); }
      if (document.getElementById('admin-order-rows') || document.getElementById('admin-customer-rows')) { await loadOrders(); renderCustomers(); }
      if (document.getElementById('admin-message-rows')) await loadMessages();
      await renderDashboard();
    } catch (error) { notice(error.message); }
  }
  document.addEventListener('DOMContentLoaded', init);
}());
