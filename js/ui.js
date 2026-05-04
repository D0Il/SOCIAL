/* ═══════════════════════════════════════════════════════════════
   ui.js — UI components: modals, audio, analytics display.
   Deferred. Depends on app.js (S state) and tea-party.js (_fbDb_analytics).

   Exposes:
     window.openAnalytics()  — open analytics modal
     window.resetAnalytics() — clear analytics data
     window.__uiAudio        — audio context for UI sounds

   Contains: custom background modal, analytics modal,
             UI click/hover audio, dayjs timestamp refresh loop.
   ═══════════════════════════════════════════════════════════════ */

/* ── Custom background (dropdown entry point) ── */
function openCustomBgFromDropdown() {
        try {
          const n = document.getElementById("nav-settings-dropdown");
          n && (n.style.display = "none", n.setAttribute("aria-hidden", "true"));
          const o = document.getElementById("nav-settings-btn");
          o && o.setAttribute("aria-expanded", "false")
        } catch (t) {}
        try {
          var t = S && S.settings && S.settings.customBg ? S.settings.customBg : "",
            e = S && S.settings && S.settings.customBgMode ? S.settings.customBgMode : "tile";
          const s = document.getElementById("custom-bg-input"),
            d = document.getElementById("custom-bg-mode");
          s && (s.value = t), d && (d.value = e);
          const c = document.getElementById("custom-bg-modal");
          if (c) {
            c.style.display = "flex";
            const i = document.getElementById("custom-bg-modal-mode");
            i && (i.value = e), updateCustomBgPreview(t), setTimeout(() => {
              try {
                s && s.focus(), s && s.select()
              } catch (t) {}
            }, 50)
          } else {
            const m = prompt("Enter a direct image URL for Custom Background (e.g. https://i.imgur.com/abc123.jpg):", t);
            if (!m) return;
            setCustomBgFromPrompt(m.replace(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/, "https://i.imgur.com/$1.jpg"))
          }
        } catch (t) {
          console.warn("openCustomBgFromDropdown error", t)
        }
      }

      function setCustomBgFromPrompt(t) {
        try {
          if (!t || !t.trim()) return;
          const e = document.getElementById("custom-bg-input");
          e && (e.value = t);
          const n = document.getElementById("custom-bg-mode") || document.getElementById("custom-bg-modal-mode");
          n && !n.value && (n.value = "tile"), setCustomBg()
        } catch (t) {
          console.warn("setCustomBgFromPrompt error", t)
        }
      }! function() {
        const s = document.getElementById("nav-settings-btn"),
          d = document.getElementById("nav-settings-dropdown"),
          c = document.getElementById("nav-theme-toggle"),
          i = document.getElementById("nav-logout-label");

        var _openedAt = 0;

        function m() {
          d && (d.style.display = "none", d.setAttribute("aria-hidden", "true"), s.setAttribute("aria-expanded",
            "false"), document.removeEventListener("click", a))
        }

        function a(t) {
          if (Date.now() - _openedAt < 200) return; // guard: ignore clicks within 200ms of opening
          d && (t.target === s || s.contains(t.target) || d.contains(t.target) || m())
        }

        function openDropdownFromEvent(ev) {
          try { ev.stopPropagation() } catch (e) {}
          if (!d) return;
          try {
            if ("block" === d.style.display) return void m();
            const rect = s.getBoundingClientRect();
            d.style.right = window.innerWidth - rect.right + 8 + "px", d.style.top = rect.bottom + 6 + "px", d.style.display =
              "block", d.setAttribute("aria-hidden", "false"), s.setAttribute("aria-expanded", "true"), c && (c.checked =
                document.documentElement.classList.contains("light-mode")), i && (i.textContent = document.body.classList
                .contains("talk-admin") ? "Sign Out" : "Sign In");
            const e = document.getElementById("nav-analytics-btn");
            e && (e.style.display = document.body.classList.contains("talk-admin") ? "flex" : "none");
            const n = document.getElementById("nav-mobile-mode-btn");
            n && (n.style.display = document.body.classList.contains("talk-admin") ? "flex" : "none");
            const o = document.getElementById("nav-moodboard-btn");
            o && (o.style.display = document.body.classList.contains("talk-admin") ? "flex" : "none");
            _openedAt = Date.now();
            document.addEventListener("click", a)
          } catch (err) {
            console.warn("openDropdownFromEvent error", err)
          }
        }
        s.addEventListener("click", function(t) {
          t.stopPropagation();
          openDropdownFromEvent(t)
        });
        // Wire mobile hamburger to the same dropdown
        var mob = document.getElementById("mob-settings-btn");
        if (mob) mob.addEventListener("click", function(t) {
          t.stopPropagation();
          openDropdownFromEvent(t)
        });
        c.addEventListener("change", function() {
          try {
            toggleTheme(this.checked)
          } catch (t) {
            console.warn(t)
          }
        }), window.addEventListener("resize", m)
      }()

