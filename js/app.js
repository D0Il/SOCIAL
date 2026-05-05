/* ═══════════════════════════════════════════════════════════════
   app.js — Core application state and navigation.
   Deferred. Depends on core.js, config.js.

   Exposes:
     window.S          — full site state object (posts, profile, settings)
     window.PLAT       — platform config (gallery, cinema, talk)
     window.showPage() — navigate to a page
     window.cap()      — capitalize a string
     window.hRgb()     — hex color to r,g,b string

   Does NOT own: profile features, settings UI, live page, music page.
   Those live in profile.js, settings.js, live.js, music.js respectively.
   ═══════════════════════════════════════════════════════════════ */

/* Boot: load Profile and Talk immediately */
(function () {
  if (window._loadPage) {
    window._loadPage('profile', null);
    window._loadPage('talk', null);
  }
})();

/* ── Platform config ── */
var PLAT = {
  gallery: {
    label: 'Instagram',
    ch: '#d4a0b5',
    placeholder: 'https://www.instagram.com/p/...',
    urlLabel: 'Instagram Post URL',
    parse: function (url) {
      var m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      return m ? { id: m[1], embedUrl: 'https://www.instagram.com/p/' + m[1] + '/embed/' } : null;
    },
    type: 'photo',
  },
  cinema: {
    label: 'YouTube',
    ch: '#ff6666',
    placeholder: 'https://www.youtube.com/watch?v=...',
    urlLabel: 'YouTube Video URL',
    parse: function (url) {
      var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
      return m ? { id: m[1], embedUrl: 'https://www.youtube-nocookie.com/embed/' + m[1] } : null;
    },
    type: 'video',
  },
  talk: {
    label: 'X / Twitter',
    ch: '#b0a0c0',
    placeholder: 'https://x.com/.../status/...',
    urlLabel: 'Tweet URL',
    parse: function (url) {
      var m = url.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/);
      return m
        ? {
            id: m[1],
            embedUrl: 'https://platform.twitter.com/embed/Tweet.html?id=' + m[1] + '&theme=dark',
          }
        : null;
    },
    type: 'tweet',
  },
};
window.PLAT = PLAT;

/* ── Site state ── */
var S = {
  posts: {
    gallery: [],
    cinema: [
      {
        id: 20250110,
        tab: 'cinema',
        platform: 'YouTube',
        ch: '#ff6666',
        idstr: 'RYPt_FuzmOw',
        embedUrl: 'https://www.youtube-nocookie.com/embed/RYPt_FuzmOw',
        caption: 'Jan 10, 2025 — Video 1',
        likes: 0,
        time: 'Jan 10, 2025',
        type: 'video',
        comments: [],
        liked: false,
        saved: false,
      },
      {
        id: 20250117,
        tab: 'cinema',
        platform: 'YouTube',
        ch: '#ff6666',
        idstr: '7swqEOzRhlM',
        embedUrl: 'https://www.youtube-nocookie.com/embed/7swqEOzRhlM',
        caption: 'Jan 17, 2025 — Video 2',
        likes: 0,
        time: 'Jan 17, 2025',
        type: 'video',
        comments: [],
        liked: false,
        saved: false,
      },
      {
        id: 20250124,
        tab: 'cinema',
        platform: 'YouTube',
        ch: '#ff6666',
        type: 'playlist',
        playlistId: 'PLhRgPfuqZrXM9XvNAcbM1Q-dB-Cp2HyRO',
        embedUrl:
          'https://www.youtube-nocookie.com/embed/videoseries?list=PLhRgPfuqZrXM9XvNAcbM1Q-dB-Cp2HyRO',
        caption: 'OCTODAD: DADLIEST CATCH',
        time: 'Jan 31, 2025',
        episodeCount: 2,
        likes: 0,
        comments: [],
        liked: false,
        saved: false,
      },
      {
        id: 20250207,
        tab: 'cinema',
        platform: 'YouTube',
        ch: '#ff6666',
        idstr: 'B66uxAIrd8E',
        embedUrl: 'https://www.youtube-nocookie.com/embed/B66uxAIrd8E',
        caption: 'Feb 07, 2025 — Video 5',
        likes: 0,
        time: 'Feb 7, 2025',
        type: 'video',
        comments: [],
        liked: false,
        saved: false,
      },
      {
        id: 20250221,
        tab: 'cinema',
        platform: 'YouTube',
        ch: '#ff6666',
        idstr: 'A6hrqBd5Fig',
        embedUrl: 'https://www.youtube-nocookie.com/embed/A6hrqBd5Fig',
        caption: 'Feb 21, 2025 — Video (added)',
        likes: 0,
        time: 'Feb 21, 2025',
        type: 'video',
        comments: [],
        liked: false,
        saved: false,
      },
      {
        id: 20260329,
        tab: 'cinema',
        platform: 'YouTube',
        ch: '#ff6666',
        idstr: '7sLFFbPe5hI',
        embedUrl: 'https://www.youtube-nocookie.com/embed/7sLFFbPe5hI',
        caption: 'Mar 29, 2026 — Video 6',
        likes: 0,
        time: 'Mar 29, 2026',
        type: 'video',
        comments: [],
        liked: false,
        saved: false,
      },
    ],
    talk: [],
    clips: [],
  },
  following: false,
  currentPost: null,
  addingFor: 'gallery',
  pinned: null,
  profile: {
    displayName: 'FAME DOLL',
    realname: 'Xavier Fox',
    level: 'LVL. 21',
    born: "Dec 10th '04",
    origin: 'Canadian / Portuguese',
    genre: 'Pop · Brantford, ON',
    bio: '...',
    npTitle: 'Birthday Suit',
    npArtist: 'Fame Doll',
    audio: Object.assign({}, window.FD_CFG.defaultProfile.audio),
    spotify: window.FD_CFG.defaultProfile.spotify,
    apple: window.FD_CFG.defaultProfile.apple,
    avatar: window.FD_CFG.defaultProfile.avatar,
  },
  settings: {
    accent: 'rose',
    theme: 'light',
  },
};
window.S = S;

