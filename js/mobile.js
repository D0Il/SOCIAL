/* ═══════════════════════════════════════════════════════════════
   mobile.js — Mobile layout, performance, and session management.
   Deferred. Depends on app.js (showPage, S). Wraps showPage last.

   Exposes:
     window.isMobilePreviewOrNarrow(w) — true if viewport <= w
     window.activateCommunity()        — community page mobile init
     window.switchToSearch(q, t)       — navigate to search
     window.toggleMobilePreview()      — no-op stub (feature removed)

   Contains: applyMobWidgetSizes, analytics page tracker, panties
             widget positioning, profile widget row, now-playing widget,
             shop lazy load, session restore, performance optimizations,
             lazy iframe loader (IntersectionObserver), showPage wrappers,
             resize→rAF migration, queue drain on first load.
   ═══════════════════════════════════════════════════════════════ */

/* ── Mobile widget sizing (lvl bar, np widget) ── */
! function() {
            function applyMobWidgetSizes() {
              if (window.innerWidth > 900) return;
              var lvlInner = document.querySelector(".sl-info .np-widget-inner");
              if (lvlInner) {
                lvlInner.style.setProperty("padding", "4px 5px", "important");
                lvlInner.style.setProperty("gap", "3px", "important")
              }
              var lvlSvgOuter = document.querySelector(".sl-info .np-widget-inner > div:first-child");
              if (lvlSvgOuter) lvlSvgOuter.style.setProperty("justify-content", "center", "important");
              var lvlSvgWrap = document.querySelector(".sl-info .np-widget-inner > div:first-child > div");
              if (lvlSvgWrap) {
                lvlSvgWrap.style.setProperty("width", "90px", "important");
                lvlSvgWrap.style.setProperty("height", "18px", "important")
              }
              var lvlSvg = document.getElementById("sl-lvl");
              if (lvlSvg) {
                lvlSvg.setAttribute("width", "90");
                lvlSvg.setAttribute("height", "18")
              }
              var lvlVisual = document.querySelector(".sl-info .lvl-visual");
              if (lvlVisual) lvlVisual.style.setProperty("width", "58px", "important");
              var lvlNums = document.querySelectorAll(".sl-info .lvl-endnums .num");
              lvlNums.forEach(function(n) {
                n.style.setProperty("font-size", "11px", "important")
              });
              var npInner = document.querySelector(".sl-song-block .np-widget-inner");
              if (npInner) npInner.style.setProperty("padding", "4px 6px", "important");
              var npTitle = document.querySelector(".sl-song-block .np-title");
              if (npTitle) {
                npTitle.style.setProperty("font-size", "12px", "important");
                npTitle.style.setProperty("letter-spacing", "1px", "important");
                npTitle.style.setProperty("margin-bottom", "1px", "important")
              }
              var npArtist = document.querySelector(".sl-song-block .np-artist-name");
              if (npArtist) {
                npArtist.style.setProperty("font-size", "7px", "important");
                npArtist.style.setProperty("margin-bottom", "5px", "important")
              }
              var npLabel = document.querySelector(".sl-song-block .np-label");
              if (npLabel) {
                npLabel.style.setProperty("font-size", "5px", "important");
                npLabel.style.setProperty("letter-spacing", "2px", "important")
              }
            }

            function tryApply() {
              applyMobWidgetSizes();
              setTimeout(applyMobWidgetSizes, 300);
              setTimeout(applyMobWidgetSizes, 800)
            }
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", tryApply)
            } else {
              tryApply()
            }
            window._onResize && window._onResize(applyMobWidgetSizes);
            var _origShowPage = window.showPage;
            if (_origShowPage) window.showPage = function(p) {
              var r = _origShowPage(p);
              setTimeout(applyMobWidgetSizes, 100);
              return r
            }
          }()

/* ── Analytics page-view tracker ── */
! function() {
            function o(t) {
              if (window._fbDb_analytics) try {
                window._fbDb_analytics.collection("analytics").add(Object.assign({
                  ts: Date.now(),
                  d: (new Date).toISOString(),
                  sessionId: window._sessionId
                }, t))
              } catch (t) {}
            }
            window._sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
            let n = "profile",
              a = Date.now();
            const i = window.showPage;
            window.showPage = function(t) {
              var e = Math.round((Date.now() - a) / 1e3);
              return 2 < e && o({
                type: "time_on_page",
                page: n,
                seconds: e
              }), n = t, a = Date.now(), "function" == typeof i ? i(t) : void 0
            }, window.addEventListener("beforeunload", function() {
              var t = Math.round((Date.now() - a) / 1e3);
              2 < t && o({
                type: "time_on_page",
                page: n,
                seconds: t
              })
            }), document.addEventListener("click", function(t) {
              const e = t.target.closest(".insta-cell");
              if (e) {
                const n = e.querySelector("a");
                n && o({
                  type: "instagram_click",
                  postId: (n.href || "").match(/\/p\/([^\/]+)/)?.[1] || "unknown"
                })
              }
            }, !0), document.addEventListener("click", function(t) {
              const e = t.target.closest(".mp-era-card-outer");
              if (e) {
                const n = e.querySelector(".mp-era-card-label-title");
                o({
                  type: "era_click",
                  era: n ? n.textContent.trim() : "unknown"
                })
              }
            }, !0), document.addEventListener("click", function(t) {
              t.target.closest(".panties-widget") && o({
                type: "link_click",
                dest: "onlyfans"
              })
            }, !0), document.addEventListener("click", function(t) {
              const e = t.target.closest(".mp-sidebar-stream-link");
              if (e) {
                const n = e.querySelector(".mp-sidebar-stream-name");
                o({
                  type: "stream_click",
                  platform: n ? n.textContent.trim().toLowerCase() : "unknown"
                })
              }
            }, !0)
          }()

