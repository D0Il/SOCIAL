/* ═══════════════════════════════════════════════════════════════
   app.js — Core application.
   Deferred. Depends on core.js and config.js.

   Exposes:
     window.showPage(name)           — navigate to a page
     window.saveProfile()            — persist S.profile to Firebase
     window.S                        — full site state object
     window.FameDoll                 — public API { setProfile, getProfile }
     window._instaTrash              — UNDO stack for deleted insta cells
     window._initTwitchOnce          — lazy Twitch embed init
     window.updateLatestPostWidget() — update now-playing widget

   Contains: PLAT (platform config), S state init, showPage(),
             renderGrid(), renderYT(), openDetail(), insta grid admin,
             all settings modals, Firebase profile sync, crop system.

   Integration: Set window._onPageLoad before app.js loads to hook
   into page transitions. Use window.showPage(name) to navigate.
   ═══════════════════════════════════════════════════════════════ */

// ── Load essential pages on startup ──────────────────────────────────────────
// Profile (or last-visited page) loads first so the user sees content immediately.
// Talk MUST also load upfront — tea-party.js needs #app-root from talk.html to
// initialize Firebase and subscribe to site_config, which feeds the avatar,
// insta grid, eras, drops, streaming buttons, and all other dynamic content.
// All other pages are lazy-loaded on first showPage() call.
(function() {
  var defaultPage = 'profile';
  try { var s = localStorage.getItem('fd_last_main_page'); if (s) defaultPage = s; } catch(e) {}
  if (window._loadPage) {
    window._loadPage(defaultPage, null);
    if (defaultPage !== 'talk') window._loadPage('talk', null);
  }
})();