/* ── Utility functions ── */
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
window.cap = cap;

function hRgb(hex) {
  var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16)
    : '255,255,255';
}
window.hRgb = hRgb;

/* ── showPage — navigate between pages ── */
function isKnownMainPage(page) {
  return ['profile', 'scrollables', 'community', 'feed', 'live', 'shop', 'music', 'talk', 'settings'].indexOf(page) !== -1;
}

function showPage(page) {
  page = isKnownMainPage(page) ? page : 'profile';
  /* Lazy-load page HTML on first visit */
  if (window._loadPage) {
    var ph = document.getElementById('page-' + page);
    if (ph && ph.dataset.pageSrc && !ph.dataset.loaded) {
      window._loadPage(page, function () {
        showPage(page);
      });
      return;
    }
  }

  /* Deactivate all nav buttons */
  document.querySelectorAll('.mob-tab,.mob-top-btn,#mob-shop-btn').forEach(function (el) {
    el.classList.remove('active');
  });

  /* Activate the correct nav button */
  var navMap = {
    music: 'mob-tab-music',
    talk: 'mob-tab-talk',
    profile: 'mob-tab-profile',
    scrollables: 'mob-tab-scroll',
    community: 'mob-tab-community',
    live: 'mob-live-btn',
    shop: 'mob-shop-btn',
  };
  var activeBtn = document.getElementById(navMap[page]);
  if (activeBtn) activeBtn.classList.add('active');

  /* Analytics */
  if (window._fbDb_analytics) {
    try {
      window._fbDb_analytics
        .collection('analytics')
        .add({ page: page, ts: Date.now(), d: new Date().toISOString() });
    } catch (e) {}
  }

  /* Show the page */
  document.querySelectorAll('.page').forEach(function (el) {
    el.classList.remove('active');
  });
  var pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  /* Nav state */
  var pairs = [
    ['nav-profile', 'profile'],
    ['nav-scrollables', 'scrollables'],
    ['nav-community', 'community'],
    ['nav-feed', 'feed'],
    ['nav-live', 'live'],
    ['nav-shop-main', 'shop'],
    ['nav-music', 'music'],
    ['nav-talk', 'talk'],
  ];
  pairs.forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    if (el) {
      el.classList.toggle('on', page === pair[1]);
      el.classList.toggle('active', page === pair[1]);
    }
  });

  var settingsBtn = document.getElementById('nav-settings-btn');
  if (settingsBtn) settingsBtn.style.borderColor = page === 'settings' ? 'var(--pk)' : '';

  /* TikTok embed script on scrollables */
  if (page === 'scrollables' && !document.getElementById('tiktok-embed-js')) {
    var tts = document.createElement('script');
    tts.id = 'tiktok-embed-js';
    tts.src = 'https://www.tiktok.com/embed.js';
    tts.async = true;
    document.body.appendChild(tts);
  }

  /* Twitch init on live */
  if (page === 'live') {
    try {
      if (typeof initLivePage === 'function') initLivePage();
    } catch (e) {
      console.warn('initLivePage failed:', e);
    }
  }

  /* Talk intro */
  if (page === 'talk') {
    var intro = document.getElementById('talk-intro');
    if (intro)
      setTimeout(function () {
        intro.style.opacity = '0';
      }, 1200);
  }

  /* Community forces dark mode; restore theme when leaving */
  try {
    var themeToggle = document.getElementById('theme-toggle');
    if (page === 'community') {
      window._communityPrevLight = document.documentElement.classList.contains('light-mode');
      document.documentElement.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.checked = false;
    } else if (window._communityPrevLight !== undefined) {
      if (window._communityPrevLight) {
        document.documentElement.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.checked = true;
      } else {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = false;
      }
      delete window._communityPrevLight;
    }
  } catch (e) {}

  /* Save last visited page */
  try {
    localStorage.setItem('fd_last_main_page', page);
  } catch (e) {}
}
/* Drain any showPage() calls queued by config.js stub before app.js loaded */
(function () {
  var queue = window._showPageQueue || [];
  window.showPage = showPage;

  function isReloadNavigation() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
      return !!(nav && nav[0] && nav[0].type === 'reload');
    } catch (e) {
      return false;
    }
  }

  function getSavedMainPage() {
    try {
      var saved = localStorage.getItem('fd_last_main_page');
      return isKnownMainPage(saved) ? saved : '';
    } catch (e) {
      return '';
    }
  }

  var initialPage = queue.length
    ? queue[queue.length - 1]
    : isReloadNavigation()
      ? getSavedMainPage() || 'profile'
      : 'profile';
  showPage(initialPage);
})();

