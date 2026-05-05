/* ═══════════════════════════════════════════════════════════════
   profile.js — Profile page: instagram grid, now playing, avatar,
                crop editor, level progress, YouTube, fans, pin,
                detail view, media management.
   Deferred. Depends on app.js (window.S, window.PLAT),
             firebase.js (_saveSiteConfig, _uploadFile).

   Owns: all profile page interactive features.
   ═══════════════════════════════════════════════════════════════ */

/* ══ Crop state ══════════════════════════════════════════════════ */
window._cropPositions = window._cropPositions || {};
window._cropSaturation = window._cropSaturation || {};
window._cropZoom = window._cropZoom || {};
try {
  window._cropPositions = JSON.parse(localStorage.getItem('fd_crop_positions') || '{}');
} catch (e) {}
try {
  window._cropSaturation = JSON.parse(localStorage.getItem('fd_crop_saturation') || '{}');
} catch (e) {}
try {
  window._cropZoom = JSON.parse(localStorage.getItem('fd_crop_zoom') || '{}');
} catch (e) {}

/* ══ Instagram grid ══════════════════════════════════════════════ */
function _saveInstaGrid() {
  var cells = Array.from(document.querySelectorAll('#grid-gallery .insta-cell')).map(
    function (cell) {
      var img = cell.querySelector('img');
      var a = cell.querySelector('a');
      return {
        src: img ? img.src : '',
        href: a ? a.href : '',
        alt: img ? img.alt : '',
        title: cell.getAttribute('title') || '',
        carousel: cell.classList.contains('is-carousel'),
      };
    },
  );
  window._saveSiteConfig && window._saveSiteConfig({ insta_posts: cells });
}

function _saveInstaTrash() {
  var trash = (window._instaTrash || []).map(function (item) {
    return {
      src: item.src,
      href: item.href,
      alt: item.alt,
      title: item.title,
      carousel: !!item.carousel,
      html: item.html,
    };
  });
  window._saveSiteConfig && window._saveSiteConfig({ insta_trash: trash });
}

function _showRestoreToast() {
  var toast = document.getElementById('insta-restore-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'insta-restore-toast';
    toast.style.cssText =
      "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--s3,#222);color:var(--ink);border:1px solid var(--border2);border-radius:6px;padding:8px 14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;z-index:9000;display:flex;align-items:center;gap:10px;opacity:0;transition:opacity .2s;pointer-events:none";
    toast.innerHTML =
      '<span>Post removed</span><button onclick="restoreLastInsta()" style="background:var(--pk,#e8d5c4);color:#111;border:none;border-radius:3px;padding:3px 8px;font-family:\'DM Mono\',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;font-weight:700">UNDO</button>';
    document.body.appendChild(toast);
  }
  clearTimeout(window._restoreToastTimer);
  toast.style.pointerEvents = 'all';
  requestAnimationFrame(function () {
    toast.style.opacity = '1';
  });
  window._restoreToastTimer = setTimeout(function () {
    toast.style.opacity = '0';
    setTimeout(function () {
      toast.style.pointerEvents = 'none';
    }, 200);
  }, 4000);
}

function deleteInstaCell(btn, alt) {
  var cell = btn.closest('.insta-cell');
  if (!cell) return;
  var img = cell.querySelector('img');
  var a = cell.querySelector('a');
  window._instaTrash = window._instaTrash || [];
  window._instaTrash.push({
    src: img ? img.src : '',
    href: a ? a.href : '',
    alt: img ? img.alt : '',
    title: cell.getAttribute('title') || '',
    carousel: cell.classList.contains('is-carousel'),
    html: cell.outerHTML,
  });
  cell.style.transition = 'opacity .2s,transform .2s';
  cell.style.opacity = '0';
  cell.style.transform = 'scale(0.8)';
  setTimeout(function () {
    cell.remove();
    _saveInstaGrid();
    _showRestoreToast();
    _saveInstaTrash();
    if (typeof renderDeletedGrid === 'function') renderDeletedGrid();
  }, 200);
}
window.deleteInstaCell = deleteInstaCell;

function restoreLastInsta() {
  var trash = window._instaTrash;
  if (!trash || !trash.length) return;
  var item = trash.pop();
  var grid = document.getElementById('grid-gallery');
  if (!grid) return;
  var temp = document.createElement('div');
  temp.innerHTML = item.html;
  var cell = temp.firstElementChild;
  if (!cell) return;
  cell.style.opacity = '0';
  cell.style.transform = 'scale(0.8)';
  cell.style.transition = 'opacity .2s,transform .2s';
  grid.prepend(cell);
  requestAnimationFrame(function () {
    cell.style.opacity = '1';
    cell.style.transform = 'scale(1)';
  });
  _saveInstaGrid();
  var toast = document.getElementById('insta-restore-toast');
  if (toast) {
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
  }
  if (trash.length) setTimeout(_showRestoreToast, 300);
}
window.restoreLastInsta = restoreLastInsta;

function restoreSingleInsta(idx) {
  var trash = window._instaTrash;
  if (!trash || !trash[idx]) return;
  var item = trash.splice(idx, 1)[0];
  var grid = document.getElementById('grid-gallery');
  if (grid) {
    var temp = document.createElement('div');
    temp.innerHTML = item.html;
    var cell = temp.firstElementChild;
    if (cell) {
      cell.style.opacity = '0';
      cell.style.transition = 'opacity .2s';
      grid.prepend(cell);
      requestAnimationFrame(function () {
        cell.style.opacity = '1';
      });
      _saveInstaGrid();
    }
  }
  _saveInstaTrash();
  renderDeletedGrid();
}
window.restoreSingleInsta = restoreSingleInsta;

function renderDeletedGrid() {
  var container = document.getElementById('recently-deleted-grid');
  var empty = document.getElementById('recently-deleted-empty');
  if (!container) return;
  var trash = window._instaTrash || [];
  container.innerHTML = '';
  if (!trash.length) {
    container.style.display = 'none';
    if (empty) empty.style.display = '';
    return;
  }
  container.style.display = 'grid';
  if (empty) empty.style.display = 'none';
  trash.forEach(function (item, idx) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;background:var(--s2);overflow:hidden';
    var img = document.createElement('img');
    img.src = item.src;
    img.style.cssText = 'width:100%;height:auto;display:block;opacity:0.7';
    img.onerror = function () {
      this.style.opacity = '0.2';
    };
    var btn = document.createElement('button');
    btn.textContent = 'Restore';
    btn.className = 'setting-btn';
    btn.style.cssText =
      'position:absolute;bottom:4px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;padding:3px 8px';
    btn.onclick = function () {
      restoreSingleInsta(idx);
    };
    wrap.appendChild(img);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  });
}
window.renderDeletedGrid = renderDeletedGrid;

function addInstaPost(postUrl, imgUrl) {
  if (!postUrl || !imgUrl) return;
  var grid = document.getElementById('grid-gallery');
  if (!grid) {
    alert('Navigate to the Profile page first.');
    return;
  }
  var shortcode = (postUrl.match(/\/p\/([^/]+)/) || [])[1] || Date.now();
  var cell = document.createElement('div');
  cell.className = 'insta-cell';
  cell.title = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  cell.innerHTML =
    '<a href="' +
    postUrl +
    '" target="_blank" style="display:block;width:100%">' +
    '<img src="' +
    imgUrl +
    '" style="width:100%;height:auto;display:block" alt="' +
    shortcode +
    '" ' +
    'onerror=\'this.closest(".insta-cell").style.opacity="0.2",this.closest(".insta-cell").style.pointerEvents="none"\' loading="lazy"></a>' +
    '<button onclick=\'event.preventDefault(),event.stopPropagation(),deleteInstaCell(this,"' +
    shortcode +
    '")\' class="insta-cell-delete" title="Remove">✕</button>';
  cell.style.opacity = '0';
  cell.style.transition = 'opacity .25s';
  grid.prepend(cell);
  requestAnimationFrame(function () {
    cell.style.opacity = '1';
  });
  _saveInstaGrid();
}
window.addInstaPost = addInstaPost;

function toggleCarousel(btn) {
  var cell = btn.closest('.insta-cell');
  if (cell) {
    cell.classList.toggle('is-carousel');
    _saveInstaGrid();
  }
}
window.toggleCarousel = toggleCarousel;

/* ══ Crop editor ═════════════════════════════════════════════════ */
function saveCropPositions() {
  try {
    localStorage.setItem('fd_crop_positions', JSON.stringify(window._cropPositions));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ crop_positions: window._cropPositions });
}

function saveCropSaturation() {
  try {
    localStorage.setItem('fd_crop_saturation', JSON.stringify(window._cropSaturation));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ crop_saturation: window._cropSaturation });
}

