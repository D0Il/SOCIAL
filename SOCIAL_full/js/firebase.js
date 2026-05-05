/* ═══════════════════════════════════════════════════════════════
   firebase.js — Firebase initialization and site-wide data layer.
   Deferred. Depends on config.js (FD_CFG, fdLoadScript, fdEnsureFirebaseApp).

   Owns: Firebase SDK loading, firebase.initializeApp, site_config
         Firestore subscription, auth (admin detection), _saveSiteConfig,
         _uploadFile, _fbDb_analytics, login, logout, _talkLogout.

   IMPORTANT: Runs before tea-party.js. tea-party.js handles only the
              Tea Party social app and will reuse the already-initialized
              Firebase app via firebase.apps[0].
   ═══════════════════════════════════════════════════════════════ */

(async function () {
  try {
    /* ── Load Firebase SDK ── */
    var base = window.FD_CFG.firebaseSdkBase;
    await window.fdLoadScript(base + '/firebase-app-compat.js');
    await window.fdLoadScript(base + '/firebase-auth-compat.js');
    await window.fdLoadScript(base + '/firebase-firestore-compat.js');
    await window.fdLoadScript(base + '/firebase-storage-compat.js');

    /* ── Initialize Firebase app (only once) ── */
    if (!window.fdEnsureFirebaseApp()) {
      console.warn('[firebase.js] Firebase failed to initialize');
      return;
    }

    /* ── Get service instances ── */
    var db = firebase.firestore();
    var auth = firebase.auth();
    var storage = firebase.storage();

    window._fbDb = db;
    window._fbAuth = auth;
    window._fbStorage = storage;
    window._fbDb_analytics = db; /* analytics writes use the main db ref */

    /* ── _saveSiteConfig — persist data to Firestore site_config/main ── */
    var siteConfigDoc = db.collection('site_config').doc('main');

    window._saveSiteConfig = async function (patch) {
      if (!document.body.classList.contains('talk-admin')) return;
      try {
        await siteConfigDoc.set(patch, { merge: true });
      } catch (e) {}
    };

    /* ── _uploadFile — upload to Firebase Storage and return download URL ── */
    window._uploadFile = async function (file) {
      var path = 'uploads/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      var ref = storage.ref(path);
      await ref.put(file);
      return ref.getDownloadURL();
    };

    /* ── site_config snapshot handler ── */
    function handleSiteConfig(data) {
      if (!data) return;

      /* Crop positions */
      if (data.crop_positions) window._cropPositions = data.crop_positions;
      if (data.crop_saturation) window._cropSaturation = data.crop_saturation;
      if (data.crop_zoom) window._cropZoom = data.crop_zoom;
      if (typeof applyAllCrops === 'function') applyAllCrops();

      /* Likes visibility */
      if (data.likes_hidden !== undefined) {
        document.body.classList.toggle('likes-hidden', !!data.likes_hidden);
      }

      /* Profile */
      if (data.profile) {
        var p = data.profile;
        /* Preserve existing followerCounts: merge, don't overwrite with zeros */
        if (p.followerCounts) {
          var existing = (window.S && window.S.profile && window.S.profile.followerCounts) || {};
          var merged = Object.assign({}, existing);
          Object.entries(p.followerCounts).forEach(function (entry) {
            if (entry[1] > 0) merged[entry[0]] = entry[1];
          });
          p.followerCounts = merged;
        } else if (window.S && window.S.profile && window.S.profile.followerCounts) {
          p.followerCounts = window.S.profile.followerCounts;
        }
        if (window.S) window.S.profile = Object.assign(window.S.profile || {}, p);
        try {
          var dnEl = document.getElementById('sl-display-name');
          if (dnEl) dnEl.textContent = p.displayName || 'FAME DOLL';
          var biEl = document.getElementById('sl-bio');
          if (biEl) biEl.textContent = p.bio || '';
          var orEl = document.getElementById('sl-origin');
          if (orEl && p.origin) orEl.innerHTML = p.origin;
          if (p.followerCounts) {
            var total = Object.values(p.followerCounts).reduce(function (a, b) {
              return a + b;
            }, 0);
            if (total > 0 && typeof formatFans === 'function') {
              var statEl = document.getElementById('stat-followers');
              if (statEl) statEl.textContent = formatFans(total);
            }
          }
          if (typeof updateLevelProgress === 'function') updateLevelProgress();
          if (typeof ensureNowPlayingAudio === 'function') ensureNowPlayingAudio();
          if (typeof syncMusicSidebar === 'function') syncMusicSidebar();
        } catch (e) {}
      }

      /* Settings (theme, accent, custom background) */
      if (data.settings) {
        if (window.S) window.S.settings = Object.assign(window.S.settings || {}, data.settings);
        if (typeof applyAccent === 'function') applyAccent(data.settings.accent);
        if (data.settings.customBg) {
          document.documentElement.style.backgroundImage = "url('" + data.settings.customBg + "')";
          document.body.style.backgroundImage = "url('" + data.settings.customBg + "')";
          if (typeof _applyCustomBgUI === 'function') _applyCustomBgUI(data.settings.customBg);
        } else if (typeof _applyCustomBgUI === 'function') {
          _applyCustomBgUI('');
        }
      }

      /* Instagram posts */
      if (data.insta_posts && data.insta_posts.length) {
        var grid = document.getElementById('grid-gallery');
        if (grid) {
          grid.innerHTML = data.insta_posts
            .map(function (post) {
              return (
                '<div class="insta-cell' +
                (post.carousel ? ' is-carousel' : '') +
                '" title="' +
                (post.title || '') +
                '">' +
                '<div class="carousel-badge" title="Carousel post">' +
                '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="5" y="5" width="12" height="12" rx="1.5" fill="rgba(0,0,0,0.55)" stroke="white" stroke-width="1.4"/>' +
                '<rect x="3" y="3" width="12" height="12" rx="1.5" fill="rgba(0,0,0,0.55)" stroke="white" stroke-width="1.4"/>' +
                '<rect x="1" y="1" width="12" height="12" rx="1.5" fill="rgba(0,0,0,0.65)" stroke="white" stroke-width="1.4"/>' +
                '</svg></div>' +
                '<button class="carousel-toggle-btn" onclick="event.preventDefault();event.stopPropagation();toggleCarousel(this)" title="Toggle carousel">' +
                '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="12" height="12" rx="2"/><rect x="6" y="3" width="12" height="12" rx="2" opacity="0.6"/></svg></button>' +
                '<button class="insta-cell-delete" onclick="event.preventDefault();event.stopPropagation();deleteInstaCell(this,\'' +
                post.alt +
                '\')" title="Remove">✕</button>' +
                '<a href="' +
                post.href +
                '" target="_blank" style="display:block;width:100%;">' +
                '<img src="' +
                post.src +
                '" alt="' +
                post.alt +
                '" style="width:100%;height:auto;display:block;" ' +
                "onerror=\"this.closest('.insta-cell').style.opacity='0.2';this.closest('.insta-cell').style.pointerEvents='none';\" loading=\"lazy\">" +
                '</a>' +
                '<div class="cell-ov"><div class="cell-stat"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>View</div></div></div>'
              );
            })
            .join('');
          if (typeof applyAllCrops === 'function') applyAllCrops();
          if (typeof wireInstaClickCrop === 'function') wireInstaClickCrop();
        }
      }

      /* Insta trash */
      if (Array.isArray(data.insta_trash)) {
        window._instaTrash = data.insta_trash;
        if (typeof renderDeletedGrid === 'function') renderDeletedGrid();
      }

      /* Pinned featured item */
      if (data.pinned) {
        try {
          var featFrame = document.querySelector('#feat-embed iframe');
          if (featFrame && data.pinned.embedUrl) featFrame.src = data.pinned.embedUrl;
          var descEl = document.getElementById('feat-desc-text');
          if (descEl) descEl.textContent = data.pinned.desc || '—';
        } catch (e) {}
      }

      /* Live description */
      if (data.live_description !== undefined && typeof _renderLiveDesc === 'function') {
        _renderLiveDesc(data.live_description);
      }

      /* Eras */
      if (data.eras && typeof data.eras === 'object') {
        ERAS = data.eras;
        try {
          localStorage.setItem('fd_eras', JSON.stringify(ERAS));
        } catch (e) {}
        if (typeof renderEras === 'function') renderEras();
      }

      /* Era photos */
      if (data.era_photos && typeof data.era_photos === 'object') {
        _eraPhotos = data.era_photos;
        try {
          localStorage.setItem('fd_era_photos', JSON.stringify(_eraPhotos));
        } catch (e) {}
        if (typeof renderEras === 'function') renderEras();
      }

      /* Drops */
      if (Array.isArray(data.drops)) {
        DROPS = data.drops;
        try {
          localStorage.setItem('fd_drops', JSON.stringify(DROPS));
        } catch (e) {}
        if (typeof renderDrops === 'function') renderDrops();
      }

      /* Stream links */
      if (data.stream_links && typeof data.stream_links === 'object') {
        STREAM_LINKS = data.stream_links;
        try {
          localStorage.setItem('fd_streams', JSON.stringify(STREAM_LINKS));
        } catch (e) {}
        if (typeof renderStreams === 'function') renderStreams();
      }
    }

    /* Subscribe to real-time updates */
    siteConfigDoc.onSnapshot(function (snap) {
      if (snap.exists) handleSiteConfig(snap.data());
    });

    /* Fetch once immediately */
    try {
      var snap = await siteConfigDoc.get();
      if (snap.exists) handleSiteConfig(snap.data());
    } catch (e) {}

    /* ── Auth: admin detection and login/logout ── */
    auth.onAuthStateChanged(function (user) {
      if (user && user.uid === 'kbEeYQPq8TRtzHC2SfTizvbButa2') {
        document.body.classList.add('talk-admin');
      } else {
        document.body.classList.remove('talk-admin');
      }
    });

    window.login = async function () {
      var email = prompt('Email:');
      if (!email) return;
      var pass = prompt('Password:');
      if (!pass) return;
      try {
        await auth.signInWithEmailAndPassword(email, pass);
      } catch (e) {
        alert('Login failed: ' + e.message);
      }
    };

    window.logout = async function () {
      try {
        await auth.signOut();
      } catch (e) {}
      document.body.classList.remove('talk-admin');
    };

    window._talkLogout = function () {
      window.logout && window.logout();
    };

    /* Signal that Firebase is ready for tea-party.js */
    window._fbReady = true;
    document.dispatchEvent(new CustomEvent('firebase-ready'));
  } catch (err) {
    console.warn('[firebase.js] Initialization failed:', err);
  }
})();
