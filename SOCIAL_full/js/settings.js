/* ═══════════════════════════════════════════════════════════════
   settings.js — Settings page logic.
   Deferred. Depends on app.js (window.S), config.js (fdTextureUrl).

   Owns: accent, texture, theme, custom background.
   Called from: pages/settings.html, nav dropdown buttons.
   ═══════════════════════════════════════════════════════════════ */

var ACCENTS = {
  rose: { pk: '#d4a0b5', pk2: '#e8c0d0', label: 'Rose (Default)' },
  lavender: { pk: '#b0a0d0', pk2: '#ccbce0', label: 'Lavender' },
  sage: { pk: '#9cbe94', pk2: '#b8d4b0', label: 'Sage' },
  cyan: { pk: '#8ec5c8', pk2: '#aad8da', label: 'Cyan' },
  amber: { pk: '#c8a878', pk2: '#dfc098', label: 'Amber' },
};

function applyAccent(name) {
  var a = ACCENTS[name];
  if (!a) return;
  document.documentElement.style.setProperty('--pk', a.pk);
  document.documentElement.style.setProperty('--pk2', a.pk2);
  window.S.settings.accent = name;
  document.querySelectorAll('.accent-sw').forEach(function (sw) {
    sw.classList.toggle('on', sw.dataset.accent === name);
  });
  var label = document.getElementById('accent-label');
  if (label) label.textContent = a.label;
  try {
    localStorage.setItem('famed0ll_settings', JSON.stringify(window.S.settings));
  } catch (e) {}
}
window.applyAccent = applyAccent;

function applyAccentPicker(hex) {
  if (!hex || typeof hex !== 'string') return;
  if (/^#?[0-9a-f]{3}$/i.test(hex)) {
    hex =
      '#' +
      hex
        .replace('#', '')
        .split('')
        .map(function (c) {
          return c + c;
        })
        .join('');
  } else if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  document.documentElement.style.setProperty('--pk', hex);
  try {
    var r = parseInt(hex.substr(1, 2), 16),
      g = parseInt(hex.substr(3, 2), 16),
      b = parseInt(hex.substr(5, 2), 16);
    var lighten = function (v) {
      return Math.min(255, Math.round(v + 0.22 * (255 - v)));
    };
    var pk2 =
      '#' +
      [lighten(r), lighten(g), lighten(b)]
        .map(function (v) {
          return v.toString(16).padStart(2, '0');
        })
        .join('');
    document.documentElement.style.setProperty('--pk2', pk2);
  } catch (e) {
    document.documentElement.style.setProperty('--pk2', hex);
  }
  window.S.settings.accent = 'custom';
  window.S.settings.customAccent = hex;
  try {
    localStorage.setItem('famed0ll_settings', JSON.stringify(window.S.settings));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ settings: window.S.settings });
  var label = document.getElementById('accent-label');
  if (label) label.textContent = 'Custom';
  var picked = document.getElementById('accent-picked-label');
  if (picked) picked.textContent = hex.toUpperCase();
  document.querySelectorAll('.accent-sw').forEach(function (sw) {
    sw.classList.remove('on');
  });
}
window.applyAccentPicker = applyAccentPicker;

function toggleTexture(isStone) {
  var url = isStone ? window.fdTextureUrl('stone') : window.fdTextureUrl('concrete');
  document.querySelector('html').style.backgroundImage = "url('" + url + "')";
  document.body.style.backgroundImage = "url('" + url + "')";
  window.S.settings.texture = isStone ? 'stone' : 'concrete';
  var label = document.getElementById('texture-label');
  if (label) label.textContent = isStone ? 'Stone' : 'Concrete';
  try {
    localStorage.setItem('famed0ll_settings', JSON.stringify(window.S.settings));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ settings: window.S.settings });
}
window.toggleTexture = toggleTexture;

function toggleTheme(isLight) {
  window.S.settings.theme = isLight ? 'light' : 'dark';
  var stone = window.fdTextureUrl('stone');
  var concrete = window.fdTextureUrl('concrete');
  var customBg = window.S.settings.customBg || '';
  if (isLight) {
    document.documentElement.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    var t1 = document.getElementById('theme-toggle');
    if (t1) t1.checked = true;
    var t2 = document.getElementById('nav-theme-toggle');
    if (t2) t2.checked = true;
    if (!customBg) {
      document.documentElement.style.backgroundImage = "url('" + stone + "')";
      document.body.style.backgroundImage = "url('" + stone + "')";
    }
  } else {
    document.documentElement.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    var t3 = document.getElementById('theme-toggle');
    if (t3) t3.checked = false;
    var t4 = document.getElementById('nav-theme-toggle');
    if (t4) t4.checked = false;
    if (!customBg) {
      document.documentElement.style.backgroundImage = "url('" + concrete + "')";
      document.body.style.backgroundImage = "url('" + concrete + "')";
    }
  }
  try {
    localStorage.setItem('famed0ll_settings', JSON.stringify(window.S.settings));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ settings: window.S.settings });
}
window.toggleTheme = toggleTheme;

