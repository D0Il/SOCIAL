/* ═══════════════════════════════════════════════════════════════
   core.js — SYNCHRONOUS bootstrap. Loads first, no defer/async.

   Exposes:
     window._ls              — safe localStorage wrapper
     window._onResize(fn)    — rAF-debounced resize listener
     window._loadPage(name, cb) — fetch+inject a page HTML file
     window._prefetchPage(name) — fire-and-forget prefetch
     window._onPageLoad      — hook called after page inject (set by pages.js)
     window._pageCache       — {pageName: true} for loaded pages

   Integration: Any module can call window._onResize(fn) for resize
   events or set window._onPageLoad = fn(pageName) to react to page loads.
   ═══════════════════════════════════════════════════════════════ */

// ── Safe localStorage wrapper ─────────────────────────────────────────────
window._ls = {
  get: function(key, fallback) {
    try {
      var val = localStorage.getItem(key);
      return val !== null ? val : (fallback !== undefined ? fallback : null);
    } catch(e) {
      return fallback !== undefined ? fallback : null;
    }
  },
  set: function(key, val) {
    try { localStorage.setItem(key, val); } catch(e) {}
  },
  remove: function(key) {
    try { localStorage.removeItem(key); } catch(e) {}
  }
};

// ── Debounced resize dispatcher ───────────────────────────────────────────
// All resize listeners go through a single rAF — prevents layout thrash.
window._resizeRAF       = null;
window._resizeListeners = [];

window._resizeDispatch = function() {
  if (window._resizeRAF) cancelAnimationFrame(window._resizeRAF);
  window._resizeRAF = requestAnimationFrame(function() {
    window._resizeRAF = null;
    window._resizeListeners.forEach(function(fn) {
      try { fn(); } catch(e) {}
    });
  });
};

window._onResize = function(fn) {
  window._resizeListeners.push(fn);
  window.addEventListener('resize', window._resizeDispatch, { passive: true });
};

// ── Lazy page loader ──────────────────────────────────────────────────────
// Fetches pages/X.html and injects into <div id="page-X" data-page-src="pages/X.html">.
// Called automatically by showPage() in app.js on first visit.
// cb(wasLoaded: boolean) fires when done.
window._pageCache  = {};
window._onPageLoad = null; // hook: pages.js sets this

window._loadPage = function(pageName, cb) {
  var ph = document.getElementById('page-' + pageName);
  if (!ph || !ph.dataset.pageSrc || ph.dataset.loaded) {
    if (cb) cb(false);
    return;
  }
  ph.dataset.loaded = '1';
  fetch(ph.dataset.pageSrc)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var src = tmp.firstElementChild;
      if (src) {
        Array.from(src.attributes).forEach(function(a) {
          if (a.name !== 'data-page-src' && a.name !== 'data-loaded')
            ph.setAttribute(a.name, a.value);
        });
        ph.innerHTML = src.innerHTML;
      }
      window._pageCache[pageName] = true;
      try { if (window._onPageLoad) window._onPageLoad(pageName); } catch(e) {}
      if (cb) cb(true);
    })
    .catch(function() {
      ph.dataset.loaded = '';  // allow retry
      if (cb) cb(false);
    });
};

window._prefetchPage = function(pageName) {
  window._loadPage(pageName, null);
};