function saveCropZoom() {
  try {
    localStorage.setItem('fd_crop_zoom', JSON.stringify(window._cropZoom));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ crop_zoom: window._cropZoom });
}

function applyImgFilter(img, alt) {
  var sat = window._cropSaturation[alt];
  var filter = sat !== undefined && sat < 100 ? 'saturate(' + sat + '%)' : '';
  img.style.filter = filter;
  var cell = img.closest('.insta-cell');
  if (cell && cell.style.backgroundImage) cell.style.filter = filter;
}

function applyCropToImg(img, alt) {
  var cell = img.closest('.insta-cell');
  if (!cell) return;
  var zoom = window._cropZoom[alt] || 1;
  var pos = window._cropPositions[alt] || { x: 50, y: 50 };
  cell.style.backgroundImage = "url('" + img.src + "')";
  cell.style.backgroundSize = zoom <= 1 ? 'cover' : 100 * zoom + '%';
  cell.style.backgroundRepeat = 'no-repeat';
  cell.style.backgroundPosition = pos.x + '% ' + pos.y + '%';
  img.style.opacity = '0';
}

function applyAllCrops() {
  document.querySelectorAll('.insta-cell').forEach(function (cell) {
    var img = cell.querySelector('img');
    var alt = img && img.alt;
    if (!alt) return;
    applyImgFilter(img, alt);
    if (
      window._cropPositions[alt] &&
      typeof window._cropPositions[alt] === 'object' &&
      window._cropZoom[alt]
    ) {
      applyCropToImg(img, alt);
    } else if (window._cropPositions[alt] && typeof window._cropPositions[alt] === 'string') {
      delete window._cropPositions[alt];
    }
  });
}
window.applyAllCrops = applyAllCrops;

function openCropPicker(alt, imgEl) {
  document.querySelector('.crop-picker-popup') &&
    document.querySelector('.crop-picker-popup').remove();
  var pos = window._cropPositions[alt] || { x: 50, y: 50 };
  var zoom = window._cropZoom[alt] || 1;
  var sat = window._cropSaturation[alt] !== undefined ? window._cropSaturation[alt] : 100;
  var panX = 0,
    panY = 0,
    dragging = false,
    initX,
    initY,
    SIZE = 300;

  var overlay = document.createElement('div');
  overlay.className = 'crop-picker-popup';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

  var box = document.createElement('div');
  box.style.cssText =
    'background:rgba(12,11,10,0.97);border:1px solid rgba(237,232,222,0.15);padding:16px;display:flex;flex-direction:column;gap:10px;border-radius:6px;box-shadow:0 20px 60px rgba(0,0,0,0.8);width:340px;';
  box.onclick = function (e) {
    e.stopPropagation();
  };

  var head = document.createElement('div');
  head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
  head.innerHTML =
    '<span style="font-family:DM Mono,monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(237,232,222,0.5);">Crop & Style</span>' +
    '<button id="crop-close-btn" style="background:none;border:none;color:rgba(237,232,222,0.4);cursor:pointer;font-size:16px;padding:0;">✕</button>';
  box.appendChild(head);

  var canvas = document.createElement('div');
  canvas.style.cssText =
    'position:relative;width:' +
    SIZE +
    'px;height:' +
    SIZE +
    'px;overflow:hidden;border:1px solid rgba(237,232,222,0.12);cursor:crosshair;user-select:none;background:#111;flex-shrink:0;align-self:center;';

  var previewImg = document.createElement('img');
  previewImg.src = imgEl.src;
  previewImg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';

  var grid = document.createElement('div');
  grid.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  grid.innerHTML =
    '<div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.15);transform:translateX(-50%);"></div>' +
    '<div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.15);transform:translateY(-50%);"></div>' +
    '<div style="position:absolute;inset:0;border:2px solid rgba(212,160,181,0.3);"></div>';

  canvas.appendChild(previewImg);
  canvas.appendChild(grid);
  box.appendChild(canvas);

  var info = document.createElement('div');
  info.style.cssText =
    'font-family:DM Mono,monospace;font-size:8px;color:rgba(237,232,222,0.3);text-align:center;';
  box.appendChild(info);

  var initialized = false;
  function redraw() {
    var nw = previewImg.naturalWidth || 400;
    var nh = previewImg.naturalHeight || 400;
    var w = Math.round(nw * zoom);
    var h = Math.round(nh * zoom);
    if (!initialized) {
      initialized = true;
      panX = (pos.x / 100) * Math.max(1, w - SIZE);
      panY = (pos.y / 100) * Math.max(1, h - SIZE);
    }
    panX = Math.max(0, Math.min(panX, w - SIZE));
    panY = Math.max(0, Math.min(panY, h - SIZE));
    previewImg.style.width = w + 'px';
    previewImg.style.height = h + 'px';
    previewImg.style.left = -panX + 'px';
    previewImg.style.top = -panY + 'px';
    var px = w > SIZE ? Math.round((panX / (w - SIZE)) * 100) : 50;
    var py = h > SIZE ? Math.round((panY / (h - SIZE)) * 100) : 50;
    info.textContent = px + '% x, ' + py + '% y  ·  zoom ' + Math.round(zoom * 100) + '%';
  }
  previewImg.complete && previewImg.naturalWidth ? redraw() : (previewImg.onload = redraw);

  var startX, startY, startPanX, startPanY;
  canvas.addEventListener('mousedown', function (e) {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (dragging) {
      panX = startPanX - (e.clientX - startX);
      panY = startPanY - (e.clientY - startY);
      redraw();
    }
  });
  document.addEventListener('mouseup', function () {
    if (dragging) {
      dragging = false;
      canvas.style.cursor = 'crosshair';
    }
  });
  canvas.addEventListener(
    'wheel',
    function (e) {
      e.preventDefault();
      zoom = Math.max(0.5, Math.min(5, zoom + (e.deltaY > 0 ? -0.05 : 0.05)));
      zoomInput.value = Math.round(zoom * 100);
      zoomLabel.textContent = Math.round(zoom * 100) + '%';
      redraw();
    },
    { passive: false },
  );

  function makeSlider(label, min, max, value, step, onChange) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;';
    var lbl = document.createElement('span');
    lbl.style.cssText =
      'font-family:DM Mono,monospace;font-size:8px;color:rgba(237,232,222,0.5);min-width:60px;text-transform:uppercase;letter-spacing:1px;';
    lbl.textContent = label;
    var inp = document.createElement('input');
    inp.type = 'range';
    inp.min = min;
    inp.max = max;
    inp.step = step;
    inp.value = value;
    inp.style.cssText = 'flex:1;accent-color:var(--pk);';
    var val = document.createElement('span');
    val.style.cssText =
      'font-family:DM Mono,monospace;font-size:8px;color:rgba(237,232,222,0.4);min-width:32px;text-align:right;';
    val.textContent = value + '%';
    inp.addEventListener('input', function () {
      val.textContent = inp.value + '%';
      onChange(parseFloat(inp.value));
    });
    row.appendChild(lbl);
    row.appendChild(inp);
    row.appendChild(val);
    return { row: row, input: inp, label: val };
  }

  var zoomSlider = makeSlider('Zoom', 50, 500, Math.round(zoom * 100), 1, function (v) {
    zoom = v / 100;
    redraw();
  });
  var zoomInput = zoomSlider.input;
  var zoomLabel = zoomSlider.label;
  box.appendChild(zoomSlider.row);

  var satSlider = makeSlider('Saturation', 0, 100, sat, 1, function (v) {
    sat = v;
    window._cropSaturation[alt] = sat;
    applyImgFilter(imgEl, alt);
    saveCropSaturation();
  });
  box.appendChild(satSlider.row);

  var actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;margin-top:4px;';
  var applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply Crop';
  applyBtn.style.cssText =
    'flex:1;background:var(--pk);color:#111;border:none;padding:8px;font-family:DM Mono,monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;border-radius:3px;';
  applyBtn.onclick = function () {
    var nw = previewImg.naturalWidth || 400;
    var nh = previewImg.naturalHeight || 400;
    var w = Math.round(nw * zoom);
    var h = Math.round(nh * zoom);
    var px = w > SIZE ? Math.round((panX / (w - SIZE)) * 100) : 50;
    var py = h > SIZE ? Math.round((panY / (h - SIZE)) * 100) : 50;
    window._cropPositions[alt] = { x: px, y: py };
    window._cropZoom[alt] = zoom;
    applyCropToImg(imgEl, alt);
    saveCropPositions();
    saveCropZoom();
    overlay.remove();
  };
  var resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.style.cssText =
    'background:none;color:rgba(237,232,222,0.4);border:1px solid rgba(237,232,222,0.15);padding:8px 12px;font-family:DM Mono,monospace;font-size:9px;cursor:pointer;border-radius:3px;';
  resetBtn.onclick = function () {
    delete window._cropPositions[alt];
    delete window._cropZoom[alt];
    delete window._cropSaturation[alt];
    var cell = imgEl.closest('.insta-cell');
    if (cell) {
      cell.style.backgroundImage = '';
      cell.style.backgroundSize = '';
      cell.style.backgroundPosition = '';
      cell.style.filter = '';
    }
    imgEl.style.opacity = '';
    imgEl.style.filter = '';
    saveCropPositions();
    saveCropZoom();
    saveCropSaturation();
    overlay.remove();
  };
  actions.appendChild(applyBtn);
  actions.appendChild(resetBtn);
  box.appendChild(actions);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });
  document.getElementById('crop-close-btn') &&
    document.getElementById('crop-close-btn').addEventListener('click', function () {
      overlay.remove();
    });
}
window.openCropPicker = openCropPicker;

