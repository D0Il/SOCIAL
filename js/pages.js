/* ═══════════════════════════════════════════════════════════════
   pages.js — Per-page initialization router.
   Deferred. Depends on all page-specific modules being loaded first.

   Exposes:
     window._onPageLoad — hook called by core.js after HTML inject.

   This file ONLY contains the _onPageLoad router.
   Page-specific logic lives in:
     profile.js    — profile page
     settings.js   — settings page
     live.js       — live page
     music.js      — music page
     scrollables.js — scrollables page
     community.js  — community page
   ═══════════════════════════════════════════════════════════════ */

(function () {
  var _prev = window._onPageLoad;

  window._onPageLoad = function (pageName) {
    if (_prev) {
      try {
        _prev(pageName);
      } catch (e) {}
    }

    switch (pageName) {
      case 'profile':
        /* Restore profile text fields now that DOM exists */
        (function () {
          var p = window.S && window.S.profile;
          if (!p) return;
          function set(id, val, html) {
            var el = document.getElementById(id);
            if (el && val) {
              if (html) el.innerHTML = val;
              else el.textContent = val;
            }
          }
          set('sl-realname', p.realname);
          set('sl-origin', p.origin, true);
          set('sl-bio', p.bio);
          set('sl-np-title', p.npTitle);
          set('sl-np-artist', p.npArtist);
        })();

        /* Render gallery grid if data exists */
        if (typeof renderGrid === 'function' && window.S && window.S.posts.gallery.length > 0) {
          renderGrid('gallery');
        }

        /* Render YouTube list with retry */
        if (typeof renderYT === 'function') {
          setTimeout(async function () {
            var retries = 0;
            while (retries < 5) {
              try {
                await renderYT();
                break;
              } catch (e) {
                retries++;
                if (retries >= 5) break;
                await new Promise(function (res) {
                  setTimeout(res, 200 * retries);
                });
              }
            }
          }, 100);
        }

        if (typeof updateLatestPostWidget === 'function') {
          updateLatestPostWidget(window._cachedBlogPosts || null);
        }
        if (typeof applyAllCrops === 'function') applyAllCrops();
        if (typeof wireInstaClickCrop === 'function') wireInstaClickCrop();
        if (typeof _applyMasonry === 'function') setTimeout(_applyMasonry, 150);
        if (typeof updateLevelProgress === 'function') updateLevelProgress();
        break;

      case 'settings':
        break;

      case 'live':
        if (typeof _renderLiveDesc === 'function' && window._cachedLiveDesc !== undefined) {
          _renderLiveDesc(window._cachedLiveDesc);
        }
        break;

      case 'music':
        if (typeof renderAll === 'function') renderAll();
        if (typeof syncMusicSidebar === 'function') syncMusicSidebar();
        break;

      case 'scrollables':
        var scrollBtn = document.getElementById('scroll-grid-btn');
        if (scrollBtn) scrollBtn.style.display = 'flex';
        if (typeof window._initScrollSort === 'function') window._initScrollSort();
        if (typeof window._initScrollThumbs === 'function') window._initScrollThumbs();
        if (typeof window._refreshScrollEmbeds === 'function') {
          setTimeout(window._refreshScrollEmbeds, 80);
        }
        /* Re-trigger TikTok embed processing */
        if (window.tiktokEmbed && typeof window.tiktokEmbed.lib === 'object') {
          try {
            window.tiktokEmbed.lib.render(
              document.querySelectorAll('.tiktok-embed:not(.rendered)'),
            );
          } catch (e) {}
        }
        if (!document.getElementById('tiktok-embed-js')) {
          var s = document.createElement('script');
          s.id = 'tiktok-embed-js';
          s.src = 'https://www.tiktok.com/embed.js';
          s.async = true;
          document.body.appendChild(s);
        }
        break;

      case 'community':
        /* Force upgrade any new widgetbot custom elements */
        if (window.customElements && window.customElements.get('widgetbot')) {
          document.querySelectorAll('widgetbot').forEach(function (el) {
            if (!el._initialized) window.customElements.upgrade(el);
          });
        }
        break;
    }
  };

  window.__famedoll_visible = true;

  /* ── Catch-up: re-init any pages that loaded before _onPageLoad was defined ──
     pages.js is the last deferred script. If a pre-loaded page (e.g. music, talk)
     finished its _loadPage fetch before pages.js ran, _onPageLoad was null at that
     point and no init happened. We fix that here. */
  Object.keys(window._pageCache || {}).forEach(function (pageName) {
    try {
      window._onPageLoad(pageName);
    } catch (e) {}
  });
})();
