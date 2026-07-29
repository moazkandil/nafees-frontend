(function () {
  'use strict';
  var config = window.NAFEES_CONFIG || {};
  var base = String(config.apiUrl || 'http://localhost:5000/api').replace(/\/$/, '');
  var apiOrigin = base.replace(/\/api$/, '');

  function token() {
    return sessionStorage.getItem('nafeesAdminToken') || localStorage.getItem('nafeesToken') || '';
  }

  async function request(path, options) {
    var settings = Object.assign({}, options || {});
    settings.headers = Object.assign({}, settings.headers || {});
    var auth = token();
    if (auth) settings.headers.Authorization = 'Bearer ' + auth;
    if (settings.body && !(settings.body instanceof FormData)) {
      settings.headers['Content-Type'] = 'application/json';
      settings.body = JSON.stringify(settings.body);
    }
    var response = await fetch(base + path, settings);
    var payload = response.status === 204 ? null : await response.json().catch(function () { return null; });
    if (!response.ok) {
      var error = new Error(payload && payload.message || 'The server request failed.');
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function normalizeProduct(product) {
    var category = product.category || {};
    function asset(value) {
      if (!value || /^(https?:|data:)/.test(value)) return value;
      if (value.charAt(0) === '/') return apiOrigin + value;
      return value;
    }
    return Object.assign({}, product, {
      id: product._id || product.id,
      category: category.name || category,
      categoryAr: category.nameAr || product.categoryAr || '',
      image: asset(product.image) || 'Images/product.jpg',
      gallery: (product.gallery || []).map(asset)
    });
  }

  async function loadProducts() {
    try {
      var payload = await request('/products?limit=100');
      if (payload.products && payload.products.length) {
        window.NAFEES_PRODUCTS = payload.products.map(normalizeProduct);
      }
      return window.NAFEES_PRODUCTS || [];
    } catch (error) {
      console.warn('NAFEES API unavailable; using the bundled catalog.', error.message);
      return window.NAFEES_PRODUCTS || [];
    }
  }

  window.NAFEES_API = {
    request: request,
    loadProducts: loadProducts,
    normalizeProduct: normalizeProduct,
    setToken: function (value, admin) {
      (admin ? sessionStorage : localStorage).setItem(admin ? 'nafeesAdminToken' : 'nafeesToken', value);
    },
    clearAdminToken: function () { sessionStorage.removeItem('nafeesAdminToken'); },
    hasAdminToken: function () { return Boolean(sessionStorage.getItem('nafeesAdminToken')); }
  };
}());
