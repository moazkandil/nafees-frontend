(function () {
  try {
    var savedLanguage = localStorage.getItem('nafeesLanguage');
    if (savedLanguage === 'ar') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  } catch (error) {}
}());

window.NAFEES_CONFIG = {
  siteUrl: 'https://nafees-frontend-production.up.railway.app',
  apiUrl: 'https://nafees-backend-production.up.railway.app/api',
  currency: 'EGP',
  locale: 'en-EG',
  deliveryFee: 75,
  freeDeliveryAt: 2000,
  whatsappNumber: '201044004771',
  phoneDisplay: '+20 10 440 04771',
  whatsappMessage: 'Hello NAFEES, I would like help choosing a perfume.',
  email: 'Nafeesperfumes2026@gmail.com',
  social: {
    instagram: '#',
    facebook: '#',
    tiktok: '#'
  }
};