/* ── Panties widget positioning (mobile vs desktop) ── */
! function() {
            var o = null,
              r = null;

            function n() {
              var e = document.querySelector(".panties-widget"),
                n = document.querySelector(".sl-avatar-wrap"),
                t = document.querySelector(".fans-star-wrap"),
                p = document.getElementById("sl-origin");
              e && n && t && (window.innerWidth <= 768 ? p && p.parentNode && e.parentNode !== p.parentNode && (o = e.parentNode,
                r = e.nextSibling, p.parentNode.insertBefore(e, p.nextSibling)) : o && e.parentNode !== o && o.insertBefore(
                e, r || null))
            }

            function e() {
              n()
            }
            "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", e) : e(), window.addEventListener(
              "resize", n)
          }();

/* ── Mobile profile widget row (3-col grid) ── */
! function() {
            var originals = null;

            function isMobileWidgetsMode() {
              return window.innerWidth <= 900
            }

            function ensureWidgetRow() {
              var lvl = document.querySelector(".sl-info"),
                panties = document.querySelector(".panties-widget"),
                nowPlaying = document.querySelector(".sl-song-block");
              if (!lvl || !panties || !nowPlaying) return;
              if (!originals) originals = {
                lvlParent: lvl.parentNode,
                lvlNext: lvl.nextSibling,
                pantiesParent: panties.parentNode,
                pantiesNext: panties.nextSibling,
                npParent: nowPlaying.parentNode,
                npNext: nowPlaying.nextSibling
              };
              var host = originals.lvlParent || lvl.parentNode;
              if (!host) return;
              var row = document.getElementById("mobile-profile-widget-row");
              row || (row = document.createElement("div"), row.id = "mobile-profile-widget-row", row.className =
                "mobile-profile-widget-row", host.insertBefore(row, lvl));
              row.appendChild(lvl);
              row.appendChild(panties);
              row.appendChild(nowPlaying)
            }

            function restoreWidgetRow() {
              var row = document.getElementById("mobile-profile-widget-row");
              if (!originals) return;

              var lvl = document.querySelector(".sl-info"),
                panties = document.querySelector(".panties-widget"),
                nowPlaying = document.querySelector(".sl-song-block");

              // Helper to safely insert node back into original parent
              function safeInsert(node, parent, nextSibling) {
                if (!node || !parent) return;
                try {
                  // If nextSibling exists and is still a child of parent, insert before it.
                  if (nextSibling && parent.contains(nextSibling)) {
                    parent.insertBefore(node, nextSibling);
                  } else {
                    // Otherwise append to parent to avoid insertBefore errors
                    parent.appendChild(node);
                  }
                } catch (err) {
                  // Fallback: append to parent
                  try {
                    parent.appendChild(node);
                  } catch (e) { /* ignore */ }
                }
              }

              safeInsert(lvl, originals.lvlParent, originals.lvlNext || null);
              safeInsert(panties, originals.pantiesParent, originals.pantiesNext || null);
              safeInsert(nowPlaying, originals.npParent, originals.npNext || null);

              if (row && row.parentNode) {
                try {
                  row.parentNode.removeChild(row);
                } catch (err) { /* ignore if already removed */ }
              }
            }

            function applyProfileWidgetRow() {
              if (!isMobileWidgetsMode()) {
                restoreWidgetRow();
                return
              }
              ensureWidgetRow();
              var lvlInner = document.querySelector(".sl-info .np-widget-inner");
              if (lvlInner) {
                lvlInner.style.setProperty("padding", "7px 6px", "important");
                lvlInner.style.setProperty("gap", "4px", "important")
              }
              var lvlSvgOuter = document.querySelector(".sl-info .np-widget-inner > div:first-child");
              if (lvlSvgOuter) lvlSvgOuter.style.setProperty("justify-content", "center", "important");
              var lvlSvgWrap = document.querySelector(".sl-info .np-widget-inner > div:first-child > div");
              if (lvlSvgWrap) {
                lvlSvgWrap.style.setProperty("width", "100%", "important");
                lvlSvgWrap.style.setProperty("max-width", "98px", "important");
                lvlSvgWrap.style.setProperty("height", "20px", "important")
              }
              var lvlSvg = document.getElementById("sl-lvl");
              if (lvlSvg) {
                lvlSvg.setAttribute("width", "98");
                lvlSvg.setAttribute("height", "20")
              }
              var lvlVisual = document.querySelector(".sl-info .lvl-visual");
              if (lvlVisual) {
                lvlVisual.style.setProperty("width", "62px", "important");
                lvlVisual.style.setProperty("max-width", "100%", "important")
              }
              var lvlVal = document.querySelector(".sl-info .lvl-val");
              if (lvlVal) {
                lvlVal.style.setProperty("justify-content", "center", "important");
                lvlVal.style.setProperty("text-align", "center", "important");
                lvlVal.style.setProperty("width", "100%", "important");
                lvlVal.style.setProperty("margin", "0 auto", "important")
              }
              var lvlNums = document.querySelectorAll(".sl-info .lvl-endnums .num");
              lvlNums.forEach(function(n) {
                n.style.setProperty("font-size", "11px", "important")
              });
              var lvlRange = document.querySelector(".sl-info .lvl-range");
              if (lvlRange) lvlRange.style.setProperty("font-size", "8px", "important");
              var npInner = document.querySelector(".sl-song-block .np-widget-inner");
              if (npInner) {
                npInner.style.setProperty("padding", "7px 6px", "important");
                npInner.style.setProperty("gap", "4px", "important")
              }
              var npTitle = document.querySelector(".sl-song-block .np-title");
              if (npTitle) {
                npTitle.style.setProperty("font-size", "11px", "important");
                npTitle.style.setProperty("letter-spacing", ".7px", "important");
                npTitle.style.setProperty("margin-bottom", "1px", "important");
                npTitle.style.setProperty("line-height", "1.05", "important")
              }
              var npArtist = document.querySelector(".sl-song-block .np-artist-name");
              if (npArtist) {
                npArtist.style.setProperty("font-size", "7px", "important");
                npArtist.style.setProperty("margin-bottom", "4px", "important");
                npArtist.style.setProperty("line-height", "1.1", "important")
              }
              var npLabel = document.querySelector(".sl-song-block .np-label");
              if (npLabel) {
                npLabel.style.setProperty("font-size", "5px", "important");
                npLabel.style.setProperty("letter-spacing", "1.4px", "important")
              }
              var panties = document.querySelector(".panties-widget");
              if (panties) {
                panties.style.setProperty("padding", "0", "important");
                panties.style.setProperty("margin", "0", "important")
              }
            }

            function run() {
              applyProfileWidgetRow();
              setTimeout(applyProfileWidgetRow, 150);
              setTimeout(applyProfileWidgetRow, 450)
            }
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", run)
            } else run();
            window._onResize && window._onResize(applyProfileWidgetRow);
            var oldShowPage = window.showPage;
            if (oldShowPage) window.showPage = function() {
              var out = oldShowPage.apply(this, arguments);
              setTimeout(applyProfileWidgetRow, 120);
              setTimeout(applyProfileWidgetRow, 360);
              return out
            };
            var oldToggleMobilePreview = window.toggleMobilePreview;
            if (oldToggleMobilePreview) window.toggleMobilePreview = function() {
              var out = oldToggleMobilePreview.apply(this, arguments);
              setTimeout(applyProfileWidgetRow, 80);
              setTimeout(applyProfileWidgetRow, 260);
              return out
            }
          }()

