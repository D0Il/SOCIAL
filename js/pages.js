/* ═══════════════════════════════════════════════════════════════
   pages.js — Per-page initialization and music page rendering.
   Deferred. Depends on app.js (S, showPage) and config.js (ERAS, DROPS).

   Exposes:
     window.initLivePage()       — lazy-init Twitch on Live page
     window.openCommunityEdit()  — community bio edit
     window.syncMusicSidebar()   — sync music page sidebar to S.profile
     window._onPageLoad          — hook called after page HTML inject
     window.__famedoll_visible   — true once site is interactive

   Contains: bio block observer, scrollables TikTok grid, scroll-grid
             button, community UI, live page lazy-init, music page
             render functions (ERAS, DROPS, STREAM_LINKS, streams).
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────
   Page init hook — called by core.js _loadPage after HTML inject.
   Add per-page init logic here. Other modules can chain this hook.
───────────────────────────────────────────────────────────────── */
(function() {
  var _prev = window._onPageLoad;
  window._onPageLoad = function(pageName) {
    if (_prev) try { _prev(pageName); } catch(e) {}
    switch (pageName) {
      case 'music':
        if (typeof renderAll === 'function') renderAll();
        if (typeof syncMusicSidebar === 'function') syncMusicSidebar();
        break;
      case 'profile':
        if (typeof renderGrid === 'function') renderGrid(window.S && window.S.addingFor || 'gallery');
        if (typeof renderYT === 'function') renderYT();
        if (typeof updateLatestPostWidget === 'function') updateLatestPostWidget();
        if (typeof applyAllCrops === 'function') applyAllCrops();
        if (typeof wireInstaClickCrop === 'function') wireInstaClickCrop();
        // Apply profile text fields now that profile.html is in the DOM
        (function() {
          var p = window.S && window.S.profile;
          if (!p) return;
          var el;
          el = document.getElementById('sl-realname'); if (el && p.realname) el.textContent = p.realname;
          el = document.getElementById('sl-origin');   if (el && p.origin)   el.innerHTML  = p.origin;
          el = document.getElementById('sl-bio');      if (el && p.bio)      el.textContent = p.bio;
          el = document.getElementById('sl-np-title'); if (el && p.npTitle)  el.textContent = p.npTitle;
          el = document.getElementById('sl-np-artist');if (el && p.npArtist) el.textContent = p.npArtist;
        })();
        // Bio block observer — runs here so #sl-bio exists in the DOM
        (function() {
          var e = document.getElementById('sl-bio'),
              n = e && e.closest('.sl-bio-block');
          function t() { var txt = (e.textContent || '').trim(); n.style.display = txt && txt !== '...' ? '' : 'none'; }
          if (e && n) { t(); new MutationObserver(t).observe(e, { childList: true, characterData: true, subtree: true }); }
        })();
        break;
      case 'scrollables':
        // Re-trigger TikTok embed processing after HTML inject
        if (window.tiktokEmbed && typeof window.tiktokEmbed.lib === 'object') {
          try { window.tiktokEmbed.lib.render(document.querySelectorAll('.tiktok-embed:not(.rendered)')); } catch(e) {}
        }
        // Fallback: reload TikTok embed script if not yet processed
        if (!document.getElementById('tiktok-embed-js')) {
          var s = document.createElement('script');
          s.id = 'tiktok-embed-js';
          s.src = 'https://www.tiktok.com/embed.js';
          s.async = true;
          document.body.appendChild(s);
        }
        break;
      case 'community':
        // Re-trigger @widgetbot/html-embed after community.html inject
        // The custom element <widgetbot> needs to be processed
        if (window.customElements && window.customElements.get('widgetbot')) {
          // Force upgrade any new widgetbot elements
          document.querySelectorAll('widgetbot').forEach(function(el) {
            if (!el._initialized) window.customElements.upgrade(el);
          });
        }
        break;
    }
  };
})();