function wireInstaClickCrop() {
  if (!document.body.classList.contains('talk-admin')) return;
  document.querySelectorAll('.insta-cell img').forEach(function (img) {
    if (img.dataset.cropWired) return;
    img.dataset.cropWired = '1';
    img.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      openCropPicker(img.alt, img);
    });
  });
}
window.wireInstaClickCrop = wireInstaClickCrop;

/* ══ Level progress bar ══════════════════════════════════════════ */
function parseBornString(str) {
  if (!str) return null;
  var s = str
    .replace(/(st|nd|rd|th)/gi, '')
    .replace(/'/g, '\u2019')
    .trim();
  var m = s.match(/'(\d{2})$/);
  if (m) {
    var yr = parseInt(m[1], 10);
    yr = yr > 30 ? 1900 + yr : 2000 + yr;
    s = s.replace(/'\d{2}$/, '') + ' ' + yr;
  }
  var d = new Date(s);
  if (!isNaN(d)) return d;
  d = new Date(s + ' ' + new Date().getFullYear());
  return isNaN(d) ? null : d;
}
window.parseBornString = parseBornString;

function updateLevelProgress() {
  var profile = window.S && window.S.profile;
  if (!profile || !document.getElementById('sl-lvl')) return;
  var match = (profile.level || 'LVL.0').match(/(\d+)/);
  var level = match ? parseInt(match[1], 10) : 0;
  var lvlEl = document.getElementById('sl-lvl');
  if (lvlEl) lvlEl.textContent = 'LVL. ' + level;
  var leftEl = document.getElementById('lvl-num-left');
  var rightEl = document.getElementById('lvl-num-right');
  if (leftEl) leftEl.textContent = level;
  if (rightEl) rightEl.textContent = level + 1;
  var born = parseBornString(profile.born || '');
  var fillEl = document.getElementById('lvl-fill');
  var labelEl = document.getElementById('lvl-bar-label');
  var tipEl = document.getElementById('lvl-tooltip');
  if (born && fillEl && labelEl) {
    var now = new Date();
    var next = new Date(born);
    next.setFullYear(now.getFullYear());
    var prev, nextBday;
    if (next > now) {
      prev = new Date(next);
      prev.setFullYear(next.getFullYear() - 1);
      nextBday = next;
    } else {
      prev = next;
      nextBday = new Date(next);
      nextBday.setFullYear(next.getFullYear() + 1);
    }
    var span = nextBday - prev;
    var pct = Math.max(0, Math.min(100, ((now - prev) / span) * 100));
    var last = parseFloat(fillEl.dataset._last || 0);
    var target = Math.round(pct);
    fillEl.dataset._last = target;
    var t0 = performance.now();
    requestAnimationFrame(function animate(t) {
      var p = Math.min(1, (t - t0) / 900);
      var ease = p < 0.5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1;
      fillEl.style.width = Math.round(last + (target - last) * ease) + '%';
      if (p < 1) requestAnimationFrame(animate);
    });
    labelEl.textContent = prev.toLocaleString(undefined, { month: 'short', day: 'numeric' });
    if (tipEl) tipEl.textContent = Math.ceil((nextBday - now) / 864e5) + ' days to next level';
  } else {
    if (fillEl) fillEl.style.width = '0%';
    if (labelEl) labelEl.textContent = profile.born || '—';
    if (tipEl) tipEl.textContent = '—';
  }
}
window.updateLevelProgress = updateLevelProgress;

/* ══ Fan / follower count ════════════════════════════════════════ */
function formatFans(n) {
  return n >= 1e6
    ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    : n >= 1e3
      ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
      : n.toString();
}
window.formatFans = formatFans;

function recalcFans() {
  var platforms = ['tiktok', 'instagram', 'youtube', 'spotify', 'twitch'];
  var total = platforms.reduce(function (sum, p) {
    var el = document.getElementById('ep-followers-' + p);
    return el && el.value.trim() !== '' ? sum + (parseInt(el.value) || 0) : sum;
  }, 0);
  var totalEl = document.getElementById('ep-fans-total');
  if (totalEl) totalEl.textContent = total > 0 ? total.toLocaleString() : '—';
  var statEl = document.getElementById('stat-followers');
  if (statEl) statEl.textContent = total > 0 ? formatFans(total) : '—';
  window.S.profile.followerCounts = window.S.profile.followerCounts || {};
  platforms.forEach(function (p) {
    var el = document.getElementById('ep-followers-' + p);
    if (el && el.value.trim() !== '') window.S.profile.followerCounts[p] = parseInt(el.value) || 0;
  });
  try {
    localStorage.setItem('famed0ll_profile', JSON.stringify(window.S.profile));
  } catch (e) {}
  window._saveSiteConfig &&
    window._saveSiteConfig({ profile: JSON.parse(JSON.stringify(window.S.profile)) });
  return total;
}
window.recalcFans = recalcFans;

var _fanSaveTimer = null;
function updateFanCount(platform, value) {
  if (!document.body.classList.contains('talk-admin')) return;
  var count = parseInt(value) || 0;
  window.S.profile.followerCounts = window.S.profile.followerCounts || {};
  window.S.profile.followerCounts[platform] = count;
  var fanEl = document.getElementById('fans-' + platform);
  if (fanEl) fanEl.textContent = count > 0 ? formatFans(count) : '—';
  var total = Object.values(window.S.profile.followerCounts).reduce(function (a, b) {
    return a + b;
  }, 0);
  var statEl = document.getElementById('stat-followers');
  if (statEl) statEl.textContent = total > 0 ? formatFans(total) : '—';
  var modalTotal = document.getElementById('fans-modal-total');
  if (modalTotal) modalTotal.textContent = total > 0 ? formatFans(total) : '—';
  var epEl = document.getElementById('ep-followers-' + platform);
  if (epEl) epEl.value = count > 0 ? count : '';
  try {
    localStorage.setItem('famed0ll_profile', JSON.stringify(window.S.profile));
  } catch (e) {}
  clearTimeout(_fanSaveTimer);
  _fanSaveTimer = setTimeout(function () {
    window._saveSiteConfig &&
      window._saveSiteConfig({ profile: JSON.parse(JSON.stringify(window.S.profile)) });
  }, 800);
}
window.updateFanCount = updateFanCount;

function openFansModal() {
  var platforms = ['tiktok', 'instagram', 'youtube', 'spotify', 'twitch'];
  var counts = window.S.profile.followerCounts || {};
  platforms.forEach(function (p) {
    var count = counts[p] && counts[p] > 0 ? counts[p] : 0;
    var fanEl = document.getElementById('fans-' + p);
    if (fanEl) fanEl.textContent = count > 0 ? formatFans(count) : '—';
    var inpEl = document.getElementById('fans-input-' + p);
    if (inpEl) inpEl.value = count > 0 ? count : '';
    var epEl = document.getElementById('ep-followers-' + p);
    if (epEl) epEl.value = count > 0 ? count : '';
  });
  var total = platforms.reduce(function (s, p) {
    return s + (counts[p] || 0);
  }, 0);
  var modalTotal = document.getElementById('fans-modal-total');
  if (modalTotal) modalTotal.textContent = total > 0 ? formatFans(total) : '—';
  var modal = document.getElementById('fans-modal');
  if (modal) modal.classList.add('open');
}
window.openFansModal = openFansModal;

function closeFansModal(e) {
  if (e && e.target !== document.getElementById('fans-modal')) return;
  var modal = document.getElementById('fans-modal');
  if (modal) modal.classList.remove('open');
}
window.closeFansModal = closeFansModal;

/* ══ Profile edit modal ══════════════════════════════════════════ */
var _epAvatarData = null;

function openEditModal() {
  if (!document.body.classList.contains('talk-admin')) return;
  var p = window.S.profile;
  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val || '';
  }
  setVal('ep-realname', p.realname);
  setVal('ep-level', p.level);
  setVal('ep-born', p.born);
  setVal('ep-origin', p.origin);
  var bioEl = document.getElementById('ep-bio');
  if (bioEl) bioEl.value = p.bio || '';
  var counts = p.followerCounts || {};
  ['tiktok', 'instagram', 'youtube', 'spotify', 'twitch'].forEach(function (pl) {
    var el = document.getElementById('ep-followers-' + pl);
    if (el) el.value = counts[pl] != null ? counts[pl] : '';
  });
  recalcFans();
  _epAvatarData = p.avatar;
  refreshEpAvatar();
  var urlEl = document.getElementById('ep-avatar-url');
  if (urlEl) urlEl.value = p.avatar && !p.avatar.startsWith('data:') ? p.avatar : '';
  var modal = document.getElementById('edit-modal');
  if (modal) modal.classList.add('open');
}
window.openEditModal = openEditModal;

function closeEditModal(e) {
  if (e && e.target !== document.getElementById('edit-modal')) return;
  var modal = document.getElementById('edit-modal');
  if (modal) modal.classList.remove('open');
  _epAvatarData = null;
  var inp = document.getElementById('ep-avatar-input');
  if (inp) inp.value = '';
}
window.closeEditModal = closeEditModal;

function refreshEpAvatar() {
  var el = document.getElementById('ep-av-preview');
  if (!el) return;
  el.innerHTML = _epAvatarData
    ? '<img src="' +
      _epAvatarData +
      '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>'
    : '<svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:none;stroke:var(--ink3);stroke-width:.9;"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
}
window.refreshEpAvatar = refreshEpAvatar;

function handleAvatarUpload(e) {
  var file = e.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    _epAvatarData = ev.target.result;
    refreshEpAvatar();
  };
  reader.readAsDataURL(file);
}
window.handleAvatarUpload = handleAvatarUpload;

function handleAvatarUrl(url) {
  if (url && url.trim()) {
    _epAvatarData = url.trim();
    refreshEpAvatar();
  }
}
window.handleAvatarUrl = handleAvatarUrl;

function saveProfile() {
  var p = window.S.profile;
  function gv(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  var dn = gv('ep-displayname'),
    rn = gv('ep-realname'),
    lv = gv('ep-level'),
    br = gv('ep-born'),
    or_ = gv('ep-origin');
  var bioEl = document.getElementById('ep-bio');
  var bio = bioEl ? bioEl.value : null;
  if (dn) p.displayName = dn;
  if (rn) p.realname = rn;
  if (lv) p.level = lv;
  if (br) p.born = br;
  if (or_) p.origin = or_;
  if (typeof bio === 'string') p.bio = bio;
  if (_epAvatarData) p.avatar = _epAvatarData;
  /* Spotify / Apple from edit modal */
  var spotify = gv('ep-spotify'),
    apple = gv('ep-apple');
  if (spotify) p.spotify = spotify;
  else delete p.spotify;
  if (apple) p.apple = apple;
  else delete p.apple;
  /* Follower counts */
  p.followerCounts = p.followerCounts || {};
  ['tiktok', 'instagram', 'youtube', 'spotify', 'twitch'].forEach(function (pl) {
    var el = document.getElementById('ep-followers-' + pl);
    if (el && el.value.trim() !== '') p.followerCounts[pl] = parseInt(el.value) || 0;
  });
  /* Update DOM */
  var displayName = p.displayName || 'FAME DOLL';
  var dnEl = document.getElementById('sl-display-name');
  if (dnEl) dnEl.textContent = displayName;
  else {
    var slName = document.querySelector('.sl-name');
    if (slName) slName.textContent = displayName;
  }
  var rnEl = document.getElementById('sl-realname');
  if (rnEl) rnEl.textContent = p.realname || '';
  var orEl = document.getElementById('sl-origin');
  if (orEl) orEl.innerHTML = p.origin || '';
  var biEl = document.getElementById('sl-bio');
  if (biEl) biEl.textContent = p.bio || '';
  var ntEl = document.getElementById('sl-np-title');
  if (ntEl) ntEl.textContent = p.npTitle || '';
  var naEl = document.getElementById('sl-np-artist');
  if (naEl) naEl.textContent = p.npArtist || '';
  if (p.avatar) {
    var avInner = document.getElementById('sl-avatar-inner');
    if (avInner)
      avInner.innerHTML =
        '<img src="' +
        p.avatar +
        '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  }
  updateNpLinksVisibility();
  updateLevelProgress();
  var total = Object.values(p.followerCounts).reduce(function (a, b) {
    return a + b;
  }, 0);
  if (total > 0) {
    var sfEl = document.getElementById('stat-followers');
    if (sfEl) sfEl.textContent = formatFans(total);
  }
  try {
    localStorage.setItem('famed0ll_profile', JSON.stringify(p));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ profile: JSON.parse(JSON.stringify(p)) });
  closeEditModal();
  ensureNowPlayingAudio();
  updateNpLinksVisibility();
  if (typeof syncMusicSidebar === 'function') syncMusicSidebar();
}
window.saveProfile = saveProfile;

/* ══ Now Playing ═════════════════════════════════════════════════ */
function openNowPlayingEdit() {
  if (!document.body.classList.contains('talk-admin')) return;
  var p = window.S.profile;
  var titleEl = document.getElementById('npe-title');
  if (titleEl) titleEl.value = p.npTitle || '';
  var artistEl = document.getElementById('npe-artist');
  if (artistEl) artistEl.value = p.npArtist || '';
  var audioUrl = document.getElementById('npe-audio-url');
  if (audioUrl) audioUrl.value = p.audio && p.audio.isUrl ? p.audio.dataUrl : '';
  var spotEl = document.getElementById('npe-spotify');
  if (spotEl) spotEl.value = p.spotify || '';
  var applEl = document.getElementById('npe-apple');
  if (applEl) applEl.value = p.apple || '';
  var previewEl = document.getElementById('npe-audio-preview');
  if (previewEl) previewEl.textContent = p.audio && p.audio.name ? p.audio.name : '';
  var modal = document.getElementById('np-edit-modal');
  if (modal) modal.classList.add('open');
}
window.openNowPlayingEdit = openNowPlayingEdit;

function closeNowPlayingEdit(e) {
  if (e && e.target !== document.getElementById('np-edit-modal')) return;
  var modal = document.getElementById('np-edit-modal');
  if (modal) modal.classList.remove('open');
}
window.closeNowPlayingEdit = closeNowPlayingEdit;

function handleNpeAudioUpload(e) {
  var file = e.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    window.S.profile.audio = { name: file.name, dataUrl: ev.target.result, isUrl: false };
    var previewEl = document.getElementById('npe-audio-preview');
    if (previewEl) previewEl.textContent = file.name;
  };
  reader.readAsDataURL(file);
}
window.handleNpeAudioUpload = handleNpeAudioUpload;

function removeNpeAudio() {
  window.S.profile.audio = null;
  var inp = document.getElementById('npe-audio-input');
  if (inp) inp.value = '';
  var url = document.getElementById('npe-audio-url');
  if (url) url.value = '';
  var pre = document.getElementById('npe-audio-preview');
  if (pre) pre.textContent = '';
}
window.removeNpeAudio = removeNpeAudio;

function saveNowPlaying() {
  var p = window.S.profile;
  function gv(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  var title = gv('npe-title'),
    artist = gv('npe-artist'),
    audioUrl = gv('npe-audio-url'),
    spotify = gv('npe-spotify'),
    apple = gv('npe-apple');
  if (title) p.npTitle = title;
  if (artist) p.npArtist = artist;
  if (audioUrl) p.audio = { name: audioUrl, dataUrl: audioUrl, isUrl: true };
  if (spotify) p.spotify = spotify;
  if (apple) p.apple = apple;
  var ntEl = document.getElementById('sl-np-title');
  if (ntEl) ntEl.textContent = p.npTitle;
  var naEl = document.getElementById('sl-np-artist');
  if (naEl) naEl.textContent = p.npArtist;
  ensureNowPlayingAudio();
  updateNpLinksVisibility();
  if (typeof syncMusicSidebar === 'function') syncMusicSidebar();
  try {
    localStorage.setItem('famed0ll_profile', JSON.stringify(p));
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ profile: JSON.parse(JSON.stringify(p)) });
  closeNowPlayingEdit();
}
window.saveNowPlaying = saveNowPlaying;

var _npAudioEl = null;

function ensureEpAudioPlayer() {
  var previewEl = document.getElementById('ep-audio-preview');
  var existing = document.getElementById('ep-audio-player');
  if (existing) existing.remove();
  if (window.S.profile && window.S.profile.audio && window.S.profile.audio.dataUrl) {
    var audio = document.createElement('audio');
    audio.id = 'ep-audio-player';
    audio.controls = true;
    audio.src = window.S.profile.audio.dataUrl;
    audio.style.cssText = 'width:100%;margin-top:8px;';
    if (previewEl && previewEl.parentNode) previewEl.parentNode.appendChild(audio);
  }
}
window.ensureEpAudioPlayer = ensureEpAudioPlayer;

function ensureNowPlayingAudio() {
  if (!_npAudioEl) {
    _npAudioEl = document.createElement('audio');
    _npAudioEl.id = 'np-audio';
    _npAudioEl.preload = 'auto';
    _npAudioEl.style.display = 'none';
    document.body.appendChild(_npAudioEl);
    _npAudioEl.addEventListener('ended', function () {
      updatePlayUI(false);
    });
    _npAudioEl.addEventListener('timeupdate', function () {
      var bar = document.getElementById('np-progress-fill');
      if (bar && _npAudioEl.duration)
        bar.style.width = (_npAudioEl.currentTime / _npAudioEl.duration) * 100 + '%';
    });
  }
  var src =
    window.S.profile && window.S.profile.audio && window.S.profile.audio.dataUrl
      ? window.S.profile.audio.dataUrl
      : null;
  if (src) {
    if (_npAudioEl.src !== src) _npAudioEl.src = src;
  } else {
    _npAudioEl.removeAttribute('src');
  }
  ensureEpAudioPlayer();
}
window.ensureNowPlayingAudio = ensureNowPlayingAudio;

function playProfileAudio(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  ensureNowPlayingAudio();
  if (_npAudioEl && _npAudioEl.src) {
    if (_npAudioEl.paused) {
      _npAudioEl.play().catch(function () {});
      updatePlayUI(true);
      updateNpLinksVisibility();
    } else {
      _npAudioEl.pause();
      updatePlayUI(false);
    }
  } else {
    toggleNpLinks();
  }
}
window.playProfileAudio = playProfileAudio;

function updatePlayUI(playing) {
  var iconEl = document.getElementById('np-play-icon');
  var btnEl = document.getElementById('np-play-btn');
  var widget = (btnEl && btnEl.closest('.np-widget')) || document.querySelector('.np-widget');
  if (playing) {
    if (iconEl)
      iconEl.innerHTML =
        '<rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"></rect>';
    if (btnEl) {
      btnEl.title = 'Pause';
      btnEl.style.color = 'var(--pk)';
    }
    if (widget) widget.classList.add('playing');
  } else {
    if (iconEl)
      iconEl.innerHTML =
        '<polygon points="5 3 19 12 5 21 5 3" fill="none" stroke="currentColor" stroke-width="1.8"/>';
    if (btnEl) {
      btnEl.title = 'Play';
      btnEl.style.color = '';
    }
    if (widget) widget.classList.remove('playing');
  }
}
window.updatePlayUI = updatePlayUI;

function toggleNpLinks() {
  var el = document.getElementById('np-links');
  if (!el) return;
  el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
  el.style.alignItems = 'center';
}
window.toggleNpLinks = toggleNpLinks;

function updateNpLinksVisibility() {
  var el = document.getElementById('np-links');
  if (!el) return;
  var p = window.S.profile || {};
  var hasLink = p.spotify || p.apple;
  var audioEl = document.getElementById('np-audio');
  var playing = audioEl && (!audioEl.paused || audioEl.currentTime > 0);
  if (hasLink && playing) {
    el.style.display = 'flex';
    el.style.flexDirection = 'row';
  } else {
    el.style.display = 'none';
  }
}
window.updateNpLinksVisibility = updateNpLinksVisibility;

/* ══ External streaming links ════════════════════════════════════ */
function openExternalLink(platform) {
  var p = window.S.profile || {};
  if (window._fbDb_analytics) {
    try {
      window._fbDb_analytics
        .collection('analytics')
        .add({
          type: 'stream_click',
          platform: platform,
          ts: Date.now(),
          d: new Date().toISOString(),
        });
    } catch (e) {}
  }
  if (platform === 'spotify' && p.spotify) window.open(p.spotify, '_blank');
  else if (platform === 'apple' && p.apple) window.open(p.apple, '_blank');
  else {
    var btnEl = document.getElementById(platform === 'spotify' ? 'np-spotify-btn' : 'np-apple-btn');
    if (btnEl) {
      btnEl.style.animation = 'flash-border .28s ease';
      setTimeout(function () {
        btnEl.style.animation = '';
      }, 280);
    }
  }
}
window.openExternalLink = openExternalLink;

/* ══ Post count ══════════════════════════════════════════════════ */
function updatePostCount() {
  var el = document.getElementById('stat-posts');
  if (!el) return;
  var gridCount = document.querySelectorAll('#grid-gallery .insta-cell').length;
  var postCount = Object.values(window.S.posts).reduce(function (s, arr) {
    return s + arr.length;
  }, 0);
  el.textContent = gridCount + postCount;
}
window.updatePostCount = updatePostCount;

/* ══ Featured / pinned ═══════════════════════════════════════════ */
function openPinModal() {
  if (!document.body.classList.contains('talk-admin')) return;
  var modal = document.getElementById('pin-modal');
  if (modal) modal.classList.add('open');
  setTimeout(function () {
    var inp = document.getElementById('pin-url');
    if (inp) inp.focus();
  }, 100);
}
window.openPinModal = openPinModal;

function closePinModal(e) {
  if (e && e.target !== document.getElementById('pin-modal')) return;
  var modal = document.getElementById('pin-modal');
  if (modal) modal.classList.remove('open');
  ['pin-url', 'pin-desc'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var preview = document.getElementById('pin-preview');
  if (preview) preview.classList.remove('show');
  var frame = document.getElementById('pin-iframe');
  if (frame) frame.src = '';
  var submit = document.getElementById('pin-submit');
  if (submit) submit.disabled = true;
  window._pinnedUrl = null;
}
window.closePinModal = closePinModal;


function initProfileBioVisibility() {
  var bio = document.getElementById('sl-bio');
  var block = bio && bio.closest('.sl-bio-block');
  if (!bio || !block || block._bioVisibilityReady) return;
  block._bioVisibilityReady = true;

  function sync() {
    var text = (bio.textContent || '').trim();
    block.style.display = text && text !== '...' ? '' : 'none';
  }

  sync();
  new MutationObserver(sync).observe(bio, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}
window.initProfileBioVisibility = initProfileBioVisibility;
function setFeatureDescText(text) {
  var descEl = document.getElementById('feat-desc-text');
  var descWrap = document.getElementById('feat-desc');
  var descRow = descWrap && descWrap.parentElement;
  var clean = String(text || '').trim();
  var hasText = clean && clean !== '-' && clean !== '—' && clean !== '—';
  if (descEl) descEl.textContent = hasText ? clean : '';
  if (descWrap) descWrap.style.display = hasText ? '' : 'none';
  if (descRow) descRow.style.display = hasText ? '' : 'none';
}
window.setFeatureDescText = setFeatureDescText;
function clearPin() {
  window.S.pinned = null;
  try {
    localStorage.removeItem('famed0ll_pinned');
  } catch (e) {}
  window._saveSiteConfig && window._saveSiteConfig({ pinned: null });
  var frame = document.querySelector('#feat-embed iframe');
  if (frame)
    frame.src =
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLhRgPfuqZrXNrd24d6fXO0ZKhWFm922oM&autoplay=0';
  setFeatureDescText('');
  closePinModal();
}
window.clearPin = clearPin;

var _pinTimer = null;
function handlePinUrl(url) {
  clearTimeout(_pinTimer);
  var submit = document.getElementById('pin-submit');
  if (submit) submit.disabled = true;
  var preview = document.getElementById('pin-preview');
  if (!url.trim()) {
    if (preview) preview.classList.remove('show');
    return;
  }
  _pinTimer = setTimeout(function () {
    var ALL_P = [
      function (u) {
        var m = u.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
        return m ? { id: m[1], embedUrl: 'https://www.instagram.com/p/' + m[1] + '/embed/' } : null;
      },
      function (u) {
        var m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
        return m ? { id: m[1], embedUrl: 'https://www.youtube-nocookie.com/embed/' + m[1] } : null;
      },
      function (u) {
        var m = u.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/);
        return m
          ? {
              id: m[1],
              embedUrl: 'https://platform.twitter.com/embed/Tweet.html?id=' + m[1] + '&theme=dark',
            }
          : null;
      },
    ];
    var parsed = null;
    for (var i = 0; i < ALL_P.length; i++) {
      parsed = ALL_P[i](url);
      if (parsed) break;
    }
    if (parsed) {
      if (preview) preview.classList.add('show');
      var loading = document.getElementById('pin-loading');
      if (loading) loading.style.display = 'flex';
      var frame = document.getElementById('pin-iframe');
      if (frame) {
        frame.style.opacity = '0';
        frame.src = parsed.embedUrl;
        frame.onload = function () {
          if (loading) loading.style.display = 'none';
          frame.style.opacity = '1';
          frame.style.transition = 'opacity .3s';
          if (submit) submit.disabled = false;
          window._pinnedUrl = parsed.embedUrl;
        };
      }
    } else {
      if (preview) preview.classList.remove('show');
    }
  }, 500);
}
window.handlePinUrl = handlePinUrl;

function submitPin() {
  if (!window._pinnedUrl) return;
  var embedUrl = window._pinnedUrl;
  var feat = document.getElementById('feat-embed');
  var ph = document.getElementById('feat-placeholder');
  if (ph) ph.style.display = 'none';
  if (feat) {
    feat.querySelectorAll('iframe').forEach(function (f) {
      f.remove();
    });
    var frame = document.createElement('iframe');
    var autoUrl = embedUrl.includes('autoplay=')
      ? embedUrl
      : embedUrl + (embedUrl.includes('?') ? '&autoplay=1&mute=1' : '?autoplay=1&mute=1');
    frame.src = autoUrl;
    frame.scrolling = 'no';
    frame.allowTransparency = true;
    frame.style.cssText = 'width:100%;height:100%;border:none;';
    feat.appendChild(frame);
  }
  var desc = document.getElementById('pin-desc');
  var descText = desc ? desc.value.trim() : '';
  if (descText) {
    setFeatureDescText(descText);

  }
  window.S.pinned = { embedUrl: embedUrl, desc: descText || '' };
  try {
    localStorage.setItem('famed0ll_pinned', JSON.stringify(window.S.pinned));
  } catch (e) {}
  closePinModal();
}
window.submitPin = submitPin;

/* ══ Render grids (Instagram / posts) ═══════════════════════════ */
function renderGrid(tab) {
  var isTikTok = tab === 'clips';
  var container = document.getElementById('grid-' + tab);
  if (!container) return;
  container.querySelectorAll(isTikTok ? '.tiktok-cell' : '.insta-cell').forEach(function (el) {
    el.remove();
  });
  var emptyEl = container.querySelector('.grid-empty');
  var posts = window.S.posts[tab] || [];
  if (!posts.length) {
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  posts
    .slice()
    .sort(function (a, b) {
      return b.id - a.id;
    })
    .forEach(function (post) {
      var cell = document.createElement('div');
      cell.className = isTikTok ? 'tiktok-cell' : 'insta-cell';
      cell.innerHTML =
        '<iframe src="' +
        post.embedUrl +
        '" scrolling="no" allowtransparency="true" loading="lazy"></iframe>' +
        '<div class="cell-ov"><div class="cell-stat"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
        post.likes.toLocaleString() +
        '</div></div>';
      cell.onclick = function () {
        openDetail(post);
      };
      container.appendChild(cell);
    });
}
window.renderGrid = renderGrid;

/* ── CSS Grid masonry ──────────────────────────────────────────────────────
   Uses img.naturalHeight/naturalWidth so spans are correct even before
   images have painted. Falls back to scrollHeight for non-image cells.
   Called after grid render and after each image loads.              ── */
function _applyMasonry() {
  var grid = document.getElementById('grid-gallery');
  if (!grid) return;
  var rowH = 3; /* matches grid-auto-rows: 3px in main.css */
  var colW = 0;
  var cells = Array.from(grid.querySelectorAll('.insta-cell'));
  if (!cells.length) return;

  /* Get one reliable column width */
  if (cells[0]) colW = cells[0].getBoundingClientRect().width || (grid.offsetWidth / 5);

  cells.forEach(function (cell) {
    var img = cell.querySelector('img');
    var h;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      /* Natural aspect ratio scaled to current column width, +3 for padding-bottom */
      h = Math.round(img.naturalHeight * colW / img.naturalWidth) + 3;
    } else if (img && !img.complete) {
      /* Image not loaded yet — apply a placeholder span and wait */
      cell.style.gridRowEnd = 'span 100';
      img.addEventListener('load', function () {
        requestAnimationFrame(_applyMasonry);
      }, { once: true });
      img.addEventListener('error', function () {
        cell.style.gridRowEnd = 'span 50';
      }, { once: true });
      return;
    } else {
      h = cell.scrollHeight || 100;
    }
    cell.style.gridRowEnd = 'span ' + Math.max(1, Math.ceil(h / rowH));
  });
}
window._applyMasonry = _applyMasonry;

/* ══ YouTube sidebar ═════════════════════════════════════════════ */
var YT_API_KEY = 'AIzaSyDBMSTnP-KFACKIFoCFWnlSPPTIcEs7aco';
var YT_PLAYLIST_ID = 'PLhRgPfuqZrXNrd24d6fXO0ZKhWFm922oM';

async function renderYT() {
  try {
    var listEl = document.getElementById('yt-list');
    var sideEl = document.getElementById('yt-list-side');
    if (!listEl && !sideEl) {
      console.warn('YouTube list elements not found');
      return;
    }

    function clearList(el) {
      if (!el) return null;
      var empty = el.querySelector('.yt-empty');
      el.querySelectorAll('.yt-item').forEach(function (i) {
        i.remove();
      });
      return empty;
    }
    var emptyMain = clearList(listEl);
    var emptySide = clearList(sideEl);
    var cinema = (window.S.posts.cinema || []).slice().sort(function (a, b) {
      return b.id - a.id;
    });

    var featList = document.getElementById('feat-yt-list');

    if (!cinema.length) {
      if (emptyMain) emptyMain.style.display = 'flex';
      if (emptySide) emptySide.style.display = 'flex';
      if (featList)
        featList.querySelectorAll('.feat-yt-item').forEach(function (el) {
          el.remove();
        });
      return;
    }
    if (emptyMain) emptyMain.style.display = 'none';
    if (emptySide) emptySide.style.display = 'none';

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function buildItem(container, post, thumbUrl, title, metaHtml) {
      var item = document.createElement('div');
      item.className = 'yt-item';
      item.innerHTML =
        '<div class="yt-thumb" style="position:relative;"><img src="' +
        thumbUrl +
        '" alt="thumbnail" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:6px;"/></div>' +
        '<div class="yt-info"><div class="yt-title">' +
        esc(title) +
        '</div>' +
        metaHtml +
        '</div>';
      item.onclick = function () {
        var feat = document.getElementById('feat-embed');
        var ph = document.getElementById('feat-placeholder');
        if (ph) ph.style.display = 'none';
        if (feat) {
          feat.querySelectorAll('iframe').forEach(function (f) {
            f.remove();
          });
          var frame = document.createElement('iframe');
          frame.src = post.embedUrl;
          frame.scrolling = 'no';
          frame.allowTransparency = true;
          frame.style.cssText = 'width:100%;height:100%;border:none;';
          feat.appendChild(frame);
        }
        setFeatureDescText(title);

      };
      container.appendChild(item);
      return item;
    }

    for (var i = 0; i < cinema.length; i++) {
      var post = cinema[i];
      var isPlaylist = post.type === 'playlist' && post.playlistId;
      var thumb = isPlaylist
        ? (post.thumbUrl || 'https://i.ytimg.com/vi_webp/default/hqdefault.webp')
        : 'https://i.ytimg.com/vi/' + post.idstr + '/hqdefault.jpg';
      var title = isPlaylist ? post.caption || 'Playlist' : post.caption || 'YouTube Video';
      var seriesMeta = isPlaylist
        ? '<div style="display:flex;align-items:center;gap:8px;width:100%;"><div style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--ink);font-weight:900;letter-spacing:1px;text-transform:uppercase;">SERIES • EPISODES: ' +
          (post.episodeCount || '?') +
          '</div><div class="yt-meta" style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--ink3);margin-left:auto;">' +
          post.time +
          '</div></div>'
        : '<div class="yt-meta" style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--ink3);">' +
          post.time +
          '</div>';
      if (listEl) buildItem(listEl, post, thumb, title, seriesMeta);
      if (sideEl) buildItem(sideEl, post, thumb, title, seriesMeta);
    }

    if (featList) {
      featList.querySelectorAll('.feat-yt-item').forEach(function (el) {
        el.remove();
      });
      cinema.forEach(function (post) {
        var isPlaylistItem = post.type === 'playlist' && post.playlistId;
        var thumb = isPlaylistItem ? (post.thumbUrl || 'https://i.ytimg.com/vi_webp/default/hqdefault.webp') : 'https://i.ytimg.com/vi/' + (post.idstr || '') + '/hqdefault.jpg';
        var seriesTag =
          post.type === 'playlist'
            ? '<div style="margin-left:auto;font-family:\'DM Mono\',monospace;font-size:10px;color:var(--ink3);display:flex;gap:8px;align-items:center;"><span style="letter-spacing:1px;text-transform:uppercase;">SERIES</span><span>•</span><span style="font-weight:900;letter-spacing:1px;">EPISODES: ' +
              (post.episodeCount || '?') +
              '</span></div>'
            : '';
        var item = document.createElement('div');
        item.className = 'feat-yt-item';
        item.innerHTML =
          '<div class="feat-yt-thumb"><img src="' +
          thumb +
          '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"/></div>' +
          '<div class="feat-yt-meta"><div class="feat-yt-title">' +
          esc(post.caption || 'YouTube Video') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><div class="feat-yt-time">' +
          post.time +
          '</div>' +
          seriesTag +
          '</div></div>';
        item.onclick = (function (p) {
          return function () {
            var feat = document.getElementById('feat-embed');
            var ph = document.getElementById('feat-placeholder');
            if (ph) ph.style.display = 'none';
            if (feat) {
              feat.querySelectorAll('iframe').forEach(function (f) {
                f.remove();
              });
              var frame = document.createElement('iframe');
              frame.src = p.embedUrl;
              frame.scrolling = 'no';
              frame.allowTransparency = true;
              frame.style.cssText = 'width:100%;height:100%;border:none;';
              feat.appendChild(frame);
            }
            setFeatureDescText(p.caption || 'YouTube Video');

          };
        })(post);
        featList.appendChild(item);
      });
    }

    /* Async: fetch real titles + playlist thumbnails, update DOM + cache */
    _fetchYTMeta(cinema).catch(function () {});
  } catch (err) {
    console.error('renderYT error:', err);
    throw err;
  }
}
window.renderYT = renderYT;

/* ── Fetch real YouTube titles + playlist thumbnails, patch DOM + cache ── */
async function _fetchYTMeta(cinema) {
  if (!cinema || !cinema.length) return;

  var videoIds = cinema
    .filter(function (p) { return p.idstr && p.type !== 'playlist'; })
    .map(function (p) { return p.idstr; });
  var playlists = cinema.filter(function (p) { return p.type === 'playlist' && p.playlistId; });

  var updated = false;

  /* Fetch video titles */
  if (videoIds.length) {
    try {
      var r = await fetch(
        'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' +
          videoIds.join(',') + '&key=' + YT_API_KEY,
      );
      if (r.ok) {
        var data = await r.json();
        (data.items || []).forEach(function (item) {
          var title = item.snippet && item.snippet.title;
          if (!title) return;
          window.S.posts.cinema.forEach(function (p) {
            if (p.idstr === item.id && p.caption !== title) {
              p.caption = title;
              updated = true;
            }
          });
        });
      }
    } catch (e) {}
  }

  /* Fetch playlist thumbnails + titles */
  if (playlists.length) {
    try {
      var plIds = playlists.map(function (p) { return p.playlistId; }).join(',');
      var pr = await fetch(
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' +
          plIds + '&key=' + YT_API_KEY,
      );
      if (pr.ok) {
        var plData = await pr.json();
        (plData.items || []).forEach(function (item) {
          var snippetThumb =
            item.snippet &&
            item.snippet.thumbnails &&
            (item.snippet.thumbnails.high || item.snippet.thumbnails.medium || item.snippet.thumbnails.default);
          var thumbUrl = snippetThumb ? snippetThumb.url : null;
          var plTitle = item.snippet && item.snippet.title;
          window.S.posts.cinema.forEach(function (p) {
            if (p.playlistId === item.id) {
              if (thumbUrl && p.thumbUrl !== thumbUrl) { p.thumbUrl = thumbUrl; updated = true; }
              if (plTitle && p.caption !== plTitle) { p.caption = plTitle; updated = true; }
            }
          });
        });
      }
    } catch (e) {}
  }

  /* Re-render only if something changed, and cache */
  if (updated) {
    try { localStorage.setItem('famed0ll_posts', JSON.stringify(window.S.posts)); } catch (e) {}
    if (typeof renderYT === 'function') renderYT();
  }
}
window._fetchYTMeta = _fetchYTMeta;

async function fetchYTSubCount() {
  var badge = document.getElementById('yt-sub-badge');
  try {
    if (badge) badge.textContent = '…';
    var plResp = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' +
        YT_PLAYLIST_ID +
        '&key=' +
        YT_API_KEY,
    );
    if (!plResp.ok) throw new Error('playlist lookup failed ' + plResp.status);
    var plData = await plResp.json();
    var channelId =
      plData.items &&
      plData.items[0] &&
      plData.items[0].snippet &&
      plData.items[0].snippet.channelId;
    if (!channelId) throw new Error('channelId not found');
    var chResp = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=' +
        channelId +
        '&key=' +
        YT_API_KEY,
    );
    if (!chResp.ok) throw new Error('channel stats failed ' + chResp.status);
    var chData = await chResp.json();
    var channel = chData.items && chData.items[0];
    if (!channel) throw new Error('no channel item');
    var subs = parseInt(channel.statistics && channel.statistics.subscriberCount, 10) || 0;
    if (badge) badge.textContent = formatFans(subs) + ' subs';
    window.S.profile.followerCounts = window.S.profile.followerCounts || {};
    if (subs > (window.S.profile.followerCounts.youtube || 0)) {
      window.S.profile.followerCounts.youtube = subs;
      var total = Object.values(window.S.profile.followerCounts).reduce(function (a, b) {
        return a + b;
      }, 0);
      if (total > 0) {
        var statEl = document.getElementById('stat-followers');
        if (statEl) statEl.textContent = formatFans(total);
      }
      var ytEpEl = document.getElementById('ep-followers-youtube');
      if (ytEpEl) {
        ytEpEl.value = subs;
        recalcFans();
      }
      try {
        localStorage.setItem('famed0ll_profile', JSON.stringify(window.S.profile));
      } catch (e) {}
    }
  } catch (e) {
    console.warn('[famed0ll] fetchYTSubCount failed:', e.message);
    if (badge) badge.textContent = '— subs';
  }
}