/* ── Custom background modal (open/submit/preview) ── */
function closeCustomBgModal() {
            const e = document.getElementById("custom-bg-modal");
            e && (e.style.display = "none")
          }

          function updateCustomBgPreview(e) {
            const t = document.getElementById("custom-bg-modal-preview");
            var o = e ? e.replace(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/, "https://i.imgur.com/$1.jpg") : "",
              e = document.getElementById("custom-bg-modal-mode") ? document.getElementById("custom-bg-modal-mode").value :
              document.getElementById("custom-bg-mode") ? document.getElementById("custom-bg-mode").value : "tile";
            t && (t.style.backgroundImage = o ? `url('${o}')` : "", "cover" === e ? (t.style.backgroundSize = "cover",
              t.style.backgroundRepeat = "no-repeat", t.style.backgroundPosition = "center center", t.style.backgroundAttachment =
              "fixed") : (t.style.backgroundSize = "38px", t.style.backgroundRepeat = "repeat", t.style.backgroundPosition =
              "left top", t.style.backgroundAttachment = ""));
            const n = document.getElementById("custom-bg-input"),
              m = document.getElementById("custom-bg-mode");
            n && (n.value = o), m && (m.value = e)
          }

          function submitCustomBg() {
            const e = document.getElementById("custom-bg-modal-input");
            let t = e ? e.value.trim() : "";
            if (!t) return alert("Please enter an image URL.");
            t = t.replace(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/, "https://i.imgur.com/$1.jpg");
            const o = document.getElementById("custom-bg-input");
            o && (o.value = t);
            var n = document.getElementById("custom-bg-modal-mode");
            const m = document.getElementById("custom-bg-mode");
            n && m && (m.value = n.value);
            try {
              setCustomBg()
            } catch (e) {
              console.warn(e)
            }
            closeCustomBgModal()
          }

          function toggleCustomBgPreview() {
            const e = document.getElementById("custom-bg-mode") || document.getElementById("custom-bg-modal-mode");
            if (e) {
              e.value = "cover" === e.value ? "tile" : "cover";
              const n = document.getElementById("custom-bg-input") || document.getElementById("custom-bg-modal-input");
              var t = n ? n.value.trim() : S.settings && S.settings.customBg || "";
              t && updateCustomBgPreview(t);
              try {
                var o = e.value;
                t && ("cover" === o ? (document.documentElement.style.backgroundSize = "cover", document.documentElement
                  .style.backgroundRepeat = "no-repeat", document.documentElement.style.backgroundPosition =
                  "center center", document.body.style.backgroundSize = "cover", document.body.style.backgroundRepeat =
                  "no-repeat", document.body.style.backgroundPosition = "center center") : (document.documentElement
                  .style.backgroundSize = "38px", document.documentElement.style.backgroundRepeat = "repeat",
                  document.documentElement.style.backgroundPosition = "left top", document.body.style.backgroundSize =
                  "38px", document.body.style.backgroundRepeat = "repeat", document.body.style.backgroundPosition =
                  "left top"))
              } catch (e) {
                console.warn(e)
              }
            }
          }! function() {
            const e = document.getElementById("custom-bg-modal-input"),
              t = document.getElementById("custom-bg-input");
            if (e && t) {
              const o = new MutationObserver(() => {
                "flex" === document.getElementById("custom-bg-modal").style.display && (e.value = t.value || "",
                  updateCustomBgPreview(e.value))
              });
              o.observe(document.getElementById("custom-bg-modal"), {
                attributes: !0,
                attributeFilter: ["style"]
              })
            }
          }()