/* ── Scrollables TikTok grid observer ── */
! function() {
                      const t = document.getElementById("scrollables-grid");
                      if (t) {
                        const o = Array.from(t.querySelectorAll(".tiktok-embed"));
                        if (!(o.length < 2)) {
                          const e = o.slice().sort((e, t) => (parseInt(t.dataset.videoId || "0", 10) || 0) - (parseInt(
                            e.dataset.videoId || "0", 10) || 0));
                          e.some((e, t) => e !== o[t]) && e.forEach(e => t.appendChild(e))
                        }
                      }
                    }()

/* ── Scrollables scroll-grid button ── */
! function() {
                      const d = document.getElementById("scroll-thumb-grid"),
                        m = document.getElementById("scrollables-grid");
                      d && m && setTimeout(async () => {
                        const e = Array.from(m.querySelectorAll(".tiktok-embed"));
                        var t = e.map(e => {
                          const t = e.getAttribute("cite") || "",
                            n = e.querySelector("section p");
                          var o = n ? n.textContent.trim() : "";
                          const r = e.querySelector("section a");
                          var a = r ? r.textContent.replace(/^@/, "") : "",
                            e = e.dataset.videoId || t.split("/").filter(Boolean).pop() || "";
                          return {
                            url: t,
                            caption: o,
                            user: a,
                            vid: e
                          }
                        }).filter(e => e.url);
                        for (const o of t) {
                          const r = document.createElement("a");
                          r.className = "scroll-thumb", r.href = o.url, r.target = "_blank", r.rel =
                            "noopener noreferrer", r.setAttribute("role", "listitem");
                          const a = document.createElement("img");
                          a.alt = o.caption || o.user || "TikTok", a.loading = "lazy";
                          const c = document.createElement("div");
                          c.className = "st-overlay";
                          const s = document.createElement("div");
                          s.className = "st-user", s.textContent = o.user || "";
                          const l = document.createElement("div");
                          l.className = "st-play", l.textContent = "Open", c.appendChild(s), c.appendChild(l), r.appendChild(
                            a), r.appendChild(c);
                          var n = `https://p16-sign-va.tiktokcdn.com/obj/tos-useast5-p-0037/${o.vid}.webp`;
                          a.src = n, (async () => {
                            var e = await async function(e) {
                              try {
                                var t = `https://www.tiktok.com/oembed?url=${encodeURIComponent(e)}`;
                                const o = await fetch(t, {
                                  cache: "force-cache"
                                });
                                if (!o.ok) throw new Error("no oembed");
                                var n = await o.json();
                                if (n && n.thumbnail_url) return n.thumbnail_url
                              } catch (e) {}
                              return null
                            }(o.url);
                            e && a.src !== e && (a.src = e)
                          })(), a.addEventListener("error", () => {
                            const e = document.createElement("div");
                            e.style.cssText =
                              "width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.00));color:var(--ink3);font-family:DM Mono,monospace;font-size:12px;",
                              e.textContent = o.user ? o.user.slice(0, 2).toUpperCase() : "TK", a.remove(), r.insertBefore(
                                e, c)
                          }), r.addEventListener("click", () => {
                            r.classList.add("clicked"), setTimeout(() => r.classList.remove("clicked"), 400)
                          }), d.appendChild(r)
                        }
                        if (0 === t.length) {
                          const i = document.createElement("div");
                          i.style.cssText =
                            "color:var(--ink3);font-family:DM Mono,monospace;font-size:12px;padding:8px;", i.textContent =
                            "No scrollables found — add TikTok links on the right to populate thumbnails.", d.appendChild(
                              i)
                        }
                      }, 180)
                    }()