window._ytSubFetchDone = false;
var _origShowPageForYT = window.showPage;
window.showPage = function (page) {
  var result = _origShowPageForYT(page);
  if ((page === 'music' || page === 'profile') && !window._ytSubFetchDone) {
    window._ytSubFetchDone = true;
    setTimeout(fetchYTSubCount, 300);
  }
  return result;
};

/* ══ Detail view modal ═══════════════════════════════════════════ */
function openDetail(post) {
  if (!post) return;
  window.S.currentPost = post;
  var mediaEl = document.getElementById('det-media');
  if (mediaEl)
    mediaEl.innerHTML =
      '<iframe src="' + post.embedUrl + '" scrolling="no" allowtransparency="true"></iframe>';
  var likeBtn = document.getElementById('da-like');
  if (likeBtn) likeBtn.classList.toggle('liked', !!post.liked);
  var saveBtn = document.getElementById('da-save');
  if (saveBtn) saveBtn.classList.toggle('saved', !!post.saved);
  var likesEl = document.getElementById('da-likes');
  if (likesEl) likesEl.textContent = post.likes.toLocaleString() + ' likes';
  var timeEl = document.getElementById('da-time');
  if (timeEl) timeEl.textContent = post.time.toUpperCase();
  var comments = document.getElementById('det-comments');
  if (comments) {
    comments.innerHTML = '';
    if (post.caption) {
      var capDiv = document.createElement('div');
      capDiv.className = 'dc';
      capDiv.innerHTML =
        '<div class="dc-av">FD</div><div class="dc-body"><div class="dc-text"><strong>famed0ll</strong> ' +
        post.caption +
        '</div><div class="dc-meta">' +
        post.time +
        '</div></div>';
      comments.appendChild(capDiv);
    }
    (post.comments || []).forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'dc';
      div.innerHTML =
        '<div class="dc-av">' +
        (c.user || '').slice(0, 2).toUpperCase() +
        '</div>' +
        '<div class="dc-body"><div class="dc-text"><strong>' +
        c.user +
        '</strong> ' +
        c.text +
        '</div>' +
        '<div class="dc-meta">' +
        (c.time || 'just now') +
        '</div></div>';
      comments.appendChild(div);
    });
  }
  var modal = document.getElementById('detail-modal');
  if (modal) modal.classList.add('open');
}
window.openDetail = openDetail;

