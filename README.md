# DOLL CITY — famedoll.com

## Structure

```
famedoll/
├── index.html           56KB   Shell: nav, mobile bars, shared modals,
│                                page placeholders. Zero inline JS or CSS.
│
├── pages/               Page HTML — fetched lazily on first showPage() call
│   ├── profile.html     40KB   Profile: insta grid, YT sidebar, level widget
│   ├── scrollables.html 10KB   TikTok scroll grid
│   ├── settings.html     4KB   Settings panel
│   ├── talk.html         4KB   Tea Party container
│   ├── community.html    4KB   Community page
│   ├── live.html         2KB   Live / Twitch page
│   ├── music.html        1KB   Music page container
│   └── shop.html         0KB   Shop iframe
│
├── css/                 Styles — all load in parallel from <head>
│   ├── main.css         94KB   Core: CSS vars, layout, nav, profile,
│   │                           insta grid, YT grid, all components
│   ├── mobile.css       58KB   All @media + mobile overrides (loads last)
│   ├── tea-party.css    39KB   Tea Party app styles only
│   ├── music.css        34KB   Music page + Live page + live-desc modal
│   └── reset.css         1KB   Squarespace overrides + @font-face
│
└── js/                  Scripts — core.js/config.js sync, rest deferred
    ├── core.js           3KB   [SYNC] _ls, _onResize, _loadPage, _prefetchPage
    ├── config.js         4KB   [SYNC] FD_CFG, ERAS/DROPS globals, showPage stub
    ├── intro.js          3KB   [defer] Splash screen, background sync
    ├── app.js           94KB   [defer] S state, showPage(), all core features
    ├── tea-party.js    127KB   [defer] dayjs + Tea Party IIFE (Firebase auth)
    ├── ui.js            21KB   [defer] Modals, audio UI, analytics display
    ├── pages.js         27KB   [defer] Per-page init, music renderer, page hook
    └── mobile.js        52KB   [defer] Mobile layout, session, perf wrappers
```

## Load Order

```html
<head>
  <!-- CSS loads in parallel — no render blocking -->
  <link href="css/reset.css" rel="stylesheet">
  <link href="css/main.css" rel="stylesheet">
  <link href="css/tea-party.css" rel="stylesheet">
  <link href="css/music.css" rel="stylesheet">
  <link href="css/mobile.css" rel="stylesheet">  <!-- last — wins all conflicts -->

  <!-- Sync bootstrap — must run before DOM, no defer -->
  <script src="js/core.js"></script>    <!-- _ls, _onResize, _loadPage -->
  <script src="js/config.js"></script>  <!-- FD_CFG, ERAS, DROPS, stubs -->
</head>
<body>
  <!-- ...HTML... -->

  <!-- Deferred — order matters: app → tea-party → ui → pages → mobile -->
  <script src="js/intro.js" defer></script>
  <script src="js/app.js" defer></script>        <!-- defines S, showPage -->
  <script src="js/tea-party.js" defer></script>  <!-- uses S, FD_CFG, ERAS -->
  <script src="js/ui.js" defer></script>
  <script src="js/pages.js" defer></script>       <!-- sets _onPageLoad hook -->
  <script src="js/mobile.js" defer></script>      <!-- final showPage wrappers -->
</body>
```

## Global API