/* ── Community UI ── */
! function() {
                    function o(t) {
                      const o = document.getElementById("community-avatar");
                      if (o) {
                        t = t ? "url('" + t + "')" : "url('https://i.imgur.com/ct2ERKN.jpeg')";
                        o.style.backgroundImage = t;
                        const n = document.getElementById("mob-com-avatar");
                        n && (n.style.backgroundImage = t)
                      }
                    }

                    function n() {
                      const o = document.getElementById("community-bio"),
                        n = document.getElementById("mob-com-bio");

                      function t(t) {
                        o && (o.textContent = t), n && (n.textContent = t)
                      }
                      try {
                        var i = localStorage.getItem("community_bio");
                        if (i) return void t(i)
                      } catch (t) {}
                      try {
                        var e = window._siteConfig && window._siteConfig.community_bio || null;
                        if (e) return void t(e)
                      } catch (t) {}
                    }

                    function t() {
                      const t = document.getElementById("community-edit-btn");
                      t && (document.body.classList.contains("talk-admin") ? t.style.display = "block" : t.style.display =
                        "none")
                    }
                    window.openCommunityEdit = function() {
                      if (document.body.classList.contains("talk-admin")) {
                        var t = document.getElementById("community-bio").textContent || "",
                          t = prompt("Edit server bio:", t);
                        if (null !== t) {
                          document.getElementById("community-bio").textContent = t;
                          try {
                            localStorage.setItem("community_bio", t)
                          } catch (t) {}
                          if ("function" == typeof window._saveSiteConfig) try {
                            window._saveSiteConfig({
                              community_bio: t
                            })
                          } catch (t) {}
                        }
                      }
                    };
                    try {
                      var i;
                      window.S && S.profile && S.profile.avatar ? o(S.profile.avatar) : window.S && S.profile && void 0 ===
                        S.profile.avatar ? o(null) : o((i = document.querySelector("#sl-avatar-inner img")) ? i.src :
                          "https://i.imgur.com/ct2ERKN.jpeg")
                    } catch (t) {
                      o("https://i.imgur.com/ct2ERKN.jpeg")
                    }
                    const e = window.syncMusicSidebar;
                    window.syncMusicSidebar = function() {
                        try {
                          "function" == typeof e && e()
                        } catch (t) {}
                        try {
                          window.S && S.profile && S.profile.avatar && o(S.profile.avatar)
                        } catch (t) {}
                      },
                      function() {
                        if (n(), t(), window.addEventListener("storage", function(t) {
                            "community_bio" === t.key && n()
                          }), window._siteConfig) try {
                          window._siteConfig.community_bio && (document.getElementById("community-bio").textContent =
                            window._siteConfig.community_bio)
                        } catch (t) {}
                      }();
                    const c = new MutationObserver(t);
                    c.observe(document.body, {
                      attributes: !0,
                      attributeFilter: ["class"]
                    })
                  }()

/* ── Live page lazy init ── */
window.initLivePage = window.initLivePage || function() {
            if (!window._twitchInitDone && window._initTwitchOnce) {
              window._twitchInitDone = !0;
              window._initTwitchOnce()
            }
          };
          setTimeout(() => updateLevelProgress(), 60), window.__famedoll_visible = !0;