function closeDetail(e) {
  if (e && e.target !== document.getElementById('detail-modal')) return;
  var modal = document.getElementById('detail-modal');
  if (modal) modal.classList.remove('open');
}
window.closeDetail = closeDetail;

function detailLike() {
  var post = window.S.currentPost;
  if (!post) return;
  post.liked = !post.liked;
  post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1));
  var likeBtn = document.getElementById('da-like');
  if (likeBtn) likeBtn.classList.toggle('liked', !!post.liked);
  var likesEl = document.getElementById('da-likes');
  if (likesEl) likesEl.textContent = post.likes.toLocaleString() + ' likes';
}
window.detailLike = detailLike;

function detailSave() {
  var post = window.S.currentPost;
  if (!post) return;
  post.saved = !post.saved;
  var saveBtn = document.getElementById('da-save');
  if (saveBtn) saveBtn.classList.toggle('saved', !!post.saved);
}
window.detailSave = detailSave;

function submitDetComment() {
  var inp = document.getElementById('det-comment-input');
  var post = window.S.currentPost;
  if (!inp || !inp.value.trim() || !post) return;
  post.comments.push({ user: 'you', text: inp.value.trim(), time: 'just now' });
  inp.value = '';
  var btn = document.getElementById('det-post-btn');
  if (btn) btn.classList.remove('ready');
  openDetail(post);
}
window.submitDetComment = submitDetComment;