function _applyCustomBgUI(url) {
  var previewWrap = document.getElementById('custom-bg-preview-wrap');
  var preview = document.getElementById('custom-bg-preview');
  var removeRow = document.getElementById('custom-bg-remove-row');
  var input = document.getElementById('custom-bg-input');
  var modeEl = document.getElementById('custom-bg-mode');
  var modalInput = document.getElementById('custom-bg-modal-input');
  if (url) {
    var mode =
      (modeEl && modeEl.value) || (window.S.settings && window.S.settings.customBgMode) || 'tile';
    if (previewWrap) previewWrap.style.display = 'block';
    if (preview) {
      preview.style.backgroundImage = "url('" + url + "')";
      if (mode === 'cover') {
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundRepeat = 'no-repeat';
      } else {
        preview.style.backgroundSize = '38px';
        preview.style.backgroundRepeat = 'repeat';
      }
    }
    if (removeRow) removeRow.style.display = 'flex';
    if (input) input.value = url;
    if (modalInput) modalInput.value = url;
  } else {
    if (previewWrap) previewWrap.style.display = 'none';
    if (preview) {
      preview.style.backgroundImage = '';
      preview.style.backgroundRepeat = '';
      preview.style.backgroundSize = '';
    }
    if (removeRow) removeRow.style.display = 'none';
    if (input) input.value = '';
    if (modalInput) modalInput.value = '';
  }
}
window._applyCustomBgUI = _applyCustomBgUI;

function _applyBgStyle(url, mode) {
  if (mode === 'cover') {
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center center';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.documentElement.style.backgroundRepeat = 'repeat';
    document.documentElement.style.backgroundSize = '38px';
    document.documentElement.style.backgroundPosition = 'left top';
    document.documentElement.style.backgroundAttachment = '';
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundSize = '38px';
    document.body.style.backgroundPosition = 'left top';
    document.body.style.backgroundAttachment = '';
  }
  document.documentElement.style.backgroundImage = "url('" + url + "')";
  document.body.style.backgroundImage = "url('" + url + "')";
}

function setCustomBg() {
  var input = document.getElementById('custom-bg-input');
  var url = (input ? input.value : '').trim();
  if (!url) return;
  url = url.replace(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/, 'https://i.imgur.com/$1.jpg');
  var modeEl = document.getElementById('custom-bg-mode');
  var mode = (modeEl && modeEl.value) || 'tile';
  window.S.settings.customBg = url;
  window.S.settings.customBgMode = mode;
  _applyBgStyle(url, mode);
  _applyCustomBgUI(url);
  var modalPreview = document.getElementById('custom-bg-modal-preview');
  if (modalPreview) {
    if (mode === 'cover') {
      modalPreview.style.backgroundRepeat = 'no-repeat';
      modalPreview.style.backgroundSize = 'cover';
      modalPreview.style.backgroundPosition = 'center center';
    } else {
      modalPreview.style.backgroundRepeat = 'repeat';
      modalPreview.style.backgroundSize = '38px';
      modalPreview.style.backgroundPosition = 'left top';
    }
  }
  try {
    localStorage.setItem('famed0ll_settings', JSON.stringify(window.S.settings));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ settings: window.S.settings });
  var btn =
    document.querySelector('#custom-bg-input + button') || document.querySelector('.setting-btn');
  if (btn) {
    btn.textContent = '✓ Saved';
    setTimeout(function () {
      btn.textContent = 'Set Background';
    }, 1600);
  }
}
window.setCustomBg = setCustomBg;

function removeCustomBg() {
  window.S.settings.customBg = '';
  var url =
    'light' === window.S.settings.theme
      ? window.fdTextureUrl('stone')
      : window.fdTextureUrl('concrete');
  document.documentElement.style.backgroundImage = "url('" + url + "')";
  document.body.style.backgroundImage = "url('" + url + "')";
  document.documentElement.style.backgroundRepeat = '';
  document.documentElement.style.backgroundSize = '';
  document.documentElement.style.backgroundPosition = '';
  document.documentElement.style.backgroundAttachment = '';
  document.body.style.backgroundRepeat = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundPosition = '';
  document.body.style.backgroundAttachment = '';
  _applyCustomBgUI('');
  try {
    localStorage.setItem('famed0ll_settings', JSON.stringify(window.S.settings));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ settings: window.S.settings });
}
window.removeCustomBg = removeCustomBg;

/* ── Self-init: apply saved settings as soon as this file loads ──
   app.js runs first and populates window.S.settings from localStorage.
   settings.js loads after app.js, so ACCENTS and all functions are
   now defined — apply them for real here.
   ─────────────────────────────────────────────────────────────── */
(function () {
  var s = window.S && window.S.settings;
  if (!s) return;

  /* Accent color */
  if (s.accent === 'custom' && s.customAccent) {
    applyAccentPicker(s.customAccent);
  } else if (s.accent) {
    applyAccent(s.accent);
  }

  /* Theme */
  toggleTheme(s.theme === 'light');

  /* Custom background (overrides theme texture) */
  if (s.customBg) {
    _applyBgStyle(s.customBg, s.customBgMode || 'tile');
    _applyCustomBgUI(s.customBg);
  }
})();
