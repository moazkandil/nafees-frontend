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
  siteUrl: 'https://friendly-marzipan-650aef.netlify.app',
  apiUrl: 'https://nafees-backend-production.up.railway.app/api',
  currency: 'EGP',
  locale: 'en-EG',
  deliveryFee: 75,
  freeDeliveryAt: 2000,
  whatsappNumber: '201000000000',
  phoneDisplay: '+20 10 0000 0000',
  email: 'hello@nafeesperfumes.com',
  social: {
    instagram: '#',
    facebook: '#',
    tiktok: '#'
  }
};