function openSheet() {
  var el = document.getElementById('sheet-bg');
  if (el) el.classList.add('open');
}
function closeSheet() {
  var el = document.getElementById('sheet-bg');
  if (el) el.classList.remove('open');
}
window.openSheet = openSheet;
window.closeSheet = closeSheet;

/* ══ Add media modal ═════════════════════════════════════════════ */
var _urlTimer = null;

function openAddModal(tab) {
  if (document.body.classList.contains('talk-admin')) openAddModal_real(tab);
}
window.openAddModal = openAddModal;

function openAddModal_real(tab) {
  var PLAT = window.PLAT;
  window.S.addingFor = tab || 'gallery';
  var plat = PLAT[window.S.addingFor];
  var titleMap = { gallery: 'Instagram Post', cinema: 'YouTube Video', talk: 'Tweet' };
  var titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = 'Add ' + (titleMap[window.S.addingFor] || 'TikTok Clip');
  function hRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
      ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16)
      : '255,255,255';
  }
  var tagEl = document.getElementById('modal-tag');
  if (tagEl) {
    tagEl.textContent = plat.label;
    tagEl.style.cssText =
      'background:rgba(' +
      hRgb(plat.ch) +
      ',0.1);color:' +
      plat.ch +
      ";font-family:'DM Mono',monospace;font-size:6px;letter-spacing:2px;padding:2px 7px;margin-left:5px;border-radius:1px;";
  }
  function set(id, val) {
    var el = document.getElementById(id);
    if (el) el[typeof val === 'boolean' ? 'disabled' : 'value'] = val;
  }
  var urlLabelEl = document.getElementById('modal-url-label');
  if (urlLabelEl) urlLabelEl.textContent = plat.urlLabel;
  set('modal-url', '');
  set('modal-caption', '');
  set('modal-likes', '');
  set('modal-time', '');
  var preview = document.getElementById('modal-preview');
  if (preview) preview.classList.remove('show');
  var frame = document.getElementById('modal-iframe');
  if (frame) frame.src = '';
  set('modal-submit', true);
  var modal = document.getElementById('add-modal');
  if (modal) modal.classList.add('open');
  setTimeout(function () {
    var inp = document.getElementById('modal-url');
    if (inp) inp.focus();
  }, 100);
}
window.openAddModal_real = openAddModal_real;