/* ─────────────────────────────────────────────────────────────────
   Music page — ERAS, DROPS, STREAM_LINKS rendering
   Functions: saveAll, renderStreams, renderEras, renderDrops,
              renderAll, openEraDetail, closeEraModal, uploadEraPhoto,
              editEraField, addEra, addDrop, syncMusicSidebar
   Depends on: ERAS, DROPS, STREAM_LINKS from config.js (global vars)
───────────────────────────────────────────────────────────────── */
// ── Music page functions (ERAS, DROPS, stream rendering) ─────────────────
// Moved from inline script — runs after DOM ready via defer
(function() {

          function saveAll() {
            try {
              localStorage.setItem("fd_eras", JSON.stringify(ERAS)), localStorage.setItem("fd_drops", JSON.stringify(
                DROPS)), localStorage.setItem("fd_streams", JSON.stringify(STREAM_LINKS)), localStorage.setItem(
                "fd_era_photos", JSON.stringify(_eraPhotos))
            } catch (e) {}
            if (window._saveSiteConfig) try {
              window._saveSiteConfig({
                eras: ERAS,
                era_photos: _eraPhotos,
                drops: DROPS,
                stream_links: STREAM_LINKS
              })
            } catch (e) {}
          }
          STREAM_LINKS = STREAM_LINKS || window.FD_CFG.streamLinks.map(e => Object.assign({}, e)), ERAS.birthday_suit && ERAS.birthday_suit.links?.find(e => "Music Video" === e.label) || (_eraPhotos.birthday_suit =
            "https://i.imgur.com/ITiSeNm.jpeg", ERAS.birthday_suit = {
              name: "BIRTHDAY SUIT",
              tag: "Single · MAR 27 2026",
              date: "",
              desc: "",
              status: "live",
              links: [{
                label: "Music Video",
                url: "https://www.youtube.com/watch?v=7sLFFbPe5hI"
              }, {
                label: "Spotify",
                url: "https://open.spotify.com/track/1lZ1jrs8QOc0sFs38A32Aj?si=d109cfb870e14fcd"
              }, {
                label: "Apple Music",
                url: "https://music.apple.com/ca/song/birthday-suit/1888560707"
              }, {
                label: "iTunes — Buy",
                url: "https://music.apple.com/us/album/birthday-suit-single/1888560706?uo=4&app=itunes&at=1001lry3&ct=dashboard"
              }, {
                label: "Amazon Music — Buy",
                url: "https://www.amazon.com/music/player/albums/B0GV2XTRDX"
              }],
              appleEmbed: "https://embed.music.apple.com/ca/song/birthday-suit/1888560707"
            });
          const STREAM_ICONS = {
              spotify: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#1ed760"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.72a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.78.78 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.326a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.615z"/></svg>',
              apple: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#fc3c3c"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
              youtube: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#ff6666"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
              amazon: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#ff9900"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.052-.872-1.238-1.276-1.814-2.106-1.733 1.766-2.962 2.293-5.209 2.293-2.66 0-4.731-1.641-4.731-4.927 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095V6.41c0-.753.06-1.642-.383-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.978 2.069 8.862 1.1 11.43 1.1c1.312 0 3.026.35 4.061 1.342 1.312 1.225 1.187 2.861 1.187 4.641v4.201c0 1.263.523 1.816 1.015 2.496.173.243.211.533-.01.712l-2.54 2.293v.01zM21.814 19.423c-2.626 1.993-6.433 3.052-9.709 3.052-4.596 0-8.732-1.699-11.861-4.527-.246-.222-.027-.526.27-.353 3.377 1.965 7.549 3.147 11.861 3.147 2.908 0 6.107-.603 9.048-1.851.444-.189.813.293.391.532z"/></svg>'
            },
            STREAM_COLORS = {
              spotify: "#1ed760",
              apple: "#fc3c3c",
              youtube: "#ff6666",
              amazon: "#ff9900",
              tiktok: "#69c9d0",
              soundcloud: "#ff5500"
            };

          function renderStreams() {
            const e = document.getElementById("mp-stream-list"),
              i = document.getElementById("mp-sidebar-streams");
            if (i) {
              i.innerHTML = '<div class="mp-sidebar-stream-head">Stream</div>';
              let o = 0;
              STREAM_LINKS.forEach(e => {
                STREAM_COLORS[e.platform];
                const t = STREAM_ICONS[e.platform] || "",
                  a = t.match(
                    /(<path[^/]*\/>|<path[^>]*>.*?<\/path>|<circle[^/]*\/>|<polygon[^/]*\/>|<rect[^/]*\/>)/gs) || [];
                var s = a.join(""),
                  r = "zbp" + o++,
                  r =
                  `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="${r}" patternUnits="userSpaceOnUse" width="24" height="24">
            <filter id="gs"><feColorMatrix type="saturate" values="0"/></filter><image href="https://i.pinimg.com/originals/53/c4/81/53c4812e63fc6c48b6c60894adad299b.jpg" width="24" height="24" preserveAspectRatio="xMidYMid slice" filter="url(#gs)"/>
          </pattern>
          <mask id="${r}m">
            <g fill="white">${s}</g>
          </mask>
        </defs>
        <rect width="24" height="24" fill="url(#${r})" mask="url(#${r}m)"/>
      </svg>`;
                const l = document.createElement("a");
                l.className = "mp-sidebar-stream-link", l.href = e.url || "#", l.target = "_blank", l.innerHTML =
                  `<span class="mp-stream-icon-wrap">${r}</span><span class="mp-sidebar-stream-name">${e.label||e.platform}</span><span class="mp-sidebar-stream-arrow">→</span>`,
                  i.appendChild(l)
              });
              const t = document.createElement("a");
              t.className = "mp-sidebar-stream-link", t.href = "https://soundcloud.com/do_ll", t.target = "_blank", t.style
                .borderTop = "1px solid var(--border)", t.style.marginTop = "4px", t.innerHTML =
                `<span class="mp-stream-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="zbp_demos" patternUnits="userSpaceOnUse" width="24" height="24">
          <filter id="gs"><feColorMatrix type="saturate" values="0"/></filter><image href="https://i.pinimg.com/originals/53/c4/81/53c4812e63fc6c48b6c60894adad299b.jpg" width="24" height="24" preserveAspectRatio="xMidYMid slice" filter="url(#gs)"/>
        </pattern>
        <mask id="zbp_demosm">
          <g fill="white"><path d="M1.175 12.225c-.015 0-.03.01-.03.025l-.338 2.4.338 2.325c0 .015.015.025.03.025s.03-.01.03-.025l.383-2.325-.383-2.4c0-.015-.015-.025-.03-.025zm.85-.812c-.015 0-.03.01-.038.025l-.3 3.212.3 3.1c.008.015.023.025.038.025s.03-.01.038-.025l.338-3.1-.338-3.212c-.008-.015-.023-.025-.038-.025zm2.138-3.675c-.022 0-.045.018-.052.042l-.27 7.8.27 6.975c.007.024.03.042.052.042s.045-.018.052-.042l.307-6.975-.307-7.8c-.007-.024-.03-.042-.052-.042zm11.763 1.725c-.09 0-.18.015-.27.037-.337-3.75-3.45-6.662-7.237-6.662-1.125 0-2.2.262-3.112.712-.337.162-.427.337-.435.487v12.9c.007.157.12.292.277.315h10.777c.72 0 1.305-.585 1.305-1.305V10.77c0-.72-.585-1.305-1.305-1.305z"/></g>
        </mask>
      </defs>
      <rect width="24" height="24" fill="url(#zbp_demos)" mask="url(#zbp_demosm)"/>
    </svg></span><span class="mp-sidebar-stream-name">DEMOS</span><span class="mp-sidebar-stream-arrow">→</span>`,
                i.appendChild(t)
            }
            e && (e.innerHTML = "")
          }

          function syncMusicSidebar() {
            var e = window.S && window.S.profile ? window.S.profile : null;
            const t = document.getElementById("mp-sidebar-avatar"),
              a = document.getElementById("mp-sidebar-name"),
              s = document.getElementById("mp-sidebar-origin"),
              r = document.getElementById("mp-sidebar-bio");
            e ? (t && e.avatar && (t.src = e.avatar), a && (a.textContent = e.displayName || "FAME DOLL"), s && (s.textContent =
              e.origin || ""), r && (r.textContent = e.bio || "")) : (t && !t.src && (t.src =
              "https://i.imgur.com/ct2ERKN.jpeg"), a && !a.textContent && (a.textContent = "FAME DOLL"))
          }

          function renderEras() {
            const r = document.getElementById("mp-eras-list");
            r && (r.innerHTML = "", Object.keys(ERAS).forEach(e => {
              var t = ERAS[e],
                a = _eraPhotos[e];
              const s = document.createElement("div");
              s.className = "mp-era-card-outer", s.onclick = () => openEraDetail(e), s.innerHTML =
                `
      <div class="mp-era-card" style="aspect-ratio:1;position:relative;overflow:hidden;">
        ${a?`<img src="${a}"alt="${t.name}">`:`<div class="mp-era-card-placeholder">${t.name}</div>`}
        ${t.status&&"live"!==t.status?`<div class="mp-era-badge ${t.status}">${t.status}</div>`:""}
      </div>
      <div class="mp-era-card-label">
        <div class="mp-era-card-label-title">${t.name}</div>
        ${t.tag?`<div class="mp-era-card-label-tag">${t.tag}</div>`:""}
      </div>`,
                r.appendChild(s)
            }))
          }

          function renderDrops() {
            const a = document.getElementById("mp-drops-list");
            a && (a.innerHTML = "", DROPS.forEach(e => {
              const t = document.createElement("div");
              t.className = "mp-drop", t.innerHTML =
                `
      <div class="mp-drop-left">
        <div class="mp-drop-day">${e.day||"—"}</div>
        <span class="mp-drop-month">${e.month||""}</span>
      </div>
      <div>
        <div class="mp-drop-title">${e.title}</div>
        <div class="mp-drop-sub">${e.sub||""}</div>
      </div>
      <div class="mp-drop-type">${e.type||""}</div>`,
                a.appendChild(t)
            }))
          }

          function renderAll() {
            renderStreams(), renderEras(), renderDrops()
          }

          // Expose to window so _onPageLoad and tea-party.js can call them
          window.renderAll = renderAll;
          window.renderEras = renderEras;
          window.renderDrops = renderDrops;
          window.renderStreams = renderStreams;

          function openEraDetail(e) {
            const t = ERAS[e];
            if (t) {
              window._currentEraId = e, document.getElementById("era-modal-tag").textContent = t.tag || "", document.getElementById(
                  "era-modal-name").textContent = t.name, document.getElementById("era-modal-desc").textContent = t.desc ||
                "";
              const a = document.getElementById("era-modal-links");
              a.innerHTML = "", t.appleEmbed && (a.innerHTML +=
                `<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="152" style="width:100%;border-radius:4px;overflow:hidden;margin-bottom:8px;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${t.appleEmbed}"></iframe>`
              ), (t.links || []).forEach(e => {
                a.innerHTML +=
                  `<a class="era-modal-link" href="${e.url}" target="_blank">${e.label}<span>→</span></a>`
              });
              const s = document.getElementById("era-modal-photo"),
                r = document.getElementById("era-photo-empty"); /* hide photo area for song/era details — show only links */
              if (s) {
                s.style.display = "none"; /* ensure any leftover images are removed */
                s.querySelectorAll("img").forEach(i => i.remove());
                r.style.display = "none"
              }
              document.getElementById("era-modal-bg").classList.add("open")
            }
          }

          function closeEraModal() {
            document.getElementById("era-modal-bg").classList.remove("open"), window._currentEraId = null
          }

          function uploadEraPhoto(e, t) {
            if (t) {
              e = e.target.files[0];
              if (e) {
                const a = new FileReader;
                a.onload = e => {
                  _eraPhotos[t] = e.target.result, saveAll(), renderEras(), openEraDetail(t)
                }, a.readAsDataURL(e)
              }
            }
          }

          function editEraField(e, t) {
            var a;
            e && ERAS[e] && (null !== (a = prompt("Edit " + t + ":", ERAS[e][t] || "")) && (ERAS[e][t] = a, saveAll(),
              renderAll(), openEraDetail(e)))
          }

          function addEra() {
            const e = prompt("Era / Release name:");
            var t;
            e && (t = "era_" + Date.now(), ERAS[t] = {
              name: e.toUpperCase(),
              tag: prompt("Tag (e.g. Single · 2026):") || "",
              date: prompt("Date:") || "",
              desc: "",
              status: prompt("Status (live / upcoming / era):") || "era"
            }, saveAll(), renderEras())
          }

          function addDrop() {
            const e = prompt("Title:");
            e && (DROPS.push({
              title: e.toUpperCase(),
              day: prompt("Day (e.g. 5):") || "—",
              month: prompt("Month (e.g. JUN 2026):") || "",
              sub: prompt("Subtitle (e.g. Debut Album):") || "",
              type: prompt("Type (Single / Album / Video / EP):") || ""
            }), saveAll(), renderDrops())
          }
          setTimeout(syncMusicSidebar, 200), renderAll(), window._currentEraId = null

})();

/* ═══════════════════════════════════════════════════════════════
   app.js — Core application (90KB).
             Defines: PLAT, S (site state), showPage(), renderGrid(),
             renderYT(), openDetail(), saveProfile(), grid admin,
             all modals, settings, YT/Insta/Cinema/Scrollables logic.
             Depends on: core.js, config.js
   ═══════════════════════════════════════════════════════════════ */