/* ── Boot: restore state from localStorage and apply settings ── */
(function () {
  /* Likes visibility */
  try {
    if (localStorage.getItem('fd_likes_hidden') === null) {
      localStorage.setItem('fd_likes_hidden', 'true');
    }
    if (localStorage.getItem('fd_likes_hidden') === 'true') {
      document.body.classList.add('likes-hidden');
    }
  } catch (e) {}

  /* Restore posts */
  try {
    var savedPosts = JSON.parse(localStorage.getItem('famed0ll_posts') || 'null');
    if (savedPosts && typeof savedPosts === 'object') S.posts = Object.assign(S.posts, savedPosts);
  } catch (e) {}

  /* Restore settings */
  try {
    var savedSettings = JSON.parse(localStorage.getItem('famed0ll_settings') || 'null');
    if (savedSettings && typeof savedSettings === 'object') {
      S.settings = Object.assign(S.settings, savedSettings);
    }
  } catch (e) {}

  /* Restore profile */
  try {
    var savedProfile = JSON.parse(localStorage.getItem('famed0ll_profile') || 'null');
    if (savedProfile && typeof savedProfile === 'object') {
      S.profile = Object.assign(S.profile, savedProfile);
      window.ensureProfileDefaults(S.profile);
      if (S.profile.avatar) {
        var avInner = document.getElementById('sl-avatar-inner');
        if (avInner) {
          avInner.innerHTML =
            '<img src="' +
            S.profile.avatar +
            '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        }
      }
    }
  } catch (e) {}

  /* Apply accent color */
  if (typeof applyAccent === 'function') applyAccent(S.settings.accent);

  /* Apply texture */
  if (S.settings.texture === 'stone') {
    var stoneUrl = window.fdTextureUrl('stone');
    document.querySelector('html').style.backgroundImage = "url('" + stoneUrl + "')";
    document.body.style.backgroundImage = "url('" + stoneUrl + "')";
    var textureToggle = document.getElementById('texture-toggle');
    if (textureToggle) textureToggle.checked = true;
    var textureLabel = document.getElementById('texture-label');
    if (textureLabel) textureLabel.textContent = 'Stone';
  }

  /* Apply custom background */
  if (S.settings.customBg) {
    document.documentElement.style.backgroundImage = "url('" + S.settings.customBg + "')";
    document.body.style.backgroundImage = "url('" + S.settings.customBg + "')";
    requestAnimationFrame(function () {
      if (typeof _applyCustomBgUI === 'function') _applyCustomBgUI(S.settings.customBg);
    });
  }

  /* Apply theme */
  var isLight = S.settings.theme === 'light';
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.checked = isLight;
  var stone = window.fdTextureUrl('stone');
  var concrete = window.fdTextureUrl('concrete');
  if (isLight) {
    document.documentElement.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    if (!S.settings.customBg) {
      document.documentElement.style.backgroundImage = "url('" + stone + "')";
      document.body.style.backgroundImage = "url('" + stone + "')";
    }
  } else {
    document.documentElement.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    if (!S.settings.customBg) {
      document.documentElement.style.backgroundImage = "url('" + concrete + "')";
      document.body.style.backgroundImage = "url('" + concrete + "')";
    }
  }

  /* Apply profile text fields to sidebar (they may not be in DOM yet — _onPageLoad handles the rest) */
  (function () {
    var p = S.profile;
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

  /* Restore pinned item */
  try {
    var pinned = JSON.parse(localStorage.getItem('famed0ll_pinned') || 'null');
    if (pinned && pinned.embedUrl) {
      S.pinned = pinned;
      var featEmbed = document.getElementById('feat-embed');
      var featPh = document.getElementById('feat-placeholder');
      if (featPh) featPh.style.display = 'none';
      if (featEmbed) {
        featEmbed.querySelectorAll('iframe').forEach(function (f) {
          f.remove();
        });
        var frame = document.createElement('iframe');
        frame.src = pinned.embedUrl.includes('autoplay=')
          ? pinned.embedUrl
          : pinned.embedUrl +
            (pinned.embedUrl.includes('?') ? '&autoplay=1&mute=1' : '?autoplay=1&mute=1');
        frame.scrolling = 'no';
        frame.allowTransparency = true;
        frame.style.cssText = 'width:100%;height:100%;border:none;';
        featEmbed.appendChild(frame);
        if (window.setFeatureDescText) window.setFeatureDescText(pinned.desc);

      }
    }
  } catch (e) {}
})();