function closeAddModal(e) {
  if (e && e.target !== document.getElementById('add-modal')) return;
  var modal = document.getElementById('add-modal');
  if (modal) modal.classList.remove('open');
}
window.closeAddModal = closeAddModal;

function handleUrl(url) {
  clearTimeout(_urlTimer);
  var submit = document.getElementById('modal-submit');
  var preview = document.getElementById('modal-preview');
  if (submit) submit.disabled = true;
  if (!url.trim()) {
    if (preview) preview.classList.remove('show');
    return;
  }
  _urlTimer = setTimeout(function () {
    var parsed = window.PLAT[window.S.addingFor].parse(url);
    if (parsed) {
      if (preview) preview.classList.add('show');
      var loading = document.getElementById('modal-loading');
      if (loading) loading.style.display = 'flex';
      var frame = document.getElementById('modal-iframe');
      if (frame) {
        frame.style.opacity = '0';
        frame.src = parsed.embedUrl;
        frame.onload = function () {
          if (loading) loading.style.display = 'none';
          frame.style.opacity = '1';
          frame.style.transition = 'opacity .3s';
          if (submit) submit.disabled = false;
        };
      }
    } else {
      if (preview) preview.classList.remove('show');
    }
  }, 500);
}
window.handleUrl = handleUrl;