/* ── Now-playing widget ── */
! function() {
                var w = {
                    avatar: {
                      x: 0,
                      y: 0,
                      w: null,
                      h: null
                    },
                    panties: {
                      x: 0,
                      y: 0,
                      w: null,
                      h: null
                    },
                    star: {
                      x: 0,
                      y: 0,
                      w: null,
                      h: null
                    }
                  },
                  f = !1;

                function a() {
                  return {
                    avatar: document.querySelector(".sl-avatar"),
                    panties: document.querySelector(".panties-widget"),
                    star: document.querySelector(".fans-star-wrap")
                  }
                }

                function E() {
                  var o = ["drag-coord-avatar", "drag-coord-panties", "drag-coord-star"];
                  ["avatar", "panties", "star"].forEach(function(t, e) {
                    var n, a = document.getElementById(o[e]);
                    a && (e = null !== (n = w[t]).w ? n.w + "px" : "—", t = null !== n.h ? n.h + "px" : "—", a.textContent =
                      "x:" + n.x + " y:" + n.y + " | " + e + "×" + t)
                  })
                }

                function o(a, o) {
                  var r, s, i, u, t, e, d, c, l, v;

                  function n(t) {
                    f && (t.preventDefault(), t = t.touches ? t.touches[0] : t, r = t.clientX, s = t.clientY, i = w[o].x,
                      u = w[o].y, document.addEventListener("mousemove", p), document.addEventListener("touchmove", p, {
                        passive: !1
                      }), document.addEventListener("mouseup", h), document.addEventListener("touchend", h), a.addEventListener(
                        "click", m, !0))
                  }

                  function m(t) {
                    t.stopImmediatePropagation(), t.preventDefault(), a.removeEventListener("click", m, !0)
                  }

                  function p(t) {
                    var e, n = t.touches ? t.touches[0] : t;
                    w[o].x = Math.round(i + (n.clientX - r)), w[o].y = Math.round(u + (n.clientY - s)), e = a, t = w[o]
                      .x, n = w[o].y, e && (e.style.transform = "translate(" + t + "px," + n + "px)", e.style.position =
                        "relative", e.style.zIndex = "10"), E()
                  }

                  function h() {
                    document.removeEventListener("mousemove", p), document.removeEventListener("touchmove", p),
                      document.removeEventListener("mouseup", h), document.removeEventListener("touchend", h)
                  }

                  function x(t) {
                    f && (t.stopPropagation(), t.preventDefault(), t = t.touches ? t.touches[0] : t, d = t.clientX, c =
                      t.clientY, t = a.getBoundingClientRect(), l = t.width, v = t.height, w[o].w = Math.round(l), w[
                        o].h = Math.round(v), document.addEventListener("mousemove", y), document.addEventListener(
                        "touchmove", y, {
                          passive: !1
                        }), document.addEventListener("mouseup", g), document.addEventListener("touchend", g), a.addEventListener(
                        "click", m, !0))
                  }

                  function y(t) {
                    var e = t.touches ? t.touches[0] : t,
                      n = Math.max(20, Math.round(l + (e.clientX - d))),
                      t = Math.max(20, Math.round(v + (e.clientY - c)));
                    w[o].w = n, w[o].h = t, e = n, n = t, (t = a) && (null !== e && (t.style.width = e + "px"), null !==
                      n && (t.style.height = n + "px")), E()
                  }

                  function g() {
                    document.removeEventListener("mousemove", y), document.removeEventListener("touchmove", y),
                      document.removeEventListener("mouseup", g), document.removeEventListener("touchend", g)
                  }
                  a && (a.style.position = "relative", a.addEventListener("mousedown", n), a.addEventListener(
                    "touchstart", n, {
                      passive: !1
                    }), (e = (t = a).querySelector(".drag-resize-handle")) || ((e = document.createElement("div")).className =
                    "drag-resize-handle", t.appendChild(e)), (e = e).addEventListener("mousedown", x), e.addEventListener(
                    "touchstart", x, {
                      passive: !1
                    }))
                }
                window.toggleDragUI = function() {
                  f = !f;
                  var t = document.getElementById("drag-ui-panel"),
                    e = document.getElementById("nav-drag-ui-btn"),
                    n = document.getElementById("nav-drag-ui-label");
                  document.body.classList.toggle("drag-ui-active", f), t && t.classList.toggle("open", f), n && (n.textContent =
                    f ? "Drag UI ON" : "Drag UI"), e && (e.style.color = f ? "var(--pk)" : "var(--dp2)"), f && (o((
                    e = a()).avatar, "avatar"), o(e.panties, "panties"), o(e.star, "star")), E()
                }, window.copyDragCoords = function() {
                  var t = ["/* ── Drag UI output ── */", ".sl-avatar { transform: translate(" + w.avatar.x + "px, " +
                    w.avatar.y + "px);" + (null !== w.avatar.w ? " width:" + w.avatar.w + "px; height:" + w.avatar.h +
                      "px;" : "") + " }", ".panties-widget { transform: translate(" + w.panties.x + "px, " + w.panties
                    .y + "px);" + (null !== w.panties.w ? " width:" + w.panties.w + "px;" : "") + " }",
                    ".fans-star-wrap { transform: translate(" + w.star.x + "px, " + w.star.y + "px);" + (null !==
                      w.star.w ? " width:" + w.star.w + "px; height:" + w.star.h + "px;" : "") + " }"
                  ].join("\n");
                  navigator.clipboard.writeText(t).then(function() {
                    var t = document.getElementById("drag-copy-btn");
                    t && (t.textContent = "Copied!", setTimeout(function() {
                      t.textContent = "Copy Coords + Sizes"
                    }, 1500))
                  }).catch(function() {
                    prompt("Copy:", t)
                  })
                }, window.resetDragCoords = function() {
                  w = {
                    avatar: {
                      x: 0,
                      y: 0,
                      w: null,
                      h: null
                    },
                    panties: {
                      x: 0,
                      y: 0,
                      w: null,
                      h: null
                    },
                    star: {
                      x: 0,
                      y: 0,
                      w: null,
                      h: null
                    }
                  };
                  var e = a();
                  ["avatar", "panties", "star"].forEach(function(t) {
                    t = e[t];
                    t && (t.style.transform = "", t.style.position = "", t.style.zIndex = "", t.style.width = "",
                      t.style.height = "")
                  }), E()
                }
              }()