/* ── Analytics display modal ── */
function _anBar(e, t, n) {
            return `<div class="an-bar-track"><div style="width:${Math.round(e/t*100)}%;height:100%;background:${n||"var(--pk)"};border-radius:2px;"></div></div>`
          }

          function _anRow(e, t, n, a, o) {
            return `<div class="an-row-wrap"><div class="an-label" title="${e}">${e}</div>${_anBar(t,n,a)}<div class="an-val">${t}${o||""}</div></div>`
          }

          function _anFmt(e) {
            return e < 60 ? e + "s" : e < 3600 ? Math.round(e / 60) + "m" : (e / 3600).toFixed(1) + "h"
          }

          function _anNone() {
            return '<div class="an-none">No data yet</div>'
          }
          window.openAnalytics = async function() {
            const e = document.getElementById("analytics-modal");
            e.style.display = "flex";
            const t = document.getElementById("analytics-loading"),
              n = document.getElementById("analytics-content");
            t.style.display = "block", n.style.display = "none";
            try {
              const o = window._fbDb_analytics,
                i = await o.collection("analytics").orderBy("ts", "desc").limit(3e3).get(),
                l = i.docs.map(e => e.data()),
                s = new Date;
              s.setHours(0, 0, 0, 0);
              const c = Date.now() - 6048e5,
                r = {
                  profile: "Profile",
                  talk: "Tea Party",
                  music: "Music",
                  live: "Live",
                  scrollables: "Scroll",
                  shop: "Shop",
                  community: "Community",
                  feed: "Feed"
                },
                d = l.filter(e => "pageview" === e.type || !e.type && e.page);
              document.getElementById("an-total").textContent = d.length.toLocaleString(), document.getElementById(
                "an-today").textContent = d.filter(e => e.ts >= s.getTime()).length.toLocaleString(), document.getElementById(
                "an-week").textContent = d.filter(e => e.ts >= c).length.toLocaleString();
              const m = {};
              d.forEach(e => {
                e.page && (m[e.page] = (m[e.page] || 0) + 1)
              });
              const y = Object.entries(m).sort((e, t) => t[1] - e[1]),
                p = y[0]?.[1] || 1;
              document.getElementById("an-pages").innerHTML = y.length ? y.map(([e, t]) => _anRow(r[e] || e, t, p,
                "var(--pk)")).join("") : _anNone();
              const g = l.filter(e => "time_on_page" === e.type && e.seconds),
                u = {};
              g.forEach(e => {
                u[e.page] || (u[e.page] = {
                  sum: 0,
                  n: 0
                }), u[e.page].sum += e.seconds, u[e.page].n++
              });
              const h = Object.entries(u).map(([e, t]) => [e, Math.round(t.sum / t.n)]).sort((e, t) => t[1] - e[1]),
                v = h[0]?.[1] || 1;
              document.getElementById("an-time-per-page").innerHTML = h.length ? h.map(([e, t]) =>
                `<div class="an-row-wrap"><div class="an-label">${r[e]||e}</div>${_anBar(t,v,"var(--cy)")}<div class="an-val">${_anFmt(t)}</div></div>`
              ).join("") : _anNone();
              const f = [];
              for (let e = 6; 0 <= e; e--) {
                const j = new Date;
                j.setHours(0, 0, 0, 0), j.setDate(j.getDate() - e);
                const D = new Date(j);
                D.setDate(D.getDate() + 1);
                var a = d.filter(e => e.ts >= j.getTime() && e.ts < D.getTime()).length;
                f.push({
                  label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][j.getDay()],
                  count: a
                })
              }
              const w = Math.max(...f.map(e => e.count), 1);
              document.getElementById("an-chart").innerHTML = f.map(e =>
                `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;"><div class="an-val" style="width:auto;text-align:center;">${e.count||""}</div><div style="width:100%;background:var(--pk);border-radius:2px 2px 0 0;height:${Math.max(e.count/w*70,e.count?4:0)}px;opacity:${e.count?1:.2};"></div></div>`
              ).join(""), document.getElementById("an-chart-labels").innerHTML = f.map(e =>
                `<div style="flex:1;text-align:center;" class="an-none">${e.label}</div>`).join("");
              const x = {};
              l.filter(e => "stream_click" === e.type).forEach(e => {
                e = e.platform || "?";
                x[e] = (x[e] || 0) + 1
              });
              const b = Object.entries(x).sort((e, t) => t[1] - e[1]),
                E = b[0]?.[1] || 1;
              document.getElementById("an-streams").innerHTML = b.length ? b.map(([e, t]) => _anRow(e, t, E,
                "var(--pg)")).join("") : _anNone();
              const _ = {};
              l.filter(e => "era_click" === e.type).forEach(e => {
                e = e.era || "?";
                _[e] = (_[e] || 0) + 1
              });
              const B = Object.entries(_).sort((e, t) => t[1] - e[1]),
                M = B[0]?.[1] || 1;
              document.getElementById("an-eras").innerHTML = B.length ? B.map(([e, t]) => _anRow(e, t, M,
                "var(--dp2)")).join("") : _anNone();
              const $ = {};
              l.filter(e => "instagram_click" === e.type).forEach(e => {
                e = e.postId || "?";
                $[e] = ($[e] || 0) + 1
              });
              const k = Object.entries($).sort((e, t) => t[1] - e[1]).slice(0, 6),
                I = k[0]?.[1] || 1;
              document.getElementById("an-insta").innerHTML = k.length ? k.map(([e, t]) => _anRow(e, t, I,
                "var(--cy)")).join("") : _anNone();
              const L = new Array(24).fill(0);
              d.forEach(e => {
                e.ts && L[new Date(e.ts).getHours()]++
              });
              const T = Math.max(...L, 1);
              document.getElementById("an-hours").innerHTML = L.map((e, t) =>
                `<div style="flex:1;background:var(--pk);opacity:${e ? .2 + e / T * .8 : .08};border-radius:2px 2px 0 0;height:${Math.max(e/T*50,e?3:2)}px;" title="${t}:00 — ${e} visits"></div>`
              ).join(""), document.getElementById("an-hours-labels").innerHTML = L.map((e, t) =>
                `<div style="flex:1;text-align:center;font-family:'DM Mono',monospace;font-size:7px;color:var(--ink3);">${t%6==0?t+"h":""}</div>`
              ).join(""), t.style.display = "none", n.style.display = "flex"
            } catch (e) {
              t.textContent = "Error loading analytics. Check Firestore rules.", console.error(e)
            }
          }, window.resetAnalytics = async function() {
            if (confirm("Delete ALL analytics data? This cannot be undone.")) try {
              const n = window._fbDb_analytics;
              let e = 0,
                t;
              do {
                if (t = await n.collection("analytics").limit(500).get(), t.empty) break;
                const a = n.batch();
                t.docs.forEach(e => a.delete(e.ref)), await a.commit(), e += t.docs.length
              } while (!t.empty);
              alert(`Cleared ${e} records.`), window.openAnalytics()
            } catch (e) {
              alert("Error: " + e.message), console.error(e)
            }
          }, document.getElementById("analytics-modal").addEventListener("click", function(e) {
            e.target === this && (this.style.display = "none")
          })