function submitPost() {
  var urlEl = document.getElementById('modal-url');
  var url = urlEl ? urlEl.value.trim() : '';
  var parsed = window.PLAT[window.S.addingFor].parse(url);
  if (!parsed) return;
  var post = Object.assign(
    {
      id: Date.now(),
      tab: window.S.addingFor,
      platform: window.PLAT[window.S.addingFor].label,
      ch: window.PLAT[window.S.addingFor].ch,
    },
    parsed,
    {
      caption: (document.getElementById('modal-caption') || {}).value || '',
      likes:
        parseInt(((document.getElementById('modal-likes') || {}).value || '').replace(/\D/g, '')) ||
        0,
      time: ((document.getElementById('modal-time') || {}).value || '').trim() || 'just now',
      type: window.PLAT[window.S.addingFor].type,
      comments: [],
      liked: false,
      saved: false,
    },
  );
  window.S.posts[window.S.addingFor].unshift(post);
  if (window.S.addingFor === 'cinema') renderYT();
  else renderGrid(window.S.addingFor);
  updatePostCount();
  try {
    localStorage.setItem('famed0ll_posts', JSON.stringify(window.S.posts));
  } catch (e) {}
  closeAddModal();
}
window.submitPost = submitPost;

/* ══ Latest post widget ══════════════════════════════════════════ */
function updateLatestPostWidget(posts) {
  var widget = document.getElementById('latest-post-widget');
  if (!widget) {
    /* Profile page not in DOM yet — retry once it loads */
    if (posts && posts.length) {
      setTimeout(function () { updateLatestPostWidget(posts); }, 300);
    }
    return;
  }
  var list = posts || [];
  if (!list.length) {
    widget.style.display = 'none';
    return;
  }
  var latest = list[0];
  widget.style.display = 'block';
  var titleEl = document.getElementById('latest-post-text');
  var timeEl = document.getElementById('latest-post-date');
  var latestTitle = (latest.title || 'Latest post').trim();
  var latestText = (latest.content || latest.body || latest.text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (titleEl) {
    titleEl.innerHTML = '';
    titleEl.style.display = 'block';
    titleEl.style.webkitLineClamp = '';
    titleEl.style.webkitBoxOrient = '';
    var titleLine = document.createElement('div');
    titleLine.textContent = latestTitle;
    titleLine.style.cssText = "font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--ink);font-weight:800;line-height:1.35;margin-bottom:5px;";
    var textLine = document.createElement('div');
    textLine.textContent = latestText || 'No preview text yet.';
    textLine.style.cssText = "font-family:'Cormorant Garamond',serif;font-size:13px;line-height:1.45;color:var(--ink2);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;";
    titleEl.appendChild(titleLine);
    titleEl.appendChild(textLine);
  }
  if (timeEl)
    timeEl.textContent = latest.created_at ? new Date(latest.created_at).toLocaleDateString() : '';
}
window.updateLatestPostWidget = updateLatestPostWidget;
window._updateLatestPostWidget = updateLatestPostWidget;

/* ══ Boot: init NP audio ═════════════════════════════════════════ */
setTimeout(function () {
  try {
    ensureNowPlayingAudio();
    updateNpLinksVisibility();
  } catch (e) {}
}, 120);

/* Fix up any stale string-type crop positions */
(function () {
  var changed = false;
  Object.keys(window._cropPositions).forEach(function (k) {
    if (typeof window._cropPositions[k] === 'string') {
      delete window._cropPositions[k];
      changed = true;
    }
  });
  if (changed) saveCropPositions();
  applyAllCrops();
  wireInstaClickCrop();
})();

