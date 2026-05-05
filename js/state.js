/*
   state.js - shared site state helpers.
   Loads after core.js and before config.js/app.js.
*/
(function () {
  var MAIN_PAGES = {
    profile: true,
    scrollables: true,
    community: true,
    feed: true,
    live: true,
    shop: true,
    music: true,
    talk: true,
    settings: true,
  };

  function isMainPage(page) {
    return !!MAIN_PAGES[String(page || '')];
  }

  function normalizeMainPage(page, fallback) {
    return isMainPage(page) ? String(page) : fallback || 'profile';
  }

  function getText(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function setText(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getJSON(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  window.FD_STATE = {
    mainPages: MAIN_PAGES,
    isMainPage: isMainPage,
    normalizeMainPage: normalizeMainPage,
    getText: getText,
    setText: setText,
    getJSON: getJSON,
    setJSON: setJSON,
  };
})();