const PLAT = {
              gallery: {
                label: "Instagram",
                ch: "#d4a0b5",
                placeholder: "https://www.instagram.com/p/...",
                urlLabel: "Instagram Post URL",
                parse(e) {
                  e = e.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
                  return e ? {
                    id: e[1],
                    embedUrl: `https://www.instagram.com/p/${e[1]}/embed/`
                  } : null
                },
                type: "photo"
              },
              cinema: {
                label: "YouTube",
                ch: "#ff6666",
                placeholder: "https://www.youtube.com/watch?v=...",
                urlLabel: "YouTube Video URL",
                parse(e) {
                  e = e.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
                  return e ? {
                    id: e[1],
                    embedUrl: `https://www.youtube-nocookie.com/embed/${e[1]}`
                  } : null
                },
                type: "video"
              },
              talk: {
                label: "X / Twitter",
                ch: "#b0a0c0",
                placeholder: "https://x.com/.../status/...",
                urlLabel: "Tweet URL",
                parse(e) {
                  e = e.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/);
                  return e ? {
                    id: e[1],
                    embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${e[1]}&theme=dark`
                  } : null
                },
                type: "tweet"
              }
            },
            ALL_P = [e => PLAT.gallery.parse(e), e => PLAT.cinema.parse(e), e => PLAT.talk.parse(e)],
            S = {
              posts: {
                gallery: [],
                cinema: [{
                  id: 20250110,
                  tab: "cinema",
                  platform: "YouTube",
                  ch: "#ff6666",
                  idstr: "RYPt_FuzmOw",
                  embedUrl: "https://www.youtube-nocookie.com/embed/RYPt_FuzmOw",
                  caption: "Jan 10, 2025 — Video 1",
                  likes: 0,
                  time: "Jan 10, 2025",
                  type: "video",
                  comments: [],
                  liked: !1,
                  saved: !1
                }, {
                  id: 20250117,
                  tab: "cinema",
                  platform: "YouTube",
                  ch: "#ff6666",
                  idstr: "7swqEOzRhlM",
                  embedUrl: "https://www.youtube-nocookie.com/embed/7swqEOzRhlM",
                  caption: "Jan 17, 2025 — Video 2",
                  likes: 0,
                  time: "Jan 17, 2025",
                  type: "video",
                  comments: [],
                  liked: !1,
                  saved: !1
                }, {
                  id: 20250124,
                  tab: "cinema",
                  platform: "YouTube",
                  ch: "#ff6666",
                  type: "playlist",
                  playlistId: "PLhRgPfuqZrXM9XvNAcbM1Q-dB-Cp2HyRO",
                  embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLhRgPfuqZrXM9XvNAcbM1Q-dB-Cp2HyRO",
                  caption: "OCTODAD: DADLIEST CATCH",
                  time: "Jan 31, 2025",
                  episodeCount: 2,
                  likes: 0,
                  comments: [],
                  liked: !1,
                  saved: !1
                }, {
                  id: 20250207,
                  tab: "cinema",
                  platform: "YouTube",
                  ch: "#ff6666",
                  idstr: "B66uxAIrd8E",
                  embedUrl: "https://www.youtube-nocookie.com/embed/B66uxAIrd8E",
                  caption: "Feb 07, 2025 — Video 5",
                  likes: 0,
                  time: "Feb 7, 2025",
                  type: "video",
                  comments: [],
                  liked: !1,
                  saved: !1
                }, {
                  id: 20250221,
                  tab: "cinema",
                  platform: "YouTube",
                  ch: "#ff6666",
                  idstr: "A6hrqBd5Fig",
                  embedUrl: "https://www.youtube-nocookie.com/embed/A6hrqBd5Fig",
                  caption: "Feb 21, 2025 — Video (added)",
                  likes: 0,
                  time: "Feb 21, 2025",
                  type: "video",
                  comments: [],
                  liked: !1,
                  saved: !1
                }, {
                  id: 20260329,
                  tab: "cinema",
                  platform: "YouTube",
                  ch: "#ff6666",
                  idstr: "7sLFFbPe5hI",
                  embedUrl: "https://www.youtube-nocookie.com/embed/7sLFFbPe5hI",
                  caption: "Mar 29, 2026 — Video 6",
                  likes: 0,
                  time: "Mar 29, 2026",
                  type: "video",
                  comments: [],
                  liked: !1,
                  saved: !1
                }],
                talk: [],
                clips: []
              },
              following: !1,
              currentPost: null,
              addingFor: "gallery",
              profile: {
                displayName: "FAME DOLL",
                realname: "Xavier Fox",
                level: "LVL. 21",
                born: "Dec 10th '04",
                origin: "Canadian / Portuguese",
                genre: "Pop · Brantford, ON",
                bio: "...",
                npTitle: "Birthday Suit",
                npArtist: "Fame Doll",
                audio: Object.assign({}, window.FD_CFG.defaultProfile.audio),
                spotify: window.FD_CFG.defaultProfile.spotify,
                apple: window.FD_CFG.defaultProfile.apple,
                avatar: window.FD_CFG.defaultProfile.avatar
              },
              settings: {
                accent: "rose",
                theme: "light"
              }
            },
            ACCENTS = {
              rose: {
                pk: "#d4a0b5",
                pk2: "#e8c0d0",
                label: "Rose (Default)"
              },
              lavender: {
                pk: "#b0a0d0",
                pk2: "#ccbce0",
                label: "Lavender"
              },
              sage: {
                pk: "#9cbe94",
                pk2: "#b8d4b0",
                label: "Sage"
              },
              cyan: {
                pk: "#8ec5c8",
                pk2: "#aad8da",
                label: "Cyan"
              },
              amber: {
                pk: "#c8a878",
                pk2: "#dfc098",
                label: "Amber"
              }
            };
          window.S = S; // expose to pages.js, tea-party.js, etc.

          function applyAccent(t) {
            var e = ACCENTS[t];
            if (e) {
              document.documentElement.style.setProperty("--pk", e.pk), document.documentElement.style.setProperty(
                "--pk2", e.pk2), S.settings.accent = t, document.querySelectorAll(".accent-sw").forEach(e => e.classList
                .toggle("on", e.dataset.accent === t));
              const o = document.getElementById("accent-label");
              o && (o.textContent = e.label);
              try {
                localStorage.setItem("famed0ll_settings", JSON.stringify(S.settings))
              } catch (e) {}
            }
          }

          function applyAccentPicker(t) {
            if (t && "string" == typeof t) {
              /^#?[0-9a-f]{3}$/i.test(t) ? t = "#" + (t = t.replace("#", "")).split("").map(e => e + e).join("") : t.startsWith(
                "#") || (t = "#" + t), document.documentElement.style.setProperty("--pk", t);
              try {
                var e = parseInt(t.substr(1, 2), 16),
                  o = parseInt(t.substr(3, 2), 16),
                  n = parseInt(t.substr(5, 2), 16),
                  l = e => Math.min(255, Math.round(e + .22 * (255 - e)));
                const d = l(e),
                  c = l(o),
                  r = l(n);
                var a = "#" + [d, c, r].map(e => e.toString(16).padStart(2, "0")).join("");
                document.documentElement.style.setProperty("--pk2", a)
              } catch (e) {
                document.documentElement.style.setProperty("--pk2", t)
              }
              S.settings.accent = "custom", S.settings.customAccent = t;
              try {
                localStorage.setItem("famed0ll_settings", JSON.stringify(S.settings))
              } catch (e) {}
              window._saveSiteConfig && window._saveSiteConfig({
                settings: S.settings
              });
              const i = document.getElementById("accent-label");
              i && (i.textContent = "Custom");
              const s = document.getElementById("accent-picked-label");
              s && (s.textContent = t.toUpperCase()), document.querySelectorAll(".accent-sw").forEach(e => e.classList.remove(
                "on"))
            }
          }

          function toggleTexture(e) {
            var t = e ? window.fdTextureUrl("stone") : window.fdTextureUrl("concrete");
            document.querySelector("html").style.backgroundImage = `url('${t}')`, document.body.style.backgroundImage =
              `url('${t}')`, S.settings.texture = e ? "stone" : "concrete";
            const o = document.getElementById("texture-label");
            o && (o.textContent = e ? "Stone" : "Concrete");
            try {
              localStorage.setItem("famed0ll_settings", JSON.stringify(S.settings))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              settings: S.settings
            })
          }

          function toggleTheme(e) {
            S.settings.theme = e ? "light" : "dark";
            var t = window.fdTextureUrl("stone"),
              o = window.fdTextureUrl("concrete"),
              n = S.settings.customBg || "";
            if (e) {
              document.documentElement.classList.add("light-mode"), document.body.classList.remove("dark-mode");
              const l = document.getElementById("theme-toggle");
              l && (l.checked = !0);
              const a = document.getElementById("nav-theme-toggle");
              a && (a.checked = !0), n || (document.documentElement.style.backgroundImage = `url('${t}')`, document.body
                .style.backgroundImage = `url('${t}')`)
            } else {
              document.documentElement.classList.remove("light-mode"), document.body.classList.add("dark-mode");
              const i = document.getElementById("theme-toggle");
              i && (i.checked = !1);
              const s = document.getElementById("nav-theme-toggle");
              s && (s.checked = !1), n || (document.documentElement.style.backgroundImage = `url('${o}')`, document.body
                .style.backgroundImage = `url('${o}')`)
            }
            try {
              localStorage.setItem("famed0ll_settings", JSON.stringify(S.settings))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              settings: S.settings
            })
          }

          function _applyCustomBgUI(e) {
            const t = document.getElementById("custom-bg-preview-wrap"),
              o = document.getElementById("custom-bg-preview"),
              n = document.getElementById("custom-bg-remove-row"),
              l = document.getElementById("custom-bg-input");
            var a = document.getElementById("custom-bg-mode");
            const i = document.getElementById("custom-bg-modal-input");
            e ? (t && (t.style.display = "block"), o && (a = a && a.value || S.settings && S.settings.customBgMode ||
              "tile", o.style.backgroundImage = `url('${e}')`, "cover" === a ? (o.style.backgroundSize = "cover", o
                .style.backgroundRepeat = "no-repeat") : (o.style.backgroundSize = "38px", o.style.backgroundRepeat =
                "repeat")), n && (n.style.display = "flex"), l && (l.value = e), i && (i.value = e)) : (t && (t.style
              .display = "none"), o && (o.style.backgroundImage = "", o.style.backgroundRepeat = "", o.style.backgroundSize =
              ""), n && (n.style.display = "none"), l && (l.value = ""), i && (i.value = ""))
          }

          function setCustomBg() {
            const e = document.getElementById("custom-bg-input");
            let t = (e ? e.value : "").trim();
            if (t) {
              t = t.replace(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/, "https://i.imgur.com/$1.jpg");
              var o = document.getElementById("custom-bg-mode"),
                o = o && o.value || "tile";
              S.settings.customBg = t, S.settings.customBgMode = o, document.documentElement.style.backgroundImage =
                `url('${t}')`, document.body.style.backgroundImage = `url('${t}')`, "cover" === o ? (document.documentElement
                  .style.backgroundRepeat = "no-repeat", document.documentElement.style.backgroundSize = "cover",
                  document.documentElement.style.backgroundPosition = "center center", document.body.style.backgroundRepeat =
                  "no-repeat", document.body.style.backgroundSize = "cover", document.body.style.backgroundPosition =
                  "center center", document.documentElement.style.backgroundAttachment = "fixed", document.body.style.backgroundAttachment =
                  "fixed") : (document.documentElement.style.backgroundRepeat = "repeat", document.documentElement.style
                  .backgroundSize = "38px", document.documentElement.style.backgroundPosition = "left top", document.body
                  .style.backgroundRepeat = "repeat", document.body.style.backgroundSize = "38px", document.body.style.backgroundPosition =
                  "left top", document.documentElement.style.backgroundAttachment = "", document.body.style.backgroundAttachment =
                  ""), _applyCustomBgUI(t);
              const n = document.getElementById("custom-bg-modal-preview");
              n && ("cover" === o ? (n.style.backgroundRepeat = "no-repeat", n.style.backgroundSize = "cover", n.style.backgroundPosition =
                "center center") : (n.style.backgroundRepeat = "repeat", n.style.backgroundSize = "38px", n.style.backgroundPosition =
                "left top"));
              try {
                localStorage.setItem("famed0ll_settings", JSON.stringify(S.settings))
              } catch (e) {}
              window._saveSiteConfig && window._saveSiteConfig({
                settings: S.settings
              });
              const l = document.querySelector("#custom-bg-input + button") || document.querySelector(".setting-btn");
              l && (l.textContent = "✓ Saved", setTimeout(() => {
                l.textContent = "Set Background"
              }, 1600))
            }
          }

          function removeCustomBg() {
            S.settings.customBg = "";
            var e = "light" === S.settings.theme ? window.fdTextureUrl("stone") : window.fdTextureUrl("concrete");
            document.documentElement.style.backgroundImage = `url('${e}')`, document.body.style.backgroundImage =
              `url('${e}')`, document.documentElement.style.backgroundRepeat = "", document.documentElement.style.backgroundSize =
              "", document.documentElement.style.backgroundPosition = "", document.documentElement.style.backgroundAttachment =
              "", document.body.style.backgroundRepeat = "", document.body.style.backgroundSize = "", document.body.style
              .backgroundPosition = "", _applyCustomBgUI(document.body.style.backgroundAttachment = "");
            try {
              localStorage.setItem("famed0ll_settings", JSON.stringify(S.settings))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              settings: S.settings
            })
          }

          function fetchInstaThumbs() {}

          function showPage(e) {
            // ── Lazy-load page HTML on first visit via core.js _loadPage ──
            if (window._loadPage) {
              var _ph = document.getElementById("page-" + e);
              if (_ph && _ph.dataset.pageSrc && !_ph.dataset.loaded) {
                window._loadPage(e, function() { showPage(e); });
                return;
              }
            }
            document.querySelectorAll(".mob-tab,.mob-top-btn,#mob-shop-btn").forEach(function(e) {
              e.classList.remove("active")
            });
            const t = document.getElementById({
              music: "mob-tab-music",
              talk: "mob-tab-talk",
              profile: "mob-tab-profile",
              scrollables: "mob-tab-scroll",
              community: "mob-tab-community",
              live: "mob-live-btn",
              shop: "mob-shop-btn"
            }[e]);
            if (t && t.classList.add("active"), window._fbDb_analytics) try {
              window._fbDb_analytics.collection("analytics").add({
                page: e,
                ts: Date.now(),
                d: (new Date).toISOString()
              })
            } catch (e) {}
            document.querySelectorAll(".page").forEach(e => e.classList.remove("active"));
            const o = document.getElementById("page-" + e);
            o && o.classList.add("active");
            const n = document.getElementById("nav-profile");
            n && (n.classList.toggle("on", "profile" === e), n.classList.toggle("active", "profile" === e));
            const l = document.getElementById("nav-scrollables"),
              a = document.getElementById("nav-community");
            a && (a.classList.toggle("on", "community" === e), a.classList.toggle("active", "community" === e)), l && (
              l.classList.toggle("on", "scrollables" === e), l.classList.toggle("active", "scrollables" === e));
            const i = document.getElementById("nav-feed");
            i && i.classList.toggle("on", "feed" === e);
            const s = document.getElementById("nav-settings-btn");
            s && (s.style.borderColor = "settings" === e ? "var(--pk)" : "");
            const d = document.getElementById("nav-live");
            d && (d.classList.toggle("on", "live" === e), d.classList.toggle("active", "live" === e));
            const c = document.getElementById("nav-shop-main");
            c && (c.classList.toggle("on", "shop" === e), c.classList.toggle("active", "shop" === e));
            const r = document.getElementById("nav-music");
            if (r && (r.classList.toggle("on", "music" === e), r.classList.toggle("active", "music" === e)),
              "scrollables" === e && function() {
                if (!document.getElementById("tiktok-embed-js")) {
                  var s = document.createElement("script");
                  s.id = "tiktok-embed-js", s.src = "https://www.tiktok.com/embed.js", s.async = !0, document.body.appendChild(
                    s)
                }
              }(), "live" === e) try {
              "function" == typeof initLivePage && initLivePage()
            } catch (e) {
              console.warn("initLivePage failed or not defined", e)
            }
            if ("talk" === e) {
              const u = document.getElementById("talk-intro");
              if (u) {
                u.classList.remove("playing"), u.offsetWidth, u.classList.add("playing"), setTimeout(() => u.classList.remove(
                  "playing"), 1600);
                try {
                  const p = new Audio(
                    "https://www.dropbox.com/scl/fi/aohixtb5actdi3r4psk0z/Splat-Sound-Effect-HD-0.mp3?rlkey=t1mpm4tjuumh8dqbfyd7h3is5&st=pbsahp7p&dl=1"
                  );
                  p.volume = .8, p.play().catch(() => {})
                } catch (e) {}
              }
              try {
                "function" == typeof updateView && updateView()
              } catch (e) {}
              try {} catch (e) {}
            }
            const m = document.getElementById("nav-talk");
            m && (m.classList.toggle("on", "talk" === e), m.classList.toggle("active", "talk" === e));
            try {
              const g = document.getElementById("theme-toggle");
              "community" === e ? (window._communityPrevLight = document.documentElement.classList.contains(
                "light-mode"), document.documentElement.classList.remove("light-mode"), document.body.classList.add(
                "dark-mode"), g && (g.checked = !1)) : void 0 !== window._communityPrevLight && (window._communityPrevLight ?
                (document.documentElement.classList.add("light-mode"), document.body.classList.remove("dark-mode"), g &&
                  (g.checked = !0)) : (document.documentElement.classList.remove("light-mode"), document.body.classList
                  .add("dark-mode"), g && (g.checked = !1)), delete window._communityPrevLight)
            } catch (e) {
              console.warn("theme toggle fallback failed", e)
            }
          }

          function _renderLiveDesc(e) {
            const t = document.getElementById("live-desc-content"),
              o = document.getElementById("live-desc-placeholder");
            t && (e && e.trim() ? (t.innerHTML = e, o && (o.style.display = "none")) : (t.innerHTML = "", o && (o.style
              .display = "")))
          }

          function openLiveDescEdit() {
            if (document.body.classList.contains("talk-admin")) {
              const e = document.getElementById("live-desc-editor"),
                t = document.getElementById("live-desc-content");
              e && t && (e.innerHTML = t.innerHTML.replace(/<span[^>]*live-desc-empty[^>]*>.*?<\/span>/gi, "")),
                document.getElementById("live-desc-modal-overlay").classList.add("active"), e && e.focus()
            }
          }

          function closeLiveDescEdit() {
            document.getElementById("live-desc-modal-overlay").classList.remove("active")
          }

          function liveDescExec(e) {
            document.getElementById("live-desc-editor").focus(), document.execCommand(e, !1, null)
          }

          function liveDescLink() {
            var e = prompt("Enter URL:");
            e && (document.getElementById("live-desc-editor").focus(), document.execCommand("createLink", !1, e))
          }

          function liveDescAddPhoto() {
            const a = document.createElement("input");
            a.type = "file", a.accept = "image/*", a.onchange = async () => {
              var e = a.files[0];
              if (e) {
                const n = document.querySelector('.live-desc-tb-btn[onclick="liveDescAddPhoto()"]');
                var t = n ? n.textContent : "";
                n && (n.textContent = "Uploading...");
                try {
                  var o = await window._uploadFile(e);
                  const l = document.getElementById("live-desc-editor");
                  l.focus(), document.execCommand("insertHTML", !1,
                    `<img src="${o}" alt="" style="max-width:100%;border-radius:4px;margin:6px 0;display:block;">`)
                } catch (e) {
                  alert("Upload failed: " + e.message)
                } finally {
                  n && (n.textContent = t)
                }
              }
            }, a.click()
          }
          async function saveLiveDesc() {
            if (document.body.classList.contains("talk-admin")) {
              var e = document.getElementById("live-desc-editor"),
                e = e ? e.innerHTML : "";
              const t = document.querySelector(".live-desc-save-btn");
              t && (t.textContent = "Saving...");
              try {
                await window._saveSiteConfig({
                  live_description: e
                }), _renderLiveDesc(e), closeLiveDescEdit()
              } catch (e) {
                alert("Save failed: " + e.message)
              } finally {
                t && (t.textContent = "Save")
              }
            }
          }

          function deleteInstaCell(e, t) {
            const o = e.closest(".insta-cell");
            if (!o) return;
            const img = o.querySelector("img"),
              a = o.querySelector("a");
            window._instaTrash = window._instaTrash || [];
            window._instaTrash.push({
              src: img ? img.src : "",
              href: a ? a.href : "",
              alt: img ? img.alt : "",
              title: o.getAttribute("title") || "",
              carousel: o.classList.contains("is-carousel"),
              html: o.outerHTML
            });
            o.style.transition = "opacity .2s,transform .2s";
            o.style.opacity = "0";
            o.style.transform = "scale(0.8)";
            setTimeout(() => {
              o.remove();
              _saveInstaGrid();
              _showRestoreToast()
            }, 200)
          }

          function _showRestoreToast() {
            let t = document.getElementById("insta-restore-toast");
            if (!t) {
              t = document.createElement("div");
              t.id = "insta-restore-toast";
              t.style.cssText =
                "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--s3,#222);color:var(--ink);border:1px solid var(--border2);border-radius:6px;padding:8px 14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;z-index:9000;display:flex;align-items:center;gap:10px;opacity:0;transition:opacity .2s;pointer-events:none";
              t.innerHTML =
                `<span>Post removed</span><button onclick="restoreLastInsta()" style="background:var(--pk,#e8d5c4);color:#111;border:none;border-radius:3px;padding:3px 8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;font-weight:700">UNDO</button>`;
              document.body.appendChild(t)
            }
            clearTimeout(window._restoreToastTimer);
            t.style.pointerEvents = "all";
            requestAnimationFrame(() => {
              t.style.opacity = "1"
            });
            window._restoreToastTimer = setTimeout(() => {
              t.style.opacity = "0";
              setTimeout(() => {
                t.style.pointerEvents = "none"
              }, 200)
            }, 4000)
          }

          function restoreLastInsta() {
            const trash = window._instaTrash;
            if (!trash || !trash.length) return;
            const item = trash.pop();
            const grid = document.getElementById("grid-gallery");
            if (!grid) return;
            const temp = document.createElement("div");
            temp.innerHTML = item.html;
            const cell = temp.firstElementChild;
            if (!cell) return;
            cell.style.opacity = "0";
            cell.style.transform = "scale(0.8)";
            cell.style.transition = "opacity .2s,transform .2s";
            grid.prepend(cell);
            requestAnimationFrame(() => {
              cell.style.opacity = "1";
              cell.style.transform = "scale(1)"
            });
            _saveInstaGrid();
            const t = document.getElementById("insta-restore-toast");
            if (t) {
              t.style.opacity = "0";
              t.style.pointerEvents = "none"
            }
            if (trash.length) setTimeout(_showRestoreToast, 300)
          }

          function toggleCarousel(e) {
            const t = e.closest(".insta-cell");
            t && (t.classList.toggle("is-carousel"), _saveInstaGrid())
          }

          function _saveInstaGrid() {
            var e = document.querySelectorAll("#grid-gallery .insta-cell"),
              e = Array.from(e).map(e => {
                var t = e.querySelector("img"),
                  o = e.querySelector("a");
                return {
                  src: t ? t.src : "",
                  href: o ? o.href : "",
                  alt: t ? t.alt : "",
                  title: e.getAttribute("title") || "",
                  carousel: e.classList.contains("is-carousel")
                }
              });
            window._saveSiteConfig && window._saveSiteConfig({
              insta_posts: e
            })
          }

          function openNowPlayingEdit() {
            if (document.body.classList.contains("talk-admin")) {
              var e = S.profile;
              document.getElementById("npe-title").value = e.npTitle || "", document.getElementById("npe-artist").value =
                e.npArtist || "", document.getElementById("npe-audio-url").value = e.audio && e.audio.isUrl ? e.audio.dataUrl :
                "", document.getElementById("npe-spotify").value = e.spotify || "", document.getElementById("npe-apple")
                .value = e.apple || "";
              const t = document.getElementById("npe-audio-preview");
              t && (t.textContent = e.audio && e.audio.name ? e.audio.name : ""), document.getElementById(
                "np-edit-modal").classList.add("open")
            }
          }

          function closeNowPlayingEdit(e) {
            e && e.target !== document.getElementById("np-edit-modal") || document.getElementById("np-edit-modal").classList
              .remove("open")
          }

          function handleNpeAudioUpload(e) {
            const o = e.files[0];
            if (o) {
              const t = new FileReader;
              t.onload = e => {
                S.profile.audio = {
                  name: o.name,
                  dataUrl: e.target.result,
                  isUrl: !1
                };
                const t = document.getElementById("npe-audio-preview");
                t && (t.textContent = o.name)
              }, t.readAsDataURL(o)
            }
          }

          function removeNpeAudio() {
            S.profile.audio = null, document.getElementById("npe-audio-input").value = "", document.getElementById(
              "npe-audio-url").value = "";
            const e = document.getElementById("npe-audio-preview");
            e && (e.textContent = "")
          }

          function saveNowPlaying() {
            const e = S.profile;
            var t = document.getElementById("npe-title").value.trim(),
              o = document.getElementById("npe-artist").value.trim(),
              n = document.getElementById("npe-audio-url").value.trim(),
              l = document.getElementById("npe-spotify").value.trim(),
              a = document.getElementById("npe-apple").value.trim();
            t && (e.npTitle = t), o && (e.npArtist = o), n && (e.audio = {
                name: n,
                dataUrl: n,
                isUrl: !0
              }), l && (e.spotify = l), a && (e.apple = a), document.getElementById("sl-np-title").textContent = e.npTitle,
              document.getElementById("sl-np-artist").textContent = e.npArtist, ensureNowPlayingAudio(),
              updateNpLinksVisibility(), "function" == typeof syncMusicSidebar && syncMusicSidebar();
            try {
              localStorage.setItem("famed0ll_profile", JSON.stringify(e))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              profile: JSON.parse(JSON.stringify(e))
            }), closeNowPlayingEdit()
          }

          function updatePostCount() {
            const e = document.getElementById("stat-posts");
            var t, o;
            e && (t = document.querySelectorAll("#grid-gallery .insta-cell").length, o = Object.values(S.posts).reduce(
              (e, t) => e + t.length, 0), e.textContent = t + o)
          }! function() {
            try {
              // default likes visibility: hidden by default unless user/site config overrides
              if (null === localStorage.getItem("fd_likes_hidden")) {
                try {
                  localStorage.setItem("fd_likes_hidden", "true");
                } catch (e) {}
              }
              "true" === localStorage.getItem("fd_likes_hidden") && document.body.classList.add("likes-hidden")
            } catch (e) {}
            try {
              var e = JSON.parse(localStorage.getItem("famed0ll_posts") || "null");
              e && "object" == typeof e && (S.posts = Object.assign(S.posts, e))
            } catch (e) {
              console.warn("Failed to restore posts", e)
            }
            try {
              var t = JSON.parse(localStorage.getItem("famed0ll_settings") || "null");
              t && "object" == typeof t && (S.settings = Object.assign(S.settings, t));
              var o = JSON.parse(localStorage.getItem("famed0ll_profile") || "null");
              o && "object" == typeof o && (S.profile = Object.assign(S.profile, o), window.ensureProfileDefaults(S.profile), S.profile.avatar && document.getElementById("sl-avatar-inner") && (document.getElementById("sl-avatar-inner").innerHTML =
                  `<img src="${S.profile.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                ))
              
              // Initialize fans count after profile data is loaded
              if (S.profile.followerCounts) {
                const t = Object.values(S.profile.followerCounts).reduce((e, t) => e + t, 0);
                const s = document.getElementById("stat-followers");
                s && (s.textContent = 0 < t ? formatFans(t) : "—");
                
                // Initialize fans modal display values
                const e = ["tiktok", "instagram", "youtube", "spotify", "twitch"];
                e.forEach(e => {
                  var t = S.profile.followerCounts[e] && 0 < S.profile.followerCounts[e] ? S.profile.followerCounts[e] : 0;
                  const o = document.getElementById("fans-" + e);
                  o && (o.textContent = 0 < t ? formatFans(t) : "—");
                  const n = document.getElementById("fans-input-" + e);
                  n && (n.value = 0 < t ? t : "");
                  const i = document.getElementById("ep-followers-" + e);
                  i && (i.value = 0 < t ? t : "");
                });
                const o = document.getElementById("fans-modal-total");
                o && (o.textContent = 0 < t ? formatFans(t) : "—");
              }
              
              // Update level progress after profile data is loaded (this includes "days to next")
              updateLevelProgress();
            } catch (e) {
              console.warn("Failed to load saved state", e)
            }
            if (applyAccent(S.settings.accent), "stone" === S.settings.texture) {
              const l = window.fdTextureUrl("stone");
              document.querySelector("html").style.backgroundImage = `url('${l}')`, document.body.style.backgroundImage =
                `url('${l}')`;
              const a = document.getElementById("texture-toggle");
              a && (a.checked = !0);
              const i = document.getElementById("texture-label");
              i && (i.textContent = "Stone")
            }
            S.settings.customBg && (document.documentElement.style.backgroundImage = `url('${S.settings.customBg}')`,
              document.body.style.backgroundImage = `url('${S.settings.customBg}')`, requestAnimationFrame(() =>
                _applyCustomBgUI(S.settings.customBg)));
            t = "light" === S.settings.theme;
            const n = document.getElementById("theme-toggle");
            n && (n.checked = t);
            const l = window.fdTextureUrl("stone");
            o = window.fdTextureUrl("concrete");
            t ? (document.documentElement.classList.add("light-mode"), document.body.classList.remove("dark-mode"),
                document.documentElement.style.backgroundImage = `url('${l}')`, document.body.style.backgroundImage =
                `url('${l}')`) : (document.documentElement.classList.remove("light-mode"), document.body.classList.add(
                  "dark-mode"), document.documentElement.style.backgroundImage = `url('${o}')`, document.body.style.backgroundImage =
                `url('${o}')`), t ? document.body.classList.remove("dark-mode") : document.body.classList.add(
                "dark-mode");
            (function() {
              var _g = function(id) { return document.getElementById(id); };
              var _rn = _g("sl-realname"); if (_rn) _rn.textContent = S.profile.realname || _rn.textContent;
              var _ro = _g("sl-origin");   if (_ro) _ro.innerHTML  = S.profile.origin   || _ro.innerHTML;
              var _rb = _g("sl-bio");      if (_rb) _rb.textContent = S.profile.bio      || _rb.textContent;
              var _nt = _g("sl-np-title"); if (_nt) _nt.textContent = S.profile.npTitle  || _nt.textContent;
              var _na = _g("sl-np-artist");if (_na) _na.textContent = S.profile.npArtist || _na.textContent;
            })();
            S.profile.displayName;
            updatePostCount();
            // renderYT() called by _onPageLoad after profile.html injects
            try {
              const d = JSON.parse(localStorage.getItem("famed0ll_pinned") || "null");
              if (d && d.embedUrl) {
                S.pinned = d;
                const c = document.getElementById("feat-embed");
                document.getElementById("feat-placeholder").style.display = "none", c.querySelectorAll("iframe").forEach(
                  e => e.remove());
                const r = document.createElement("iframe");
                r.src = d.embedUrl.includes("autoplay=") ? d.embedUrl : d.embedUrl + (d.embedUrl.includes("?") ?
                    "&autoplay=1&mute=1" : "?autoplay=1&mute=1"), r.scrolling = "no", r.allowTransparency = !0, r.style
                  .cssText = "width:100%;height:100%;border:none;", c.appendChild(r), d.desc && (document.getElementById(
                    "feat-desc-text").textContent = d.desc)
              }
            } catch (e) {
              console.warn("failed to restore pinned item", e)
            }
            fetchInstaThumbs()
          }(), window._initTwitchOnce = function() {
            var e = "twitch-video";
            const t = document.getElementById(e);
            if (t) {
              if (t.innerHTML = "", window.twitchPlayer) {
                try {
                  "function" == typeof window.twitchPlayer.pause && window.twitchPlayer.pause()
                } catch (e) {}
                try {
                  "function" == typeof window.twitchPlayer.destroy && window.twitchPlayer.destroy()
                } catch (e) {}
                window.twitchPlayer = null
              }
              var o = () => {
                const t = ["famedoll.com", "d0ll.ca", "claude.ai", "websim.ai", "websim.com", "localhost"];
                try {
                  window.location.hostname && t.push(window.location.hostname)
                } catch (e) {}
                try {
                  if (window.location.ancestorOrigins)
                    for (let e = 0; e < window.location.ancestorOrigins.length; e++) try {
                      t.push(new URL(window.location.ancestorOrigins[e]).hostname)
                    } catch (e) {}
                } catch (e) {}
                return [...new Set(t)].filter(Boolean)
              };
              try {
                "undefined" != typeof Twitch && Twitch.Player ? window.twitchPlayer = new Twitch.Player(e, {
                    width: "100%",
                    height: 480,
                    channel: "famedoll",
                    parent: o()
                  }) : t.innerHTML =
                  '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-family:DM Mono,monospace;font-size:13px;flex-direction:column;gap:12px;"><div>Player unavailable — open on Twitch</div><a href="https://www.twitch.tv/famedoll" target="_blank" style="color:var(--pk);text-decoration:none;border:1px solid var(--border2);padding:8px 16px;border-radius:4px;">Watch on Twitch</a></div>'
              } catch (e) {
                console.warn("Twitch init failed, showing fallback", e), t.innerHTML =
                  '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-family:DM Mono,monospace;font-size:13px;flex-direction:column;gap:12px;"><div>Player failed to initialize — open on Twitch</div><a href="https://www.twitch.tv/famedoll" target="_blank" style="color:var(--pk);text-decoration:none;border:1px solid var(--border2);padding:8px 16px;border-radius:4px;">Watch on Twitch</a></div>'
              }
              const n = document.getElementById("twitch-chat-container-live");
              if (n) {
                n.innerHTML = "";
                let e = o();
                o =
                  `https://www.twitch.tv/embed/famedoll/chat?${e.map(e=>`parent=${encodeURIComponent(e)}`).join("&")}&darkpopout=true`;
                const l = document.createElement("iframe");
                l.src = o, l.style.width = "100%", l.style.height = "100%", l.style.border = "none", l.id =
                  "twitch-chat-iframe", n.appendChild(l)
              }
            }
          };
          const liveDescOverlay = document.getElementById("live-desc-modal-overlay");
          if (liveDescOverlay) {
            liveDescOverlay.addEventListener("click", function(e) {
              e.target === this && closeLiveDescEdit()
            });
          }
          let _epAvatarData = null;

          function openEditModal() {
            if (document.body.classList.contains("talk-admin")) {
              const t = S.profile;
              var e = (e, t) => {
                const o = document.getElementById(e);
                o && (o.value = t || "")
              };
              e("ep-realname", t.realname), e("ep-level", t.level), e("ep-born", t.born), e("ep-origin", t.origin);
              const o = document.getElementById("ep-bio");
              o && (o.value = t.bio || "");
              const n = t.followerCounts || {};
              ["tiktok", "instagram", "youtube", "spotify", "twitch"].forEach(e => {
                const t = document.getElementById("ep-followers-" + e);
                t && (t.value = null != n[e] ? n[e] : "")
              }), recalcFans(), _epAvatarData = t.avatar, refreshEpAvatar();
              const l = document.getElementById("ep-avatar-url");
              l && (l.value = t.avatar && !t.avatar.startsWith("data:") ? t.avatar : ""), document.getElementById(
                "edit-modal").classList.add("open")
            }
          }

          function closeEditModal(e) {
            e && e.target !== document.getElementById("edit-modal") || (document.getElementById("edit-modal").classList
              .remove("open"), _epAvatarData = null, document.getElementById("ep-avatar-input").value = "")
          }

          function refreshEpAvatar() {
            const e = document.getElementById("ep-av-preview");
            _epAvatarData ? e.innerHTML =
              `<img src="${_epAvatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>` : e.innerHTML =
              '<svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:none;stroke:var(--ink3);stroke-width:.9;"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
          }

          function handleAvatarUpload(e) {
            e = e.files[0];
            if (e) {
              const t = new FileReader;
              t.onload = e => {
                _epAvatarData = e.target.result, refreshEpAvatar()
              }, t.readAsDataURL(e)
            }
          }

          function handleAvatarUrl(e) {
            e && e.trim() && (e = e.trim(), _epAvatarData = e, refreshEpAvatar())
          }

          function ensureEpAudioPlayer() {
            const e = document.getElementById("ep-audio-preview"),
              t = document.getElementById("ep-audio-player");
            if (t && t.remove(), S.profile && S.profile.audio && S.profile.audio.dataUrl) {
              const o = document.createElement("audio");
              o.id = "ep-audio-player", o.controls = !0, o.src = S.profile.audio.dataUrl, o.style.cssText =
                "width:100%;margin-top:8px;", e && e.parentNode && e.parentNode.appendChild(o)
            }
          }

          function saveProfile() {
            const e = S.profile;
            var t = document.getElementById("ep-displayname")?.value.trim(),
              o = document.getElementById("ep-realname")?.value.trim(),
              n = document.getElementById("ep-level")?.value.trim(),
              l = document.getElementById("ep-born")?.value.trim(),
              a = document.getElementById("ep-origin")?.value.trim(),
              i = document.getElementById("ep-bio")?.value;
            t && (e.displayName = t), o && (e.realname = o), n && (e.level = n), l && (e.born = l), a && (e.origin = a),
              "string" == typeof i && (e.bio = i), _epAvatarData && (e.avatar = _epAvatarData);
            i = e.displayName || "FAME DOLL";
            const s = document.getElementById("sl-display-name");
            if (s) s.textContent = i;
            else {
              const c = document.querySelector(".sl-name");
              c && (c.textContent = i)
            }
            document.getElementById("sl-realname").textContent = e.realname, document.getElementById("sl-origin").innerHTML =
              e.origin || "", document.getElementById("sl-bio").textContent = e.bio, document.getElementById(
                "sl-np-title").textContent = e.npTitle, document.getElementById("sl-np-artist").textContent = e.npArtist,
              updateNpLinksVisibility(), updateLevelProgress(), e.avatar && (document.getElementById("sl-avatar-inner")
                .innerHTML =
                `<img src="${e.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`), S.profile
              .followerCounts = S.profile.followerCounts || {}, ["tiktok", "instagram", "youtube", "spotify", "twitch"]
              .forEach(e => {
                const t = document.getElementById("ep-followers-" + e);
                var o;
                t && "" !== t.value.trim() && (o = parseInt(t.value) || 0, S.profile.followerCounts[e] = o)
              });
            i = Object.values(S.profile.followerCounts).reduce((e, t) => e + t, 0);
            if (0 < i) {
              const r = document.getElementById("stat-followers");
              r && (r.textContent = formatFans(i))
            }
            try {
              localStorage.setItem("famed0ll_profile", JSON.stringify(S.profile))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              profile: JSON.parse(JSON.stringify(S.profile))
            }), closeEditModal();
            const d = document.querySelector("#edit-modal .modal-box");
            d && (d.style.animation = "flash-border .4s ease", setTimeout(() => d.style.animation = "", 400))
          }

          function openFansModal() {
            const l = S.profile && S.profile.followerCounts ? S.profile.followerCounts : {},
              e = ["tiktok", "instagram", "youtube", "spotify", "twitch"];
            e.forEach(e => {
              var t = l[e] && 0 < l[e] ? l[e] : 0;
              const o = document.getElementById("fans-" + e);
              o && (o.textContent = 0 < t ? formatFans(t) : "—");
              const n = document.getElementById("fans-input-" + e);
              n && (n.value = 0 < t ? t : "")
            });
            var t = e.reduce((e, t) => e + (l[t] || 0), 0);
            const o = document.getElementById("fans-modal-total");
            o && (o.textContent = 0 < t ? formatFans(t) : "—"), document.getElementById("fans-modal").classList.add(
              "open")
          }
          let _fanSaveTimer = null;

          function updateFanCount(e, t) {
            if (document.body.classList.contains("talk-admin")) {
              var o = parseInt(t) || 0;
              S.profile.followerCounts = S.profile.followerCounts || {}, S.profile.followerCounts[e] = o;
              const n = document.getElementById("fans-" + e);
              n && (n.textContent = 0 < o ? formatFans(o) : "—");
              t = Object.values(S.profile.followerCounts).reduce((e, t) => e + t, 0);
              const l = document.getElementById("stat-followers");
              l && (l.textContent = 0 < t ? formatFans(t) : "—");
              const a = document.getElementById("fans-modal-total");
              a && (a.textContent = 0 < t ? formatFans(t) : "—");
              const i = document.getElementById("ep-followers-" + e);
              i && (i.value = 0 < o ? o : "");
              try {
                localStorage.setItem("famed0ll_profile", JSON.stringify(S.profile))
              } catch (e) {}
              clearTimeout(_fanSaveTimer);
              _fanSaveTimer = setTimeout(() => {
                window._saveSiteConfig && window._saveSiteConfig({
                  profile: JSON.parse(JSON.stringify(S.profile))
                })
              }, 800)
            }
          }

          function closeFansModal(e) {
            e && e.target !== document.getElementById("fans-modal") || document.getElementById("fans-modal").classList.remove(
              "open")
          }
          let pinnedUrl = null,
            pinTimer;

          function openPinModal() {
            document.body.classList.contains("talk-admin") && (document.getElementById("pin-modal").classList.add(
              "open"), setTimeout(() => document.getElementById("pin-url").focus(), 100))
          }

          function clearPin() {
            S.pinned = null;
            try {
              localStorage.removeItem("famed0ll_pinned")
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              pinned: null
            });
            const e = document.querySelector("#feat-embed iframe");
            e && (e.src =
              "https://www.youtube-nocookie.com/embed/videoseries?list=PLhRgPfuqZrXNrd24d6fXO0ZKhWFm922oM&autoplay=0"
            );
            const t = document.getElementById("feat-desc-text");
            t && (t.textContent = "—"), closePinModal()
          }

          function closePinModal(e) {
            e && e.target !== document.getElementById("pin-modal") || (document.getElementById("pin-modal").classList.remove(
                "open"), document.getElementById("pin-url").value = "", document.getElementById("pin-desc").value =
              "", document.getElementById("pin-preview").classList.remove("show"), document.getElementById(
                "pin-iframe").src = "", document.getElementById("pin-submit").disabled = !0, pinnedUrl = null)
          }

          function handlePinUrl(n) {
            clearTimeout(pinTimer), document.getElementById("pin-submit").disabled = !0;
            const l = document.getElementById("pin-preview");
            n.trim() ? pinTimer = setTimeout(() => {
              let e = null;
              for (const t of ALL_P)
                if (e = t(n), e) break;
              if (e) {
                l.classList.add("show"), document.getElementById("pin-loading").style.display = "flex";
                const o = document.getElementById("pin-iframe");
                o.style.opacity = "0", o.src = e.embedUrl, o.onload = () => {
                  document.getElementById("pin-loading").style.display = "none", o.style.opacity = "1", o.style.transition =
                    "opacity .3s", document.getElementById("pin-submit").disabled = !1, pinnedUrl = e.embedUrl
                }
              } else l.classList.remove("show")
            }, 500) : l.classList.remove("show")
          }

          function ensureAutoplayParam(t) {
            try {
              return t ? t.includes("autoplay=") ? t : t + (t.includes("?") ? "&autoplay=1&mute=1" :
                "?autoplay=1&mute=1") : t
            } catch (e) {
              return t
            }
          }

          function submitPin() {
            if (pinnedUrl) {
              const t = document.getElementById("feat-embed");
              document.getElementById("feat-placeholder").style.display = "none", t.querySelectorAll("iframe").forEach(
                e => e.remove());
              const o = document.createElement("iframe");
              o.src = ensureAutoplayParam(pinnedUrl), o.scrolling = "no", o.allowTransparency = !0, o.style.cssText =
                "width:100%;height:100%;border:none;", t.appendChild(o);
              var e = document.getElementById("pin-desc").value.trim();
              e && (document.getElementById("feat-desc-text").textContent = e);
              try {
                S.pinned = {
                  embedUrl: pinnedUrl,
                  desc: e || ""
                }, localStorage.setItem("famed0ll_pinned", JSON.stringify(S.pinned))
              } catch (e) {
                console.warn("failed to save pinned item", e)
              }
              closePinModal()
            }
          }
          let urlTimer;

          function openAddModal(e) {
            document.body.classList.contains("talk-admin") && openAddModal_real(e)
          }

          function openAddModal_real(e) {
            S.addingFor = e || "gallery";
            e = PLAT[S.addingFor];
            document.getElementById("modal-title").textContent = "Add " + cap("gallery" === S.addingFor ?
              "Instagram Post" : "cinema" === S.addingFor ? "YouTube Video" : "talk" === S.addingFor ? "Tweet" :
              "TikTok Clip");
            const t = document.getElementById("modal-tag");
            t.textContent = e.label, t.style.cssText =
              `background:rgba(${hRgb(e.ch)},0.1);color:${e.ch};font-family:'DM Mono',monospace;font-size:6px;letter-spacing:2px;padding:2px 7px;margin-left:5px;border-radius:1px;`,
              document.getElementById("modal-url-label").textContent = e.urlLabel, document.getElementById("modal-url")
              .placeholder = e.placeholder, document.getElementById("modal-url").value = "", document.getElementById(
                "modal-caption").value = "", document.getElementById("modal-likes").value = "", document.getElementById(
                "modal-time").value = "", document.getElementById("modal-preview").classList.remove("show"), document.getElementById(
                "modal-iframe").src = "", document.getElementById("modal-submit").disabled = !0, document.getElementById(
                "add-modal").classList.add("open"), setTimeout(() => document.getElementById("modal-url").focus(), 100)
          }

          function closeAddModal(e) {
            e && e.target !== document.getElementById("add-modal") || document.getElementById("add-modal").classList.remove(
              "open")
          }

          function handleUrl(o) {
            clearTimeout(urlTimer), document.getElementById("modal-submit").disabled = !0;
            const n = document.getElementById("modal-preview");
            o.trim() ? urlTimer = setTimeout(() => {
              var e = PLAT[S.addingFor].parse(o);
              if (e) {
                n.classList.add("show"), document.getElementById("modal-loading").style.display = "flex";
                const t = document.getElementById("modal-iframe");
                t.style.opacity = "0", t.src = e.embedUrl, t.onload = () => {
                  document.getElementById("modal-loading").style.display = "none", t.style.opacity = "1", t.style
                    .transition = "opacity .3s", document.getElementById("modal-submit").disabled = !1
                }
              } else n.classList.remove("show")
            }, 500) : n.classList.remove("show")
          }

          function submitPost() {
            var e = document.getElementById("modal-url").value.trim(),
              e = PLAT[S.addingFor].parse(e);
            if (e) {
              e = {
                id: Date.now(),
                tab: S.addingFor,
                platform: PLAT[S.addingFor].label,
                ch: PLAT[S.addingFor].ch,
                ...e,
                caption: document.getElementById("modal-caption").value.trim(),
                likes: parseInt(document.getElementById("modal-likes").value.replace(/\D/g, "")) || 0,
                time: document.getElementById("modal-time").value.trim() || "just now",
                type: PLAT[S.addingFor].type,
                comments: [],
                liked: !1,
                saved: !1
              };
              S.posts[S.addingFor].unshift(e), "cinema" === S.addingFor ? renderYT() : renderGrid(S.addingFor),
                updatePostCount();
              try {
                localStorage.setItem("famed0ll_posts", JSON.stringify(S.posts))
              } catch (e) {}
              closeAddModal()
            }
          }

          function parseBornString(e) {
            if (!e) return null;
            let t = e.replace(/(st|nd|rd|th)/gi, "").replace(/’/g, "'").trim();
            e = t.match(/'(\d{2})$/);
            e && (o = 30 < (o = parseInt(e[1], 10)) ? 1900 + o : 2e3 + o, t = t.replace(/'\d{2}$/, "") + " " + o);
            var o = new Date(t);
            if (!isNaN(o)) return o;
            o = new Date(t + " " + (new Date).getFullYear());
            return isNaN(o) ? null : o
          }

          function updateLevelProgress() {
            const e = S.profile;
            if (document.getElementById("sl-lvl")) {
              var n = (e.level || "LVL.0").match(/(\d+)/),
                l = n ? parseInt(n[1], 10) : 0;
              const o = document.getElementById("sl-lvl");
              o && (o.textContent = "LVL. " + l);
              const a = document.getElementById("lvl-num-left"),
                i = document.getElementById("lvl-num-right");
              a && (a.textContent = l), i && (i.textContent = l + 1);
              var t = e.born || "",
                n = parseBornString(t);
              const s = document.getElementById("lvl-fill"),
                d = document.getElementById("lvl-bar-label"),
                c = document.getElementById("lvl-tooltip");
              if (n && s && d) {
                const r = new Date;
                let e = new Date(n);
                e.setFullYear(r.getFullYear());
                let t, o;
                e > r ? (t = new Date(e), t.setFullYear(e.getFullYear() - 1), o = e) : (t = e, o = new Date(e), o.setFullYear(
                  e.getFullYear() + 1));
                l = o - t, n = r - t, l = Math.max(0, Math.min(100, n / l * 100));
                const m = parseFloat(s.dataset._last || 0),
                  u = Math.round(l);
                s.dataset._last = u;
                const p = performance.now();
                requestAnimationFrame(function e(t) {
                  var o = Math.min(1, (t - p) / 900),
                    t = o < .5 ? 4 * o * o * o : (o - 1) * (2 * o - 2) * (2 * o - 2) + 1,
                    t = Math.round(m + (u - m) * t);
                  s.style.width = t + "%", o < 1 && requestAnimationFrame(e)
                });
                l = t.toLocaleString(void 0, {
                  month: "short",
                  day: "numeric"
                });
                d.textContent = l;
                l = Math.ceil((o - r) / 864e5);
                c.textContent = `${l} day${1===l?"":"s"} to next level`
              } else s && (s.style.width = "0%"), d && (d.textContent = t || "—"), c && (c.textContent = "—")
            }
          }

          function renderGrid(e) {
            const o = "clips" === e,
              n = document.getElementById("grid-" + e);
            n.querySelectorAll(o ? ".tiktok-cell" : ".insta-cell").forEach(e => e.remove());
            const t = n.querySelector(".grid-empty"),
              l = S.posts[e] || [];
            if (l.length) {
              t && (t.style.display = "none");
              const a = l.slice().sort((e, t) => t.id - e.id);
              a.forEach(e => {
                const t = document.createElement("div");
                t.className = o ? "tiktok-cell" : "insta-cell", t.innerHTML =
                  `<iframe src="${e.embedUrl}" scrolling="no" allowtransparency="true" loading="lazy"></iframe><div class="cell-ov"><div class="cell-stat"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>${e.likes.toLocaleString()}</div></div>`,
                  t.onclick = () => openDetail(e), n.appendChild(t)
              })
            } else t && (t.style.display = "flex")
          }
          async function renderYT() {
            try {
              // Ensure required elements exist
              const e = document.getElementById("yt-list"),
                t = document.getElementById("yt-list-side");
              
              if (!e && !t) {
                console.warn('YouTube list elements not found, skipping renderYT');
                return;
              }

              function o(e) {
                if (!e) return null;
                var t = e.querySelector(".yt-empty");
                return e.querySelectorAll(".yt-item").forEach(e => e.remove()), t
              }
              const n = o(e),
                l = o(t),
                a = S.posts.cinema || [],
                i = a.slice().sort((e, t) => t.id - e.id);
            if (i.length) {
              n && (n.style.display = "none"), l && (l.style.display = "none");
              for (const u of i)
                if ("playlist" === u.type && u.playlistId) try {
                  var s = (S.posts.cinema || []).filter(e => {
                    return !(!e.playlistId || e.playlistId !== u.playlistId) || !!(e.embedUrl && u.embedUrl && e.embedUrl
                      .includes("list=") && u.embedUrl.includes("list=")) && (e.embedUrl.split("list=")[1] ||
                      "") === (u.embedUrl.split("list=")[1] || "")
                  }).sort((e, t) => (t.id || 0) - (e.id || 0));
                  s.length && (u.time = s[0].time || u.time)
                } catch (e) {}
              for (const p of i) {
                window._ytMetaCache = window._ytMetaCache || {};
                const _cacheKey = (t, e, o) => e === "playlist" ? `pl:${o}` : `vid:${t}`;
                var d = await async function(t, e, o) {
                  const ck = _cacheKey(t, e, o);
                  if (window._ytMetaCache[ck]) return window._ytMetaCache[ck];
                  if ("playlist" === e && o) {
                    try {
                      const a = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${o}&key=${YT_API_KEY}`);
                      if (!a.ok) throw new Error("playlist fetch failed");
                      var n = (await a.json()).items?.[0];
                      if (n) {
                        const r = {
                          title: n.snippet.title,
                          thumb: n.snippet.thumbnails?.high?.url || n.snippet.thumbnails?.default?.url ||
                            "https://i.ytimg.com/vi/JDy-wtnZtm0/hqdefault.jpg"
                        };
                        window._ytMetaCache[ck] = r;
                        return r
                      }
                    } catch (e) {}
                    const fr = {
                      title: "Playlist",
                      thumb: "https://i.ytimg.com/vi/JDy-wtnZtm0/hqdefault.jpg"
                    };
                    window._ytMetaCache[ck] = fr;
                    return fr
                  }
                  try {
                    const i = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${t}`);
                    if (!i.ok) throw new Error("noembed failed");
                    var l = await i.json();
                    const vr = {
                      title: l.title,
                      thumb: l.thumbnail_url
                    };
                    window._ytMetaCache[ck] = vr;
                    return vr
                  } catch (e) {
                    const er = {
                      title: null,
                      thumb: `https://i.ytimg.com/vi/${t}/hqdefault.jpg`
                    };
                    window._ytMetaCache[ck] = er;
                    return er
                  }
                }(p.idstr || p.id, p.type, p.playlistId);
                e && e.appendChild(c(p, d)), t && t.appendChild(c(p, d))
              }
              const m = document.getElementById("feat-yt-list");

              function c(a, i) {
                const e = document.createElement("div");
                e.className = "yt-item";
                var t = "playlist" === a.type,
                  o = i.thumb,
                  n = t ? a.caption || "Playlist" : i.title || a.caption || "YouTube Video",
                  t =
                  `<div style="display:flex;align-items:center;gap:8px;width:100%;">${t?`<div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink);font-weight:900;letter-spacing:1px;text-transform:uppercase;">SERIES • EPISODES: ${a.episodeCount||"?"}</div>`:""}${`<div class="yt-meta" style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink3);margin-left:auto;">${a.time}</div>`}</div>`;
                return e.innerHTML =
                  `${`<div class="yt-thumb" style="position:relative;"><img src="${o}" alt="thumbnail" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:6px;"/></div>`}<div class="yt-info"><div class="yt-title">${r(n)}</div>${t}</div>`,
                  e.onclick = () => {
                    const e = document.getElementById("feat-embed"),
                      t = document.getElementById("feat-placeholder");
                    if (t && (t.style.display = "none"), e) {
                      e.querySelectorAll("iframe").forEach(e => e.remove());
                      const l = document.createElement("iframe");
                      l.src = a.embedUrl, l.scrolling = "no", l.allowTransparency = !0, l.style.cssText =
                        "width:100%;height:100%;border:none;", e.appendChild(l)
                    }
                    const o = document.getElementById("feat-desc-text");
                    var n = i.title || a.caption || "YouTube Video";
                    o && (o.textContent = n)
                  }, e
              }

              function r(e) {
                return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              }
              m && (m.querySelectorAll(".feat-yt-item").forEach(e => e.remove()), i.forEach(n => {
                const e = document.createElement("div");
                e.className = "feat-yt-item";
                var t = `https://i.ytimg.com/vi/${n.idstr}/hqdefault.jpg`,
                  o = "playlist" === n.type ?
                  `<div style="margin-left:auto;font-family:'DM Mono',monospace;font-size:10px;color:var(--ink3);display:flex;gap:8px;align-items:center;"><span style="letter-spacing:1px;text-transform:uppercase;">SERIES</span><span>•</span><span style="font-weight:900;letter-spacing:1px;">EPISODES: ${n.episodeCount||"?"}</span></div>` :
                  "";
                e.innerHTML =
                  `<div class="feat-yt-thumb"><img src="${t}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"/></div><div class="feat-yt-meta"><div class="feat-yt-title">${r(n.caption||"YouTube Video")}</div><div style="display:flex;align-items:center;gap:8px;"><div class="feat-yt-time">${n.time}</div>${o}</div></div>`,
                  e.onclick = () => {
                    const e = document.getElementById("feat-embed"),
                      t = document.getElementById("feat-placeholder");
                    if (t && (t.style.display = "none"), e) {
                      e.querySelectorAll("iframe").forEach(e => e.remove());
                      const o = document.createElement("iframe");
                      o.src = n.embedUrl, o.scrolling = "no", o.allowTransparency = !0, o.style.cssText =
                        "width:100%;height:100%;border:none;", e.appendChild(o)
                    }
                    document.getElementById("feat-desc-text").textContent = n.caption || "YouTube Video"
                  }, m.appendChild(e)
              }))
            } else {
              n && (n.style.display = "flex"), l && (l.style.display = "flex");
              const m = document.getElementById("feat-yt-list");
              m && m.querySelectorAll(".feat-yt-item").forEach(e => e.remove())
            }
            } catch (error) {
              console.error('Error in renderYT:', error);
              throw error; // Re-throw to allow retry logic in pages.js
            }
          }

          function recalcFans() {
            const e = ["tiktok", "instagram", "youtube", "spotify", "twitch"],
              t = e.reduce((e, t) => {
                const o = document.getElementById("ep-followers-" + t);
                return o && "" !== o.value.trim() ? e + (parseInt(o.value) || 0) : e
              }, 0),
              o = document.getElementById("ep-fans-total");
            o && (o.textContent = 0 < t ? t.toLocaleString() : "—");
            const n = document.getElementById("stat-followers");
            n && (n.textContent = 0 < t ? formatFans(t) : "—"), S.profile.followerCounts = S.profile.followerCounts ||
              {}, e.forEach(e => {
                const t = document.getElementById("ep-followers-" + e);
                t && "" !== t.value.trim() && (S.profile.followerCounts[e] = parseInt(t.value) || 0)
              });
            try {
              localStorage.setItem("famed0ll_profile", JSON.stringify(S.profile))
            } catch (e) {}
            return window._saveSiteConfig && window._saveSiteConfig({
              profile: JSON.parse(JSON.stringify(S.profile))
            }), t
          }

          function formatFans(e) {
            return 1e6 <= e ? (e / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : 1e3 <= e ? (e / 1e3).toFixed(1).replace(
              /\.0$/, "") + "K" : e.toString()
          }

          function findP(e, t) {
            return S.posts[e]?.find(e => e.id === t)
          }

          function openDetail(e) {
            if (e) {
              S.currentPost = e, document.getElementById("det-media").innerHTML =
                `<iframe src="${e.embedUrl}" scrolling="no" allowtransparency="true"></iframe>`, document.getElementById(
                  "da-like").classList.toggle("liked", !!e.liked), document.getElementById("da-save").classList.toggle(
                  "saved", !!e.saved), document.getElementById("da-likes").textContent = e.likes.toLocaleString() +
                " likes", document.getElementById("da-time").textContent = e.time.toUpperCase();
              const o = document.getElementById("det-comments");
              if (o.innerHTML = "", e.caption) {
                const t = document.createElement("div");
                t.className = "dc", t.innerHTML =
                  `<div class="dc-av">FD</div><div class="dc-body"><div class="dc-text"><strong>famed0ll</strong> ${e.caption}</div><div class="dc-meta">${e.time}</div></div>`,
                  o.appendChild(t)
              }(e.comments || []).forEach(e => {
                const t = document.createElement("div");
                t.className = "dc", t.innerHTML =
                  `<div class="dc-av">${(e.user||"").slice(0,2).toUpperCase()}</div><div class="dc-body"><div class="dc-text"><strong>${e.user}</strong> ${e.text}</div><div class="dc-meta">${e.time||"just now"}</div></div>`,
                  o.appendChild(t)
              }), document.getElementById("detail-modal").classList.add("open")
            }
          }

          function closeDetail(e) {
            e && e.target !== document.getElementById("detail-modal") || document.getElementById("detail-modal").classList
              .remove("open")
          }

          function tLike(e, t) {
            const o = findP(e, t);
            o && (o.liked = !o.liked, o.likes = Math.max(0, o.likes + (o.liked ? 1 : -1)))
          }

          function tSave(e, t) {
            const o = findP(e, t);
            o && (o.saved = !o.saved)
          }

          function detailLike() {
            S.currentPost && (tLike(S.currentPost.tab, S.currentPost.id), document.getElementById("da-like").classList.toggle(
                "liked", !!S.currentPost.liked), document.getElementById("da-likes").textContent = S.currentPost.likes
              .toLocaleString() + " likes")
          }

          function detailSave() {
            S.currentPost && (tSave(S.currentPost.tab, S.currentPost.id), document.getElementById("da-save").classList.toggle(
              "saved", !!S.currentPost.saved))
          }

          function submitDetComment() {
            const e = document.getElementById("det-comment-input");
            e.value.trim() && S.currentPost && (S.currentPost.comments.push({
              user: "you",
              text: e.value.trim(),
              time: "just now"
            }), e.value = "", document.getElementById("det-post-btn").classList.remove("ready"), openDetail(S.currentPost))
          }

          function openSheet() {
            document.getElementById("sheet-bg")?.classList.add("open")
          }

          function closeSheet() {
            document.getElementById("sheet-bg")?.classList.remove("open")
          }

          function cap(e) {
            return e.charAt(0).toUpperCase() + e.slice(1)
          }

          function hRgb(e) {
            e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
            return e ? `${parseInt(e[1],16)},${parseInt(e[2],16)},${parseInt(e[3],16)}` : "255,255,255"
          }
          window._cropPositions = {},
            window._cropSaturation = {},
            window._cropZoom = {};
          try {
            window._cropPositions = JSON.parse(localStorage.getItem("fd_crop_positions") || "{}")
          } catch (e) {}
          try {
            window._cropSaturation = JSON.parse(localStorage.getItem("fd_crop_saturation") || "{}")
          } catch (e) {}
          try {
            window._cropZoom = JSON.parse(localStorage.getItem("fd_crop_zoom") || "{}")
          } catch (e) {}
          let _cropChanged = !1;

          function saveCropPositions() {
            try {
              localStorage.setItem("fd_crop_positions", JSON.stringify(window._cropPositions))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              crop_positions: window._cropPositions
            })
          }

          function saveCropSaturation() {
            try {
              localStorage.setItem("fd_crop_saturation", JSON.stringify(window._cropSaturation))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              crop_saturation: window._cropSaturation
            })
          }

          function saveCropZoom() {
            try {
              localStorage.setItem("fd_crop_zoom", JSON.stringify(window._cropZoom))
            } catch (e) {}
            window._saveSiteConfig && window._saveSiteConfig({
              crop_zoom: window._cropZoom
            })
          }

          function applyImgFilter(e, t) {
            t = void 0 !== window._cropSaturation[t] ? window._cropSaturation[t] : 100, t = t < 100 ? `saturate(${t}%)` : "";
            e.style.filter = t;
            const o = e.closest(".insta-cell");
            o && o.style.backgroundImage && (o.style.filter = t)
          }

          function applyCropToImg(e, t) {
            const o = e.closest(".insta-cell");
            var n;
            o && (n = window._cropZoom[t] || 1, t = window._cropPositions[t] || {
                x: 50,
                y: 50
              }, o.style.backgroundImage = `url('${e.src}')`, o.style.backgroundSize = n <= 1 ? "cover" : `${100*n}%`,
              o.style.backgroundRepeat = "no-repeat", o.style.backgroundPosition = `${t.x}% ${t.y}%`, e.style.opacity =
              "0")
          }

          function applyAllCrops() {
            document.querySelectorAll(".insta-cell").forEach(e => {
              var t = e.querySelector("img"),
                e = t?.alt;
              e && (applyImgFilter(t, e), window._cropPositions[e] && "object" == typeof window._cropPositions[e] && window._cropZoom[e] ?
                applyCropToImg(t, e) : window._cropPositions[e] && "string" == typeof window._cropPositions[e] && delete window._cropPositions[e])
            })
          }

          function openCropPicker(o, n) {
            document.querySelector(".crop-picker-popup")?.remove();
            const l = window._cropPositions[o] || {
              x: 50,
              y: 50
            };
            let a = window._cropZoom[o] || 1,
              i = 0,
              s = 0;
            const d = document.createElement("div");
            d.className = "crop-picker-popup", d.style.cssText =
              "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);";
            const e = document.createElement("div");
            e.style.cssText =
              "background:rgba(12,11,10,0.97);border:1px solid rgba(237,232,222,0.15);padding:16px;display:flex;flex-direction:column;gap:10px;border-radius:6px;box-shadow:0 20px 60px rgba(0,0,0,0.8);width:340px;",
              e.onclick = e => e.stopPropagation();
            const t = document.createElement("div");
            t.style.cssText = "display:flex;justify-content:space-between;align-items:center;", t.innerHTML =
              '<span style="font-family:DM Mono,monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(237,232,222,0.5);">Crop & Style</span><button id="crop-close-btn" style="background:none;border:none;color:rgba(237,232,222,0.4);cursor:pointer;font-size:16px;padding:0;">✕</button>',
              e.appendChild(t);
            const c = 300,
              r = document.createElement("div");
            r.style.cssText =
              "position:relative;width:300px;height:300px;overflow:hidden;border:1px solid rgba(237,232,222,0.12);cursor:crosshair;user-select:none;background:#111;flex-shrink:0;align-self:center;";
            const m = document.createElement("img");
            m.src = n.src, m.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;image-rendering:auto;",
              r.appendChild(m);
            const u = document.createElement("div");
            u.style.cssText = "position:absolute;inset:0;pointer-events:none;", u.innerHTML =
              `
    <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.15);transform:translateX(-50%);"></div>
    <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.15);transform:translateY(-50%);"></div>
    <div style="position:absolute;inset:0;border:2px solid rgba(212,160,181,0.3);"></div>`,
              r.appendChild(u);
            const p = document.createElement("div");
            let g = !(p.style.cssText =
              "font-family:DM Mono,monospace;font-size:8px;color:rgba(237,232,222,0.3);text-align:center;");
            const y = () => {
              var e = m.naturalWidth || 400,
                t = m.naturalHeight || 400,
                o = Math.round(e * a),
                n = Math.round(t * a);
              g || (g = !0, e = Math.max(1, o - c), t = Math.max(1, n - c), i = l.x / 100 * e, s = l.y / 100 * t), i =
                Math.max(0, Math.min(i, o - c)), s = Math.max(0, Math.min(s, n - c)), m.style.width = o + "px", m.style
                .height = n + "px", m.style.left = -i + "px", m.style.top = -s + "px";
              o = o > c ? Math.round(i / (o - c) * 100) : 50, n = n > c ? Math.round(s / (n - c) * 100) : 50;
              p.textContent = `${o}% x, ${n}% y  ·  zoom ${Math.round(100*a)}%`
            };
            m.complete && m.naturalWidth ? y() : m.onload = y;
            let f = !1,
              v, h, b, w;
            r.addEventListener("mousedown", e => {
              f = !0, v = e.clientX, h = e.clientY, b = i, w = s, r.style.cursor = "grabbing", e.preventDefault()
            }), document.addEventListener("mousemove", e => {
              f && (i = b - (e.clientX - v), s = w - (e.clientY - h), y())
            }), document.addEventListener("mouseup", () => {
              f && (f = !1, r.style.cursor = "crosshair")
            }), r.addEventListener("wheel", e => {
              e.preventDefault();
              e = 0 < e.deltaY ? -.05 : .05;
              a = Math.max(.5, Math.min(5, a + e)), k.value = Math.round(100 * a), I.textContent = Math.round(100 *
                a) + "%", y()
            }, {
              passive: !1
            }), e.appendChild(r), e.appendChild(p);
            var S = (e, t, o, n, l, a) => {
              const i = document.createElement("div");
              i.style.cssText = "display:flex;flex-direction:column;gap:4px;";
              const s = document.createElement("div");
              s.style.cssText = "display:flex;justify-content:space-between;";
              const d = document.createElement("span");
              d.style.cssText = "font-family:DM Mono,monospace;font-size:7px;color:rgba(237,232,222,0.4);", d.textContent =
                n + "%", s.innerHTML =
                `<span style="font-family:DM Mono,monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(237,232,222,0.4);">${e}</span>`,
                s.appendChild(d);
              const c = document.createElement("input");
              return c.type = "range", c.min = t, c.max = o, c.step = l, c.value = n, c.style.cssText =
                "width:100%;accent-color:var(--pk);cursor:pointer;", c.oninput = () => {
                  d.textContent = c.value + "%", a(parseInt(c.value), d, c)
                }, i.appendChild(s), i.appendChild(c), {
                  row: i,
                  valSpan: d,
                  slider: c
                }
            };
            const {
              row: E,
              valSpan: I,
              slider: k
            } = S("Zoom", 50, 500, Math.round(100 * a), 5, e => {
              a = e / 100, y()
            });
            e.appendChild(E);
            var S = S("Saturation", 0, 100, void 0 !== window._cropSaturation[o] ? window._cropSaturation[o] : 100, 1, e => {
              window._cropSaturation[o] = e, saveCropSaturation(), applyImgFilter(n, o), m.style.filter = e < 100 ?
                `saturate(${e}%)` : ""
            })["row"];
            e.appendChild(S);
            const x = document.createElement("div");
            x.style.cssText =
              "font-family:DM Mono,monospace;font-size:7px;color:rgba(237,232,222,0.2);text-align:center;", x.textContent =
              "Drag to pan · Scroll to zoom", e.appendChild(x);
            const B = document.createElement("button");
            B.textContent = "Apply", B.style.cssText =
              "font-family:DM Mono,monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:9px;background:var(--pk);border:none;color:#fff;cursor:pointer;border-radius:2px;",
              B.onclick = () => {
                var e = m.naturalWidth || 400,
                  t = m.naturalHeight || 400,
                  e = e * a,
                  t = t * a,
                  e = Math.max(1, e - 300),
                  t = Math.max(1, t - 300),
                  e = Math.max(0, Math.min(100, Math.round(i / e * 100))),
                  t = Math.max(0, Math.min(100, Math.round(s / t * 100)));
                window._cropPositions[o] = {
                  x: i,
                  y: s
                }, window._cropZoom[o] = a, saveCropPositions(), saveCropZoom(), applyCropToImg(n, o), d.remove()
              }, e.appendChild(B), d.appendChild(e), document.body.appendChild(d), d.onclick = () => d.remove(), e.querySelector(
                "#crop-close-btn").onclick = () => d.remove()
          }
          const _cropWired = new WeakSet();

          function wireInstaClickCrop() {
            document.querySelectorAll(".insta-cell").forEach(e => {
              if (_cropWired.has(e)) return;
              _cropWired.add(e);
              const t = e.querySelector("img");
              t && e.addEventListener("contextmenu", e => {
                document.body.classList.contains("talk-admin") && (e.preventDefault(), openCropPicker(t.alt, t))
              })
            })
          }

          function updateLatestPostWidget(e) {
            const t = document.getElementById("latest-post-widget"),
              o = document.getElementById("latest-post-text"),
              n = document.getElementById("latest-post-date");
            if (t && o && n) {
              const l = (e || []).find(e => e.title || e.content);
              if (l) {
                t.style.display = "block", l.title ? o.innerHTML =
                  '<span style="font-family:&quot;Bebas Neue&quot;,sans-serif;font-size:15px;letter-spacing:2px;color:var(--ink);">' +
                  l.title + "</span>" + (l.content ? "<br><span>" + l.content.substring(0, 120) + (120 < l.content.length ?
                    "…" : "") + "</span>" : "") : o.textContent = l.content;
                try {
                  const a = new Date(l.created_at);
                  n.textContent = a.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })
                } catch (e) {
                  n.textContent = ""
                }
              }
            }
          }
          Object.keys(window._cropPositions).forEach(e => {
              "string" == typeof window._cropPositions[e] && (delete window._cropPositions[e], _cropChanged = !0)
            }), _cropChanged && saveCropPositions(), applyAllCrops(), wireInstaClickCrop(), window.updateLatestPostWidget = updateLatestPostWidget, window._updateLatestPostWidget =
            updateLatestPostWidget, window.FameDoll = {
              setProfile(e = {}) {
                e.bio && (S.profile.bio = e.bio, document.getElementById("sl-bio").textContent = e.bio), e.nowPlaying &&
                  (S.profile.npTitle = e.nowPlaying, document.getElementById("sl-np-title").textContent = e.nowPlaying),
                  e.npArtist && (S.profile.npArtist = e.npArtist, document.getElementById("sl-np-artist").textContent =
                    e.npArtist), e.realname && (S.profile.realname = e.realname, document.getElementById("sl-realname")
                    .textContent = e.realname), null != e.followers && (document.getElementById("stat-followers").textContent =
                    e.followers), null != e.following && (document.getElementById("stat-following").textContent = e.following)
              }
            };
          let _npAudioEl = null;

          function ensureNowPlayingAudio() {
            _npAudioEl || (_npAudioEl = document.createElement("audio"), _npAudioEl.id = "np-audio", _npAudioEl.preload =
              "auto", _npAudioEl.style.display = "none", document.body.appendChild(_npAudioEl), _npAudioEl.addEventListener(
                "ended", () => {
                  updatePlayUI(!1)
                }), _npAudioEl.addEventListener("timeupdate", () => {
                const e = document.getElementById("np-progress-fill");
                e && _npAudioEl.duration && (e.style.width = _npAudioEl.currentTime / _npAudioEl.duration * 100 +
                  "%")
              }));
            var _ns = S.profile && S.profile.audio && S.profile.audio.dataUrl ? S.profile.audio.dataUrl : null;
            if (_ns) {
              if (_npAudioEl.src !== _ns) _npAudioEl.src = _ns;
            } else {
              _npAudioEl.removeAttribute("src");
            }
            ensureEpAudioPlayer()
          }

          function playProfileAudio(e) {
            e && e.stopPropagation && e.stopPropagation(), ensureNowPlayingAudio(), _npAudioEl && _npAudioEl.src ?
              _npAudioEl.paused ? (_npAudioEl.play().catch(() => {}), updatePlayUI(!0), updateNpLinksVisibility()) : (
                _npAudioEl.pause(), updatePlayUI(!1)) : toggleNpLinks()
          }

          function updatePlayUI(e) {
            const t = document.getElementById("np-play-icon"),
              o = document.getElementById("np-play-btn");
            let n = null;
            try {
              o && (n = o.closest(".np-widget"))
            } catch (e) {}
            n = n || document.querySelector(".np-widget"), e ? (t && (t.innerHTML =
              '<rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"></rect>'
            ), o && (o.title = "Pause", o.style.color = "var(--pk)"), n && n.classList.add("playing")) : (t && (t.innerHTML =
                '<polygon points="5 3 19 12 5 21 5 3" fill="none" stroke="currentColor" stroke-width="1.8"/>'), o &&
              (o.title = "Play", o.style.color = ""), n && n.classList.remove("playing"))
          }

          function toggleNpLinks() {
            const e = document.getElementById("np-links");
            e && (e.style.display = "flex" === e.style.display ? "none" : "flex", e.style.alignItems = "center")
          }

          function updateNpLinksVisibility() {
            const e = document.getElementById("np-links");
            var t, o;
            e && (t = (o = S.profile || {}).spotify || o.apple, o = (o = document.getElementById("np-audio")) && (!o.paused ||
                0 < o.currentTime), t && o ? (e.style.display = "flex", e.style.flexDirection = "row") : e.style.display =
              "none")
          }

          function openExternalLink(e) {
            var t = S.profile || {};
            if (window._fbDb_analytics) try {
              window._fbDb_analytics.collection("analytics").add({
                type: "stream_click",
                platform: e,
                ts: Date.now(),
                d: (new Date).toISOString()
              })
            } catch (e) {}
            if ("spotify" === e && t.spotify) window.open(t.spotify, "_blank");
            else if ("apple" === e && t.apple) window.open(t.apple, "_blank");
            else {
              const o = document.getElementById("spotify" === e ? "np-spotify-btn" : "np-apple-btn");
              o && (o.style.animation = "flash-border .28s ease", setTimeout(() => o.style.animation = "", 280))
            }
          }! function() {
            const o = window.saveProfile;
            "function" == typeof o && (window.saveProfile = function() {
              var e = document.getElementById("ep-spotify")?.value.trim() || "",
                t = document.getElementById("ep-apple")?.value.trim() || "";
              e ? S.profile.spotify = e : delete S.profile.spotify, t ? S.profile.apple = t : delete S.profile.apple;
              S.profile.followerCounts = S.profile.followerCounts || {}, ["tiktok", "instagram", "youtube",
                "spotify", "twitch"
              ].forEach(e => {
                const t = document.getElementById("ep-followers-" + e);
                t && "" !== t.value.trim() && (S.profile.followerCounts[e] = parseInt(t.value) || 0)
              });
              t = Object.values(S.profile.followerCounts).reduce((e, t) => e + t, 0);
              0 < t && (document.getElementById("stat-followers").textContent = formatFans(t)), o();
              try {
                localStorage.setItem("famed0ll_profile", JSON.stringify(S.profile))
              } catch (e) {}
              window._saveSiteConfig && window._saveSiteConfig({
                  profile: S.profile
                }), ensureNowPlayingAudio(), updateNpLinksVisibility(), "function" == typeof syncMusicSidebar &&
                syncMusicSidebar()
            })
          }(), setTimeout(() => {
            try {
              ensureNowPlayingAudio(), updateNpLinksVisibility()
            } catch (e) {}
          }, 120);
          const YT_API_KEY = "AIzaSyDBMSTnP-KFACKIFoCFWnlSPPTIcEs7aco",
            YT_PLAYLIST_ID = "PLhRgPfuqZrXNrd24d6fXO0ZKhWFm922oM";
          async function fetchYTSubCount() {
            const t = document.getElementById("yt-sub-badge");
            try {
              t && (t.textContent = "…");
              const a = await fetch(
                `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${YT_PLAYLIST_ID}&key=${YT_API_KEY}`
              );
              if (!a.ok) throw new Error("playlist lookup failed " + a.status);
              var e = (await a.json()).items?.[0]?.snippet?.channelId;
              if (!e) throw new Error("channelId not found in playlist response");
              const i = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${e}&key=${YT_API_KEY}`);
              if (!i.ok) throw new Error("channel stats failed " + i.status);
              var o = (await i.json()).items?.[0];
              if (!o) throw new Error("no channel item returned");
              const s = parseInt(o.statistics?.subscriberCount, 10) || 0;
              var n = o.snippet?.title || "";
              if (t && (t.textContent = formatFans(s) + " subs"), S.profile.followerCounts = S.profile.followerCounts ||
                {}, s > (S.profile.followerCounts.youtube || 0)) {
                S.profile.followerCounts.youtube = s;
                var l = Object.values(S.profile.followerCounts).reduce((e, t) => e + t, 0);
                0 < l && (document.getElementById("stat-followers").textContent = formatFans(l));
                const d = document.getElementById("ep-followers-youtube");
                d && (d.value = s, recalcFans());
                try {
                  localStorage.setItem("famed0ll_profile", JSON.stringify(S.profile))
                } catch (e) {}
              }
            } catch (e) {
              console.warn("[famed0ll] fetchYTSubCount failed:", e.message), t && (t.textContent = "— subs")
            }
          }
          window._ytSubFetchDone = !1;
          var _origShowPageForYT = window.showPage;
          window.showPage = function(p) {
            var r = _origShowPageForYT(p);
            if ((p === "music" || p === "profile") && !window._ytSubFetchDone) {
              window._ytSubFetchDone = !0;
              setTimeout(fetchYTSubCount, 300)
            }
            return r
          }