/* ── UI audio (click/hover sounds) ── */
! function() {
            const d = function() {
              try {
                const e = window.AudioContext || window.webkitAudioContext;
                return e ? new e : null
              } catch (e) {
                return null
              }
            }();

            function e(e = {}) {
              if (d) {
                var t = d.currentTime;
                "suspended" === d.state && d.resume().catch(() => {});
                const o = d.createGain();
                o.gain.setValueAtTime(1e-4, t);
                var n = e.attack || .0012,
                  a = e.sustain || .028,
                  c = e.release || .18,
                  i = e.peak || .11;
                o.gain.linearRampToValueAtTime(i, t + n), o.gain.exponentialRampToValueAtTime(.6 * i, t + n + a), o.gain
                  .exponentialRampToValueAtTime(1e-4, t + n + a + c);
                const s = d.createOscillator();
                s.type = "sine", s.frequency.value = e.freq || 950;
                const r = d.createOscillator();
                r.type = "triangle", r.frequency.value = (e.freq || 950) * (1 + (e.detunePct || .008));
                const l = d.createBiquadFilter();
                l.type = "lowpass", l.frequency.value = e.lp || 6400;
                const u = d.createBiquadFilter();
                u.type = "highpass", u.frequency.value = e.hp || 200;
                const p = d.createGain();
                p.gain.value = e.shimmer || .012, s.connect(l), r.connect(p), p.connect(l), l.connect(u), u.connect(o),
                  o.connect(d.destination);
                c = n + a + c + .02;
                s.start(t), r.start(t), s.stop(t + c), r.stop(t + c);
                setTimeout(() => {
                  try {
                    s.disconnect(), r.disconnect(), p.disconnect(), l.disconnect(), u.disconnect(), o.disconnect()
                  } catch (e) {}
                }, 1e3 * (c + .05)), setTimeout(() => function(e, t) {
                  if (d) {
                    var n = d.currentTime;
                    const a = d.createBuffer(1, d.sampleRate * e, d.sampleRate),
                      c = a.getChannelData(0);
                    for (let e = 0; e < c.length; e++) c[e] = (2 * Math.random() - 1) * (1 - e / c.length);
                    const i = d.createBufferSource();
                    i.buffer = a;
                    const o = d.createGain();
                    o.gain.setValueAtTime(t, n), o.gain.exponentialRampToValueAtTime(1e-4, n + e);
                    const s = d.createBiquadFilter();
                    s.type = "highpass", s.frequency.value = 800, i.connect(s), s.connect(o), o.connect(d.destination),
                      i.start(n), i.stop(n + e + .02), i.onended = () => {
                        try {
                          i.disconnect(), s.disconnect(), o.disconnect()
                        } catch (e) {}
                      }
                  }
                }(.06, e.noiseLevel || .007), 8)
              }
            }

            function t() {
              e({
                freq: 920,
                detunePct: .009,
                peak: .12,
                lp: 5600,
                hp: 220,
                shimmer: .014,
                noiseLevel: .008,
                attack: .0012,
                sustain: .03,
                release: .14
              })
            }

            function n() {
              e({
                freq: 1200,
                detunePct: .012,
                peak: .045,
                lp: 7200,
                hp: 300,
                shimmer: .006,
                noiseLevel: .004,
                attack: .002,
                sustain: .02,
                release: .09
              })
            }
            document.addEventListener("click", function(e) {
              e.target.closest(
                'button, a, [role="button"], .nb, .insta-cell, .mp-era-card-outer, .panties-widget, .bra-nav-btn, .fans-star-wrap, .talk-nav-pill, .sl-btn, .dropdown-item'
              ) && t()
            }, !0);
            const a = new WeakMap;
            document.addEventListener("mouseover", function(e) {
              var t = e.target.closest(".nb, .bra-nav-btn, .talk-nav-pill, .sl-btn");
              t && ((e = Date.now()) - (a.get(t) || 0) < 110 || (a.set(t, e), n()))
            }, !0), window.__uiAudio = {
              playClick: t,
              playHover: n
            }
          }()

/* ── dayjs timestamp refresh ── */
setInterval(function() {
            "undefined" != typeof dayjs && document.querySelectorAll(".tweet-time[data-ts]").forEach(function(t) {
              var e = t.getAttribute("data-ts");
              if (e) try {
                t.textContent = dayjs(e).fromNow()
              } catch (t) {}
            })
          }, 6e4)
