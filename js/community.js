/* ═══════════════════════════════════════════════════════════════
   community.js — Community page: Discord server bio and avatar.
   Deferred. Depends on app.js (window.S).

   Owns: community avatar, server bio, openCommunityEdit().
   Called from: pages/community.html, _onPageLoad('community').
   ═══════════════════════════════════════════════════════════════ */

(function () {
  function setCommunityAvatar(url) {
    var el = document.getElementById('community-avatar');
    if (el) {
      el.style.backgroundImage = "url('" + (url || 'https://i.imgur.com/ct2ERKN.jpeg') + "')";
      var mob = document.getElementById('mob-com-avatar');
      if (mob) mob.style.backgroundImage = el.style.backgroundImage;
    }
  }

  function setCommunityBio(text) {
    var el = document.getElementById('community-bio');
    var mob = document.getElementById('mob-com-bio');
    if (el) el.textContent = text;
    if (mob) mob.textContent = text;
  }

  function loadCommunityBio() {
    try {
      var stored = localStorage.getItem('community_bio');
      if (stored) {
        setCommunityBio(stored);
        return;
      }
    } catch (e) {}
    try {
      var cfg = window._siteConfig && window._siteConfig.community_bio;
      if (cfg) {
        setCommunityBio(cfg);
        return;
      }
    } catch (e) {}
  }

  function syncAdminEditButton() {
    var btn = document.getElementById('community-edit-btn');
    if (btn) btn.style.display = document.body.classList.contains('talk-admin') ? 'block' : 'none';
  }

  window.openCommunityEdit = function () {
    if (!document.body.classList.contains('talk-admin')) return;
    var current = (document.getElementById('community-bio') || {}).textContent || '';
    var updated = prompt('Edit server bio:', current);
    if (updated === null) return;
    setCommunityBio(updated);
    try {
      localStorage.setItem('community_bio', updated);
    } catch (e) {}
    if (typeof window._saveSiteConfig === 'function') {
      try {
        window._saveSiteConfig({ community_bio: updated });
      } catch (e) {}
    }
  };

  /* Sync avatar from profile */
  try {
    var avatarImg = document.querySelector('#sl-avatar-inner img');
    var avatarUrl =
      window.S && window.S.profile && window.S.profile.avatar
        ? window.S.profile.avatar
        : avatarImg
          ? avatarImg.src
          : 'https://i.imgur.com/ct2ERKN.jpeg';
    setCommunityAvatar(avatarUrl);
  } catch (e) {
    setCommunityAvatar('https://i.imgur.com/ct2ERKN.jpeg');
  }

  /* Wrap syncMusicSidebar to also keep community avatar in sync */
  var _prevSync = window.syncMusicSidebar;
  window.syncMusicSidebar = function () {
    try {
      if (typeof _prevSync === 'function') _prevSync();
    } catch (e) {}
    try {
      if (window.S && window.S.profile && window.S.profile.avatar) {
        setCommunityAvatar(window.S.profile.avatar);
      }
    } catch (e) {}
  };

  loadCommunityBio();
  syncAdminEditButton();

  window.addEventListener('storage', function (e) {
    if (e.key === 'community_bio') loadCommunityBio();
  });

  if (window._siteConfig && window._siteConfig.community_bio) {
    setCommunityBio(window._siteConfig.community_bio);
  }
})();

