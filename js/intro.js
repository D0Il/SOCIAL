/* ═══════════════════════════════════════════════════════════════
   intro.js — Splash screen and background sync.
   Deferred. Runs after DOM is ready.

   Exposes:
     window._syncDollBg()   — sync #_doll_bg_fixed to body background

   Contains:
     #_doll_bg_fixed         — fixed background mirror element
     famed0ll_intro_v3       — splash screen (shown once per browser)
   ═══════════════════════════════════════════════════════════════ */

/* ── Loading bar ── */
! function() {
    var n = document.createElement("div");

    function e() {
      var e = document.documentElement,
        t = document.body || e,
        t = e.style.backgroundImage && "none" !== e.style.backgroundImage ? e : t,
        t = getComputedStyle(t);
      n.style.backgroundImage = t.backgroundImage || "", n.style.backgroundSize = t.backgroundSize || "cover", n.style.backgroundRepeat =
        t.backgroundRepeat || "no-repeat", n.style.backgroundPosition = t.backgroundPosition || "center center", n.style
        .backgroundAttachment = t.backgroundAttachment || "fixed", n.style.backgroundColor = t.backgroundColor ||
        "var(--bg)"
    }
    n.id = "_doll_bg_fixed", n.setAttribute("aria-hidden", "true"), n.style.cssText =
      "position:fixed;inset:0;z-index:-9999;pointer-events:none;will-change:background-image;background-size:cover;background-position:center center;background-attachment:fixed;",
      document.documentElement.appendChild(n);
    var t = new MutationObserver(e);

    function o() {
      document.body && (t.observe(document.body, {
        attributes: !0,
        attributeFilter: ["style"]
      }), e())
    }
    t.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["style"]
    }), document.body && t.observe(document.body, {
      attributes: !0,
      attributeFilter: ["style"]
    }), document.body ? o() : document.addEventListener("DOMContentLoaded", o), window.addEventListener("load", () => {
      e(), setTimeout(e, 800), setTimeout(e, 1500)
    }), window._syncDollBg = e
  }()

/* ── Intro splash (famed0ll_intro_v3) ── */
! function() {
      const t = "famed0ll_intro_v3",
        i = document.getElementById("site-intro");
      if (i)
        if (localStorage.getItem(t)) i.classList.add("si-hidden");
        else {
          let e = !1;

          function s() {
            e || (e = !0, localStorage.setItem(t, "1"), i.classList.add("si-out"), setTimeout(() => i.classList.add(
              "si-hidden"), 950))
          }
          requestAnimationFrame(() => requestAnimationFrame(() => i.classList.add("si-visible"))), i.addEventListener(
            "click",
            function e() {
              i.removeEventListener("click", e);
              try {
                const t = new Audio(
                  "https://www.dropbox.com/scl/fi/707lbe1u5zvivzqzh4x4d/FAMEEEEEEEEEEEEEEEEEEE.m4a?rlkey=ihm3skhrotb8wto95tnct1imn&st=a7p8uhht&dl=1"
                );
                t.volume = .9, t.play().catch(() => {}), t.addEventListener("ended", s), setTimeout(s, 8e3)
              } catch (e) {
                setTimeout(s, 1e3)
              }
            }), setTimeout(s, 12e3)
        }
    }()
