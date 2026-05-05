/* ═══════════════════════════════════════════════════════════════
   scrollables.js — Scrollables page: TikTok grid and thumbnail loader.
   Deferred. No external dependencies.

   Owns: TikTok embed sort, scroll-grid overlay toggle,
         thumbnail grid builder.
   Called from: _onPageLoad('scrollables') in pages.js.
   ═══════════════════════════════════════════════════════════════ */

/* ── Overlay toggle (wired to HTML onclick so must be on window) ── */
window.toggleScrollGrid = function () {
  var overlay = document.getElementById('scroll-grid-overlay');
  var btn = document.getElementById('scroll-grid-btn');
  if (!overlay) return;
  var isHidden = overlay.style.display === 'none' || overlay.style.display === '';
  overlay.style.display = isHidden ? 'block' : 'none';
  if (btn) btn.style.display = isHidden ? 'none' : 'flex';
};

window.closeScrollGrid = function () {
  var overlay = document.getElementById('scroll-grid-overlay');
  var btn = document.getElementById('scroll-grid-btn');
  if (overlay) overlay.style.display = 'none';
  if (btn) btn.style.display = 'flex';
};

/* ── Sort TikTok embeds by video ID descending ── */
window._initScrollSort = function () {
  var grid = document.getElementById('scrollables-grid');
  if (!grid) return;
  var embeds = Array.from(grid.querySelectorAll('.tiktok-embed'));
  if (embeds.length < 2) return;
  var sorted = embeds.slice().sort(function (a, b) {
    return (
      (parseInt(b.dataset.videoId || '0', 10) || 0) -
      (parseInt(a.dataset.videoId || '0', 10) || 0)
    );
  });
  var needsReorder = sorted.some(function (el, i) { return el !== embeds[i]; });
  if (needsReorder) sorted.forEach(function (el) { grid.appendChild(el); });
};

/* ── Thumbnail grid builder ── */
window._initScrollThumbs = function () {
  var thumbGrid = document.getElementById('scroll-thumb-grid');
  var mainGrid = document.getElementById('scrollables-grid');
  if (!thumbGrid || !mainGrid) return;
  if (thumbGrid.children.length > 0) return; /* already built */

  setTimeout(async function () {
    var embeds = Array.from(mainGrid.querySelectorAll('.tiktok-embed'));
    var items = embeds
      .map(function (el) {
        var cite = el.getAttribute('cite') || '';
        var captionEl = el.querySelector('section p');
        var caption = captionEl ? captionEl.textContent.trim() : '';
        var userEl = el.querySelector('section a');
        var user = userEl ? userEl.textContent.replace(/^@/, '') : '';
        var vid = el.dataset.videoId || cite.split('/').filter(Boolean).pop() || '';
        return { url: cite, caption: caption, user: user, vid: vid };
      })
      .filter(function (item) { return item.url; });

    if (!items.length) {
      var empty = document.createElement('div');
      empty.style.cssText =
        'color:var(--ink3);font-family:DM Mono,monospace;font-size:12px;padding:8px;';
      empty.textContent = 'No scrollables found — add TikTok links to populate thumbnails.';
      thumbGrid.appendChild(empty);
      return;
    }

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var wrapper = document.createElement('a');
      wrapper.className = 'scroll-thumb';
      wrapper.href = item.url;
      wrapper.target = '_blank';
      wrapper.rel = 'noopener noreferrer';
      wrapper.setAttribute('role', 'listitem');

      var img = document.createElement('img');
      img.alt = item.caption || item.user || 'TikTok';
      img.loading = 'lazy';

      var ov = document.createElement('div');
      ov.className = 'st-overlay';
      var userDiv = document.createElement('div');
      userDiv.className = 'st-user';
      userDiv.textContent = item.user || '';
      var playDiv = document.createElement('div');
      playDiv.className = 'st-play';
      playDiv.textContent = 'Open';
      ov.appendChild(userDiv);
      ov.appendChild(playDiv);
      wrapper.appendChild(img);
      wrapper.appendChild(ov);

      /* Try TikTok CDN thumbnails, fall back to oembed, then initials */
      (function (imgEl, itemData, wrapEl, ovEl) {
        var endpoints = [
          'https://p16-sign-va.tiktokcdn.com/obj/tos-useast5-p-0037/' + itemData.vid + '.webp',
          'https://p16-sign-va.tiktokcdn.com/obj/tos-useast2a-p-0037/' + itemData.vid + '.webp',
          'https://p16-sign-va.tiktokcdn.com/obj/tos-useast1a-p-0037/' + itemData.vid + '.webp',
        ];

        async function tryLoad() {
          for (var j = 0; j < endpoints.length; j++) {
            try {
              await new Promise(function (res, rej) {
                var t = new Image();
                t.onload = res;
                t.onerror = rej;
                t.src = endpoints[j];
                setTimeout(function () { rej(new Error('timeout')); }, 3000);
              });
              return endpoints[j];
            } catch (e) {}
          }
          try {
            var resp = await fetch(
              'https://www.tiktok.com/oembed?url=' + encodeURIComponent(itemData.url),
              { cache: 'force-cache' },
            );
            if (!resp.ok) throw new Error('no oembed');
            var data = await resp.json();
            if (data && data.thumbnail_url) return data.thumbnail_url;
          } catch (e) {}
          return null;
        }

        imgEl.src = endpoints[0];
        tryLoad().then(function (url) {
          if (url && imgEl.src !== url) imgEl.src = url;
        });

        imgEl.addEventListener('error', function () {
          var fallback = document.createElement('div');
          fallback.style.cssText =
            'width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
            'background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.00));' +
            'color:var(--ink3);font-family:DM Mono,monospace;font-size:12px;';
          fallback.textContent = itemData.user ? itemData.user.slice(0, 2).toUpperCase() : 'TK';
          imgEl.remove();
          wrapEl.insertBefore(fallback, ovEl);
        });
      })(img, item, wrapper, ov);

      wrapper.addEventListener('click', function () {
        this.classList.add('clicked');
        var self = this;
        setTimeout(function () { self.classList.remove('clicked'); }, 400);
      });

      thumbGrid.appendChild(wrapper);
    }
  }, 180);
};