/* ── Shop iframe lazy load ── */
! function() {
                var moved = false;
                var items = [];

                function shouldUseMobileTalkTabs() {
                  return window.innerWidth <= 768;
                }

                function ensureSecondaryWrap(tabs) {
                  var wrap = document.getElementById("mob-talk-secondary-tabs");
                  if (!wrap) {
                    wrap = document.createElement("div");
                    wrap.id = "mob-talk-secondary-tabs";
                    tabs.appendChild(wrap);
                  }
                  return wrap;
                }

                function moveTalkButtons() {
                  var tabs = document.getElementById("timeline-tabs");
                  var rightCol = document.querySelector(".app-column-right");
                  if (!tabs || !rightCol) return;
                  var headers = Array.prototype.slice.call(rightCol.querySelectorAll(".sidebar-section-header")).slice(
                    0, 2);
                  if (headers.length < 2) return;
                  if (!items.length) {
                    items = headers.map(function(node) {
                      var marker = document.createComment("mob-talk-tab-marker");
                      if (node.parentNode) node.parentNode.insertBefore(marker, node);
                      return {
                        node: node,
                        marker: marker
                      };
                    });
                  }
                  if (shouldUseMobileTalkTabs()) {
                    var wrap = ensureSecondaryWrap(tabs);
                    items.forEach(function(item) {
                      wrap.appendChild(item.node);
                    });
                    moved = true;
                  } else if (moved) {
                    items.forEach(function(item) {
                      if (item.marker && item.marker.parentNode) {
                        item.marker.parentNode.insertBefore(item.node, item.marker.nextSibling);
                      }
                    });
                    var wrap = document.getElementById("mob-talk-secondary-tabs");
                    if (wrap && !wrap.children.length) wrap.remove();
                    moved = false;
                  }
                }

                function runTalkTabSync() {
                  moveTalkButtons();
                  requestAnimationFrame(moveTalkButtons);
                }
                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", runTalkTabSync);
                } else {
                  runTalkTabSync();
                }
                window._onResize && window._onResize(runTalkTabSync);
                var oldShowPage = window.showPage;
                if (oldShowPage) {
                  window.showPage = function() {
                    var out = oldShowPage.apply(this, arguments);
                    requestAnimationFrame(runTalkTabSync);
                    return out;
                  };
                }
              }();

