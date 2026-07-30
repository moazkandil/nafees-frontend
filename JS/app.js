(function () {
  'use strict';

  var config = window.NAFEES_CONFIG || {};
  if (!window.NAFEES_API) {
    window.NAFEES_API = {
      request: async function (path, options) {
        var settings = Object.assign({}, options || {});
        settings.headers = Object.assign({}, settings.headers || {});
        var auth = localStorage.getItem('nafeesToken');
        if (auth) settings.headers.Authorization = 'Bearer ' + auth;
        if (settings.body && !(settings.body instanceof FormData)) {
          settings.headers['Content-Type'] = 'application/json';
          settings.body = JSON.stringify(settings.body);
        }
        var response = await fetch(String(config.apiUrl || 'http://localhost:5000/api').replace(/\/$/, '') + path, settings);
        var payload = response.status === 204 ? null : await response.json().catch(function () { return null; });
        if (!response.ok) throw new Error(payload && payload.message || 'The server request failed.');
        return payload;
      },
      loadProducts: async function () {
        try {
          var payload = await this.request('/products?limit=100');
          if (payload.products && payload.products.length) {
            var origin = String(config.apiUrl || '').replace(/\/api\/?$/, '');
            window.NAFEES_PRODUCTS = payload.products.map(function (product) {
              var category = product.category || {};
              var image = product.image && product.image.charAt(0) === '/' ? origin + product.image : product.image;
              return Object.assign({}, product, { id: product._id, category: category.name || category, categoryAr: category.nameAr || '', image: image || 'Images/product.jpg' });
            });
          }
        } catch (error) {
          console.warn('NAFEES API unavailable; using bundled products.');
        }
      }
    };
  }
  var KEYS = {
    cart: 'nafeesCart',
    wishlist: 'nafeesWishlist',
    language: 'nafeesLanguage',
    orders: 'nafeesOrders',
    customProducts: 'nafeesCustomProducts',
    productOverrides: 'nafeesProductOverrides',
    deletedProducts: 'nafeesDeletedProducts'
  };
  var state = { activeModal: null, lastFocus: null };
  var dictionary = {
    en: {
      home: 'Home', shop: 'Shop', offers: 'Offers', about: 'About', contact: 'Contact',
      cart: 'Cart', wishlist: 'Wishlist', search: 'Search', featured: 'Featured perfumes',
      best: 'Best sellers', new: 'New arrivals', shopNow: 'Shop now', explore: 'Explore collection',
      add: 'Add to cart', details: 'Details', quick: 'Quick view', continue: 'Continue shopping',
      checkout: 'Checkout', subtotal: 'Subtotal', delivery: 'Delivery', discount: 'Savings',
      total: 'Total', clear: 'Clear cart', emptyCart: 'Your bag is ready for a signature.',
      emptyWishlist: 'Your wishlist is waiting for something extraordinary.', inStock: 'In stock',
      lowStock: 'Only {count} left', outStock: 'Out of stock', close: 'Close', viewAll: 'View all',
      filters: 'Refine your selection', reset: 'Reset filters', results: '{count} fragrances found',
      newsletter: 'Private access, delivered', subscribe: 'Subscribe', contactUs: 'Contact us',
      privacy: 'Privacy', terms: 'Terms', language: 'العربية', orderSuccess: 'Order received',
      backToShop: 'Back to shop', moveToCart: 'Move to cart', share: 'Share',
      shippingFree: 'Complimentary delivery over {amount}', why: 'Why NAFEES'
    },
    ar: {
      home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', shop: '\u0627\u0644\u0645\u062a\u062c\u0631', offers: '\u0627\u0644\u0639\u0631\u0648\u0636', about: '\u0645\u0646 \u0646\u062d\u0646', contact: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627',
      cart: '\u0627\u0644\u0633\u0644\u0629', wishlist: '\u0627\u0644\u0645\u0641\u0636\u0644\u0629', search: '\u0628\u062d\u062b', featured: '\u0627\u0644\u0639\u0637\u0648\u0631 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629',
      best: '\u0627\u0644\u0623\u0643\u062b\u0631 \u0645\u0628\u064a\u0639\u0627\u064b', new: '\u0648\u0635\u0644 \u062d\u062f\u064a\u062b\u0627\u064b', shopNow: '\u062a\u0633\u0648\u0651\u0642 \u0627\u0644\u0622\u0646', explore: '\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629',
      add: '\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629', details: '\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644', quick: '\u0639\u0631\u0636 \u0633\u0631\u064a\u0639', continue: '\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u062a\u0633\u0648\u0651\u0642',
      checkout: '\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628', subtotal: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064a', delivery: '\u0627\u0644\u062a\u0648\u0635\u064a\u0644', discount: '\u0627\u0644\u062a\u0648\u0641\u064a\u0631',
      total: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a', clear: '\u0625\u0641\u0631\u0627\u063a \u0627\u0644\u0633\u0644\u0629', emptyCart: '\u062d\u0642\u064a\u0628\u062a\u0643 \u062c\u0627\u0647\u0632\u0629 \u0644\u0639\u0637\u0631\u0643 \u0627\u0644\u0645\u0645\u064a\u0632.',
      emptyWishlist: '\u0642\u0627\u0626\u0645\u0629 \u0645\u0641\u0636\u0644\u0627\u062a\u0643 \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u062e\u062a\u064a\u0627\u0631\u0643.', inStock: '\u0645\u062a\u0648\u0641\u0631',
      lowStock: '\u0645\u062a\u0628\u0642\u064a {count} \u0641\u0642\u0637', outStock: '\u0646\u0641\u062f \u0645\u0646 \u0627\u0644\u0645\u062e\u0632\u0648\u0646', close: '\u0625\u063a\u0644\u0627\u0642', viewAll: '\u0639\u0631\u0636 \u0627\u0644\u0643\u0644',
      filters: '\u062d\u062f\u062f \u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a\u0643', reset: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u0631\u0634\u062d\u0627\u062a', results: '\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 {count} \u0639\u0637\u0631',
      newsletter: '\u0648\u0635\u0648\u0644 \u062e\u0627\u0635 \u064a\u0635\u0644 \u0625\u0644\u064a\u0643', subscribe: '\u0627\u0634\u062a\u0631\u0627\u0643', contactUs: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627',
      privacy: '\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629', terms: '\u0627\u0644\u0634\u0631\u0648\u0637', language: 'English', orderSuccess: '\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0637\u0644\u0628\u0643',
      backToShop: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u062a\u062c\u0631', moveToCart: '\u0646\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629', share: '\u0645\u0634\u0627\u0631\u0643\u0629',
      shippingFree: '\u062a\u0648\u0635\u064a\u0644 \u0645\u062c\u0627\u0646\u064a \u0644\u0644\u0637\u0644\u0628\u0627\u062a \u0641\u0648\u0642 {amount}', why: '\u0644\u0645\u0627\u0630\u0627 NAFEES'
    }
  };
  dictionary.en.language = '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';
  dictionary.en.noResults = 'No fragrances found';
  dictionary.ar.noResults = '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0639\u0637\u0648\u0631';
  var originalText = new WeakMap();
  var staticArabic = {
    'The private collection': 'المجموعة الخاصة',
    'Perfume, with': 'عطرٌ له',
    'presence.': 'حضور.',
    'NAFEES creates long-lasting, refined scents that become part of your own story.': 'تبتكر نفيس عطوراً راقية تدوم طويلاً وتصبح جزءاً من قصتك.',
    'Extrait': 'خلاصة عطرية',
    'Long-lasting artistry': 'إبداع يدوم طويلاً',
    'Private welcome offer': 'عرض ترحيبي خاص',
    '15% off selected signatures': 'خصم 15% على عطور مختارة',
    'Explore offers': 'اكتشف العروض',
    'Curated for you': 'مختارة من أجلك',
    'Find your expression': 'اكتشف أسلوبك',
    'Fragrance for every': 'عطر لكل',
    'mood.': 'مزاج.',
    'Men': 'للرجال',
    'Women': 'للنساء',
    'Unisex': 'للجنسين',
    'Woods, spice and mineral freshness.': 'أخشاب وتوابل وانتعاش معدني.',
    'Florals, amber and velvet softness.': 'زهور وعنبر ونعومة مخملية.',
    'Oud, musk and modern contrast.': 'عود ومسك وتباين عصري.',
    'Long lasting': 'ثبات طويل',
    'High-concentration formulas with an elegant trail.': 'تركيبات عالية التركيز بأثر أنيق.',
    'Premium ingredients': 'مكونات فاخرة',
    'Materials selected for depth, clarity and character.': 'مكونات مختارة للعمق والنقاء والطابع المميز.',
    'Elegant packaging': 'تغليف أنيق',
    'Every order arrives presentation ready.': 'يصل كل طلب بتغليف فاخر جاهز للإهداء.',
    'Secure shopping': 'تسوق آمن',
    'Clear checkout and Cash on Delivery ordering.': 'خطوات دفع واضحة وإمكانية الدفع عند الاستلام.',
    'Most loved': 'الأكثر تفضيلاً',
    'Explore best sellers': 'اكتشف الأكثر مبيعاً',
    'The NAFEES ritual': 'طقوس نفيس',
    'More than a final touch.': 'أكثر من مجرد لمسة أخيرة.',
    'Each NAFEES composition balances its materials with patience, depth and restraint, then reveals itself slowly on the skin.': 'توازن كل تركيبة من نفيس بين مكوناتها بعمق ودقة، ثم تكشف عن جمالها تدريجياً على البشرة.',
    'Richly layered compositions': 'تركيبات غنية متعددة الطبقات',
    'Made for skin, not passing trends': 'مصممة للبشرة لا للصيحات العابرة',
    'Presented in a signature gift box': 'تقدم في علبة هدايا نفيس المميزة',
    'Discover our story': 'اكتشف قصتنا',
    'Just arrived': 'وصل حديثاً',
    'View new arrivals': 'شاهد الجديد',
    'In their words': 'بكلماتهم',
    'Worn. Remembered.': 'عطر يُرتدى ويُذكر.',
    'The inner circle': 'الدائرة الخاصة',
    'Be first to receive new creations, limited releases and private invitations.': 'كن أول من يتعرف على الإبداعات الجديدة والإصدارات المحدودة والدعوات الخاصة.',
    'Refine your selection': 'حدد اختياراتك',
    'For': 'الفئة',
    'Type': 'النوع',
    'Collections': 'المجموعات',
    'Best sellers': 'الأكثر مبيعاً',
    'New arrivals': 'وصل حديثاً',
    'Maximum price': 'السعر الأقصى',
    'Featured': 'المميزة',
    'Price: low to high': 'السعر: من الأقل للأعلى',
    'Price: high to low': 'السعر: من الأعلى للأقل',
    'Rating': 'التقييم',
    'Newest': 'الأحدث',
    'Home / Shop': 'الرئيسية / المتجر',
    'The collection': 'المجموعة',
    'Compositions with character, selected for the way they stay with you.': 'تركيبات ذات طابع مميز، مختارة لأثرها الذي يبقى معك.',
    'Your selection': 'اختياراتك',
    'Delivery details': 'بيانات التوصيل',
    'Secure checkout': 'دفع آمن',
    'Cash on Delivery available': 'الدفع عند الاستلام متاح',
    'Full name': 'الاسم الكامل',
    'Egyptian phone number': 'رقم الهاتف المصري',
    'Email': 'البريد الإلكتروني',
    'Governorate': 'المحافظة',
    'Select governorate': 'اختر المحافظة',
    'Cairo': 'القاهرة',
    'Giza': 'الجيزة',
    'Alexandria': 'الإسكندرية',
    'Qalyubia': 'القليوبية',
    'Other': 'أخرى',
    'City / area': 'المدينة / المنطقة',
    'Full address': 'العنوان الكامل',
    'Order notes': 'ملاحظات الطلب',
    '(optional)': '(اختياري)',
    'Payment method': 'طريقة الدفع',
    'Cash on Delivery': 'الدفع عند الاستلام',
    'Place a local demo order and pay when it arrives.': 'أكمل الطلب وادفع عند الاستلام.',
    'Coming soon — not connected in this static site.': 'قريباً.',
    'Coming soon — no real card charge is made.': 'قريباً.',
    'Card payment': 'الدفع بالبطاقة',
    'Place Cash on Delivery order': 'تأكيد طلب الدفع عند الاستلام',
    'Home / Contact': 'الرئيسية / تواصل معنا',
    'A personal fragrance consultation': 'استشارة عطرية شخصية',
    'We are here to help you find your next signature.': 'نحن هنا لمساعدتك في العثور على عطرك المميز.',
    'The concierge': 'خدمة العملاء',
    'Phone': 'الهاتف',
    'Studio hours': 'ساعات العمل',
    'Sunday–Thursday · 10am–7pm': 'الأحد–الخميس · 10 صباحاً–7 مساءً',
    'WhatsApp the concierge': 'تواصل معنا عبر واتساب',
    'Cairo, Egypt · By appointment': 'القاهرة، مصر · بموعد مسبق',
    'Write to us': 'اكتب لنا',
    'How may we help?': 'كيف يمكننا مساعدتك؟',
    'Name': 'الاسم',
    'Subject': 'الموضوع',
    'Choose a subject': 'اختر الموضوع',
    'Fragrance consultation': 'استشارة عطرية',
    'Existing order': 'طلب حالي',
    'Wholesale or press': 'الجملة أو الصحافة',
    'Message': 'الرسالة',
    'Send message': 'إرسال الرسالة',
    'Home / About': 'الرئيسية / من نحن',
    'The house of NAFEES': 'دار نفيس',
    'We compose fragrances that live close to the skin and remain in the memory.': 'نصنع عطوراً تلامس البشرة وتبقى في الذاكرة.',
    'Our point of view': 'رؤيتنا',
    'Luxury speaks in a lower voice.': 'الفخامة تتحدث بهدوء.',
    'Discover the collection': 'اكتشف المجموعة',
    'Our mission': 'مهمتنا',
    'Our vision': 'رؤيتنا',
    'Our promise': 'وعدنا',
    'Our craft': 'حرفتنا',
    'To turn everyday rituals into lasting memories.': 'تحويل الطقوس اليومية إلى ذكريات باقية.',
    'To be a fragrance house people return to for a lifetime.': 'أن نكون دار عطور يعود إليها الناس مدى الحياة.',
    'Exceptional quality, quiet confidence, considered detail.': 'جودة استثنائية وثقة هادئة وتفاصيل مدروسة.',
    'Balanced compositions that unfold over time.': 'تركيبات متوازنة تتكشف مع مرور الوقت.',
    'Home / Offers': 'الرئيسية / العروض',
    'Selected signatures': 'عطور مختارة',
    'Private offer': 'عرض خاص',
    'Shop the edit': 'تسوق الاختيارات',
    'Gift of the house': 'هدية من الدار',
    'Speak with us': 'تحدث معنا',
    "Collector's access": 'لعشاق الاقتناء',
    'See Obsidian Reserve': 'شاهد أوبسيديان ريزيرف',
    'Top notes': 'المقدمة العطرية',
    'Middle notes': 'قلب العطر',
    'Base notes': 'قاعدة العطر',
    'You may also like': 'قد يعجبك أيضاً',
    'Complete the ritual': 'أكمل طقوسك',
    'All fragrances': 'كل العطور',
    'Remove': 'إزالة',
    'Complimentary': 'مجاني',
    'Try changing your filters.': 'جرّب تغيير خيارات التصفية.',
    'Search by fragrance, note or category.': 'ابحث باسم العطر أو النوتة أو الفئة.',
    'No fragrance matched that search.': 'لم نجد عطراً مطابقاً لبحثك.',
    'Find your signature': 'اعثر على عطرك المميز',
    'Search fragrance, note or type': 'ابحث عن عطر أو نوتة أو نوع'
    ,'Offer': 'عرض'
    ,'New': 'جديد'
    ,'Best seller': 'الأكثر مبيعاً'
    ,'Extrait de Parfum': 'خلاصة عطرية'
    ,'Eau de Parfum': 'ماء عطر'
    ,'Eau de Toilette': 'ماء تواليت'
    ,'Discover': 'اكتشف'
    ,'Client services': 'خدمة العملاء'
    ,'Quietly confident fragrance, composed for remarkable moments.': 'عطور بثقة هادئة، صُممت للحظات استثنائية.'
    ,'Made with intention.': 'صُنع بعناية.'
    ,'This page has slipped away.': 'هذه الصفحة غير موجودة.'
    ,'The fragrance you are looking for may have moved, or the address may be incorrect.': 'ربما تم نقل الصفحة التي تبحث عنها أو أن العنوان غير صحيح.'
    ,'Return home': 'العودة للرئيسية'
    ,'Shop fragrances': 'تسوق العطور'
    ,'NAFEES began with a simple belief: a great fragrance should reveal itself, not announce itself. We work with contrast — shadow and light, spice and softness, the familiar and the unexpected.': 'بدأت نفيس بإيمان بسيط: العطر الرائع يكشف عن نفسه ولا يفرض حضوره. نمزج بين الظل والنور، والتوابل والنعومة، والمألوف وغير المتوقع.'
    ,'Our compositions are designed to become personal. They meet the warmth of the skin, change through the day, and leave a presence that feels entirely your own.': 'صُممت تركيباتنا لتصبح شخصية؛ تتفاعل مع دفء البشرة وتتغير على مدار اليوم وتترك حضوراً يعبّر عنك.'
    ,'A measured evolution': 'تطور مدروس'
    ,'Built with': 'صُنع بـ'
    ,'intention.': 'عناية.'
    ,'An idea takes shape': 'بداية الفكرة'
    ,'A small study of resins, spices and the ways scent can hold a memory.': 'دراسة صغيرة للراتنجات والتوابل وقدرة العطر على حفظ الذكريات.'
    ,'The first collection': 'المجموعة الأولى'
    ,'Four signature fragrances introduced in limited quantities.': 'إطلاق أربعة عطور مميزة بكميات محدودة.'
    ,'A house in full bloom': 'دار تتفتح'
    ,'NAFEES welcomes a wider collection and a personal fragrance concierge.': 'تقدم نفيس مجموعة أوسع وخدمة استشارات عطرية شخصية.'
    ,'“Sovereign Oud is warm without being loud. I reach for it whenever the evening deserves a little ceremony.”': '«سوفيرين عود دافئ من دون مبالغة. أختاره كلما استحقت الأمسية لمسة خاصة.»'
    ,'“The packaging, the note card, the scent itself — every detail feels beautifully considered.”': '«التغليف وبطاقة النوتات والعطر نفسه؛ كل تفصيلة مدروسة بجمال.»'
    ,'“Cedar Veil is the rare fresh scent that still feels completely distinctive.”': '«سيدار فيل من العطور المنعشة النادرة التي تحتفظ بطابعها المميز.»'
    ,'Verified client': 'عميل موثّق'
    ,'Privileged moments, beautifully bottled': 'لحظات استثنائية في زجاجات أنيقة'
    ,'Private prices on expressions worth discovering.': 'أسعار خاصة لعطور تستحق الاكتشاف.'
    ,'Explore current savings across selected NAFEES expressions.': 'اكتشف التخفيضات الحالية على مجموعة مختارة من عطور نفيس.'
    ,'Ask the concierge about travel-size recommendations for your order.': 'اسأل خدمة العملاء عن اقتراحات الأحجام المناسبة للسفر.'
    ,'Explore small-batch expressions before they leave the house.': 'اكتشف الإصدارات محدودة الكمية قبل نفادها.'
    ,'An unforgettable gift': 'هدية لا تُنسى'
    ,'Make it feel like it was chosen': 'اجعلها تبدو مختارة'
    ,'just for them.': 'خصيصاً لهم.'
    ,'Every NAFEES purchase arrives in a polished black gift box with a gold-rimmed card. Add a personal message at checkout.': 'يصل كل طلب من نفيس في علبة هدايا سوداء أنيقة مع بطاقة ذهبية الحواف. أضف رسالتك الشخصية عند إتمام الطلب.'
    ,'Speak with the concierge': 'تحدث مع خدمة العملاء'
    ,'Legal': 'قانوني'
    ,'Privacy policy': 'سياسة الخصوصية'
    ,'Last updated: July 2026': 'آخر تحديث: يوليو 2026'
    ,'Information we collect': 'المعلومات التي نجمعها'
    ,'How information is used': 'كيفية استخدام المعلومات'
    ,'Your choices': 'خياراتك'
    ,'Terms and conditions': 'الشروط والأحكام'
    ,'Orders': 'الطلبات'
    ,'Products and availability': 'المنتجات والتوفر'
    ,'Intellectual property': 'الملكية الفكرية'
    ,'Saved signatures': 'عطورك المحفوظة'
    ,'Search collection': 'ابحث في المجموعة'
    ,'Sort products': 'ترتيب المنتجات'
    ,'Legal': '\u0642\u0627\u0646\u0648\u0646\u064a'
    ,'NAFEES currently accepts Cash on Delivery orders. An order is confirmed only after the NAFEES team contacts you using the phone number supplied during checkout. Orders may be cancelled before shipment, subject to availability and confirmation.': '\u062a\u0642\u0628\u0644 \u0646\u0641\u064a\u0633 \u062d\u0627\u0644\u064a\u064b\u0627 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645. \u0644\u0627 \u064a\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0627 \u0628\u0639\u062f \u062a\u0648\u0627\u0635\u0644 \u0641\u0631\u064a\u0642 \u0646\u0641\u064a\u0633 \u0645\u0639\u0643 \u0639\u0628\u0631 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0627\u0644\u0645\u0633\u062c\u0644 \u0623\u062b\u0646\u0627\u0621 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628. \u064a\u0645\u0643\u0646 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u0634\u062d\u0646\u060c \u0648\u0641\u0642\u064b\u0627 \u0644\u0644\u062a\u0648\u0641\u0631 \u0648\u0627\u0644\u062a\u0623\u0643\u064a\u062f.'
    ,'Product imagery, descriptions, pricing and stock may change without notice. If an item becomes unavailable after an order is placed, the NAFEES team will contact you before confirming the order.': '\u0642\u062f \u062a\u062a\u063a\u064a\u0631 \u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0648\u0623\u0648\u0635\u0627\u0641\u0647\u0627 \u0648\u0623\u0633\u0639\u0627\u0631\u0647\u0627 \u0648\u0627\u0644\u0643\u0645\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629 \u062f\u0648\u0646 \u0625\u0634\u0639\u0627\u0631 \u0645\u0633\u0628\u0642. \u0625\u0630\u0627 \u0644\u0645 \u064a\u0639\u062f \u0623\u062d\u062f \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u062a\u0648\u0641\u0631\u064b\u0627 \u0628\u0639\u062f \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628\u060c \u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0641\u0631\u064a\u0642 \u0646\u0641\u064a\u0633 \u0642\u0628\u0644 \u062a\u0623\u0643\u064a\u062f\u0647.'
    ,'The NAFEES name, visual identity and site content may not be copied or reused without permission.': '\u0644\u0627 \u064a\u062c\u0648\u0632 \u0646\u0633\u062e \u0627\u0633\u0645 \u0646\u0641\u064a\u0633 \u0623\u0648 \u0647\u0648\u064a\u062a\u0647\u0627 \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u0623\u0648 \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u0625\u0639\u0627\u062f\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647 \u062f\u0648\u0646 \u0625\u0630\u0646.'
  };

  function translateStaticContent() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(parent.tagName)) return;
      if (parent.closest('[data-i18n], .lang-button')) return;
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      var english = originalText.get(node);
      if (language() === 'en') {
        node.nodeValue = english;
        return;
      }
      var trimmed = english.trim();
      if (staticArabic[trimmed]) node.nodeValue = english.replace(trimmed, staticArabic[trimmed]);
    });
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (field) {
      if (!field.dataset.englishPlaceholder) field.dataset.englishPlaceholder = field.placeholder;
      field.placeholder = language() === 'ar' ? (staticArabic[field.dataset.englishPlaceholder] || field.dataset.englishPlaceholder) : field.dataset.englishPlaceholder;
    });
  }

  function language() {
    try { return localStorage.getItem(KEYS.language) || 'en'; }
    catch (error) { return 'en'; }
  }

  function t(key, values) {
    var copy = (dictionary[language()] || dictionary.en)[key] || dictionary.en[key] || key;
    if (values) {
      Object.keys(values).forEach(function (name) {
        copy = copy.replace('{' + name + '}', values[name]);
      });
    }
    return copy;
  }

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cleanText(value) {
    return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  }

  function whatsappUrl() {
    var number = String(config.whatsappNumber || '').replace(/\D/g, '');
    var message = String(config.whatsappMessage || '').trim();
    return 'https://wa.me/' + number + (message ? '?text=' + encodeURIComponent(message) : '');
  }

  function readJSON(key, fallback) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key));
      return parsed === null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      showToast('Your browser could not save this change.');
      return false;
    }
  }

  function migrateStorage() {
    try {
      if (!localStorage.getItem(KEYS.cart) && localStorage.getItem('nafees-cart')) writeJSON(KEYS.cart, readJSON('nafees-cart', []));
      if (!localStorage.getItem(KEYS.wishlist) && localStorage.getItem('nafees-wishlist')) writeJSON(KEYS.wishlist, readJSON('nafees-wishlist', []));
      if (!localStorage.getItem(KEYS.language) && localStorage.getItem('nafees-lang')) localStorage.setItem(KEYS.language, localStorage.getItem('nafees-lang'));
    } catch (error) {}
  }

  function customProducts() {
    var items = readJSON(KEYS.customProducts, []);
    return Array.isArray(items) ? items : [];
  }

  function allProducts() {
    var overrides = readJSON(KEYS.productOverrides, {});
    var deleted = readJSON(KEYS.deletedProducts, []);
    var hidden = Array.isArray(deleted) ? deleted : [];
    var base = (window.NAFEES_PRODUCTS || []).filter(function (product) {
      return !hidden.includes(product.id);
    }).map(function (product) {
      return Object.assign({}, product, overrides[product.id] || {});
    });
    return base.concat(customProducts().filter(function (product) { return !hidden.includes(product.id); }));
  }

  function getProduct(idOrSlug) {
    var key = String(idOrSlug || '');
    var legacy = Number(key);
    return allProducts().find(function (item, index) {
      return item.id === key || item.slug === key || (Number.isFinite(legacy) && legacy === index + 1);
    }) || null;
  }

  function productName(product) {
    return language() === 'ar' && product.nameAr ? product.nameAr : product.name;
  }

  function productCategory(product) {
    return language() === 'ar' && product.categoryAr ? product.categoryAr : product.category;
  }

  function productDescription(product) {
    return language() === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;
  }

  function productGender(product) {
    if (language() !== 'ar') return product.gender;
    return { Men: 'رجالي', Women: 'نسائي', Unisex: 'للجنسين' }[product.gender] || product.gender;
  }

  function productType(product) {
    if (language() !== 'ar') return product.type;
    return staticArabic[product.type] || product.type;
  }

  function money(value) {
    return new Intl.NumberFormat(config.locale || 'en-EG', {
      style: 'currency',
      currency: config.currency || 'EGP',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function getCart() {
    var cart = readJSON(KEYS.cart, []);
    if (!Array.isArray(cart)) return [];
    var normalized = [];
    cart.forEach(function (line) {
      var item = getProduct(line.id);
      if (!item || Number(item.stock) < 1) return;
      var quantity = Math.min(Number(item.stock), Math.max(1, Number(line.quantity) || 1));
      var existing = normalized.find(function (saved) { return saved.id === item.id; });
      if (existing) existing.quantity = Math.min(Number(item.stock), existing.quantity + quantity);
      else normalized.push({ id: item.id, quantity: quantity });
    });
    return normalized;
  }

  function saveCart(cart) {
    writeJSON(KEYS.cart, cart);
    updateCartCount();
    syncCustomerCollection('cart', cart);
  }

  function getWishlist() {
    var list = readJSON(KEYS.wishlist, []);
    if (!Array.isArray(list)) return [];
    return list.map(function (id) {
      var item = getProduct(id);
      return item ? item.id : null;
    }).filter(Boolean);
  }

  function saveWishlist(list) {
    var unique = Array.from(new Set(list));
    writeJSON(KEYS.wishlist, unique);
    syncCustomerCollection('wishlist', unique);
  }

  function syncCustomerCollection(type, items) {
    if (!localStorage.getItem('nafeesToken')) return;
    var body = type === 'cart'
      ? { items: items.map(function (line) { return { product: line.id, quantity: line.quantity }; }) }
      : { items: items };
    window.NAFEES_API.request('/users/' + type, { method: 'PUT', body: body }).catch(function (error) {
      console.warn('Could not synchronize ' + type + ':', error.message);
    });
  }

  function cartItems() {
    return getCart().map(function (line) {
      var product = getProduct(line.id);
      return product ? { line: line, product: product } : null;
    }).filter(Boolean);
  }

  function cartTotals() {
    var items = cartItems();
    var subtotal = items.reduce(function (sum, item) {
      return sum + item.product.price * item.line.quantity;
    }, 0);
    var savings = items.reduce(function (sum, item) {
      return sum + Math.max(0, (item.product.oldPrice || item.product.price) - item.product.price) * item.line.quantity;
    }, 0);
    var delivery = subtotal === 0 || subtotal >= Number(config.freeDeliveryAt || 0) ? 0 : Number(config.deliveryFee || 0);
    return { items: items, subtotal: subtotal, savings: savings, delivery: delivery, total: subtotal + delivery };
  }

  function updateCartCount() {
    var count = getCart().reduce(function (sum, line) { return sum + line.quantity; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (element) {
      element.textContent = String(count);
      element.hidden = count === 0;
    });
  }

  function addToCart(id, quantity) {
    var product = getProduct(id);
    if (!product) {
      showToast('This product is no longer available.');
      return false;
    }
    if (product.stock < 1) {
      showToast(t('outStock'));
      return false;
    }
    var requested = Math.max(1, Number(quantity) || 1);
    var cart = getCart();
    var line = cart.find(function (item) { return item.id === product.id; });
    var nextQuantity = (line ? line.quantity : 0) + requested;
    if (nextQuantity > product.stock) {
      showToast(t('lowStock', { count: product.stock }));
      return false;
    }
    if (line) line.quantity = nextQuantity;
    else cart.push({ id: product.id, quantity: requested });
    saveCart(cart);
    renderCartPage();
    renderCheckoutSummary();
    showToast(language() === 'ar' ? 'تمت إضافة ' + productName(product) + ' إلى السلة.' : productName(product) + ' added to your bag.');
    return true;
  }

  function changeCartQuantity(id, change) {
    var product = getProduct(id);
    var cart = getCart();
    var line = cart.find(function (item) { return item.id === id; });
    if (!product || !line) return;
    var next = line.quantity + Number(change);
    if (next < 1) {
      saveCart(cart.filter(function (item) { return item.id !== id; }));
    } else if (next > product.stock) {
      showToast(t('lowStock', { count: product.stock }));
      return;
    } else {
      line.quantity = next;
      saveCart(cart);
    }
    renderCartPage();
    renderCheckoutSummary();
  }

  function removeFromCart(id) {
    saveCart(getCart().filter(function (line) { return line.id !== id; }));
    renderCartPage();
    renderCheckoutSummary();
    showToast(language() === 'ar' ? 'تمت الإزالة من السلة.' : 'Removed from your bag.');
  }

  function toggleWishlist(id) {
    var product = getProduct(id);
    if (!product) return;
    var list = getWishlist();
    var index = list.indexOf(product.id);
    if (index > -1) {
      list.splice(index, 1);
      showToast(language() === 'ar' ? 'تمت الإزالة من المفضلة.' : 'Removed from your wishlist.');
    } else {
      list.push(product.id);
      showToast(language() === 'ar' ? 'تم حفظ ' + productName(product) + ' في المفضلة.' : productName(product) + ' saved to your wishlist.');
    }
    saveWishlist(list);
    refreshWishlistButtons(product.id);
    renderWishlistPage();
  }

  function refreshWishlistButtons(id) {
    var active = getWishlist().includes(id);
    document.querySelectorAll('[data-wishlist-id="' + CSS.escape(id) + '"]').forEach(function (button) {
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function productImage(product, className) {
    return '<img class="' + (className || '') + '" data-product-image src="' + esc(product.image) + '" alt="' + esc(productName(product)) + ' perfume bottle" loading="lazy" decoding="async">';
  }

  function productCard(product, wishlistMode) {
    var saved = getWishlist().includes(product.id);
    var tag = product.onSale ? 'Offer' : product.newArrival ? 'New' : product.bestSeller ? 'Best seller' : '';
    var stock = product.stock > 0 ? '' : ' is-sold-out';
    return '<article class="product-card' + stock + '">' +
      '<div class="product-image">' + productImage(product, '') +
      (tag ? '<span class="card-tag">' + esc(tag) + '</span>' : '') +
      '<button class="heart' + (saved ? ' active' : '') + '" type="button" data-action="wishlist" data-wishlist-id="' + esc(product.id) + '" aria-label="Save ' + esc(productName(product)) + '" aria-pressed="' + (saved ? 'true' : 'false') + '">&#9825;</button></div>' +
      '<div class="card-body"><div class="rating" aria-label="' + esc(product.rating + ' out of 5 stars') + '">&#9733;&#9733;&#9733;&#9733;&#9733; <span>(' + esc(product.rating) + ')</span></div>' +
      '<h3>' + esc(productName(product)) + '</h3><p>' + esc(productDescription(product)) + '</p>' +
      '<div class="price-row"><div class="price">' + money(product.price) +
      (product.oldPrice ? '<span class="old-price">' + money(product.oldPrice) + '</span>' : '') +
      '</div><span class="product-size">' + esc(product.size) + '</span></div>' +
      '<div class="card-actions"><button class="button small" type="button" data-action="add-cart" data-product-id="' + esc(product.id) + '"' + (product.stock ? '' : ' disabled') + '>' + esc(product.stock ? t('add') : t('outStock')) + '</button>' +
      '<button class="button small ghost" type="button" data-action="quick-view" data-product-id="' + esc(product.id) + '">' + esc(t('quick')) + '</button>' +
      (wishlistMode ? '<button class="button small ghost" type="button" data-action="move-to-cart" data-product-id="' + esc(product.id) + '">' + esc(t('moveToCart')) + '</button>' : '') + '</div>' +
      '<a class="card-details" href="product-details.html?slug=' + encodeURIComponent(product.slug) + '">' + esc(t('details')) + '</a></div></article>';
  }

  function icon(name) {
    var icons = {
      search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>',
      heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"></path></svg>',
      bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path></svg>',
      menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
      user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path></svg>'
    };
    return icons[name] || '';
  }

  function renderProducts(target, products) {
    if (!target) return;
    target.innerHTML = products.length ? products.map(function (product) {
      return productCard(product, target.id === 'wishlist-items');
    }).join('') :
      '<div class="empty-state"><h2>' + esc(t('noResults')) + '</h2><p>Try changing your filters.</p></div>';
  }

  function mountChrome() {
    var header = document.getElementById('site-header');
    var footer = document.getElementById('site-footer');
    var current = location.pathname.split('/').pop() || 'index.html';
    function nav(href, key) {
      return '<a href="' + href + '"' + (current === href ? ' class="active" aria-current="page"' : '') + ' data-i18n="' + key + '">' + esc(t(key)) + '</a>';
    }
    if (header) {
      header.innerHTML = '<a class="skip-link" href="#main">Skip to content</a><nav class="nav" aria-label="Primary navigation">' +
        '<a class="logo brand-logo" href="index.html" aria-label="NAFEES home"><img src="Images/logo.jpg" alt="NAFEES Perfumes" width="62" height="62"></a>' +
        '<div class="nav-links" id="nav-links">' + nav('index.html', 'home') + nav('shop.html', 'shop') + nav('offers.html', 'offers') + nav('about.html', 'about') + nav('contact.html', 'contact') +
        '<a class="mobile-only-link" href="wishlist.html">' + esc(t('wishlist')) + '</a><a class="mobile-only-link" href="cart.html">' + esc(t('cart')) + ' <span data-cart-count hidden>0</span></a></div>' +
        '<div class="nav-actions"><button class="icon-button" type="button" data-action="open-search" aria-label="Search" title="Search">' + icon('search') + '</button>' +
        '<button class="icon-button lang-button" type="button" data-action="toggle-language" aria-label="Change language" title="Change language">' + esc(t('language')) + '</button>' +
        '<a class="icon-button" href="account.html" aria-label="My account" title="My account">' + icon('user') + '</a>' +
        '<a class="icon-button" href="wishlist.html" aria-label="Wishlist" title="Wishlist">' + icon('heart') + '</a>' +
        '<a class="icon-button" href="cart.html" aria-label="Cart" title="Cart">' + icon('bag') + '<span class="counter" data-cart-count hidden>0</span></a>' +
        '<button class="icon-button menu-button" type="button" data-action="toggle-menu" aria-label="Open menu" aria-controls="nav-links" aria-expanded="false">' + icon('menu') + '</button></div></nav>';
    }
    if (footer) {
      footer.classList.add('site-footer');
      var social = Object.keys(config.social || {}).filter(function (network) { return config.social[network] && config.social[network] !== '#'; }).map(function (network) {
        return '<a href="' + esc(config.social[network]) + '" target="_blank" rel="noopener noreferrer">' + esc(network) + '</a>';
      }).join('');
      footer.innerHTML = '<div class="container footer-grid"><div><a class="logo footer-logo" href="index.html" aria-label="NAFEES home"><img src="Images/logo.jpg" alt="NAFEES Perfumes" width="150" height="150" loading="lazy" decoding="async"></a><p>Quietly confident fragrance, composed for remarkable moments.</p>' + (social ? '<div class="footer-social">' + social + '</div>' : '') + '</div>' +
        '<div><h4>Discover</h4><a href="shop.html" data-i18n="shop">' + esc(t('shop')) + '</a><a href="offers.html" data-i18n="offers">' + esc(t('offers')) + '</a><a href="about.html" data-i18n="about">' + esc(t('about')) + '</a><a href="wishlist.html" data-i18n="wishlist">' + esc(t('wishlist')) + '</a></div>' +
        '<div><h4>Client services</h4><a href="account.html">My account</a><a href="contact.html" data-i18n="contact">' + esc(t('contact')) + '</a><a href="privacy.html" data-i18n="privacy">' + esc(t('privacy')) + '</a><a href="terms.html" data-i18n="terms">' + esc(t('terms')) + '</a><a href="Admin/login.html">Administrator</a></div>' +
        '<div><h4>Contact</h4><a href="mailto:' + esc(config.email || '') + '">' + esc(config.email || '') + '</a><a href="' + esc(whatsappUrl()) + '" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="tel:+' + esc(String(config.whatsappNumber || '').replace(/\D/g, '')) + '">' + esc(config.phoneDisplay || '') + '</a></div></div><div class="container copyright"><span>&copy; ' + new Date().getFullYear() + ' NAFEES. All rights reserved.</span><span>Made with intention.</span></div>';
    }
    if (!document.getElementById('site-modal-root')) {
      var root = document.createElement('div');
      root.id = 'site-modal-root';
      document.body.appendChild(root);
    }
    if (!document.getElementById('toast')) {
      var toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    if (!document.querySelector('.whatsapp-float')) {
      var whatsapp = document.createElement('a');
      whatsapp.className = 'whatsapp-float';
      whatsapp.href = whatsappUrl();
      whatsapp.target = '_blank';
      whatsapp.rel = 'noopener';
      whatsapp.setAttribute('aria-label', 'Chat with NAFEES on WhatsApp');
      whatsapp.innerHTML = '&#128172;<span>WhatsApp</span>';
      document.body.appendChild(whatsapp);
    }
    if (!document.querySelector('.back-to-top')) {
      var backTop = document.createElement('button');
      backTop.className = 'back-to-top';
      backTop.type = 'button';
      backTop.setAttribute('data-action', 'back-top');
      backTop.setAttribute('aria-label', 'Back to top');
      backTop.innerHTML = '&#8593;';
      document.body.appendChild(backTop);
    }
  }

  function updateLanguage() {
    var lang = language();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('.lang-button').forEach(function (button) {
      button.textContent = t('language');
    });
  }

  function setLanguage(next) {
    try { localStorage.setItem(KEYS.language, next === 'ar' ? 'ar' : 'en'); } catch (error) {}
    updateLanguage();
    renderHome();
    renderShop();
    renderProductDetails();
    renderCartPage();
    renderWishlistPage();
    renderCheckoutSummary();
    translateStaticContent();
  }

  function renderHome() {
    renderProducts(document.getElementById('home-featured'), allProducts().filter(function (product) { return product.featured; }).slice(0, 4));
    renderProducts(document.getElementById('home-best'), allProducts().filter(function (product) { return product.bestSeller; }).slice(0, 4));
    renderProducts(document.getElementById('home-new'), allProducts().filter(function (product) { return product.newArrival; }).slice(0, 4));
  }

  function bindShop() {
    var catalog = document.getElementById('catalog');
    if (!catalog || catalog.dataset.bound) return;
    catalog.dataset.bound = 'true';
    document.querySelectorAll('[data-shop-filter]').forEach(function (input) {
      input.addEventListener('input', renderShop);
      input.addEventListener('change', renderShop);
    });
    var reset = document.getElementById('reset-filters');
    if (reset) {
      reset.addEventListener('click', function () {
        document.querySelectorAll('[data-shop-filter]').forEach(function (input) {
          if (input.type === 'checkbox') input.checked = false;
          else if (input.id === 'shop-price') input.value = input.max;
          else if (input.tagName === 'SELECT') input.selectedIndex = 0;
          else input.value = '';
        });
        renderShop();
      });
    }
    var requestedGender = new URLSearchParams(location.search).get('gender');
    if (requestedGender) {
      var genderInput = Array.from(document.querySelectorAll('[data-filter-gender]')).find(function (input) {
        return input.value === requestedGender;
      });
      if (genderInput) genderInput.checked = true;
    }
  }

  function renderShop() {
    var catalog = document.getElementById('catalog');
    if (!catalog) return;
    var search = (document.getElementById('shop-search') || {}).value || '';
    var maxPrice = Number((document.getElementById('shop-price') || {}).value || Number.MAX_SAFE_INTEGER);
    var gender = Array.from(document.querySelectorAll('[data-filter-gender]:checked')).map(function (item) { return item.value; });
    var types = Array.from(document.querySelectorAll('[data-filter-type]:checked')).map(function (item) { return item.value; });
    var best = (document.getElementById('filter-best') || {}).checked;
    var newest = (document.getElementById('filter-new') || {}).checked;
    var sale = (document.getElementById('filter-sale') || {}).checked;
    var sort = (document.getElementById('shop-sort') || {}).value || 'featured';
    var needle = search.toLowerCase().trim();
    var products = allProducts().filter(function (product) {
      var searchable = [product.name, product.nameAr, product.category, product.type, product.description].join(' ').toLowerCase();
      return product.price <= maxPrice &&
        (!needle || searchable.includes(needle)) &&
        (!gender.length || gender.includes(product.gender)) &&
        (!types.length || types.includes(product.type)) &&
        (!best || product.bestSeller) && (!newest || product.newArrival) && (!sale || product.onSale);
    });
    products.sort(function (a, b) {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'newest') return Number(b.newArrival) - Number(a.newArrival);
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
    renderProducts(catalog, products);
    var count = document.getElementById('result-count');
    if (count) count.textContent = t('results', { count: products.length });
    var priceOutput = document.getElementById('shop-price-output');
    if (priceOutput) priceOutput.textContent = money(maxPrice);
  }

  function renderProductDetails() {
    var target = document.getElementById('product-detail');
    if (!target) return;
    var query = new URLSearchParams(location.search);
    var product = getProduct(query.get('slug') || query.get('id'));
    if (!product) {
      target.innerHTML = '<div class="empty-state"><h1>Fragrance not found</h1><p>The selected fragrance may have moved or is no longer available.</p><a class="button" href="shop.html">' + esc(t('backToShop')) + '</a></div>';
      return;
    }
    var saved = getWishlist().includes(product.id);
    document.title = productName(product) + ' | NAFEES Perfumes';
    var descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = productDescription(product);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = (config.siteUrl || location.origin) + '/product-details.html?slug=' + encodeURIComponent(product.slug);
    var gallery = (product.gallery || [product.image]).map(function (image, index) {
      return '<button class="gallery-thumb' + (index === 0 ? ' active' : '') + '" type="button" data-action="gallery-image" data-image="' + esc(image) + '" aria-label="View image ' + (index + 1) + '">' +
        '<img src="' + esc(image) + '" alt="" loading="lazy" decoding="async"></button>';
    }).join('');
    target.innerHTML = '<div class="detail-gallery"><div class="detail-main">' + productImage(product, 'detail-image') + '</div><div class="gallery-thumbs">' + gallery + '</div></div>' +
      '<div class="detail-info"><div class="eyebrow">' + esc(productCategory(product)) + ' / ' + esc(productGender(product)) + '</div><h1>' + esc(productName(product)) + '</h1>' +
      '<div class="rating" aria-label="' + esc(product.rating + ' out of 5 stars') + '">&#9733;&#9733;&#9733;&#9733;&#9733; <span>' + esc(product.rating) + ' / 5 · ' + esc(product.reviewCount) + ' reviews</span></div>' +
      '<p>' + esc(productDescription(product)) + '</p><div class="price">' + money(product.price) + (product.oldPrice ? '<span class="old-price">' + money(product.oldPrice) + '</span>' : '') + '</div>' +
      '<p class="stock ' + (product.stock ? '' : 'stock-out') + '">' + esc(product.stock ? (product.stock < 6 ? t('lowStock', { count: product.stock }) : t('inStock')) : t('outStock')) + '</p>' +
      '<dl class="notes"><div><dt>Top notes</dt><dd>' + esc(product.notes.top) + '</dd></div><div><dt>Middle notes</dt><dd>' + esc(product.notes.middle) + '</dd></div><div><dt>Base notes</dt><dd>' + esc(product.notes.base) + '</dd></div></dl>' +
      '<p class="detail-meta">' + esc(productType(product)) + ' · ' + esc(product.size) + '</p><div class="purchase-row"><div class="quantity" aria-label="Quantity"><button type="button" data-action="detail-quantity" data-change="-1" aria-label="Decrease quantity">−</button><input id="detail-quantity" type="number" min="1" max="' + esc(product.stock) + '" value="1" inputmode="numeric" aria-label="Quantity"><button type="button" data-action="detail-quantity" data-change="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="button" type="button" data-action="detail-add" data-product-id="' + esc(product.id) + '"' + (product.stock ? '' : ' disabled') + '>' + esc(product.stock ? t('add') : t('outStock')) + '</button>' +
      '<button class="heart detail-heart' + (saved ? ' active' : '') + '" type="button" data-action="wishlist" data-wishlist-id="' + esc(product.id) + '" aria-label="Save to wishlist" aria-pressed="' + (saved ? 'true' : 'false') + '">&#9825;</button></div>' +
      '<button class="text-link share-link" type="button" data-action="share-product" data-product-id="' + esc(product.id) + '">' + esc(t('share')) + '</button></div>';
    var related = allProducts().filter(function (item) {
      return item.id !== product.id && (item.category === product.category || item.gender === product.gender);
    }).slice(0, 4);
    renderProducts(document.getElementById('related-products'), related);
  }

  function renderSummary(target) {
    if (!target) return;
    var totals = cartTotals();
    target.innerHTML = '<h2>' + esc(t('cart')) + '</h2><div class="summary-line"><span>' + esc(t('subtotal')) + '</span><span>' + money(totals.subtotal) + '</span></div>' +
      '<div class="summary-line"><span>' + esc(t('discount')) + '</span><span>' + (totals.savings ? '−' + money(totals.savings) : money(0)) + '</span></div>' +
      '<div class="summary-line"><span>' + esc(t('delivery')) + '</span><span>' + (totals.delivery ? money(totals.delivery) : 'Complimentary') + '</span></div>' +
      '<div class="summary-line total"><span>' + esc(t('total')) + '</span><span>' + money(totals.total) + '</span></div>';
  }

  function renderCartPage() {
    var list = document.getElementById('cart-items');
    var summary = document.getElementById('cart-summary');
    if (!list && !summary) return;
    var totals = cartTotals();
    renderSummary(summary);
    if (!list) return;
    if (!totals.items.length) {
      list.innerHTML = '<div class="empty-state"><h2>' + esc(t('emptyCart')) + '</h2><p>Explore the collection and find your signature.</p><a class="button" href="shop.html">' + esc(t('continue')) + '</a></div>';
      return;
    }
    list.innerHTML = totals.items.map(function (item) {
      var product = item.product;
      return '<article class="cart-item"><a href="product-details.html?slug=' + encodeURIComponent(product.slug) + '">' + productImage(product, '') + '</a><div><h3><a href="product-details.html?slug=' + encodeURIComponent(product.slug) + '">' + esc(productName(product)) + '</a></h3><p>' + esc(productType(product)) + ' · ' + esc(product.size) + '</p><div class="quantity" aria-label="Quantity"><button type="button" data-action="cart-change" data-product-id="' + esc(product.id) + '" data-change="-1" aria-label="Decrease quantity">−</button><input value="' + esc(item.line.quantity) + '" readonly aria-label="Quantity"><button type="button" data-action="cart-change" data-product-id="' + esc(product.id) + '" data-change="1" aria-label="Increase quantity">+</button></div></div><div class="cart-item-end"><b class="price">' + money(product.price * item.line.quantity) + '</b><button class="cart-remove" type="button" data-action="remove-cart" data-product-id="' + esc(product.id) + '">Remove</button></div></article>';
    }).join('');
  }

  function renderWishlistPage() {
    var target = document.getElementById('wishlist-items');
    if (!target) return;
    var products = getWishlist().map(getProduct).filter(Boolean);
    if (!products.length) {
      target.innerHTML = '<div class="empty-state"><h2>' + esc(t('emptyWishlist')) + '</h2><a class="button" href="shop.html">' + esc(t('continue')) + '</a></div>';
      return;
    }
    renderProducts(target, products);
  }

  function renderCheckoutSummary() {
    renderSummary(document.getElementById('checkout-summary'));
    var disabled = !cartTotals().items.length;
    var button = document.querySelector('#checkout-form button[type="submit"]');
    if (button) button.disabled = disabled;
  }

  function setFieldError(field, message) {
    var holder = document.querySelector('[data-error-for="' + CSS.escape(field.name) + '"]');
    if (holder) holder.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateCheckout(form) {
    var valid = true;
    var fields = ['fullName', 'phone', 'email', 'governorate', 'city', 'address'];
    fields.forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      var value = cleanText(field.value);
      var message = '';
      if (!value) message = 'This field is required.';
      if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Enter a valid email address.';
      if (name === 'phone' && value && !/^(?:\+20|0020|0)?1[0125][0-9]{8}$/.test(value.replace(/[\s-]/g, ''))) message = 'Enter a valid Egyptian mobile number.';
      setFieldError(field, message);
      if (message) valid = false;
    });
    return valid;
  }

  async function createOrder(form) {
    if (form.dataset.submitting === 'true') return;
    var totals = cartTotals();
    if (!totals.items.length) {
      showToast('Your cart is empty.');
      return;
    }
    if (!validateCheckout(form)) return;
    var status = document.getElementById('checkout-status');
    form.dataset.submitting = 'true';
    var submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;
    var orderRequest = {
      customer: {
        fullName: cleanText(form.elements.fullName.value),
        phone: cleanText(form.elements.phone.value),
        email: cleanText(form.elements.email.value),
        governorate: cleanText(form.elements.governorate.value),
        city: cleanText(form.elements.city.value),
        address: cleanText(form.elements.address.value),
        notes: cleanText(form.elements.notes.value)
      },
      items: totals.items.map(function (item) {
        return { product: item.product.id, quantity: item.line.quantity };
      }),
      payment: 'Cash on Delivery'
    };
    try {
      var payload = await window.NAFEES_API.request('/orders', { method: 'POST', body: orderRequest });
      var order = payload.order;
      var orders = readJSON(KEYS.orders, []);
      if (!Array.isArray(orders)) orders = [];
      orders.unshift(order);
      writeJSON(KEYS.orders, orders);
      saveCart([]);
      location.href = 'order-success.html?order=' + encodeURIComponent(order.number);
    } catch (error) {
      form.dataset.submitting = 'false';
      if (submit) submit.disabled = false;
      if (status) status.textContent = error.message;
    }
  }

  function bindCheckout() {
    var form = document.getElementById('checkout-form');
    if (!form || form.dataset.bound) return;
    form.querySelectorAll('input[name="payment"]:not([value="cod"])').forEach(function (input) {
      var option = input.closest('.payment-option');
      if (option) option.remove();
    });
    if (form.elements.payment) form.elements.payment.value = 'cod';
    form.dataset.bound = 'true';
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      createOrder(form);
    });
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.name) setFieldError(field, '');
      });
    });
  }

  function renderOrderSuccess() {
    var target = document.getElementById('order-success-content');
    if (!target) return;
    var number = new URLSearchParams(location.search).get('order');
    var order = readJSON(KEYS.orders, []).find(function (item) { return item.number === number; });
    target.innerHTML = '';
    var title = document.createElement('h1');
    title.textContent = t('orderSuccess');
    var message = document.createElement('p');
    message.textContent = order ? 'Thank you, ' + order.customer.fullName + '. Your order ' + order.number + ' has been created. We will confirm it by phone shortly.' : 'Your order details could not be found in this browser.';
    var actions = document.createElement('div');
    actions.className = 'hero-actions';
    var shop = document.createElement('a');
    shop.className = 'button';
    shop.href = 'shop.html';
    shop.textContent = t('backToShop');
    actions.appendChild(shop);
    target.appendChild(title);
    target.appendChild(message);
    target.appendChild(actions);
  }

  function openModal(markup, trigger) {
    var root = document.getElementById('site-modal-root');
    if (!root) return;
    state.lastFocus = trigger || document.activeElement;
    root.innerHTML = '<div class="modal open" role="dialog" aria-modal="true" aria-label="NAFEES dialog"><div class="modal-box" tabindex="-1"><button class="modal-close" type="button" data-action="close-modal" aria-label="' + esc(t('close')) + '">&times;</button>' + markup + '</div></div>';
    state.activeModal = root.querySelector('.modal');
    document.body.classList.add('no-scroll');
    translateStaticContent();
    var focusable = state.activeModal.querySelector('.modal-close');
    if (focusable) focusable.focus();
  }

  function closeModal() {
    var root = document.getElementById('site-modal-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
    state.activeModal = null;
  }

  function openSearch(trigger) {
    openModal('<div class="eyebrow">Find your signature</div><h2>' + esc(t('search')) + ' NAFEES</h2><div class="search-field modal-search"><input id="site-search" type="search" autocomplete="off" placeholder="Search fragrance, note or type" aria-label="Search fragrances"><button type="button" aria-label="Search">&#128269;</button></div><div class="search-results" id="site-search-results"><p>Search by fragrance, note or category.</p></div>', trigger);
    var input = document.getElementById('site-search');
    if (input) setTimeout(function () { input.focus(); }, 0);
  }

  function renderSearch(term) {
    var target = document.getElementById('site-search-results');
    if (!target) return;
    var needle = String(term || '').toLowerCase().trim();
    if (!needle) {
      target.innerHTML = '<p>' + (language() === 'ar' ? 'ابحث باسم العطر أو النوتة أو الفئة.' : 'Search by fragrance, note or category.') + '</p>';
      return;
    }
    var matches = allProducts().filter(function (product) {
      return [product.name, product.nameAr, product.category, product.type, product.description, product.notes.top, product.notes.middle, product.notes.base].join(' ').toLowerCase().includes(needle);
    }).slice(0, 6);
    target.innerHTML = matches.length ? matches.map(function (product) {
      return '<a class="search-result" href="product-details.html?slug=' + encodeURIComponent(product.slug) + '">' + productImage(product, '') + '<span><b>' + esc(productName(product)) + '</b><br><small>' + esc(productCategory(product)) + ' · ' + money(product.price) + '</small></span></a>';
    }).join('') : '<p>' + (language() === 'ar' ? 'لم نجد عطراً مطابقاً لبحثك.' : 'No fragrance matched that search.') + '</p>';
  }

  function openQuickView(id, trigger) {
    var product = getProduct(id);
    if (!product) return;
    openModal('<div class="quick-view"><div class="quick-view-image">' + productImage(product, '') + '</div><div><div class="eyebrow">' + esc(productCategory(product)) + '</div><h2>' + esc(productName(product)) + '</h2><div class="rating">&#9733;&#9733;&#9733;&#9733;&#9733; <span>' + esc(product.rating) + ' / 5</span></div><p>' + esc(productDescription(product)) + '</p><div class="price">' + money(product.price) + (product.oldPrice ? '<span class="old-price">' + money(product.oldPrice) + '</span>' : '') + '</div><p>' + esc(product.size) + ' · ' + esc(productType(product)) + '</p><div class="hero-actions"><button class="button" type="button" data-action="add-cart" data-product-id="' + esc(product.id) + '"' + (product.stock ? '' : ' disabled') + '>' + esc(product.stock ? t('add') : t('outStock')) + '</button><a class="button ghost" href="product-details.html?slug=' + encodeURIComponent(product.slug) + '">' + esc(t('details')) + '</a></div></div></div>', trigger);
  }

  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = String(message);
    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  function bindGlobalEvents() {
    document.addEventListener('click', function (event) {
      var action = event.target.closest('[data-action]');
      if (!action) return;
      var type = action.dataset.action;
      if (type === 'toggle-menu') {
        var menu = document.getElementById('nav-links');
        if (menu) {
          var open = menu.classList.toggle('open');
          action.setAttribute('aria-expanded', open ? 'true' : 'false');
          action.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
      }
      if (type === 'toggle-language') setLanguage(language() === 'en' ? 'ar' : 'en');
      if (type === 'open-search') openSearch(action);
      if (type === 'close-modal') closeModal();
      if (type === 'quick-view') openQuickView(action.dataset.productId, action);
      if (type === 'wishlist') toggleWishlist(action.dataset.wishlistId);
      if (type === 'add-cart') addToCart(action.dataset.productId, 1);
      if (type === 'detail-add') {
        var input = document.getElementById('detail-quantity');
        addToCart(action.dataset.productId, input ? Number(input.value) : 1);
      }
      if (type === 'detail-quantity') {
        var quantity = document.getElementById('detail-quantity');
        if (quantity) quantity.value = String(Math.min(Number(quantity.max) || Infinity, Math.max(1, (Number(quantity.value) || 1) + Number(action.dataset.change))));
      }
      if (type === 'cart-change') changeCartQuantity(action.dataset.productId, Number(action.dataset.change));
      if (type === 'remove-cart') removeFromCart(action.dataset.productId);
      if (type === 'clear-cart') {
        saveCart([]);
        renderCartPage();
        renderCheckoutSummary();
        showToast(language() === 'ar' ? 'تم إفراغ السلة.' : 'Your cart has been cleared.');
      }
      if (type === 'move-to-cart') {
        if (addToCart(action.dataset.productId, 1)) toggleWishlist(action.dataset.productId);
      }
      if (type === 'gallery-image') {
        var image = document.querySelector('.detail-main .detail-image');
        if (image) image.src = action.dataset.image;
        document.querySelectorAll('.gallery-thumb').forEach(function (button) { button.classList.toggle('active', button === action); });
      }
      if (type === 'share-product') {
        var product = getProduct(action.dataset.productId);
        var url = config.siteUrl + '/product-details.html?slug=' + encodeURIComponent(product.slug);
        if (navigator.share) navigator.share({ title: product.name, text: product.description, url: url }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { showToast('Product link copied.'); }).catch(function () { showToast(url); });
        else showToast(url);
      }
      if (type === 'back-top') window.scrollTo({ top: 0, behavior: 'smooth' });
      if (type === 'customer-logout') {
        localStorage.removeItem('nafeesToken');
        location.reload();
      }
    });
    document.addEventListener('input', function (event) {
      if (event.target.id === 'site-search') renderSearch(event.target.value);
      if (event.target.id === 'detail-quantity') event.target.value = String(Math.min(Number(event.target.max) || Infinity, Math.max(1, Number(event.target.value) || 1)));
    });
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('modal')) closeModal();
      if (event.target.closest('#nav-links a')) {
        var menu = document.getElementById('nav-links');
        var button = document.querySelector('[data-action="toggle-menu"]');
        if (menu) menu.classList.remove('open');
        if (button) { button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Open menu'); }
      }
    });
    document.addEventListener('error', function (event) {
      var image = event.target;
      if (image && image.matches && image.matches('img[data-product-image]') && !image.dataset.fallback) {
        image.dataset.fallback = 'true';
        image.src = 'Images/favicon.svg';
      }
    }, true);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.activeModal) closeModal();
      if (event.key === 'Tab' && state.activeModal) {
        var focusable = Array.from(state.activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (element) { return !element.disabled; });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener('scroll', function () {
      var header = document.getElementById('site-header');
      var top = document.querySelector('.back-to-top');
      if (header) header.classList.toggle('scrolled', window.scrollY > 20);
      if (top) top.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
  }

  function initContact() {
    var emailLink = document.getElementById('contact-email-link');
    var phoneLink = document.getElementById('contact-phone-link');
    var whatsappLink = document.getElementById('contact-whatsapp-link');
    if (emailLink) {
      emailLink.href = 'mailto:' + (config.email || '');
      emailLink.textContent = config.email || '';
    }
    if (phoneLink) {
      phoneLink.href = 'tel:+' + String(config.whatsappNumber || '').replace(/\D/g, '');
      phoneLink.textContent = config.phoneDisplay || '';
    }
    if (whatsappLink) whatsappLink.href = whatsappUrl();
    var form = document.querySelector('form[name="contact"]');
    if (form) form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var status = document.getElementById('contact-status');
      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try {
        await window.NAFEES_API.request('/contact', {
          method: 'POST',
          body: {
            name: cleanText(form.elements.name.value),
            phone: cleanText(form.elements.phone.value),
            email: cleanText(form.elements.email.value),
            subject: cleanText(form.elements.subject.value),
            message: cleanText(form.elements.message.value)
          }
        });
        form.reset();
        if (status) status.textContent = 'Thank you. Your message has been received.';
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        if (button) button.disabled = false;
      }
    });
    if (new URLSearchParams(location.search).get('submitted') === 'true') {
      var status = document.getElementById('contact-status');
      if (status) status.textContent = 'Thank you. Your message has been submitted and the NAFEES concierge will reply soon.';
    }
  }

  function initNewsletter() {
    var form = document.querySelector('form[name="newsletter"]');
    if (!form) return;
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var button = form.querySelector('button[type="submit"]');
      var status = document.getElementById('newsletter-status');
      if (button) button.disabled = true;
      try {
        var payload = await window.NAFEES_API.request('/newsletter', {
          method: 'POST',
          body: { email: cleanText(form.elements.email.value) }
        });
        form.reset();
        if (status) status.textContent = payload.message;
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  async function loadCustomerAccount() {
    var authPanel = document.getElementById('account-auth');
    var profilePanel = document.getElementById('account-profile');
    var ordersTarget = document.getElementById('account-orders');
    var token = localStorage.getItem('nafeesToken');
    if (!authPanel || !profilePanel || !token) return false;
    try {
      var results = await Promise.all([
        window.NAFEES_API.request('/auth/me'),
        window.NAFEES_API.request('/orders/mine')
      ]);
      var user = results[0].user || results[0].data || results[0];
      var orders = results[1].orders || results[1].data || [];
      authPanel.hidden = true;
      authPanel.style.display = 'none';
      profilePanel.hidden = false;
      profilePanel.style.display = '';
      var name = document.getElementById('account-name');
      var email = document.getElementById('account-email');
      if (name) name.textContent = user.name || 'Customer';
      if (email) email.textContent = user.email || '';
      if (ordersTarget) {
        ordersTarget.innerHTML = orders.length ? orders.map(function (order) {
          var reference = order.orderNumber || order._id || '';
          var date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
          return '<article class="account-order"><div><strong>' + esc(reference) + '</strong><span>' + esc(date) +
            '</span></div><div><span class="status-pill">' + esc(order.status || 'Pending') +
            '</span><strong>' + money(order.total || 0) + '</strong></div></article>';
        }).join('') : '<p class="muted">You have not placed any orders yet.</p>';
      }
      return true;
    } catch (error) {
      localStorage.removeItem('nafeesToken');
      authPanel.hidden = false;
      authPanel.style.display = '';
      profilePanel.hidden = true;
      profilePanel.style.display = 'none';
      return false;
    }
  }

  function initAccount() {
    var loginForm = document.getElementById('customer-login');
    var registerForm = document.getElementById('customer-register');
    if (!loginForm && !registerForm) return;
    loadCustomerAccount();

    async function authenticate(form, path) {
      var status = document.getElementById('account-status');
      var button = form.querySelector('button[type="submit"]');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (status) status.textContent = '';
      if (button) button.disabled = true;
      try {
        var body = {
          email: cleanText(form.elements.email.value),
          password: form.elements.password.value
        };
        if (form.elements.name) body.name = cleanText(form.elements.name.value);
        var payload = await window.NAFEES_API.request(path, { method: 'POST', body: body });
        localStorage.setItem('nafeesToken', payload.token);
        syncCustomerCollection('cart', getCart());
        syncCustomerCollection('wishlist', getWishlist());
        await loadCustomerAccount();
        form.reset();
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        if (button) button.disabled = false;
      }
    }

    if (loginForm) loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      authenticate(loginForm, '/auth/login');
    });
    if (registerForm) registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      authenticate(registerForm, '/auth/register');
    });
  }

  async function init() {
    migrateStorage();
    if (window.NAFEES_API) await window.NAFEES_API.loadProducts();
    mountChrome();
    updateLanguage();
    updateCartCount();
    bindGlobalEvents();
    bindShop();
    bindCheckout();
    renderHome();
    renderShop();
    renderProductDetails();
    renderCartPage();
    renderWishlistPage();
    renderCheckoutSummary();
    renderOrderSuccess();
    initContact();
    initNewsletter();
    initAccount();
    translateStaticContent();
    document.documentElement.classList.add('js-ready');
  }

  document.addEventListener('DOMContentLoaded', init);
  window.NAFEES = {
    config: config,
    products: allProducts,
    getProduct: getProduct,
    money: money,
    getCart: getCart,
    getWishlist: getWishlist,
    cartTotals: cartTotals,
    addToCart: addToCart,
    showToast: showToast,
    setLanguage: setLanguage,
    keys: KEYS
  };
}());
