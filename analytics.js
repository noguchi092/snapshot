(() => {
  'use strict';
  // Count only the trial site, including when this code is copied elsewhere.
  if (location.hostname !== 'snapshot.daitoku-inc.com') return;
  const id = 'G-RGRJXPT6NN';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, {
    page_location: location.origin + location.pathname,
    page_referrer: document.referrer.split(/[?#]/)[0],
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: 'snapshot.daitoku-inc.com'
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(script);
})();
