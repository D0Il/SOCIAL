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
  var mainGrid = document.getElementById('scrollables-grid');
  if (!mainGrid) return;

  var targets = [
    document.getElementById('scroll-thumb-grid'),
    document.getElementById('scroll-grid-popup-content'),
  ].filter(Boolean);
  if (!targets.length) return;

  clearTimeout(window._scrollThumbRenderTimer);
  window._scrollThumbRenderTimer = setTimeout(function () {
    var embeds = Array.from(mainGrid.querySelectorAll('.tiktok-embed'));
    var seen = {};
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
      .filter(function (item) {
        if (!item.url || seen[item.url]) return false;
        seen[item.url] = true;
        return true;
      });

    function setFallback(wrapEl, imgEl, ovEl, itemData) {
      if (!imgEl || !imgEl.parentNode) return;
      var fallback = document.createElement('div');
      fallback.style.cssText =
        'width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
        'background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0));' +
        'color:var(--ink3);font-family:DM Mono,monospace;font-size:12px;';
      fallback.textContent = itemData.user ? itemData.user.slice(0, 2).toUpperCase() : 'TK';
      imgEl.remove();
      wrapEl.insertBefore(fallback, ovEl);
    }

    function loadImage(imgEl, url) {
      return new Promise(function (resolve, reject) {
        var done = false;
        var timer = setTimeout(function () {
          if (done) return;
          done = true;
          reject(new Error('timeout'));
        }, 4500);
        imgEl.onload = function () {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(url);
        };
        imgEl.onerror = function () {
          if (done) return;
          done = true;
          clearTimeout(timer);
          reject(new Error('image failed'));
        };
        imgEl.src = url;
      });
    }

    async function resolveThumbUrl(itemData) {
      try {
        var resp = await fetch(
          'https://www.tiktok.com/oembed?url=' + encodeURIComponent(itemData.url),
          { cache: 'force-cache' },
        );
        if (resp.ok) {
          var data = await resp.json();
          if (data && data.thumbnail_url) return data.thumbnail_url;
        }
      } catch (e) {}
      return null;
    }

    function makeThumb(item) {
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

      wrapper.addEventListener('click', function () {
        wrapper.classList.add('clicked');
        setTimeout(function () { wrapper.classList.remove('clicked'); }, 400);
      });

      resolveThumbUrl(item).then(function (url) {
        var candidates = [];
        if (url) candidates.push(url);
        if (item.vid) {
          candidates.push(
            'https://p16-sign-va.tiktokcdn.com/obj/tos-useast5-p-0037/' + item.vid + '.webp',
            'https://p16-sign-va.tiktokcdn.com/obj/tos-useast2a-p-0037/' + item.vid + '.webp',
            'https://p16-sign-va.tiktokcdn.com/obj/tos-useast1a-p-0037/' + item.vid + '.webp',
          );
        }

        function tryCandidate(index) {
          if (index >= candidates.length) {
            setFallback(wrapper, img, ov, item);
            return;
          }
          loadImage(img, candidates[index]).catch(function () {
            tryCandidate(index + 1);
          });
        }
        tryCandidate(0);
      });

      return wrapper;
    }

    targets.forEach(function (target) {
      target.classList.add('scroll-thumb-grid');
      target.innerHTML = '';

      if (!items.length) {
        var empty = document.createElement('div');
        empty.style.cssText =
          'color:var(--ink3);font-family:DM Mono,monospace;font-size:12px;padding:8px;';
        empty.textContent = 'No scrollables found - add TikTok links to populate thumbnails.';
        target.appendChild(empty);
        return;
      }

      items.forEach(function (item) {
        target.appendChild(makeThumb(item));
      });
    });
  }, 260);
};
/* Refresh TikTok embeds after the Scrollables page is visible on mobile. */
window._refreshScrollEmbeds = function () {
  var page = document.getElementById('page-scrollables');
  if (!page) return;
  page.querySelectorAll('.tiktok-embed[data-lazy-pending]').forEach(function (bq) {
    bq.removeAttribute('data-lazy-pending');
  });

  function fitFrames() {
    page.querySelectorAll('.tiktok-embed iframe').forEach(function (frame) {
      frame.style.width = '100%';
      frame.style.minWidth = '0';
      frame.style.minHeight = 'calc(100svh - 118px)';
      frame.style.height = Math.max(560, window.innerHeight - 118) + 'px';
      frame.style.display = 'block';
    });
  }

  function renderEmbeds() {
    if (window.tiktokEmbed && window.tiktokEmbed.lib && window.tiktokEmbed.lib.render) {
      try {
        window.tiktokEmbed.lib.render(page.querySelectorAll('.tiktok-embed'));
      } catch (e) {}
    }
    fitFrames();
    setTimeout(fitFrames, 350);
    setTimeout(function () {
      try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      fitFrames();
    }, 900);
  }

  var script = document.getElementById('tiktok-embed-js');
  if (!script) {
    script = document.createElement('script');
    script.id = 'tiktok-embed-js';
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    script.onload = renderEmbeds;
    document.body.appendChild(script);
  } else {
    renderEmbeds();
  }
};