/* ── Session / last-page restore ── */
! function() {
                var KEY = "fd_last_main_page";

                function getActivePage() {
                  var active = document.querySelector(".page.active");
                  return active ? String(active.id || "").replace(/^page-/, "") : "";
                }

                function saveActivePage(name) {
                  try {
                    var page = name || getActivePage();
                    if (page) sessionStorage.setItem(KEY, page);
                  } catch (e) {}
                }

                function shouldRestore() {
                  try {
                    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation");
                    return !!(nav && nav[0] && nav[0].type === "reload");
                  } catch (e) {
                    return false;
                  }
                }

                function restoreActivePage() {
                  try {
                    var saved = sessionStorage.getItem(KEY);
                    var current = getActivePage();
                    if (saved && saved !== current && typeof window.showPage === "function") {
                      window.showPage(saved);
                    }
                  } catch (e) {}
                }
                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() {
                    saveActivePage();
                    if (shouldRestore()) {
                      setTimeout(restoreActivePage, 120);
                    }
                  });
                } else {
                  saveActivePage();
                  if (shouldRestore()) {
                    setTimeout(restoreActivePage, 120);
                  }
                }
                var oldShowPage = window.showPage;
                if (oldShowPage) {
                  window.showPage = function(page) {
                    saveActivePage(page);
                    return oldShowPage.apply(this, arguments);
                  };
                }
                window.addEventListener("pagehide", function() {
                  saveActivePage();
                });
                document.addEventListener("visibilitychange", function() {
                  if (document.visibilityState === "hidden") saveActivePage();
                });
              }();

/* ── Performance-ready attribute ── */
! function() {
                var PERF_READY_ATTR = "data-mobile-perf-ready";
                var RESIZE_TIMER = 0;

                function markLazyMedia() {
                  document.querySelectorAll("img:not([loading])").forEach(function(img) {
                    img.setAttribute("loading", "lazy");
                    img.setAttribute("decoding", "async");
                  });
                  document.querySelectorAll("iframe:not([loading])").forEach(function(frame) {
                    frame.setAttribute("loading", "lazy");
                    frame.setAttribute("fetchpriority", "low");
                  });
                  document.querySelectorAll("video").forEach(function(video) {
                    if (!video.getAttribute("preload")) {
                      video.setAttribute("preload", "metadata");
                    }
                    video.setAttribute("playsinline", "");
                    video.setAttribute("webkit-playsinline", "");
                  });
                }

                function syncMobilePerformance() {
                  markLazyMedia();
                  if (document.body && !document.body.hasAttribute(PERF_READY_ATTR)) {
                    document.body.setAttribute(PERF_READY_ATTR, "1");
                  }
                }

                function queueMobilePerformanceSync(delay) {
                  window.clearTimeout(RESIZE_TIMER);
                  RESIZE_TIMER = window.setTimeout(syncMobilePerformance, delay || 120);
                }

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() {
                    syncMobilePerformance();
                    setTimeout(syncMobilePerformance, 220);
                    setTimeout(syncMobilePerformance, 900);
                  });
                } else {
                  syncMobilePerformance();
                  setTimeout(syncMobilePerformance, 220);
                  setTimeout(syncMobilePerformance, 900);
                }

                window._onResize && window._onResize(function() {
                  queueMobilePerformanceSync(140)
                });

                document.addEventListener("visibilitychange", function() {
                  if (document.visibilityState === "visible") {
                    queueMobilePerformanceSync(80);
                  }
                });

                window.addEventListener("pageshow", function() {
                  queueMobilePerformanceSync(80);
                });

              }();

