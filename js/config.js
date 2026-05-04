/* ═══════════════════════════════════════════════════════════════
   config.js — SYNCHRONOUS site config and data globals.
   Loads after core.js, before any deferred scripts.

   Exposes:
     window.FD_CFG          — Firebase config, default profile, texture URLs
     window.fdTextureUrl(k) — get texture URL by key
     window.ensureProfileDefaults(p) — fill missing profile fields
     window.fdLoadScript(src) — dynamic script loader (Promise)
     window.fdEnsureFirebaseApp() — init Firebase if not already done
     var ERAS, DROPS, STREAM_LINKS, _eraPhotos — site data (localStorage-backed)
     window.showPage(p)     — stub (queue) until app.js replaces it
     window.openExternalLink(url) — stub until app.js replaces it

   Integration: Set window.FD_CFG before loading this file to override
   defaults. ERAS/DROPS/STREAM_LINKS are plain var globals accessible
   from any subsequent script in the same browsing context.
   ═══════════════════════════════════════════════════════════════ */

window.FD_CFG = {
    firebaseSdkBase: "https://www.gstatic.com/firebasejs/9.23.0",
    firebaseConfig: {
      apiKey: "AIzaSyDNWab9sqqUDmjkaLNeV4Kaf08mv-3Qc-g",
      authDomain: "famed0ll.firebaseapp.com",
      projectId: "famed0ll",
      storageBucket: "famed0ll.firebasestorage.app",
      messagingSenderId: "390874917783",
      appId: "1:390874917783:web:9e1a9a7de9a1d1ef06b2d2"
    },
    textureUrls: {
      stone: "https://img.freepik.com/free-photo/stone-wall-texture_1194-5944.jpg?semt=ais_rp_progressive&w=740&q=80",
      concrete: "https://static.wixstatic.com/media/a8e1f3e15ccb41b88df85a10bb90531a.jpg/v1/fill/w_824,h_440,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Concrete.jpg"
    },
    defaultProfile: {
      spotify: "https://open.spotify.com/track/1lZ1jrs8QOc0sFs38A32Aj",
      apple: "https://music.apple.com/ca/song/birthday-suit/1888560707",
      avatar: "https://i.imgur.com/ct2ERKN.jpeg",
      audio: {
        name: "Birthday Suit.wav",
        dataUrl: "https://www.dropbox.com/scl/fi/4wleig23h3uw2hdckg30p/Birthday-Suit.wav?rlkey=2v0jm6sqiuw06e8a81l9a1sjd&st=jzunueqn&raw=1",
        isUrl: !0
      }
    },
    streamLinks: [{
      platform: "spotify",
      label: "Spotify",
      url: "https://open.spotify.com/artist/040glRkv4wyaBQSyAykYde?si=UbZaei72R3G0BQWfEXhAhQ"
    }, {
      platform: "apple",
      label: "Apple Music",
      url: "https://music.apple.com/ca/artist/fame-doll/1815013196"
    }, {
      platform: "youtube",
      label: "YOUTUBE",
      url: "https://music.youtube.com/channel/UCMPpHQtbtJbdXTfvYhJA5UA?si=zaDcrjCTNY9Zur2X"
    }, {
      platform: "amazon",
      label: "AMAZON",
      url: "https://music.amazon.ca/artists/B0F91RPM3H/fame-doll"
    }]
  };

  window.fdTextureUrl = function(kind) {
    return window.FD_CFG.textureUrls[kind] || window.FD_CFG.textureUrls.concrete;
  };

  window.ensureProfileDefaults = function(profile) {
    if (!profile) return profile;
    profile.spotify || (profile.spotify = window.FD_CFG.defaultProfile.spotify);
    profile.apple || (profile.apple = window.FD_CFG.defaultProfile.apple);
    profile.avatar || (profile.avatar = window.FD_CFG.defaultProfile.avatar);
    profile.audio && profile.audio.dataUrl || (profile.audio = Object.assign({}, window.FD_CFG.defaultProfile.audio));
    return profile;
  };

  window.fdLoadScript = function(src) {
    return new Promise(function(resolve, reject) {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  window.fdEnsureFirebaseApp = function() {
    if (window.firebase && !firebase.apps.length) firebase.initializeApp(window.FD_CFG.firebaseConfig);
  };

var ERAS = {};
var DROPS = [];
var STREAM_LINKS = [];
var _eraPhotos = {};
          try {
            ERAS = JSON.parse(localStorage.getItem("fd_eras") || "{}")
          } catch (e) {}
          try {
            DROPS = JSON.parse(localStorage.getItem("fd_drops") || "[]")
          } catch (e) {}
          try {
            STREAM_LINKS = JSON.parse(localStorage.getItem("fd_streams") || "null")
          } catch (e) {}
          try {
            _eraPhotos = JSON.parse(localStorage.getItem("fd_era_photos") || "{}")
          } catch (e) {}


// ── showPage stub (sync) ──────────────────────────────────────────────────
// app.js is deferred. If user clicks nav before it loads, queue the call.
// Real showPage (defined in app.js) drains this queue on first run.
window._showPageQueue = [];
window.showPage = function(page) {
  window._showPageQueue.push(page);
};

// Extra stubs for functions potentially called before app.js loads
window.openExternalLink = window.openExternalLink || function(url) {
  if (url) window.open(url, '_blank', 'noopener');
};