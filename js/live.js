/* ═══════════════════════════════════════════════════════════════
   live.js — Live page: Twitch player, live description editor.
   Deferred. Depends on app.js, firebase.js (_saveSiteConfig, _uploadFile).

   Owns: initLivePage(), stream description modal, Twitch embed.
   Called from: pages/live.html, showPage('live') in app.js.

   RULE: Never remove websim.ai or websim.com from the Twitch parent list.
   ═══════════════════════════════════════════════════════════════ */

/* ── Twitch parent domain list ── */
function _getTwitchParents() {
  var domains = ['famedoll.com', 'd0ll.ca', 'claude.ai', 'websim.ai', 'websim.com', 'localhost'];
  try {
    if (window.location.hostname) domains.push(window.location.hostname);
  } catch (e) {}
  try {
    if (window.location.ancestorOrigins) {
      for (var i = 0; i < window.location.ancestorOrigins.length; i++) {
        try {
          domains.push(new URL(window.location.ancestorOrigins[i]).hostname);
        } catch (e) {}
      }
    }
  } catch (e) {}
  return [...new Set(domains)].filter(Boolean);
}

/* ── Twitch embed init ── */
window._initTwitchOnce = function () {
  var containerId = 'twitch-video';
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  if (window.twitchPlayer) {
    try {
      if (typeof window.twitchPlayer.pause === 'function') window.twitchPlayer.pause();
    } catch (e) {}
    try {
      if (typeof window.twitchPlayer.destroy === 'function') window.twitchPlayer.destroy();
    } catch (e) {}
    window.twitchPlayer = null;
  }

  var parents = _getTwitchParents();
  var fallbackHtml =
    '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-family:DM Mono,monospace;font-size:13px;flex-direction:column;gap:12px;"><div>Player unavailable — open on Twitch</div><a href="https://www.twitch.tv/famedoll" target="_blank" style="color:var(--pk);text-decoration:none;border:1px solid var(--border2);padding:8px 16px;border-radius:4px;">Watch on Twitch</a></div>';

  try {
    if (typeof Twitch !== 'undefined' && Twitch.Player) {
      window.twitchPlayer = new Twitch.Player(containerId, {
        width: '100%',
        height: '100%',
        channel: 'famedoll',
        parent: parents,
      });
    } else {
      container.innerHTML = fallbackHtml;
    }
  } catch (e) {
    console.warn('Twitch init failed:', e);
    container.innerHTML = fallbackHtml;
  }

  var chatContainer = document.getElementById('twitch-chat-container-live');
  if (chatContainer) {
    chatContainer.innerHTML = '';
    var chatUrl =
      'https://www.twitch.tv/embed/famedoll/chat?' +
      parents
        .map(function (p) {
          return 'parent=' + encodeURIComponent(p);
        })
        .join('&') +
      '&darkpopout=true';
    var chatFrame = document.createElement('iframe');
    chatFrame.src = chatUrl;
    chatFrame.style.width = '100%';
    chatFrame.style.height = '100%';
    chatFrame.style.border = 'none';
    chatFrame.id = 'twitch-chat-iframe';
    chatContainer.appendChild(chatFrame);
  }
};

/* ── Live page lazy init (called by showPage and _onPageLoad) ── */
window.initLivePage =
  window.initLivePage ||
  function () {
    if (window._twitchInitDone) return;
    window._twitchInitDone = true;
    window
      .fdLoadScript('https://player.twitch.tv/js/embed/v1.js')
      .then(function () {
        window._initTwitchOnce && window._initTwitchOnce();
      })
      .catch(function (e) {
        console.warn('Twitch SDK load failed:', e);
      });
  };

/* ── Live description rendering ── */
function _renderLiveDesc(content) {
  window._cachedLiveDesc = content;
  var el = document.getElementById('live-desc-content');
  var placeholder = document.getElementById('live-desc-placeholder');
  if (!el) return;
  if (content && content.trim()) {
    el.innerHTML = content;
    if (placeholder) placeholder.style.display = 'none';
  } else {
    el.innerHTML = '';
    if (placeholder) placeholder.style.display = '';
  }
}
window._renderLiveDesc = _renderLiveDesc;

/* ── Live description modal ── */
function openLiveDescEdit() {
  if (!document.body.classList.contains('talk-admin')) return;
  var overlay = document.getElementById('live-desc-modal-overlay');
  var editor = document.getElementById('live-desc-editor');
  var content = document.getElementById('live-desc-content');
  if (editor && content) {
    editor.innerHTML = content.innerHTML.replace(
      /<span[^>]*live-desc-empty[^>]*>.*?<\/span>/gi,
      '',
    );
  }
  if (overlay) overlay.style.display = 'flex';
  if (editor) editor.focus();
}
window.openLiveDescEdit = openLiveDescEdit;

function closeLiveDescEdit() {
  var overlay = document.getElementById('live-desc-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}
window.closeLiveDescEdit = closeLiveDescEdit;

function liveDescExec(cmd) {
  var editor = document.getElementById('live-desc-editor');
  if (editor) editor.focus();
  document.execCommand(cmd, false, null);
}
window.liveDescExec = liveDescExec;

function liveDescLink() {
  var url = prompt('Enter URL:');
  if (url) {
    var editor = document.getElementById('live-desc-editor');
    if (editor) editor.focus();
    document.execCommand('createLink', false, url);
  }
}
window.liveDescLink = liveDescLink;

function liveDescAddPhoto() {
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = async function () {
    var file = fileInput.files[0];
    if (!file) return;
    var btn = document.querySelector('.live-desc-tb-btn[onclick="liveDescAddPhoto()"]');
    var origText = btn ? btn.textContent : '';
    if (btn) btn.textContent = 'Uploading...';
    try {
      var url = await window._uploadFile(file);
      var editor = document.getElementById('live-desc-editor');
      if (editor) {
        editor.focus();
        document.execCommand(
          'insertHTML',
          false,
          '<img src="' +
            url +
            '" alt="" style="max-width:100%;border-radius:4px;margin:6px 0;display:block;">',
        );
      }
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally {
      if (btn) btn.textContent = origText;
    }
  };
  fileInput.click();
}
window.liveDescAddPhoto = liveDescAddPhoto;

async function saveLiveDesc() {
  if (!document.body.classList.contains('talk-admin')) return;
  var editor = document.getElementById('live-desc-editor');
  var content = editor ? editor.innerHTML : '';
  var saveBtn = document.querySelector('.live-desc-save-btn');
  if (saveBtn) saveBtn.textContent = 'Saving...';
  try {
    await window._saveSiteConfig({ live_description: content });
    _renderLiveDesc(content);
    closeLiveDescEdit();
  } catch (e) {
    alert('Save failed: ' + e.message);
  } finally {
    if (saveBtn) saveBtn.textContent = 'Save';
  }
}
window.saveLiveDesc = saveLiveDesc;

/* ── Click-outside to close — delegated since modal is lazy-loaded ── */
document.addEventListener('click', function (e) {
  var overlay = document.getElementById('live-desc-modal-overlay');
  if (overlay && overlay.style.display === 'flex' && e.target === overlay) {
    closeLiveDescEdit();
  }
});