/* ── Mobile cleanup + stabilizeProfile ── */
! function() {
                function isMobile() {
                  return window.innerWidth <= 768;
                }

                function syncLikes() {
                  var hidden = true;
                  try {
                    var stored = localStorage.getItem("fd_likes_hidden");
                    if (stored === null) {
                      localStorage.setItem("fd_likes_hidden", "true");
                      stored = "true";
                    }
                    hidden = stored === "true";
                  } catch (e) {}
                  document.body.classList.toggle("likes-hidden", hidden);
                }

                function syncSearch() {
                  var input = document.querySelector(".app-search-input");
                  if (input && window.Q && typeof window.Q.query === "string") input.value = window.Q.query;
                  document.querySelectorAll(".search-page-input-container").forEach(function(n) {
                    n.remove();
                  });
                }

                function optimizeMedia() {
                  document.querySelectorAll("video").forEach(function(v) {
                    v.setAttribute("preload", "metadata");
                    v.setAttribute("playsinline", "");
                    v.setAttribute("webkit-playsinline", "");
                  });
                }

                function stabilizeProfile() {
                  if (!isMobile()) return;
                  var row = document.getElementById("mobile-profile-widget-row");
                  var level = document.querySelector(".sl-info");
                  var panties = document.querySelector(".panties-widget");
                  var nowPlaying = document.querySelector(".sl-song-block");
                  if (!level || !panties || !nowPlaying || !row) return;
                  if (level.parentNode !== row) row.appendChild(level);
                  if (panties.parentNode !== row) row.appendChild(panties);
                  if (nowPlaying.parentNode !== row) row.appendChild(nowPlaying);
                  panties.style.setProperty("margin", "0", "important");
                }

                function run() {
                  syncLikes();
                  syncSearch();
                  optimizeMedia();
                  stabilizeProfile();
                }

                // Stubs — feature removed
                window.toggleMobilePreview = function() {
                  return false;
                };
                window.syncMobPreviewContentHeight = function() {};
                window.isMobilePreviewOrNarrow = function(e) {
                  return window.innerWidth <= (e || 768);
                };

                var _sp = typeof window.showPage === "function" ? window.showPage : null;
                if (_sp) window.showPage = function() {
                  var o = _sp.apply(this, arguments);
                  setTimeout(run, 0);
                  setTimeout(run, 140);
                  return o;
                };

                var _ss = typeof window.switchToSearch === "function" ? window.switchToSearch : null;
                if (_ss) window.switchToSearch = function(q, t) {
                  var o = _ss.apply(this, arguments);
                  setTimeout(run, 0);
                  var input = document.querySelector(".app-search-input");
                  if (isMobile() && input) input.value = typeof q === "string" ? q : "";
                  return o;
                };

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() {
                    setTimeout(run, 0);
                    setTimeout(run, 200);
                  });
                } else {
                  setTimeout(run, 0);
                  setTimeout(run, 200);
                }

                window._onResize && window._onResize(function() {
                  setTimeout(run, 80);
                });
                window.addEventListener("pageshow", function() {
                  setTimeout(run, 40);
                });
              }();

