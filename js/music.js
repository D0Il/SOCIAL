/* ═══════════════════════════════════════════════════════════════
   music.js — Music page: eras, drops, stream links rendering.
   Deferred. Depends on config.js (ERAS, DROPS, STREAM_LINKS, _eraPhotos),
             firebase.js (_saveSiteConfig, _uploadFile).

   Owns: renderEras, renderDrops, renderStreams, renderAll,
         openEraDetail, closeEraModal, addEra, addDrop,
         syncMusicSidebar, saveAll.
   Called from: pages/music.html, _onPageLoad('music').
   ═══════════════════════════════════════════════════════════════ */

(function () {
  /* ── Ensure default stream links ── */
  if (!STREAM_LINKS || !STREAM_LINKS.length) {
    STREAM_LINKS = window.FD_CFG.streamLinks.map(function (s) {
      return Object.assign({}, s);
    });
  }

  /* ── Ensure Birthday Suit era exists ── */
  if (
    !ERAS.birthday_suit ||
    !(ERAS.birthday_suit.links || []).find(function (l) {
      return l.label === 'Music Video';
    })
  ) {
    _eraPhotos.birthday_suit = 'https://i.imgur.com/ITiSeNm.jpeg';
    ERAS.birthday_suit = {
      name: 'BIRTHDAY SUIT',
      tag: 'Single · MAR 27 2026',
      date: '',
      desc: '',
      status: 'live',
      links: [
        { label: 'Music Video', url: 'https://www.youtube.com/watch?v=7sLFFbPe5hI' },
        {
          label: 'Spotify',
          url: 'https://open.spotify.com/track/1lZ1jrs8QOc0sFs38A32Aj?si=d109cfb870e14fcd',
        },
        { label: 'Apple Music', url: 'https://music.apple.com/ca/song/birthday-suit/1888560707' },
        {
          label: 'iTunes — Buy',
          url: 'https://music.apple.com/us/album/birthday-suit-single/1888560706?uo=4&app=itunes&at=1001lry3&ct=dashboard',
        },
        {
          label: 'Amazon Music — Buy',
          url: 'https://www.amazon.com/music/player/albums/B0GV2XTRDX',
        },
      ],
      appleEmbed: 'https://embed.music.apple.com/ca/song/birthday-suit/1888560707',
    };
  }

  /* ── Stream icons ── */
  var STREAM_ICONS = {
    spotify:
      '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#1ed760"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.72a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.78.78 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.326a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.615z"/></svg>',
    apple:
      '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#fc3c3c"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#ff6666"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    amazon:
      '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#ff9900"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.052-.872-1.238-1.276-1.814-2.106-1.733 1.766-2.962 2.293-5.209 2.293-2.66 0-4.731-1.641-4.731-4.927 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095V6.41c0-.753.06-1.642-.383-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.978 2.069 8.862 1.1 11.43 1.1c1.312 0 3.026.35 4.061 1.342 1.312 1.225 1.187 2.861 1.187 4.641v4.201c0 1.263.523 1.816 1.015 2.496.173.243.211.533-.01.712l-2.54 2.293v.01zM21.814 19.423c-2.626 1.993-6.433 3.052-9.709 3.052-4.596 0-8.732-1.699-11.861-4.527-.246-.222-.027-.526.27-.353 3.377 1.965 7.549 3.147 11.861 3.147 2.908 0 6.107-.603 9.048-1.851.444-.189.813.293.391.532z"/></svg>',
  };

  function _streamIconSvg(platform, iconHtml) {
    var parts = (
      iconHtml.match(
        /(<path[^/]*\/>|<path[^>]*>.*?<\/path>|<circle[^/]*\/>|<polygon[^/]*\/>|<rect[^/]*\/>)/gs,
      ) || []
    ).join('');
    return (
      '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor">' +
      parts +
      '</svg>'
    );
  }

  /* ── Save all music data to localStorage + Firestore ── */
  function saveAll() {
    try {
      localStorage.setItem('fd_eras', JSON.stringify(ERAS));
      localStorage.setItem('fd_drops', JSON.stringify(DROPS));
      localStorage.setItem('fd_streams', JSON.stringify(STREAM_LINKS));
      localStorage.setItem('fd_era_photos', JSON.stringify(_eraPhotos));
    } catch (e) {}
    if (window._saveSiteConfig) {
      try {
        window._saveSiteConfig({
          eras: ERAS,
          era_photos: _eraPhotos,
          drops: DROPS,
          stream_links: STREAM_LINKS,
        });
      } catch (e) {}
    }
  }

  /* ── Render streaming platform links ── */
  function renderStreams() {
    var mainList = document.getElementById('mp-stream-list');
    var sidebarList = document.getElementById('mp-sidebar-streams');
    if (sidebarList) {
      sidebarList.innerHTML = '<div class="mp-sidebar-stream-head">Stream</div>';
      STREAM_LINKS.forEach(function (link) {
        var iconHtml = STREAM_ICONS[link.platform] || '';
        var svgIcon = _streamIconSvg(link.platform, iconHtml);
        var a = document.createElement('a');
        a.className = 'mp-sidebar-stream-link';
        a.href = link.url || '#';
        a.target = '_blank';
        a.innerHTML =
          '<span class="mp-stream-icon-wrap">' +
          svgIcon +
          '</span>' +
          '<span class="mp-sidebar-stream-name">' +
          (link.label || link.platform) +
          '</span>' +
          '<span class="mp-sidebar-stream-arrow">→</span>';
        sidebarList.appendChild(a);
      });
      /* Demos link */
      var demosLink = document.createElement('a');
      demosLink.className = 'mp-sidebar-stream-link';
      demosLink.href = 'https://soundcloud.com/do_ll';
      demosLink.target = '_blank';
      demosLink.style.borderTop = '1px solid var(--border)';
      demosLink.style.marginTop = '4px';
      demosLink.innerHTML =
        '<span class="mp-stream-icon-wrap">' +
        _streamIconSvg(
          'demos',
          '<svg viewBox="0 0 24 24"><path d="M1.175 12.225c-.388 0-.7.313-.7.7v1.4l.35 1.05.35-1.05v-1.4c0-.387-.313-.7-.7-.7zm1.4-.35c-.388 0-.7.313-.7.7v1.75l.35.875.35-.875v-1.75c0-.387-.313-.7-.7-.7zm1.4.35c-.388 0-.7.313-.7.7v1.4l.35.7.35-.7v-1.4c0-.387-.313-.7-.7-.7zm1.4-1.05c-.388 0-.7.313-.7.7v2.45l.35.525.35-.525v-2.45c0-.387-.313-.7-.7-.7zm1.4-1.225c-.388 0-.7.313-.7.7v3.675l.35.35.35-.35V10.65c0-.387-.313-.7-.7-.7zm4.9-2.625C9.7 7.325 8.4 8.625 8.4 10.3v4.725c0 .175.175.35.35.35h7.7c1.925 0 3.5-1.575 3.5-3.5 0-1.75-1.225-3.15-2.975-3.45-.175-2.1-1.925-3.675-4.025-3.675-.7 0-1.4.175-1.925.525z"/></svg>',
        ) +
        '</span><span class="mp-sidebar-stream-name">DEMOS</span><span class="mp-sidebar-stream-arrow">→</span>';
      sidebarList.appendChild(demosLink);
    }
    if (mainList) mainList.innerHTML = '';
  }

  /* ── Render eras grid ── */
  function renderEras() {
    var list = document.getElementById('mp-eras-list');
    if (!list) return;
    list.innerHTML = '';
    Object.keys(ERAS).forEach(function (key) {
      var era = ERAS[key];
      var photo = _eraPhotos[key];
      var card = document.createElement('div');
      card.className = 'mp-era-card-outer';
      card.onclick = function () {
        openEraDetail(key);
      };
      card.innerHTML =
        '<div class="mp-era-card" style="aspect-ratio:1;position:relative;overflow:hidden;">' +
        (photo
          ? '<img src="' + photo + '" alt="' + era.name + '">'
          : '<div class="mp-era-card-placeholder">' + era.name + '</div>') +
        (era.status && era.status !== 'live'
          ? '<div class="mp-era-badge ' + era.status + '">' + era.status + '</div>'
          : '') +
        '</div>' +
        '<div class="mp-era-card-label">' +
        '<div class="mp-era-card-label-title">' +
        era.name +
        '</div>' +
        (era.tag ? '<div class="mp-era-card-label-tag">' + era.tag + '</div>' : '') +
        '</div>';
      list.appendChild(card);
    });
  }

  /* ── Render drops calendar ── */
  function renderDrops() {
    var list = document.getElementById('mp-drops-list');
    if (!list) return;
    list.innerHTML = '';
    DROPS.forEach(function (drop) {
      var el = document.createElement('div');
      el.className = 'mp-drop';
      el.innerHTML =
        '<div class="mp-drop-left">' +
        '<div class="mp-drop-day">' +
        (drop.day || '—') +
        '</div>' +
        '<span class="mp-drop-month">' +
        (drop.month || '') +
        '</span>' +
        '</div>' +
        '<div>' +
        '<div class="mp-drop-title">' +
        drop.title +
        '</div>' +
        '<div class="mp-drop-sub">' +
        (drop.sub || '') +
        '</div>' +
        '</div>' +
        '<div class="mp-drop-type">' +
        (drop.type || '') +
        '</div>';
      list.appendChild(el);
    });
  }

  /* ── Render all music page content ── */
  function renderAll() {
    renderStreams();
    renderEras();
    renderDrops();
  }

  /* ── Music sidebar sync ── */
  function syncMusicSidebar() {
    var profile = window.S && window.S.profile ? window.S.profile : null;
    var avatarEl = document.getElementById('mp-sidebar-avatar');
    var nameEl = document.getElementById('mp-sidebar-name');
    var originEl = document.getElementById('mp-sidebar-origin');
    var bioEl = document.getElementById('mp-sidebar-bio');
    if (profile) {
      if (avatarEl && profile.avatar) avatarEl.src = profile.avatar;
      if (nameEl) nameEl.textContent = profile.displayName || 'FAME DOLL';
      if (originEl) originEl.textContent = profile.origin || '';
      if (bioEl) bioEl.textContent = profile.bio || '';
    } else {
      if (avatarEl && !avatarEl.src) avatarEl.src = 'https://i.imgur.com/ct2ERKN.jpeg';
      if (nameEl && !nameEl.textContent) nameEl.textContent = 'FAME DOLL';
    }
  }

  /* ── Era detail modal ── */
  function openEraDetail(key) {
    var era = ERAS[key];
    if (!era) return;
    window._currentEraId = key;
    var tagEl = document.getElementById('era-modal-tag');
    var nameEl = document.getElementById('era-modal-name');
    var descEl = document.getElementById('era-modal-desc');
    if (tagEl) tagEl.textContent = era.tag || '';
    if (nameEl) nameEl.textContent = era.name;
    if (descEl) descEl.textContent = era.desc || '';

    var linksEl = document.getElementById('era-modal-links');
    if (linksEl) {
      linksEl.innerHTML = '';
      if (era.appleEmbed) {
        linksEl.innerHTML +=
          '<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="152" ' +
          'style="width:100%;border-radius:4px;overflow:hidden;margin-bottom:8px;" ' +
          'sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" ' +
          'src="' +
          era.appleEmbed +
          '"></iframe>';
      }
      (era.links || []).forEach(function (link) {
        linksEl.innerHTML +=
          '<a class="era-modal-link" href="' +
          link.url +
          '" target="_blank">' +
          link.label +
          '<span>→</span></a>';
      });
    }

    var photoEl = document.getElementById('era-modal-photo');
    var emptyEl = document.getElementById('era-photo-empty');
    if (photoEl) {
      photoEl.style.display = '';
      photoEl.querySelectorAll('img').forEach(function (img) {
        img.remove();
      });
      var photoUrl = _eraPhotos[key];
      if (photoUrl) {
        var img = document.createElement('img');
        img.src = photoUrl;
        img.alt = era.name;
        photoEl.insertBefore(img, photoEl.firstChild);
        if (emptyEl) emptyEl.style.display = 'none';
      } else {
        if (emptyEl) emptyEl.style.display = '';
      }
    }

    var bg = document.getElementById('era-modal-bg');
    if (bg) bg.classList.add('open');
  }

  function closeEraModal() {
    var bg = document.getElementById('era-modal-bg');
    if (bg) bg.classList.remove('open');
    window._currentEraId = null;
  }

  function uploadEraPhoto(e, key) {
    if (!e || !key) return;
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      _eraPhotos[key] = ev.target.result;
      saveAll();
      renderEras();
      openEraDetail(key);
    };
    reader.readAsDataURL(file);
  }

  function editEraField(key, field) {
    if (!key || !ERAS[key]) return;
    var updated = prompt('Edit ' + field + ':', ERAS[key][field] || '');
    if (updated === null) return;
    ERAS[key][field] = updated;
    saveAll();
    renderAll();
    openEraDetail(key);
  }

  function addEra() {
    var name = prompt('Era / Release name:');
    if (!name) return;
    var key = 'era_' + Date.now();
    ERAS[key] = {
      name: name.toUpperCase(),
      tag: prompt('Tag (e.g. Single · 2026):') || '',
      date: prompt('Date:') || '',
      desc: '',
      status: prompt('Status (live / upcoming / era):') || 'era',
    };
    saveAll();
    renderEras();
  }

  function addDrop() {
    var title = prompt('Title:');
    if (!title) return;
    DROPS.push({
      title: title.toUpperCase(),
      day: prompt('Day (e.g. 5):') || '—',
      month: prompt('Month (e.g. JUN 2026):') || '',
      sub: prompt('Subtitle (e.g. Debut Album):') || '',
      type: prompt('Type (Single / Album / Video / EP):') || '',
    });
    saveAll();
    renderDrops();
  }

  /* ── Expose to window ── */
  window.renderAll = renderAll;
  window.renderEras = renderEras;
  window.renderDrops = renderDrops;
  window.renderStreams = renderStreams;
  window.syncMusicSidebar = syncMusicSidebar;
  window.openEraDetail = openEraDetail;
  window.closeEraModal = closeEraModal;
  window.uploadEraPhoto = uploadEraPhoto;
  window.editEraField = editEraField;
  window.addEra = addEra;
  window.addDrop = addDrop;

  window._currentEraId = null;
  setTimeout(syncMusicSidebar, 200);
  renderAll();
})();