| Symbol | Defined in | Type | Description |
|--------|-----------|------|-------------|
| `window._ls` | core.js | Object | Safe localStorage: `.get(k,fallback)`, `.set(k,v)`, `.remove(k)` |
| `window._onResize(fn)` | core.js | Function | Register rAF-debounced resize listener |
| `window._loadPage(name,cb)` | core.js | Function | Fetch+inject pages/X.html, calls cb(wasLoaded) |
| `window._prefetchPage(name)` | core.js | Function | Fire-and-forget prefetch |
| `window._onPageLoad` | core.js/pages.js | Hook | Set to `fn(pageName)` to react after page inject |
| `window._pageCache` | core.js | Object | `{pageName: true}` for loaded pages |
| `window.FD_CFG` | config.js | Object | Firebase config, default profile, texture URLs |
| `window.fdLoadScript(src)` | config.js | Function | Dynamic script loader (returns Promise) |
| `window.ERAS` | config.js | var | Era data (localStorage-backed) |
| `window.DROPS` | config.js | var | Drop calendar (localStorage-backed) |
| `window.STREAM_LINKS` | config.js | var | Streaming platform links |
| `window.showPage(name)` | app.js | Function | Navigate to a page by name |
| `window.S` | app.js | Object | Site state: `.profile`, `.posts`, `.settings` |
| `window.FameDoll` | app.js | Object | Public API: `.setProfile()`, `.getProfile()` |
| `window._fbDb_analytics` | tea-party.js | Object | Firestore analytics collection ref |
| `window._talkLogout()` | tea-party.js | Function | Log out of Tea Party |
| `window._saveSiteConfig(data)` | tea-party.js | Function | Persist site config to Firestore |
| `window.openAnalytics()` | ui.js | Function | Open analytics modal |
| `window.initLivePage()` | pages.js | Function | Lazy-init Twitch embed on Live page |
| `window.syncMusicSidebar()` | pages.js | Function | Sync music sidebar to profile |
| `window.isMobilePreviewOrNarrow(w)` | mobile.js | Function | `innerWidth <= w` |

## Firebase

- Project: `famed0ll` — config in `js/config.js` → `window.FD_CFG.firebaseConfig`
- Admin UID: `kbEeYQPq8TRtzHC2SfTizvbButa2`
- Tea Party (social app) requires `https://famedoll.com` origin — blocked on `file://`

## Integration Guide

**Add a new page:**
1. Create `pages/mypage.html` with `<div class=page id=page-mypage>...</div>`
2. Add placeholder to `index.html`: `<div class=page id=page-mypage data-page-src="pages/mypage.html"></div>`
3. Add nav button with `onclick="showPage('mypage')"`
4. Handle post-inject init in `pages.js` → `_onPageLoad` switch

**Hook into page navigation:**
```js
var prev = window._onPageLoad;
window._onPageLoad = function(pageName) {
  if (prev) prev(pageName);
  if (pageName === 'mypage') { /* init your page */ }
};
```

**Add a resize listener:**
```js
window._onResize(function() { /* runs on rAF after resize */ });
```

**Safe localStorage:**
```js
var theme = window._ls.get('fd_theme', 'dark');
window._ls.set('fd_theme', 'light');
```

## Hard Rules

- `websim.ai` and `websim.com` must stay in Twitch embed parent list (`js/app.js`)
- `core.js` and `config.js` must remain **synchronous** (no defer/async)
- `app.js` must load **before** `tea-party.js` (tea-party uses `S` from app)
- `pages.js` must load **before** `mobile.js` (mobile wraps showPage last)
- Never re-add `body.force-mobile-preview` CSS — removed permanently
- live-desc-modal CSS must stay at depth 0 in `css/music.css` (not inside @media)

## AI Coding Reference

| Task | Open this file |
|------|---------------|
| Profile page bug | `pages/profile.html` |
| Music / era / drops | `pages/music.html` + `js/pages.js` |
| Tea Party social app | `js/tea-party.js` |
| Live / Twitch page | `pages/live.html` + `js/pages.js` |
| Settings panel | `pages/settings.html` |
| Mobile layout | `css/mobile.css` + `js/mobile.js` |
| Core site feature (grid, YT, modals) | `js/app.js` |
| Custom BG / analytics modal | `js/ui.js` |
| Firebase config / site data | `js/config.js` |
| Page loader / resize debounce | `js/core.js` |
| Music page CSS | `css/music.css` |
| Any styling | `css/main.css` |