/* ── Lazy iframe loader (IntersectionObserver) ── */
(function() {
                'use strict';

                var isMobile = window.innerWidth <= 900 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

                /* ─────────────────────────────────────────────────────────────
                   A. LAZY IFRAME LOADER
                   Any iframe with data-src instead of src will only load when
                   it enters the viewport (or when its parent page is shown).
                   We also retroactively defer heavy embeds on mobile.
                ───────────────────────────────────────────────────────────── */
                function lazyLoadIframe(el) {
                  if (el._lazyLoaded) return;
                  el._lazyLoaded = true;
                  var src = el.dataset.src || el.getAttribute('data-lazy-src');
                  if (src) el.src = src;
                }

                var iframeObserver = ('IntersectionObserver' in window) ?
                  new IntersectionObserver(function(entries) {
                    entries.forEach(function(e) {
                      if (e.isIntersecting) {
                        lazyLoadIframe(e.target);
                        iframeObserver.unobserve(e.target);
                      }
                    });
                  }, {
                    rootMargin: '200px'
                  }) :
                  null;

                function observeIframe(el) {
                  if (iframeObserver) iframeObserver.observe(el);
                  else lazyLoadIframe(el); // fallback: load immediately
                }

                /* ─────────────────────────────────────────────────────────────
                   B. DEFER TIKTOK IFRAMES
                   On mobile: don't load TikTok embed.js or any TikTok iframe
                   until the user actually taps the "Scroll" page button.
                   The embeds still exist in DOM but iframes are paused.
                ───────────────────────────────────────────────────────────── */
                if (isMobile) {
                  // Remove TikTok embed.js that was already inserted inline
                  // and replace with a deferred version
                  window._tiktokEmbedDeferred = true;

                  // Mark all existing TikTok blockquotes as pending
                  document.querySelectorAll('.tiktok-embed').forEach(function(bq) {
                    bq.setAttribute('data-lazy-pending', '1');
                    // Hide any iframes already inside them
                    bq.querySelectorAll('iframe').forEach(function(f) {
                      if (!f._lazyPaused) {
                        f._originalSrc = f.src;
                        f.src = 'about:blank';
                        f._lazyPaused = true;
                      }
                    });
                  });
                }

                /* ─────────────────────────────────────────────────────────────
                   C. PATCH showPage() TO ACTIVATE LAZY LOADING PER PAGE
                   When user navigates to a page, activate that page's iframes.
                ───────────────────────────────────────────────────────────── */
                var _origShowPage = window.showPage;
                window.showPage = function(pageName) {
                  // call original first
                  var _origResult = (typeof _origShowPage === 'function') ? _origShowPage(pageName) : undefined;

                  var page = document.getElementById('page-' + pageName);
                  if (!page) return;

                  // Activate iframes in this page
                  setTimeout(function() {
                    // For TikTok / Scrollables page
                    if (pageName === 'scrollables') {
                      // Load TikTok embed.js if not loaded yet
                      if (!document.getElementById('tiktok-embed-js')) {
                        var s = document.createElement('script');
                        s.id = 'tiktok-embed-js';
                        s.src = 'https://www.tiktok.com/embed.js';
                        s.async = true;
                        document.body.appendChild(s);
                      }
                      // Restore TikTok iframes
                      document.querySelectorAll('.tiktok-embed[data-lazy-pending]').forEach(function(bq) {
                        bq.removeAttribute('data-lazy-pending');
                        bq.querySelectorAll('iframe').forEach(function(f) {
                          if (f._lazyPaused && f._originalSrc) {
                            f.src = f._originalSrc;
                            f._lazyPaused = false;
                          }
                        });
                      });
                      // Observe any new iframes
                      page.querySelectorAll('iframe:not([data-lazy-observed])').forEach(function(f) {
                        if (!f._lazyPaused) {
                          f.setAttribute('data-lazy-observed', '1');
                          observeIframe(f);
                        }
                      });
                      return;
                    }

                    // For all other pages: lazy-load iframes as they enter viewport
                    page.querySelectorAll('iframe:not([data-lazy-observed])').forEach(function(f) {
                      f.setAttribute('data-lazy-observed', '1');
                      // If iframe already has a real src and is loaded, leave it alone
                      if (!f.src || f.src === 'about:blank' || f.src === window.location.href) {
                        observeIframe(f);
                      } else {
                        // Already loaded — observe for viewport awareness only
                        observeIframe(f);
                      }
                    });
                  }, 100);

                  return _origResult;};

                /* ─────────────────────────────────────────────────────────────
                   D. DEFER DISCORD WIDGETBOT
                   It's a heavy custom element — only initialize it when
                   community page is actually opened, not on first load.
                ───────────────────────────────────────────────────────────── */
                if (isMobile) {
                  // Pause widgetbot on first load by removing its src
                  var wb = document.querySelector('widgetbot');
                  if (wb && !wb._deferred) {
                    wb._deferred = true;
                    wb._deferredSrc = wb.getAttribute('server');
                    // We can't truly pause a custom element but we can move it out of DOM
                    // until the community page is opened — store a clone
                    wb._placeholder = document.createElement('div');
                    wb._placeholder.id = 'widgetbot-placeholder';
                    wb._placeholder.style.cssText =
                      'width:100%;height:100%;background:var(--s2);display:flex;align-items:center;justify-content:center;color:var(--ink3);font-family:DM Mono,monospace;font-size:11px;letter-spacing:1px;';
                    wb._placeholder.textContent = 'Tap to load chat';
                    wb._placeholder.onclick = function() {
                      activateCommunity();
                    };
                    wb.parentNode.insertBefore(wb._placeholder, wb);
                    wb.parentNode.removeChild(wb);
                    window._wbEl = wb;
                  }
                  window.activateCommunity = function() {
                    var ph = document.getElementById('widgetbot-placeholder');
                    if (ph && window._wbEl) {
                      ph.parentNode.insertBefore(window._wbEl, ph);
                      ph.parentNode.removeChild(ph);
                      window._wbEl = null;
                    }
                  };

                  // Override showPage to activate community when opened
                  var _sp2 = window.showPage;
                  window.showPage = function(pageName) {
                    var _sp2r = (typeof _sp2 === 'function') ? _sp2(pageName) : undefined;
                    if (pageName === 'community') {
                      setTimeout(activateCommunity, 300);
                    }
                    return _sp2r;
                  };
                }

                /* ─────────────────────────────────────────────────────────────
                   E. SHOP PAGE IFRAME — defer until user taps Shop
                ───────────────────────────────────────────────────────────── */
                if (isMobile) {
                  var shopFrame = document.querySelector('#page-shop iframe');
                  if (shopFrame && shopFrame.src && shopFrame.src !== 'about:blank') {
                    shopFrame._shopSrc = shopFrame.src;
                    shopFrame.src = 'about:blank';
                    shopFrame._shopDeferred = true;
                  }
                  var _sp3 = window.showPage;
                  window.showPage = function(pageName) {
                    var _sp3r = (typeof _sp3 === 'function') ? _sp3(pageName) : undefined;
                    if (pageName === 'shop' && shopFrame && shopFrame._shopDeferred) {
                      shopFrame.src = shopFrame._shopSrc;
                      shopFrame._shopDeferred = false;
                    }
                    return _sp3r;
                  };
                }

                /* ─────────────────────────────────────────────────────────────
                   F. PASSIVE EVENT LISTENERS
                   Add passive:true to scroll/touch listeners for 60fps scroll.
                ───────────────────────────────────────────────────────────── */
                // Override addEventListener to force passive on scroll/touch
                var _origAddEL = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type, fn, opts) {
                  if (['touchstart', 'touchmove', 'wheel', 'mousewheel'].includes(type)) {
                    if (typeof opts === 'object') {
                      opts = Object.assign({}, opts, {
                        passive: true
                      });
                    } else if (opts !== false) {
                      opts = {
                        passive: true,
                        capture: !!opts
                      };
                    }
                  }
                  return _origAddEL.call(this, type, fn, opts);
                };

                /* ─────────────────────────────────────────────────────────────
                   G. REDUCE ANIMATION WORK ON LOW-END / BATTERY-SAVING DEVICES
                ───────────────────────────────────────────────────────────── */
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  var s = document.createElement('style');
                  s.textContent =
                    '*, *::before, *::after { animation: none !important; transition: none !important; }';
                  document.head.appendChild(s);
                }

                /* ─────────────────────────────────────────────────────────────
                   H. IMAGE LAZY LOADING — ensure all gallery images are lazy
                ───────────────────────────────────────────────────────────── */
                window.addEventListener('DOMContentLoaded', function() {
                  document.querySelectorAll('img:not([loading])').forEach(function(img) {
                    // Don't lazy-load above-the-fold avatar
                    if (!img.closest('#sl-avatar-inner') && !img.closest('.mp-av-ring')) {
                      img.setAttribute('loading', 'lazy');
                      img.setAttribute('decoding', 'async');
                    }
                  });
                });

                /* ─────────────────────────────────────────────────────────────
                   I. CPU BUDGET — throttle MutationObserver callback rate
                   The site has several MutationObservers running. On mobile
                   this can eat CPU continuously. We patch the key bg-sync one.
                ───────────────────────────────────────────────────────────── */
                if (isMobile && window._syncDollBg) {
                  var _origSync = window._syncDollBg;
                  var _syncThrottled = false;
                  window._syncDollBg = function() {
                    if (_syncThrottled) return;
                    _syncThrottled = true;
                    requestAnimationFrame(function() {
                      _origSync();
                      _syncThrottled = false;
                    });
                  };
                }

                /* ─────────────────────────────────────────────────────────────
                   J. SCROLL TO TOP ON PAGE CHANGE (mobile fix)
                   Every time showPage() is called, scroll the page back to the
                   top so users always start at the top of the new section.
                ───────────────────────────────────────────────────────────── */
                (function patchScrollToTop() {
                  var _latestShowPage = window.showPage;
                  window.showPage = function(pageName) {
                    var result = typeof _latestShowPage === 'function' ? _latestShowPage(pageName) : undefined;
                    // Scroll to top on every page change — critical for mobile UX
                    function doScrollTop() {
                      try {
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: 'instant'
                        });
                      } catch (e) {
                        try {
                          window.scrollTo(0, 0);
                        } catch (ee) {}
                      }
                      try {
                        document.documentElement.scrollTop = 0;
                      } catch (e) {}
                      try {
                        document.body.scrollTop = 0;
                      } catch (e) {}
                      try {
                        var center = document.querySelector('.app-column-center');
                        if (center) center.scrollTop = 0;
                      } catch (e) {}
                      try {
                        var activeEl = document.getElementById('page-' + pageName);
                        if (activeEl) activeEl.scrollTop = 0;
                      } catch (e) {}
                      try {

                      } catch (e) {}
                    }
                    doScrollTop();
                    // Double-tap on next frame to catch any post-render scroll restoration
                    requestAnimationFrame(doScrollTop);
                    return result;
                  };
                })();


              })();

// ── Drain showPage queue ──────────────────────────────────────────────────
// config.js stubs window.showPage before app.js loads to prevent errors.
// Now that all wrappers are set up, drain any queued calls.
(function() {
  var q = window._showPageQueue;
  if (q && q.length && typeof window.showPage === 'function') {
    var last = q[q.length - 1]; // only navigate to the last requested page
    window._showPageQueue = [];
    window.showPage(last);
  }
})();
