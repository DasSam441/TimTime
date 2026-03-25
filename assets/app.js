(() => {
  'use strict';
  window.TIMTIME_APP = Object.assign(window.TIMTIME_APP || {}, {
    bootstrapped: true
  });
  Promise.resolve()
    .then(() => window.TIMTIME_SHELL?.initApp?.())
    .catch(err => {
      try{ console.error('TimTime init failed', err); }catch{}
    });
})();
