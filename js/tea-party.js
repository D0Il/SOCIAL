/* ═══════════════════════════════════════════════════════════════
   tea-party.js — Tea Party social app (126KB).
                   Includes: dayjs, full Twitter-clone IIFE,
                   Firebase auth, Firestore, tweets, profiles,
                   search, blog, hashtags, Tea Party UI.
                   Depends on: core.js, config.js, app.js (S global)
   ═══════════════════════════════════════════════════════════════ */

// ── Wait for talk page HTML before initializing ──────────────────────────────
// The Tea Party IIFE needs #app-root which lives in pages/talk.html.
// We wait for the page to be loaded before running.
(function () {
  function runTeaParty() {
    if (!document.getElementById('app-root')) return; // not ready yet
    !(function () {
      var e, t;
      ((e = this),
        (t = function () {
          'use strict';

          function n(e, t, i) {
            var n = String(e);
            return !n || n.length >= t ? e : '' + Array(t + 1 - n.length).join(i) + e;
          }
          var a = 'millisecond',
            u = 'second',
            m = 'minute',
            p = 'hour',
            g = 'day',
            f = 'week',
            v = 'month',
            d = 'quarter',
            h = 'year',
            y = 'date',
            t = 'Invalid Date',
            r =
              /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
            b =
              /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
            e = {
              name: 'en',
              weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
              months:
                'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                  '_',
                ),
              ordinal: function (e) {
                var t = ['th', 'st', 'nd', 'rd'],
                  i = e % 100;
                return '[' + e + (t[(i - 20) % 10] || t[i] || t[0]) + ']';
              },
            },
            i = {
              s: n,
              z: function (e) {
                var t = -e.utcOffset(),
                  i = Math.abs(t),
                  e = Math.floor(i / 60),
                  i = i % 60;
                return (t <= 0 ? '+' : '-') + n(e, 2, '0') + ':' + n(i, 2, '0');
              },
              m: function e(t, i) {
                if (t.date() < i.date()) return -e(i, t);
                var n = 12 * (i.year() - t.year()) + (i.month() - t.month()),
                  a = t.clone().add(n, v),
                  o = i - a < 0,
                  t = t.clone().add(n + (o ? -1 : 1), v);
                return +(-(n + (i - a) / (o ? a - t : t - a)) || 0);
              },
              a: function (e) {
                return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
              },
              p: function (e) {
                return (
                  {
                    M: v,
                    y: h,
                    w: f,
                    d: g,
                    D: y,
                    h: p,
                    m: m,
                    s: u,
                    ms: a,
                    Q: d,
                  }[e] ||
                  String(e || '')
                    .toLowerCase()
                    .replace(/s$/, '')
                );
              },
              u: function (e) {
                return void 0 === e;
              },
            },
            o = 'en',
            s = {};
          s[o] = e;

          function l(e) {
            return e instanceof k || !(!e || !e[x]);
          }

          function c(e, t, i) {
            var n;
            if (!e) return o;
            if ('string' == typeof e) {
              var a = e.toLowerCase();
              (s[a] && (n = a), t && ((s[a] = t), (n = a)));
              a = e.split('-');
              if (!n && 1 < a.length) return c(a[0]);
            } else {
              a = e.name;
              ((s[a] = e), (n = a));
            }
            return (!i && n && (o = n), n || (!i && o));
          }

          function w(e, t) {
            return l(e)
              ? e.clone()
              : (((t = 'object' == typeof t ? t : {}).date = e), (t.args = arguments), new k(t));
          }
          var x = '$isDayjsObject',
            $ = i;
          (($.l = c),
            ($.i = l),
            ($.w = function (e, t) {
              return w(e, {
                locale: t.$L,
                utc: t.$u,
                x: t.$x,
                $offset: t.$offset,
              });
            }));
          var k =
              (((i = B.prototype).parse = function (o) {
                ((this.$d = (function () {
                  var e = o.date,
                    t = o.utc;
                  if (null === e) return new Date(NaN);
                  if ($.u(e)) return new Date();
                  if (e instanceof Date) return new Date(e);
                  if ('string' == typeof e && !/Z$/i.test(e)) {
                    var i = e.match(r);
                    if (i) {
                      var n = i[2] - 1 || 0,
                        a = (i[7] || '0').substring(0, 3);
                      return t
                        ? new Date(Date.UTC(i[1], n, i[3] || 1, i[4] || 0, i[5] || 0, i[6] || 0, a))
                        : new Date(i[1], n, i[3] || 1, i[4] || 0, i[5] || 0, i[6] || 0, a);
                    }
                  }
                  return new Date(e);
                })()),
                  this.init());
              }),
              (i.init = function () {
                var e = this.$d;
                ((this.$y = e.getFullYear()),
                  (this.$M = e.getMonth()),
                  (this.$D = e.getDate()),
                  (this.$W = e.getDay()),
                  (this.$H = e.getHours()),
                  (this.$m = e.getMinutes()),
                  (this.$s = e.getSeconds()),
                  (this.$ms = e.getMilliseconds()));
              }),
              (i.$utils = function () {
                return $;
              }),
              (i.isValid = function () {
                return !(this.$d.toString() === t);
              }),
              (i.isSame = function (e, t) {
                e = w(e);
                return this.startOf(t) <= e && e <= this.endOf(t);
              }),
              (i.isAfter = function (e, t) {
                return w(e) < this.startOf(t);
              }),
              (i.isBefore = function (e, t) {
                return this.endOf(t) < w(e);
              }),
              (i.$g = function (e, t, i) {
                return $.u(e) ? this[t] : this.set(i, e);
              }),
              (i.unix = function () {
                return Math.floor(this.valueOf() / 1e3);
              }),
              (i.valueOf = function () {
                return this.$d.getTime();
              }),
              (i.startOf = function (e, t) {
                function i(e, t) {
                  return (
                    (e = $.w(a.$u ? Date.UTC(a.$y, t, e) : new Date(a.$y, t, e), a)),
                    o ? e : e.endOf(g)
                  );
                }

                function n(e, t) {
                  return $.w(
                    a
                      .toDate()
                      [e].apply(a.toDate('s'), (o ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(t)),
                    a,
                  );
                }
                var a = this,
                  o = !!$.u(t) || t,
                  e = $.p(e),
                  r = this.$W,
                  s = this.$M,
                  l = this.$D,
                  d = 'set' + (this.$u ? 'UTC' : '');
                switch (e) {
                  case h:
                    return o ? i(1, 0) : i(31, 11);
                  case v:
                    return o ? i(1, s) : i(0, s + 1);
                  case f:
                    var c = this.$locale().weekStart || 0,
                      c = (r < c ? r + 7 : r) - c;
                    return i(o ? l - c : l + (6 - c), s);
                  case g:
                  case y:
                    return n(d + 'Hours', 0);
                  case p:
                    return n(d + 'Minutes', 1);
                  case m:
                    return n(d + 'Seconds', 2);
                  case u:
                    return n(d + 'Milliseconds', 3);
                  default:
                    return this.clone();
                }
              }),
              (i.endOf = function (e) {
                return this.startOf(e, !1);
              }),
              (i.$set = function (e, t) {
                var i = $.p(e),
                  n = 'set' + (this.$u ? 'UTC' : ''),
                  e =
                    (((e = {})[g] = n + 'Date'),
                    (e[y] = n + 'Date'),
                    (e[v] = n + 'Month'),
                    (e[h] = n + 'FullYear'),
                    (e[p] = n + 'Hours'),
                    (e[m] = n + 'Minutes'),
                    (e[u] = n + 'Seconds'),
                    (e[a] = n + 'Milliseconds'),
                    e[i]),
                  t = i === g ? this.$D + (t - this.$W) : t;
                return (
                  i === v || i === h
                    ? ((i = this.clone().set(y, 1)).$d[e](t),
                      i.init(),
                      (this.$d = i.set(y, Math.min(this.$D, i.daysInMonth())).$d))
                    : e && this.$d[e](t),
                  this.init(),
                  this
                );
              }),
              (i.set = function (e, t) {
                return this.clone().$set(e, t);
              }),
              (i.get = function (e) {
                return this[$.p(e)]();
              }),
              (i.add = function (i, e) {
                var n = this;
                i = Number(i);
                var t = $.p(e),
                  e = function (e) {
                    var t = w(n);
                    return $.w(t.date(t.date() + Math.round(e * i)), n);
                  };
                if (t === v) return this.set(v, this.$M + i);
                if (t === h) return this.set(h, this.$y + i);
                if (t === g) return e(1);
                if (t === f) return e(7);
                (((e = {})[m] = 6e4),
                  (e[p] = 36e5),
                  (e[u] = 1e3),
                  (t = e[t] || 1),
                  (t = this.$d.getTime() + i * t));
                return $.w(t, this);
              }),
              (i.subtract = function (e, t) {
                return this.add(-1 * e, t);
              }),
              (i.format = function (e) {
                var a = this,
                  i = this.$locale();
                if (!this.isValid()) return i.invalidDate || t;

                function n(e, t, i, n) {
                  return (e && (e[t] || e(a, r))) || i[t].slice(0, n);
                }

                function o(e) {
                  return $.s(l % 12 || 12, e, '0');
                }
                var r = e || 'YYYY-MM-DDTHH:mm:ssZ',
                  s = $.z(this),
                  l = this.$H,
                  d = this.$m,
                  c = this.$M,
                  u = i.weekdays,
                  m = i.months,
                  e = i.meridiem,
                  p =
                    e ||
                    function (e, t, i) {
                      e = e < 12 ? 'AM' : 'PM';
                      return i ? e.toLowerCase() : e;
                    };
                return r.replace(b, function (e, t) {
                  return (
                    t ||
                    (function () {
                      switch (e) {
                        case 'YY':
                          return String(a.$y).slice(-2);
                        case 'YYYY':
                          return $.s(a.$y, 4, '0');
                        case 'M':
                          return c + 1;
                        case 'MM':
                          return $.s(c + 1, 2, '0');
                        case 'MMM':
                          return n(i.monthsShort, c, m, 3);
                        case 'MMMM':
                          return n(m, c);
                        case 'D':
                          return a.$D;
                        case 'DD':
                          return $.s(a.$D, 2, '0');
                        case 'd':
                          return String(a.$W);
                        case 'dd':
                          return n(i.weekdaysMin, a.$W, u, 2);
                        case 'ddd':
                          return n(i.weekdaysShort, a.$W, u, 3);
                        case 'dddd':
                          return u[a.$W];
                        case 'H':
                          return String(l);
                        case 'HH':
                          return $.s(l, 2, '0');
                        case 'h':
                          return o(1);
                        case 'hh':
                          return o(2);
                        case 'a':
                          return p(l, d, !0);
                        case 'A':
                          return p(l, d, !1);
                        case 'm':
                          return String(d);
                        case 'mm':
                          return $.s(d, 2, '0');
                        case 's':
                          return String(a.$s);
                        case 'ss':
                          return $.s(a.$s, 2, '0');
                        case 'SSS':
                          return $.s(a.$ms, 3, '0');
                        case 'Z':
                          return s;
                      }
                      return null;
                    })() ||
                    s.replace(':', '')
                  );
                });
              }),
              (i.utcOffset = function () {
                return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
              }),
              (i.diff = function (e, t, i) {
                function n() {
                  return $.m(o, r);
                }
                var a,
                  o = this,
                  t = $.p(t),
                  r = w(e),
                  s = 6e4 * (r.utcOffset() - this.utcOffset()),
                  l = this - r;
                switch (t) {
                  case h:
                    a = n() / 12;
                    break;
                  case v:
                    a = n();
                    break;
                  case d:
                    a = n() / 3;
                    break;
                  case f:
                    a = (l - s) / 6048e5;
                    break;
                  case g:
                    a = (l - s) / 864e5;
                    break;
                  case p:
                    a = l / 36e5;
                    break;
                  case m:
                    a = l / 6e4;
                    break;
                  case u:
                    a = l / 1e3;
                    break;
                  default:
                    a = l;
                }
                return i ? a : $.a(a);
              }),
              (i.daysInMonth = function () {
                return this.endOf(v).$D;
              }),
              (i.$locale = function () {
                return s[this.$L];
              }),
              (i.locale = function (e, t) {
                if (!e) return this.$L;
                var i = this.clone(),
                  t = c(e, t, !0);
                return (t && (i.$L = t), i);
              }),
              (i.clone = function () {
                return $.w(this.$d, this);
              }),
              (i.toDate = function () {
                return new Date(this.valueOf());
              }),
              (i.toJSON = function () {
                return this.isValid() ? this.toISOString() : null;
              }),
              (i.toISOString = function () {
                return this.$d.toISOString();
              }),
              (i.toString = function () {
                return this.$d.toUTCString();
              }),
              B),
            E = k.prototype;

          function B(e) {
            ((this.$L = c(e.locale, null, !0)),
              this.parse(e),
              (this.$x = this.$x || e.x || {}),
              (this[x] = !0));
          }
          return (
            (w.prototype = E),
            [
              ['$ms', a],
              ['$s', u],
              ['$m', m],
              ['$H', p],
              ['$W', g],
              ['$M', v],
              ['$y', h],
              ['$D', y],
            ].forEach(function (t) {
              E[t[1]] = function (e) {
                return this.$g(e, t[0], t[1]);
              };
            }),
            (w.extend = function (e, t) {
              return (e.$i || (e(t, k, w), (e.$i = !0)), w);
            }),
            (w.locale = c),
            (w.isDayjs = l),
            (w.unix = function (e) {
              return w(1e3 * e);
            }),
            (w.en = s[o]),
            (w.Ls = s),
            (w.p = {}),
            w
          );
        }),
        'object' == typeof exports && 'undefined' != typeof module
          ? (module.exports = t())
          : 'function' == typeof define && define.amd
            ? define(t)
            : ((e = 'undefined' != typeof globalThis ? globalThis : e || self).dayjs = t()),
        (function () {
          var e, t;
          ((e = this),
            (t = function () {
              'use strict';
              return function (v, e, h) {
                v = v || {};
                var a = e.prototype,
                  y = {
                    future: 'in %s',
                    past: '%s ago',
                    s: 'a few seconds',
                    m: 'a minute',
                    mm: '%d minutes',
                    h: 'an hour',
                    hh: '%d hours',
                    d: 'a day',
                    dd: '%d days',
                    M: 'a month',
                    MM: '%d months',
                    y: 'a year',
                    yy: '%d years',
                  };

                function i(e, t, i, n) {
                  return a.fromToBase(e, t, i, n);
                }
                ((h.en.relativeTime = y),
                  (a.fromToBase = function (e, t, i, n, a) {
                    for (
                      var o,
                        r,
                        s = i.$locale().relativeTime || y,
                        l = v.thresholds || [
                          {
                            l: 's',
                            r: 44,
                            d: 'second',
                          },
                          {
                            l: 'm',
                            r: 89,
                          },
                          {
                            l: 'mm',
                            r: 44,
                            d: 'minute',
                          },
                          {
                            l: 'h',
                            r: 89,
                          },
                          {
                            l: 'hh',
                            r: 21,
                            d: 'hour',
                          },
                          {
                            l: 'd',
                            r: 35,
                          },
                          {
                            l: 'dd',
                            r: 25,
                            d: 'day',
                          },
                          {
                            l: 'M',
                            r: 45,
                          },
                          {
                            l: 'MM',
                            r: 10,
                            d: 'month',
                          },
                          {
                            l: 'y',
                            r: 17,
                          },
                          {
                            l: 'yy',
                            d: 'year',
                          },
                        ],
                        d = l.length,
                        c = 0;
                      c < d;
                      c += 1
                    ) {
                      var u = l[c];
                      u.d && (o = n ? h(e).diff(i, u.d, !0) : i.diff(e, u.d, !0));
                      var m = (v.rounding || Math.round)(Math.abs(o)),
                        p = 0 < o;
                      if (m <= u.r || !u.r) {
                        var g = s[(u = m <= 1 && 0 < c ? l[c - 1] : u).l];
                        (a && (m = a('' + m)),
                          (r = 'string' == typeof g ? g.replace('%d', m) : g(m, t, u.l, p)));
                        break;
                      }
                    }
                    if (t) return r;
                    var f = p ? s.future : s.past;
                    return 'function' == typeof f ? f(r) : f.replace('%s', r);
                  }),
                  (a.to = function (e, t) {
                    return i(e, t, this, !0);
                  }),
                  (a.from = function (e, t) {
                    return i(e, t, this);
                  }));

                function t(e) {
                  return e.$u ? h.utc() : h();
                }
                ((a.toNow = function (e) {
                  return this.to(t(this), e);
                }),
                  (a.fromNow = function (e) {
                    return this.from(t(this), e);
                  }));
              };
            }),
            'object' == typeof exports && 'undefined' != typeof module
              ? (module.exports = t())
              : 'function' == typeof define && define.amd
                ? define(t)
                : ((e =
                    'undefined' != typeof globalThis
                      ? globalThis
                      : e || self).dayjs_plugin_relativeTime = t()));
        })(),
        dayjs.extend(dayjs_plugin_relativeTime));
      const i = {
          en: {
            mind: "What's on your mind?",
            update: 'Update',
            addMedia: 'Add media',
            reply: 'Reply',
            like: 'Like',
            retweet: 'Retweet',
            delete: 'Delete',
            cancel: 'Cancel',
            search: 'Search',
            blog: 'Blog',
            trending: 'Trending',
            comments: 'Comments',
            saveChanges: 'Save changes',
            home: 'Home',
            myProfile: 'Profile',
            settings: 'Profile Settings',
            nothingToSee: 'Nothing to see here yet.',
            tweetAndReplies: 'Tweet & Replies',
            replyingTo: 'Replying to',
            quoting: 'Quoting post by',
            tweetYourReply: 'Tweet your reply',
            postComment: 'Post Comment',
            leaveComment: 'Leave a comment',
            createBlogPost: 'Create New Blog Post',
            postTitle: 'Post Title',
            mainContent: 'Main Content',
            publishBlog: 'Publish Blog Post',
            by: 'by',
            on: 'on',
            back: 'Back',
            loginWarning: 'Please log in to use features.',
            noCommentsYet: 'No comments yet. Be the first to reply!',
            nothingTrending: 'Nothing trending yet.',
            confirm: 'Confirm',
            retweetChoiceDesc: 'Would you like to retweet normally or quote it?',
            retweetNormally: 'Retweet Normally',
            quotePost: 'Quote Post',
            refresh: 'Refresh',
            hot: 'Hot',
            latest: 'Latest',
            accountProfile: 'Account Profile',
            nickname: 'Nickname',
            bio: 'Bio',
            profilePic: 'Profile Picture',
            profileBanner: 'Profile Banner',
            twitterBlog: 'Blog',
            trendingHashtags: 'Trending Hashtags',
            searchResults: 'Search Results',
            searchTweets: 'Tweets',
            searchUsers: 'Users',
            searchMode: 'Mode',
            modeNormal: 'Normal',
            modeExact: 'Exact',
            modeAll: 'All',
            writeBlog: 'Write Blog Post',
            replies: 'Replies',
            confirmDeleteBlog: 'Confirm delete blog post?',
            confirmDeleteComment: 'Confirm delete comment?',
            confirmDeleteTweet: 'Confirm delete tweet?',
            notSignedUpLabel: 'Not signed up',
            allUsersDirectory: 'All Users Directory',
            totalPosts: 'posts',
            lastUsedBy: 'Last used by',
            pinPost: 'Pin Post',
            unpinPost: 'Unpin Post',
            editPost: 'Edit Post',
            deletePost: 'Delete Post',
            noHotPosts: 'No hot posts yet.',
            noHashtagsYet: 'No hashtags yet.',
            profileHiddenGuest: 'Profile hidden in guest preview',
            notSignedUp: 'User has not completed signup',
            save: 'Save',
          },
        },
        m = 'tweet_v4',
        p = 'profile_v3',
        g = 'like_v2',
        f = 'blog_v3',
        v = 'blog_comment_v3',
        b = 300,
        c = '',
        w = 26214400;
      let h,
        x,
        y,
        $,
        k,
        E,
        B = !1;

      function L() {
        ((B = !0),
          (R = {
            username: 'famed0ll',
            id: 'famed0ll',
          }),
          document.body.classList.add('talk-admin'));
      }
      ((e = window.FD_CFG.firebaseSdkBase),
        Promise.all([
          window.fdLoadScript(`${e}/firebase-app-compat.js`),
          window.fdLoadScript(`${e}/firebase-auth-compat.js`),
        ])
          .then(() => {
            (window.fdEnsureFirebaseApp(),
              firebase.auth().onAuthStateChanged((e) => {
                e && 'kbEeYQPq8TRtzHC2SfTizvbButa2' === e.uid
                  ? L()
                  : ((B = !1), document.body.classList.remove('talk-admin'));
              }));
          })
          .catch((e) => console.warn('Early auth load failed:', e)),
        (window.login = async function () {
          var e = prompt('Email:');
          if (e) {
            var t = prompt('Password:');
            if (t)
              try {
                await firebase.auth().signInWithEmailAndPassword(e, t);
              } catch (e) {
                alert('Login failed: ' + e.message);
              }
          }
        }),
        (window.logout = async function () {
          try {
            await firebase.auth().signOut();
          } catch (e) {}
          ((B = !1),
            (R = {
              username: 'guest',
              id: 'guest',
            }),
            document.body.classList.remove('talk-admin'));
        }),
        (window._talkLogout = () => {
          window.logout && window.logout();
        }));
      let I = [],
        _ = [],
        C = [],
        T = [],
        M = {},
        P = null;
      const D = 40,
        j = 180;
      let q = [],
        A = -1,
        U = null,
        H = 1e3,
        z = !1,
        N = !0,
        O = null,
        R = {
          username: 'guest',
          id: 'guest',
        },
        F = !1,
        Y = null,
        W = null,
        V = null,
        Z = !1,
        K = 'latest',
        J = null,
        Q = {
          query: '',
          type: 'tweets',
          matchMode: 'normal',
        },
        n = localStorage.getItem('twitter_lang') || 'en',
        a = localStorage.getItem('twitter_ui_mode') || 'auto',
        G = !document.documentElement.classList.contains('light-mode');

      function X(e) {
        return (i[n] && i[n][e]) || i.en[e] || e;
      }

      function ee() {
        (document.body.classList.remove('force-desktop', 'force-mobile'),
          'auto' !== a && document.body.classList.add('force-' + a),
          document.body.classList.toggle('dark-mode', G));
      }

      function te() {
        const e = document.getElementById('topbar-avatar'),
          t = document.getElementById('topbar-username'),
          i = document.getElementById('nav-search-mobile'),
          n = document.getElementById('nav-blog-mobile');
        (i && (i.textContent = X('search')), n && (n.textContent = X('blog')));
        const a = document.querySelector('.app-search-input');
        a && (a.placeholder = X('search'));
        const o = document.getElementById('nav-home'),
          r = document.getElementById('talk-nav-profile'),
          s = document.getElementById('nav-edit-profile'),
          l = document.getElementById('nav-blog-admin');
        (o && (o.textContent = X('home')),
          r && (r.textContent = X('myProfile')),
          s && (s.textContent = X('settings')),
          l && (l.textContent = X('writeBlog')));
        var d = R || {
            username: 'guest',
            id: 'guest',
          },
          c = (P && P.avatarUrl) || 'https://i.imgur.com/Z8rhYYS.jpeg',
          d = (P && P.nickname) || d.username;
        (e && (e.style.backgroundImage = `url('${c}')`),
          t && ((t.textContent = d), (t.title = '')));
      }

      function ie() {
        if (P) {
          const t = document.getElementById('profile-nickname-input'),
            i = document.getElementById('profile-bio-input'),
            n = document.getElementById('profile-avatar-preview'),
            a = document.getElementById('profile-banner-preview');
          var e;
          (t && document.activeElement !== t && (t.value = P.nickname || ''),
            i && document.activeElement !== i && (i.value = P.bio || ''),
            n &&
              ((e = P.avatarUrl || window.FD_CFG.defaultProfile.avatar),
              (n.style.backgroundImage = `url('${e}')`)),
            a && ((e = P.bannerUrl || c), (a.style.backgroundImage = `url('${e}')`)));
        }
      }

      function ne(e) {
        ((I = e), oe());
      }

      function ae(t) {
        ('userProfile' !== t && (Y = null),
          'hashtag' !== t && (W = null),
          'blogDetail' !== t && (window.viewingBlogId = null),
          'tweetDetail' !== t && ((V = null), (Z = !1)));
        const i = {
          timeline: document.getElementById('view-timeline'),
          editProfile: document.getElementById('view-edit-profile'),
          userProfile: document.getElementById('view-user-profile'),
          search: document.getElementById('view-search'),
          hashtag: document.getElementById('view-hashtag'),
          blogAdmin: document.getElementById('view-blog-admin'),
          blogDetail: document.getElementById('view-blog-detail'),
          blogList: document.getElementById('view-blog-list'),
          tweetDetail: document.getElementById('view-tweet-detail'),
        };
        (Object.keys(i).forEach((e) => {
          i[e] && i[e].classList.toggle('active', e === t);
        }),
          window.scrollTo(0, 0));
        const e = document.querySelector('.app-column-center');
        e && (e.scrollTop = 0);
        const n = document.getElementById('topbar-user-toggle');
        n && n.classList.remove('active');
        const a = document.querySelector('.app-shell');
        (a && a.classList.toggle('view-profile', 'userProfile' === t || 'timeline' === t),
          document.querySelectorAll('.talk-nav-pill').forEach((e) => e.classList.remove('active')),
          'timeline' === t && document.getElementById('nav-home')?.classList.add('active'),
          'userProfile' === t &&
            document.getElementById('talk-nav-profile')?.classList.add('active'));
        const o = document.querySelector('.app-topbar');
        if (o) {
          let n = o.querySelector('.app-topbar-glass-bg');
          (n ||
            ((n = document.createElement('div')),
            (n.className = 'app-topbar-glass-bg'),
            o.insertBefore(n, o.firstChild)),
            ('userProfile' !== t && 'timeline' !== t) ||
              setTimeout(() => {
                var e = document.querySelector('.user-profile-banner');
                const t = e ? e.style.backgroundImage : '';
                let i = t ? t.replace(/url\(['"]?(.*?)['"]?\)/, '$1') : '';
                (!i && P && P.bannerUrl && (i = P.bannerUrl),
                  i && (n.style.backgroundImage = `url('${i}')`));
              }, 50));
        }
        oe(!0);
      }

      function u() {
        const e = document.getElementById('pinned-blog-banner');
        if (e) {
          const t = C.find((e) => e.is_pinned);
          t
            ? ((e.innerHTML = `IMPORTANT! : ${he(t.title)}`),
              (e.onclick = () => window.switchToBlog(t.id)),
              e.classList.add('active'))
            : e.classList.remove('active');
        }
      }

      function oe(e = !1) {
        u();
        const t = {
          timeline: document.getElementById('view-timeline'),
          editProfile: document.getElementById('view-edit-profile'),
          userProfile: document.getElementById('view-user-profile'),
          search: document.getElementById('view-search'),
          hashtag: document.getElementById('view-hashtag'),
          blogAdmin: document.getElementById('view-blog-admin'),
          blogDetail: document.getElementById('view-blog-detail'),
          blogList: document.getElementById('view-blog-list'),
          tweetDetail: document.getElementById('view-tweet-detail'),
          trendingList: document.getElementById('view-trending-list'),
        };
        var i =
          t.timeline && t.timeline.classList.contains('active')
            ? 'timeline'
            : t.editProfile && t.editProfile.classList.contains('active')
              ? 'editProfile'
              : t.userProfile && t.userProfile.classList.contains('active')
                ? 'userProfile'
                : t.search && t.search.classList.contains('active')
                  ? 'search'
                  : t.hashtag && t.hashtag.classList.contains('active')
                    ? 'hashtag'
                    : t.blogAdmin && t.blogAdmin.classList.contains('active')
                      ? 'blogAdmin'
                      : t.blogDetail && t.blogDetail.classList.contains('active')
                        ? 'blogDetail'
                        : t.blogList && t.blogList.classList.contains('active')
                          ? 'blogList'
                          : t.trendingList && t.trendingList.classList.contains('active')
                            ? 'trendingList'
                            : t.tweetDetail && t.tweetDetail.classList.contains('active')
                              ? 'tweetDetail'
                              : 'timeline';
        const n = document.querySelector('.app-column-right');
        if (n) {
          var a = window.innerWidth <= 900;
          const s = ['search', 'userProfile', 'editProfile', 'trendingList'];
          n.style.display = s.includes(i) || a ? 'none' : 'flex';
          const l = n.querySelector('.sidebar-section-header:first-of-type'),
            d = n.querySelector('.sidebar-section-header:last-of-type');
          (l && (l.textContent = X('twitterBlog')), d && (d.textContent = X('trendingHashtags')));
        }
        const o = document.getElementById('nav-search-mobile');
        o && (o.style.background = 'search' == i ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)');
        const r = document.getElementById('nav-blog-mobile');
        (r &&
          (r.style.background =
            'blogList' == i || 'blogDetail' == i || 'blogAdmin' == i
              ? 'rgba(255,255,255,0.3)'
              : 'rgba(0,0,0,0.1)'),
          u(),
          'userProfile' == i && Y
            ? (function (t, e = !1) {
                const i = M[t],
                  n = (i, document.getElementById('user-profile-content')),
                  a = document.getElementById('user-profile-timeline');
                var o, r, s, l;
                n &&
                  a &&
                  ((o = (i && i.nickname) || t),
                  (r = (i && i.avatarUrl) || 'https://i.imgur.com/ct2ERKN.jpeg'),
                  (s = (i && i.bannerUrl) || c),
                  (l = (i && i.bio && i.bio.trim()) || ''),
                  (n.innerHTML = `
    <div class="user-profile-header">
      <div class="user-profile-banner" style="background-image:url('${he(s)}')">

      </div>
      <div class="user-profile-info" style="justify-content: space-between; align-items: flex-end;">
        <div style="display: flex; gap: 15px; align-items: flex-end;">
          <div class="user-profile-avatar" style="background-image:url('${he(r)}')"></div>
          <div class="user-profile-text">
            <h2 class="user-profile-name" style="display:inline-flex; align-items:center;">${he(o)}</h2>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
        </div>
      </div>
      <div style="background: #fff; padding: 0 15px 15px 15px;">
        ${l ? `<div class="user-profile-bio" style="padding: 0 0 5px 0;">${ye(he(l))}</div>` : ''}
      </div>
    </div>
  `),
                  ge(
                    I.filter((e) => e.username === t),
                    a,
                    null,
                    e,
                  ));
              })(Y, e)
            : 'search' == i
              ? fe(e)
              : 'hashtag' == i && W
                ? (function (e, t = !1) {
                    const i = document.getElementById('hashtag-list'),
                      n = document.getElementById('hashtag-name'),
                      a = document.getElementById('hashtag-count');
                    if (i && n && a) {
                      const r = `#${e.toLowerCase()}`;
                      var o = I.filter((e) => {
                        if (!e.text) return !1;
                        const t = e.text.match(/#([a-zA-Z0-9_]+)/g);
                        return !!t && t.some((e) => e.toLowerCase() === r);
                      });
                      ((n.textContent = `#${e}`),
                        (a.textContent = `${o.length} post${1 === o.length ? '' : 's'}`),
                        0 === o.length
                          ? (i.innerHTML = `<div class="search-no-results">No posts found with #${he(e)}</div>`)
                          : ge(o, i, null, t));
                    }
                  })(W, e)
                : 'timeline' == i
                  ? de(I, e)
                  : 'blogDetail' == i && window.viewingBlogId
                    ? (function (t) {
                        const e = document.getElementById('blog-detail-content');
                        q = [];
                        var i = C.find((e) => e.id === t);
                        if (i && e) {
                          var { nickname: n, avatar: a } = re(i.username),
                            o = dayjs(i.created_at).format('MMMM D, YYYY [at] h:mm A');
                          const r = T.filter((e) => e.blog_id === t).sort(
                              (e, t) => new Date(e.created_at) - new Date(t.created_at),
                            ),
                            s = B;
                          e.innerHTML = `
    <div class="blog-post-header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h1 class="blog-post-title">${he(i.title)}</h1>
        <div style="display: flex; gap: 5px;">
          ${
            s
              ? `
            <button class="admin-btn" style="background: ${i.is_pinned ? '#ffcc00' : '#eee'};" onclick="window.togglePinBlogPost('${i.id}')">
              ${i.is_pinned ? X('unpinPost') : X('pinPost')}
            </button>
            <button class="admin-btn" onclick="window.editBlogPost('${i.id}')">${X('editPost')}</button>
            <button class="admin-btn admin-btn-danger" onclick="window.deleteBlogPost('${i.id}')">${X('deletePost')}</button>
          `
              : ''
          }
        </div>
      </div>
      <div class="blog-post-author-line">
        <div class="tweet-avatar" style="width:24px; height:24px; background-image:url('${a}')"></div>
        <strong>${he(n)}</strong>
        <span>${X('on')} ${o}</span>
      </div>
    </div>
    <div class="blog-post-body">${i.content}</div>

    <div class="blog-comments-section" style="margin-top:40px; border-top: 1px solid var(--border); padding-top: 20px;">
      <h3 style="font-size: 16px; color: var(--border2); margin-bottom: 15px;">${X('comments')} (${r.length})</h3>

      <div class="update-box" style="margin-bottom: 20px; background: #f9f9f9; border: 1px solid var(--border);">
        <div class="update-header">
          <span>${X('leaveComment')}</span>
        </div>
        <div class="update-textarea-wrapper">
          <textarea id="blog-comment-textarea" class="update-textarea" placeholder="..." style="min-height: 60px;"></textarea>
        </div>
        <div class="update-footer">
          <button class="update-button" id="blog-comment-submit">${X('postComment')}</button>
        </div>
      </div>

      <ul class="timeline-list" id="blog-comments-list" style="border: 1px solid var(--border);">
        ${0 === r.length ? `<li style="padding: 20px; text-align: center; color: #8899a6; font-style: italic; background: #fff;">${X('noCommentsYet')}</li>` : ''}
      </ul>
    </div>

    <div style="margin-top:40px; margin-bottom: 20px;">
      <button class="admin-btn" onclick="window.switchToHome()">← ${X('back')}</button>
    </div>
  `;
                          const l = document.getElementById('blog-comments-list');
                          if (0 < r.length) {
                            const u = [...T].sort(
                              (e, t) => new Date(e.created_at) - new Date(t.created_at),
                            );
                            l.innerHTML = r
                              .map((t) => {
                                var e = t.username,
                                  { nickname: i, avatar: n } = re(e),
                                  a = dayjs(t.created_at).fromNow(),
                                  o = e === R.username || s,
                                  r = u.findIndex((e) => e.id === t.id) + 1;
                                return `
        <li class="tweet">
          <div class="tweet-avatar clickable-user" onclick="switchToProfile('${he(e)}')" style="background-image:url('${n}')"></div>
          <div class="tweet-body">
            <div class="tweet-header">
              <span class="tweet-username clickable-user" onclick="switchToProfile('${he(e)}')">${he(i)}</span>
              <span class="tweet-time" data-ts="${he(createdAt || '')}">${he(a)}</span>
            </div>
            <div class="tweet-text">${ye(he(t.text))}</div>
            <div class="tweet-footer">
              ${o ? `<button type="button" class="tweet-delete-btn" onclick="window.deleteBlogComment('${t.id}')">${X('delete')}</button>` : ''}
            </div>
          </div>
          <span class="tweet-id-badge">${r}</span>
        </li>
      `;
                              })
                              .join('');
                          }
                          const d = document.getElementById('blog-comment-submit'),
                            c = document.getElementById('blog-comment-textarea');
                          ((window.editBlogPost = (t) => {
                            if (B) {
                              var e = C.find((e) => e.id === t);
                              if (e) {
                                ((O = t),
                                  (document.getElementById('blog-title-input').value = e.title),
                                  (document.getElementById('blog-content-input').value =
                                    e.content));
                                const i = document.querySelector('#view-blog-admin h2'),
                                  n = document.getElementById('blog-submit-btn');
                                (i && (i.textContent = 'Edit Blog Post'),
                                  n && (n.textContent = 'Update Blog Post'),
                                  ae('blogAdmin'));
                              }
                            }
                          }),
                            (window.deleteBlogPost = async (t) => {
                              if (B && (await ue(X('confirmDeleteBlog'))))
                                try {
                                  for (const e of T.filter((e) => e.blog_id === t))
                                    await E.delete(e.id);
                                  (await k.delete(t), ae('blogList'));
                                } catch (e) {
                                  alert('Failed to delete blog post.');
                                }
                            }),
                            (window.togglePinBlogPost = async (t) => {
                              if (B) {
                                var e = C.find((e) => e.id === t);
                                if (e)
                                  try {
                                    if (!e.is_pinned)
                                      for (const i of C.filter((e) => e.is_pinned && e.id !== t))
                                        await k.update(i.id, {
                                          is_pinned: !1,
                                        });
                                    await k.update(t, {
                                      is_pinned: !e.is_pinned,
                                    });
                                  } catch (e) {
                                    (console.error('Failed to toggle pin:', e),
                                      alert('Failed to update pin status.'));
                                  }
                              }
                            }),
                            (window.deleteBlogComment = async (t) => {
                              var e = T.find((e) => e.id === t),
                                i = B,
                                e = e && e.username === R.username;
                              if ((i || e) && (await ue(X('confirmDeleteComment'))))
                                try {
                                  await E.delete(t);
                                } catch (e) {
                                  alert('Failed to delete comment.');
                                }
                            }),
                            (d.onclick = async () => {
                              var e = c.value.trim();
                              if (e) {
                                ((d.disabled = !0), (d.textContent = 'Posting...'));
                                try {
                                  (await E.create({
                                    blog_id: t,
                                    text: e,
                                  }),
                                    (c.value = ''));
                                } catch (e) {
                                  alert('Failed to post comment.');
                                } finally {
                                  ((d.disabled = !1), (d.textContent = 'Post Comment'));
                                }
                              }
                            }));
                        }
                      })(window.viewingBlogId)
                    : 'blogList' == i
                      ? (function () {
                          const t = document.getElementById('mobile-blog-container');
                          if (t) {
                            let e = '';
                            (B &&
                              (e += `
      <div style="margin-bottom: 15px; border-bottom: 1px solid var(--border); padding-bottom: 15px;">
        <button class="update-button" style="width: 100%; height: 36px; font-size: 13px;" onclick="switchView('blogAdmin')">
          + Write New Blog Post
        </button>
      </div>
    `),
                              (e += se()),
                              (t.innerHTML = e));
                          }
                        })()
                      : 'trendingList' == i
                        ? (function () {
                            const e = document.getElementById('trending-list-expanded'),
                              t = document.querySelector('#view-trending-list .timeline-header');
                            if (e) {
                              t && (t.textContent = X('trendingHashtags'));
                              const n = {};
                              I.forEach((t) => {
                                if (t.text) {
                                  const e = t.text.match(/#([a-zA-Z0-9_]+)/g);
                                  if (e) {
                                    const i = new Set(
                                      e.map((e) => e.toLowerCase().replace('#', '')),
                                    );
                                    i.forEach((e) => {
                                      n[e]
                                        ? (n[e].count++,
                                          dayjs(t.created_at).isAfter(
                                            dayjs(n[e].lastTweet.created_at),
                                          ) && (n[e].lastTweet = t))
                                        : (n[e] = {
                                            count: 1,
                                            lastTweet: t,
                                          });
                                    });
                                  }
                                }
                              });
                              const i = Object.entries(n).sort((e, t) => t[1].count - e[1].count);
                              0 !== i.length
                                ? (e.innerHTML = i
                                    .map(([e, t]) => {
                                      var i = t.lastTweet,
                                        { nickname: n, avatar: a } = re(i.username),
                                        o = dayjs(i.created_at).fromNow();
                                      return `
      <li class="tweet" style="padding: 12px; flex-direction: column; gap: 10px; border-bottom: 2px solid var(--border2);">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div class="trending-name" style="font-size: 18px; color: var(--border2); font-weight: bold; cursor: pointer;" onclick="window.switchToHashtag('${he(e)}')">#${he(e)}</div>
          <div class="trending-count" style="font-size: 12px; color: #8899a6; font-weight: bold; background: #fff; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--border);">${t.count} ${X('totalPosts')}</div>
        </div>
        <div style="background: ${G ? '#161b22' : 'var(--s1)'}; border: 1px solid ${G ? '#30363d' : 'var(--border2)'}; border-radius: 4px; padding: 10px; display: flex; align-items: center; gap: 12px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 10px; color: #8899a6; font-weight: 900; min-width: 70px; text-transform: uppercase;">${X('lastUsedBy')}</div>
          <div class="tweet-avatar clickable-user" onclick="switchToProfile('${he(i.username)}')" style="width: 36px; height: 36px; margin: 0; background-image:url('${a}'); border: 1px solid var(--border2); box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
          <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap;">
              <span class="tweet-username clickable-user" style="font-size: 13px; text-overflow: ellipsis; overflow: hidden;" onclick="switchToProfile('${he(i.username)}')">${he(n)}</span>
            </div>
            <div style="font-size: 10px; color: #8899a6; margin-top: 2px;">${he(o)}</div>
          </div>
        </div>
      </li>
    `;
                                    })
                                    .join(''))
                                : (e.innerHTML = `<li style="padding:40px; text-align:center; color:#8899a6; font-style:italic; background:#fff;">${X('noHashtagsYet')}</li>`);
                            }
                          })()
                        : 'tweetDetail' == i &&
                          V &&
                          (function (t, e = !1) {
                            const i = document.getElementById('tweet-detail-original'),
                              n = document.getElementById('tweet-detail-replies');
                            q = [];
                            const a = document.getElementById('detail-reply-box'),
                              o = document.getElementById('detail-reply-label'),
                              r = document.getElementById('detail-reply-textarea');
                            if (i && n) {
                              var s = I.find((e) => e.id === t);
                              if (s) {
                                const d = (function e(t, i) {
                                  const n = i.find((e) => e.id === t);
                                  if (n && n.parent_id) {
                                    const a = i.some((e) => e.id === n.parent_id);
                                    if (a) return e(n.parent_id, i);
                                  }
                                  return t;
                                })(t, I);
                                var l = I.find((e) => e.id === d);
                                const c = [...I].sort(
                                  (e, t) => new Date(e.created_at) - new Date(t.created_at),
                                );
                                ((i.innerHTML = l
                                  ? me(l, c)
                                  : '<div style="padding:20px; text-align:center; color:#666;">This tweet or its conversation root has been deleted.</div>'),
                                  pe(i));
                                const u = I.filter((e) => e.parent_id === d).sort(
                                  (e, t) => new Date(e.created_at) - new Date(t.created_at),
                                );
                                ((n.innerHTML = u
                                  .map((e) =>
                                    (function t(i, n, a, o = 0) {
                                      const e = n.find((e) => e.id === i);
                                      if (!e) return '';
                                      const r = me(e, a);
                                      const s = n
                                        .filter((e) => e.parent_id === i)
                                        .sort(
                                          (e, t) => new Date(e.created_at) - new Date(t.created_at),
                                        );
                                      let l = '';
                                      0 < s.length &&
                                        (l = `<div class="reply-nest">
      ${s.map((e) => t(e.id, n, a, o + 1)).join('')}
    </div>`);
                                      return `<div class="thread-node">${r}${l}</div>`;
                                    })(e.id, I, c),
                                  )
                                  .join('')),
                                  pe(n));
                                const m =
                                  d === t
                                    ? i.querySelector('.tweet')
                                    : n.querySelector(`[data-id="${t}"]`);
                                (m &&
                                  (e || t !== ve) &&
                                  ((m.style.backgroundColor = G ? '#1d2a35' : '#fff9d6'),
                                  e &&
                                    setTimeout(() => {
                                      m.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'center',
                                      });
                                    }, 50)),
                                  (ve = t),
                                  a &&
                                    (F || !Z
                                      ? (a.style.display = 'none')
                                      : ((a.style.display = 'block'),
                                        (s = s.username),
                                        (o.textContent = `${X('replyingTo')} @${s}`),
                                        r.dataset.lastParent !== t &&
                                          ((r.value = ''),
                                          (r.dataset.lastParent = t),
                                          r.dispatchEvent(new Event('input'))))));
                              } else
                                ((i.innerHTML =
                                  '<div style="padding:20px; text-align:center; color:#666;">This tweet has been deleted.</div>'),
                                  a && (a.style.display = 'none'),
                                  (n.innerHTML = ''));
                            }
                          })(V, e));
      }

      function re(t) {
        var e =
          M[t] ||
          Object.values(M).find((e) => e.username && e.username.toLowerCase() === t.toLowerCase());
        return {
          nickname: (e && e.nickname) || t,
          avatar: e && e.avatarUrl ? e.avatarUrl : 'https://i.imgur.com/ct2ERKN.jpeg',
        };
      }

      function se() {
        if (0 === C.length)
          return '<div style="font-size:11px; color:#888; text-align:center; padding:10px;">No blog posts yet.</div>';
        const e = [...C].sort((e, t) => new Date(t.created_at) - new Date(e.created_at));
        return e
          .map((e) => {
            var { nickname: t, avatar: i } = re(e.username),
              n = dayjs(e.created_at).format('MMM D'),
              a = (e.content || '').replace(/<[^>]*>/g, '').substring(0, 30);
            return `
      <div class="blog-sidebar-item">
        <a class="blog-sidebar-title" onclick="window.switchToBlog('${e.id}')">${he(e.title)}</a>
        <div class="blog-sidebar-preview">${he(a)}${30 < e.content.length ? '...' : ''}</div>
        <div class="blog-sidebar-meta">
          <div class="blog-meta-avatar" style="background-image:url('${i}')"></div>
          <span>${X('by')} ${he(t)} ${X('on')} ${n}</span>
        </div>
      </div>
    `;
          })
          .join('');
      }

      function le() {
        const e = document.getElementById('blog-sidebar-list');
        e && (e.innerHTML = se());
        const t = document.getElementById('trending-sidebar-list');
        t &&
          (t.innerHTML = (function () {
            const e = dayjs(),
              t = e.subtract(36, 'hours'),
              i = I.filter((e) => e.created_at && dayjs(e.created_at).isAfter(t)),
              n = {};
            i.forEach((e) => {
              if (e.text) {
                const t = e.text.match(/#([a-zA-Z0-9_]+)/g);
                if (t) {
                  const i = new Set(t.map((e) => e.toLowerCase().replace('#', '')));
                  i.forEach((e) => {
                    n[e] = (n[e] || 0) + 1;
                  });
                }
              }
            });
            const a = Object.entries(n)
              .sort((e, t) => t[1] - e[1])
              .slice(0, 8);
            return 0 !== a.length
              ? a
                  .map(
                    ([e, t]) =>
                      `
    <div class="trending-item" onclick="window.switchToHashtag('${he(e)}')">
      <div class="trending-name">#${he(e)}</div>
      <div class="trending-count">${t} post${1 === t ? '' : 's'}</div>
    </div>
  `,
                  )
                  .join('')
              : '<div style="font-size:11px; color:#888; text-align:center; padding:10px;">Nothing trending yet.</div>';
          })());
      }

      function de(t, i = !1) {
        const n = document.getElementById('timeline-list');
        if (n) {
          const a = document.querySelectorAll('.timeline-tab');
          a.forEach((e) => {
            e.classList.toggle('active', e.dataset.mode === K);
          });
          let e = t.filter((e) => !e.retweet_of);
          if ('hot' === K) {
            const o = dayjs().subtract(12, 'hours');
            e = e.filter((e) => dayjs(e.created_at).isAfter(o));
            const r = {};
            (_.forEach((e) => {
              r[e.tweet_id] = (r[e.tweet_id] || 0) + 1;
            }),
              e.sort((e, t) => {
                var i = r[e.id] || 0,
                  n = r[t.id] || 0;
                return n !== i ? n - i : new Date(t.created_at) - new Date(e.created_at);
              }));
          } else e.sort((e, t) => new Date(t.created_at) - new Date(e.created_at));
          if (0 === e.length) {
            let e = X('nothingToSee');
            ('hot' === K && (e = X('noHotPosts')),
              (n.innerHTML = `<li style="padding:40px; text-align:center; color:#8899a6; font-style:italic; background:#fff;">${e}</li>`));
          } else ge(e, n, null, i);
        }
      }

      function ce(e, t) {
        if (!t) return e;
        ((t = he(t).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')),
          (t = new RegExp(`(${t})(?![^<]*>)`, 'gi')));
        return e.replace(t, '<mark class="search-highlight">$1</mark>');
      }

      function ue(l) {
        return new Promise((t) => {
          const i = document.getElementById('confirm-modal'),
            e = document.getElementById('confirm-modal-message'),
            n = document.getElementById('confirm-modal-yes'),
            a = document.getElementById('confirm-modal-no');
          ((e.textContent = l), i.classList.add('active'));
          const o = (e) => {
              (i.classList.remove('active'),
                n.removeEventListener('click', r),
                a.removeEventListener('click', s),
                t(e));
            },
            r = () => o(!0),
            s = () => o(!1);
          (n.addEventListener('click', r), a.addEventListener('click', s));
        });
      }

      function me(t, e, i = null) {
        if (!t) return '';
        const n = R.username;
        var a =
          t.created_at && dayjs().diff(dayjs(t.created_at), 'second') < 8 ? 'new-tweet-anim' : '';
        let o = t;
        var r = !!t.retweet_of,
          s = null;
        let l = '';
        r &&
          ((s = t.username),
          (p = I.find((e) => e.id === t.retweet_of)),
          (o = p || { ...t, text: `[${X('nothingToSee')}]` }),
          (g = M[s]),
          (l = (g && g.nickname) || s));
        var d = o.username || 'unknown',
          c = M[d],
          u = (c && c.nickname) || d,
          m = (c && c.avatarUrl) || 'https://i.imgur.com/ct2ERKN.jpeg',
          p = t.created_at,
          g = p ? dayjs(p).fromNow() : '';
        let f = ye(he(o.text || ''));
        i && (f = ce(f, i));
        ((s = o.mediaUrl || o.imageUrl || null),
          (c = o.mediaType || (o.imageUrl ? 'image' : null)));
        let v = '';
        !o.quote_id ||
          ((y = I.find((e) => e.id === o.quote_id)) &&
            ((i = re(y.username)),
            (b = y.mediaUrl || y.imageUrl),
            (w = y.mediaType || (y.imageUrl ? 'image' : null)),
            (v = `
        <div class="quote-box" onclick="window.switchToTweetDetail('${y.id}'); event.stopPropagation();">
          <div class="quote-header-mini">
            <div class="quote-avatar-mini" style="background-image:url('${i.avatar}')"></div>
            <span class="quote-username-mini">${he(i.nickname)}</span>
          </div>
          <div class="quote-text-mini">${he(y.text || '').substring(0, 140)}${y.text && 140 < y.text.length ? '...' : ''}</div>
          ${
            b
              ? `
            <div class="quote-media-preview" style="margin-top:5px; border-radius:4px; overflow:hidden; border:1px solid #eee; background:#000; display:flex; align-items:center; justify-content:center;">
              ${
                'image' === w
                  ? `
                <img src="${b}" style="width:100%; height:auto; display:block;" />
              `
                  : `
                <div style="color:#fff; font-size:10px; font-weight:bold; padding: 10px;">[${w}]</div>
              `
              }
            </div>
          `
              : ''
          }
        </div>
      `)));
        let h = '';
        o.parent_id &&
          (($ = (x = I.find((e) => e.id === o.parent_id)) ? x.username : 'someone'),
          (h = `
      <div class="retweet-indicator" style="margin-bottom: 2px;">
        ${X('replyingTo')} <a href="#" onclick="switchToTweetDetail('${o.parent_id}'); return false;">${he($)}</a>
      </div>
    `));
        var y = _.filter((e) => e.tweet_id === o.id).length,
          b = I.filter((e) => e.retweet_of === o.id).length,
          w = I.filter((e) => e.parent_id === o.id).length,
          x = _.some((e) => e.tweet_id === o.id && e.username === n),
          $ = t.username === n,
          e = e.findIndex((e) => e.id === t.id) + 1;
        return `
    <li class="tweet ${a}" data-id="${t.id}" data-original-id="${o.id}" style="cursor: pointer;">
      <div class="tweet-avatar clickable-user" onclick="switchToProfile('${he(d)}')" style="background-image:url('${he(m)}')"></div>
      <div class="tweet-body">
        <div class="tweet-header">
          <span class="tweet-username clickable-user" onclick="switchToProfile('${he(d)}')" style="display:inline-flex; align-items:center;">${he(u)}</span>
          ${r ? `<span class="retweet-indicator">- Retweeted by ${he(l)}</span>` : ''}
          <span class="tweet-time" data-ts="${he(p || '')}">${he(g)}</span>
        </div>
        ${h}
        <div class="tweet-text">${f}</div>
        ${v}
        ${
          s
            ? `
          <div class="tweet-image-wrapper">
            ${
              'image' === c
                ? `
              <img src="${he(s)}" class="tweet-image" alt="Tweet media" onclick="window.openLightbox('${he(s)}')" />
            `
                : `
              <div class="custom-player ${c}-player">
                ${
                  'video' === c
                    ? `
                  <div class="video-overlay"><div class="big-initial-play"></div></div>
                  <video src="${he(s)}" class="tweet-video" playsinline preload="metadata"></video>
                  <div class="player-controls">
                    <button type="button" class="play-btn">play</button>
                    <div class="scrubber-container">
                      <div class="scrubber-fill"></div>
                      <div class="scrubber-thumb"></div>
                    </div>
                    <span class="player-time">0:00</span>
                    <div class="volume-container">
                      <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="1">
                    </div>
                  </div>
                `
                    : `
                  <div class="player-label">[audio file]</div>
                  <audio src="${he(s)}" class="tweet-audio"></audio>
                  <div class="player-controls">
                    <button type="button" class="play-btn">play</button>
                    <div class="scrubber-container">
                      <div class="scrubber-fill"></div>
                      <div class="scrubber-thumb"></div>
                    </div>
                    <span class="player-time">0:00</span>
                    <div class="volume-container">
                      <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="1">
                    </div>
                  </div>
                `
                }
              </div>
            `
            }
          </div>
        `
            : ''
        }
        <div class="tweet-footer">
          <button type="button" class="tweet-reply-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:middle;margin-right:3px;"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>${w}</button>
          <button type="button" class="tweet-like-btn ${x ? 'active' : ''}"><svg viewBox="0 0 24 24" fill="${x ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:middle;margin-right:3px;"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>${y}</button>
          <button type="button" class="tweet-retweet-btn action-retweet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:middle;margin-right:3px;"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>${b}</button>
          ${$ ? '<button type="button" class="tweet-delete-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' : ''}
        </div>
      </div>
      <span class="tweet-id-badge">${e}</span>
    </li>
  `;
      }

      function pe(e) {
        const i = R.username;
        (e.querySelectorAll('.tweet-like-btn').forEach((e) => {
          e.addEventListener('click', async (e) => {
            const t = e.target.closest('.tweet').getAttribute('data-original-id');
            e = _.find((e) => e.tweet_id === t && e.username === i);
            e
              ? await $.delete(e.id)
              : await $.create({
                  tweet_id: t,
                });
          });
        }),
          e.querySelectorAll('.tweet-retweet-btn').forEach((e) => {
            e.addEventListener('click', async (e) => {
              const t = e.target.closest('.tweet').getAttribute('data-original-id');
              e = await window.showRetweetChoice(t);
              if ('cancel' !== e)
                if ('normal' === e)
                  if (I.some((e) => e.retweet_of === t && e.username === i))
                    alert('You already retweeted this!');
                  else
                    try {
                      await x.create({
                        retweet_of: t,
                        text: '',
                      });
                    } catch (e) {
                      console.error(e);
                    }
                else 'quote' === e && (ae('timeline'), window.setQuoting(t));
            });
          }),
          e.querySelectorAll('.tweet-reply-btn').forEach((e) => {
            e.addEventListener('click', (e) => {
              e.stopPropagation();
              e = e.target.closest('.tweet').getAttribute('data-original-id');
              window.switchToTweetDetail(e, !0);
            });
          }),
          e.querySelectorAll('.tweet-delete-btn').forEach((e) => {
            e.addEventListener('click', async (e) => {
              e.stopPropagation();
              const t = e.target.closest('.tweet');
              e = t.getAttribute('data-id');
              if (await ue(X('confirmDeleteTweet')))
                try {
                  (await x.delete(e), V === e && window.switchToHome());
                } catch (e) {
                  (console.error('Delete failed:', e),
                    alert('Failed to delete tweet. Note: You can only delete your own posts.'));
                }
            });
          }),
          e.querySelectorAll('.custom-player').forEach((t) => {
            const i = t.querySelector('video, audio'),
              n = t.querySelector('.play-btn'),
              a = t.querySelector('.scrubber-container'),
              o = t.querySelector('.scrubber-fill'),
              r = t.querySelector('.player-time'),
              s = t.querySelector('.volume-slider'),
              l = async () => {
                try {
                  var e;
                  i.paused
                    ? (void 0 !== (e = i.play()) && (await e),
                      n.classList.add('playing'),
                      t.classList.add('is-playing'))
                    : (i.pause(), n.classList.remove('playing'));
                } catch (e) {
                  'AbortError' !== e.name && console.warn('Playback interaction handled:', e);
                }
              };
            n.onclick = (e) => {
              (e.stopPropagation(), l());
            };
            const e = t.querySelector('.video-overlay');
            e &&
              (e.onclick = (e) => {
                (e.stopPropagation(), l());
              });
            const d = t.querySelector('.scrubber-thumb');
            let c = !1,
              u = !1;
            const m = (e) => {
              var t = a.getBoundingClientRect(),
                e = (e.touches ? e.touches[0] : e).clientX - t.left,
                t = (e = Math.max(0, Math.min(e, t.width))) / t.width;
              i.duration && (i.currentTime = t * i.duration);
            };
            i.ontimeupdate = () => {
              var e;
              (i.duration &&
                ((e = (i.currentTime / i.duration) * 100),
                (o.style.width = `${e}%`),
                d && (d.style.left = `${e}%`)),
                (r.textContent = ((e) => {
                  if (isNaN(e)) return '0:00';
                  var t = Math.floor(e / 60);
                  const i = Math.floor(e % 60);
                  return `${t}:${i.toString().padStart(2, '0')}`;
                })(i.currentTime)));
            };
            var p = (e) => {
              (e.stopPropagation(),
                (c = !0),
                (u = !i.paused),
                u && (i.pause(), n.classList.remove('playing')),
                m(e),
                window.addEventListener('mousemove', g),
                window.addEventListener('mouseup', f),
                window.addEventListener('touchmove', g),
                window.addEventListener('touchend', f));
            };
            const g = (e) => {
                c && m(e);
              },
              f = async (e) => {
                if (c) {
                  if (((c = !1), u))
                    try {
                      var t = i.play();
                      (void 0 !== t && (await t), n.classList.add('playing'));
                    } catch (e) {
                      'AbortError' !== e.name && console.warn('Scrub play handled:', e);
                    }
                  (window.removeEventListener('mousemove', g),
                    window.removeEventListener('mouseup', f),
                    window.removeEventListener('touchmove', g),
                    window.removeEventListener('touchend', f));
                }
              };
            (a.addEventListener('mousedown', p),
              a.addEventListener('touchstart', p, {
                passive: !1,
              }));
            const v = () => {
              var e = 100 * s.value;
              s.style.background = `linear-gradient(to right, var(--border2) ${e}%, var(--border2) ${e}%)`;
            };
            (v(),
              (s.oninput = (e) => {
                (e.stopPropagation(), (i.volume = e.target.value), v());
              }),
              (s.onclick = (e) => e.stopPropagation()),
              (s.onmousedown = (e) => e.stopPropagation()),
              (i.onended = () => {
                (n.classList.remove('playing'),
                  t.classList.remove('is-playing'),
                  (o.style.width = '0%'));
              }));
          }),
          e.querySelectorAll('.tweet').forEach((t) => {
            t.addEventListener('click', (e) => {
              e.target.closest('button, a, .clickable-user, .custom-player') ||
                ((e.target.classList.contains('tweet') ||
                  e.target.classList.contains('tweet-body') ||
                  e.target.closest('.tweet-text')) &&
                  ((e = t.getAttribute('data-original-id')), window.switchToTweetDetail(e, !1)));
            });
          }));
      }

      function ge(i, n, a = null, o = !1) {
        if (i && n) {
          q = i.filter((t) => !t.retweet_of || I.some((e) => e.id === t.retweet_of));
          const l = [...I].sort((e, t) => new Date(e.created_at) - new Date(t.created_at)),
            d = document.querySelector('.app-column-center');
          let e = 0;
          (!o && d && (e = Math.floor(d.scrollTop / j) - 10),
            (e = Math.max(0, Math.min(e, Math.max(0, q.length - D)))));
          var r = Math.min(e + D, q.length);
          A = e;
          var s = e * j,
            i = Math.max(0, (q.length - r) * j);
          const c = q.slice(e, r);
          let t = `<div class="list-spacer" style="height: ${s}px; pointer-events: none;"></div>`;
          ((t += c.map((e) => me(e, l, a)).join('')),
            (t += `<div class="list-spacer" style="height: ${i}px; pointer-events: none;"></div>`),
            z
              ? (t +=
                  '<li style="padding: 20px; text-align: center; color: #8899a6; font-style: italic; background: #fff; border-top: 1px solid var(--border);">Loading older tweets...</li>')
              : !N &&
                0 < q.length &&
                ('latest' === K ||
                  document.getElementById('view-user-profile').classList.contains('active')) &&
                (t += `<li style="padding: 20px; text-align: center; color: #8899a6; font-size: 11px; background: #fff; border-top: 1px solid var(--border);">You've reached the beginning of time.</li>`),
            (n.innerHTML = t),
            pe(n),
            o && d && (d.scrollTop = 0));
        }
      }

      function fe(t = !1) {
        const i = document.getElementById('search-results-list'),
          n = document.getElementById('search-title'),
          e = document.getElementById('search-tab-tweets'),
          a = document.getElementById('search-tab-users'),
          o = document.getElementById('search-mode-toggle'),
          r = document.getElementById('search-mode-normal'),
          s = document.getElementById('search-mode-exact'),
          l = document.getElementById('search-mode-all');
        if (i) {
          const { query: p, type: g, matchMode: f } = Q,
            v = 'all' === f ? null : p;
          if (
            ('users' === g && 'all' === f
              ? (n.textContent = 'All Users Directory')
              : (n.textContent = p ? `Results for "${p}"` : 'Search Twitter'),
            window.innerWidth <= 640)
          ) {
            let e = document.querySelector('.search-page-input-container');
            if (!e) {
              ((e = document.createElement('div')),
                (e.className = 'search-page-input-container'),
                (e.innerHTML = `
        <input type="text" class="search-page-input" placeholder="Search Twitter..." />
        <button class="update-button">Search</button>
      `),
                n.parentElement.after(e));
              const y = e.querySelector('input'),
                b = e.querySelector('button'),
                w = () => {
                  var e = y.value.trim();
                  e && window.switchToSearch(e, Q.type);
                };
              (y.addEventListener('keypress', (e) => {
                'Enter' === e.key && w();
              }),
                b.addEventListener('click', w));
            }
            const h = e.querySelector('input');
            h && p && h.value !== p && (h.value = p);
          }
          if (
            (e.classList.toggle('active', 'tweets' === g),
            a.classList.toggle('active', 'users' === g),
            (o.style.display = 'users' === g ? 'block' : 'none'),
            r.classList.toggle('active', 'normal' === f),
            s.classList.toggle('active', 'exact' === f),
            l.classList.toggle('active', 'all' === f),
            p || 'all' === f)
          )
            if ('tweets' === g) {
              let e = I;
              var d = p.match(/before:(\d{1,2}-\d{1,2}-\d{4})/i),
                c = p.match(/after:(\d{1,2}-\d{1,2}-\d{4})/i),
                u = p.match(/during:(\d{1,2}-\d{1,2}-\d{4})/i),
                m = (e) => {
                  const t = e.split('-');
                  return dayjs(`${t[2]}-${t[0].padStart(2, '0')}-${t[1].padStart(2, '0')}`);
                };
              if (d) {
                const $ = m(d[1]);
                $.isValid() &&
                  (e = e.filter((e) => dayjs(e.created_at).isBefore($.startOf('day'))));
              }
              if (c) {
                const k = m(c[1]);
                k.isValid() && (e = e.filter((e) => dayjs(e.created_at).isAfter(k.endOf('day'))));
              }
              if (u) {
                const E = m(u[1]);
                E.isValid() && (e = e.filter((e) => dayjs(e.created_at).isSame(E, 'day')));
              }
              const x = p
                .replace(/before:\d{1,2}-\d{1,2}-\d{4}/gi, '')
                .replace(/after:\d{1,2}-\d{1,2}-\d{4}/gi, '')
                .replace(/during:\d{1,2}-\d{1,2}-\d{4}/gi, '')
                .trim();
              (x && (e = e.filter((e) => e.text && e.text.toLowerCase().includes(x.toLowerCase()))),
                0 === e.length
                  ? (i.innerHTML = `<div class="search-no-results">No tweets found matching "${he(p)}"</div>`)
                  : ge(e, i, 'all' === f ? null : x || p, t));
            } else {
              q = [];
              t = new Set([...Object.keys(M), ...I.map((e) => e.username)]);
              const B = Array.from(t)
                .map((e) => {
                  var t = M[e];
                  return {
                    username: e,
                    nickname: (t && t.nickname) || e,
                    avatarUrl: (t && t.avatarUrl) || window.FD_CFG.defaultProfile.avatar,
                    hasSignedUp: !!t,
                  };
                })
                .filter(
                  (e) =>
                    'all' === f ||
                    ('exact' === f
                      ? e.username.toLowerCase() === p.toLowerCase()
                      : e.username.toLowerCase().includes(p.toLowerCase()) ||
                        e.nickname.toLowerCase().includes(p.toLowerCase())),
                )
                .sort((e, t) =>
                  e.hasSignedUp !== t.hasSignedUp
                    ? t.hasSignedUp - e.hasSignedUp
                    : e.username.localeCompare(t.username),
                );
              0 === B.length
                ? (i.innerHTML = `<div class="search-no-results">No users found matching "${he(p)}"</div>`)
                : ('users' === g &&
                    'all' === f &&
                    (n.textContent = `${X('allUsersDirectory')} (${B.length} total)`),
                  (i.innerHTML = B.map((e) => {
                    var t = M[e.username]?.bio || '',
                      i = ce(he(e.nickname), v);
                    let n,
                      a =
                        'color: #555; font-size: 11px; margin-top: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;';
                    return (
                      t
                        ? (n = ce(he(t), v))
                        : ((n = 'No bio - click to view profile'),
                          (a += ' color: #8899a6; font-style: italic;')),
                      `
        <li class="tweet clickable-user" onclick="switchToProfile('${he(e.username)}')" style="padding: 6px 8px;">
          <div class="tweet-avatar" style="background-image:url('${e.avatarUrl}'); width: 32px; height: 32px;"></div>
          <div class="tweet-body">
            <div class="tweet-header" style="margin-bottom: 0;">
              <span class="tweet-username" style="display:inline-flex; align-items:center;">${i}</span>

            </div>
            <div class="tweet-text" style="${a}">${n}</div>
          </div>
        </li>
      `
                    );
                  }).join('')));
            }
          else
            i.innerHTML =
              '<div class="search-no-results" style="font-size: 16px; margin-top: 40px; font-style: normal; color: var(--border2); font-weight: bold;">Search to get started!</div>';
        }
      }
      ((window.switchView = ae),
        (window.switchToBlog = (e) => {
          ((window.viewingBlogId = e), ae('blogDetail'));
        }),
        (window.switchToHome = () => {
          ae('timeline');
        }));
      let ve = null;

      function he(e) {
        return String(e).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      function ye(e) {
        let t = e.replace(/((https?:\/\/|www\.)[^\s<]+)/gi, (e) => {
          return `<a href="${e.startsWith('http') ? e : 'http://' + e}" target="_blank" rel="noopener noreferrer">${e}</a>`;
        });
        return (
          (t = t.replace(/(^|\s)@([a-zA-Z0-9_]+)/g, (e, t, i) => {
            return `${t}<a href="#" onclick="switchToProfile('${i}'); return false;">${`${i}`}</a>`;
          })),
          (t = t.replace(/(^|\s)#([a-zA-Z0-9_]+)/g, (e, t, i) => {
            return `${t}<a href="#" onclick="switchToHashtag('${i}'); return false;">${`#${i}`}</a>`;
          })),
          t
        );
      }
      !(async function () {
        (ee(),
          (function () {
            const e = document.querySelector('#confirm-modal .modal-header'),
              t = document.getElementById('confirm-modal-yes'),
              i = document.getElementById('confirm-modal-no');
            (e && (e.textContent = X('confirm')),
              t && (t.textContent = X('delete')),
              i && (i.textContent = X('cancel')));
            const n = document.querySelector('#retweet-modal .modal-header'),
              a = document.querySelector('#retweet-modal .modal-body'),
              o = document.getElementById('retweet-modal-normal'),
              r = document.getElementById('retweet-modal-quote'),
              s = document.getElementById('retweet-modal-cancel');
            (n && (n.textContent = X('retweet')),
              a && (a.textContent = X('retweetChoiceDesc')),
              o && (o.textContent = X('retweetNormally')),
              r && (r.textContent = X('quotePost')),
              s && (s.textContent = X('cancel')));
          })());
        var e = window.FD_CFG.firebaseSdkBase;
        (await window.fdLoadScript(`${e}/firebase-app-compat.js`),
          await window.fdLoadScript(`${e}/firebase-auth-compat.js`),
          await window.fdLoadScript(`${e}/firebase-firestore-compat.js`),
          await window.fdLoadScript(`${e}/firebase-storage-compat.js`));

        // Ensure Firebase app is properly initialized
        const firebaseInitialized = window.fdEnsureFirebaseApp();
        if (!firebaseInitialized) {
          throw new Error('Failed to initialize Firebase app');
        }

        // Wait for Firebase services to be fully available with retry logic
        let i = null;
        let retryCount = 0;
        const maxRetries = 20;
        while (!i && retryCount < maxRetries) {
          try {
            if (window.firebase && typeof window.firebase.firestore === 'function') {
              i = firebase.firestore();
              // Test if firestore is actually working
              if (i && typeof i.collection === 'function') {
                break; // Success!
              }
            }
            throw new Error('Firebase Firestore not ready');
          } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) {
              throw new Error(
                `Failed to initialize Firebase Firestore after ${maxRetries} attempts: ${error.message}`,
              );
            }
            // Wait a bit before retrying (increasing delay)
            await new Promise((resolve) => setTimeout(resolve, 50 * retryCount));
          }
        }
        window._fbDb_analytics = i;
        const n = firebase.storage(),
          a = firebase.auth(),
          o = i.collection('site_config').doc('main');
        window._saveSiteConfig =
          window._saveSiteConfig ||
          async function (e) {
            if (document.body.classList.contains('talk-admin'))
              try {
                await o.set(e, {
                  merge: !0,
                });
              } catch (e) {}
          };
        const r = (e) => {
          if (e) {
            if (e.crop_positions) window._cropPositions = e.crop_positions;
            if (e.crop_saturation) window._cropSaturation = e.crop_saturation;
            if (e.crop_zoom) window._cropZoom = e.crop_zoom;
            if (typeof applyAllCrops === 'function') applyAllCrops();
            if (void 0 !== e.likes_hidden)
              document.body.classList.toggle('likes-hidden', !!e.likes_hidden);
            if (e.profile) {
              const n = e.profile;
              if (n.followerCounts) {
                var t = (S.profile && S.profile.followerCounts) || {};
                const a = Object.assign({}, t);
                (Object.entries(n.followerCounts).forEach(([e, t]) => {
                  0 < t && (a[e] = t);
                }),
                  (n.followerCounts = a));
              } else
                S.profile &&
                  S.profile.followerCounts &&
                  (n.followerCounts = S.profile.followerCounts);
              S.profile = Object.assign(S.profile || {}, n);
              try {
                var _dn = document.getElementById('sl-display-name');
                if (_dn) _dn.textContent = S.profile.displayName || 'FAME DOLL';
                var _bi = document.getElementById('sl-bio');
                if (_bi) _bi.textContent = S.profile.bio || '';
                var _or = document.getElementById('sl-origin');
                if (_or && S.profile.origin) _or.innerHTML = S.profile.origin;
                if (S.profile.followerCounts) {
                  var _fc = Object.values(S.profile.followerCounts).reduce(function (a, b) {
                    return a + b;
                  }, 0);
                  var _sf = document.getElementById('stat-followers');
                  if (_fc > 0 && _sf) _sf.textContent = formatFans(_fc);
                }
                if (typeof updateLevelProgress === 'function') updateLevelProgress();
                if (typeof ensureNowPlayingAudio === 'function') ensureNowPlayingAudio();
                if (typeof syncMusicSidebar === 'function') syncMusicSidebar();
              } catch (_e) {}
            }
            if (
              (e.settings &&
                ((S.settings = Object.assign(S.settings || {}, e.settings)),
                'function' == typeof applyAccent && applyAccent(S.settings.accent),
                S.settings.customBg
                  ? ((document.documentElement.style.backgroundImage = `url('${S.settings.customBg}')`),
                    (document.body.style.backgroundImage = `url('${S.settings.customBg}')`),
                    'function' == typeof _applyCustomBgUI && _applyCustomBgUI(S.settings.customBg))
                  : 'function' == typeof _applyCustomBgUI && _applyCustomBgUI('')),
              e.insta_posts && e.insta_posts.length)
            ) {
              const l = document.getElementById('grid-gallery');
              l &&
                ((l.innerHTML = e.insta_posts
                  .map(
                    (e) =>
                      `
          <div class="insta-cell${e.carousel ? ' is-carousel' : ''}" title="${e.title}">
            <div class="carousel-badge" title="Carousel post">
          <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="12" height="12" rx="1.5" fill="rgba(0,0,0,0.55)" stroke="white" stroke-width="1.4"/>
            <rect x="3" y="3" width="12" height="12" rx="1.5" fill="rgba(0,0,0,0.55)" stroke="white" stroke-width="1.4"/>
            <rect x="1" y="1" width="12" height="12" rx="1.5" fill="rgba(0,0,0,0.65)" stroke="white" stroke-width="1.4"/>
          </svg>
        </div>
        <button class="carousel-toggle-btn" onclick="event.preventDefault();event.stopPropagation();toggleCarousel(this)" title="Toggle carousel">
          <svg viewBox="0 0 24 24"><rect x="2" y="7" width="12" height="12" rx="2"/><rect x="6" y="3" width="12" height="12" rx="2" opacity="0.6"/></svg>
        </button>
      <button class="insta-cell-delete" onclick="event.preventDefault();event.stopPropagation();deleteInstaCell(this,'${e.alt}')" title="Remove">✕</button>
            <a href="${e.href}" target="_blank" style="display:block;width:100%;height:100%;position:absolute;inset:0;z-index:2;">
              <img src="${e.src}" alt="${e.alt}" style="width:100%;height:100%;object-fit:cover;" onerror="this.closest('.insta-cell').style.opacity='0.2';this.closest('.insta-cell').style.pointerEvents='none';">
            </a>
            <div class="cell-ov"><div class="cell-stat"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>View</div></div>
          </div>`,
                  )
                  .join('')),
                'function' == typeof applyAllCrops && applyAllCrops(),
                'function' == typeof wireInstaClickCrop && wireInstaClickCrop());
            }
            if (e.pinned)
              try {
                const d = document.querySelector('#feat-embed iframe');
                d && e.pinned.embedUrl && (d.src = e.pinned.embedUrl);
                const c = document.getElementById('feat-desc-text');
                c && (c.textContent = e.pinned.desc || '—');
              } catch (e) {}
            if (void 0 !== e.live_description) _renderLiveDesc(e.live_description);
            if (Array.isArray(e.insta_trash)) {
              window._instaTrash = e.insta_trash;
              if ('function' == typeof renderDeletedGrid) renderDeletedGrid();
            }
            if (e.eras && 'object' == typeof e.eras) {
              ERAS = e.eras;
              try {
                localStorage.setItem('fd_eras', JSON.stringify(ERAS));
              } catch (e) {}
              'function' == typeof renderEras && renderEras();
            }
            if (e.era_photos && 'object' == typeof e.era_photos) {
              _eraPhotos = e.era_photos;
              try {
                localStorage.setItem('fd_era_photos', JSON.stringify(_eraPhotos));
              } catch (e) {}
              'function' == typeof renderEras && renderEras();
            }
            if (e.drops && Array.isArray(e.drops)) {
              DROPS = e.drops;
              try {
                localStorage.setItem('fd_drops', JSON.stringify(DROPS));
              } catch (e) {}
              'function' == typeof renderDrops && renderDrops();
            }
            if (e.stream_links && 'object' == typeof e.stream_links) {
              STREAM_LINKS = e.stream_links;
              try {
                localStorage.setItem('fd_streams', JSON.stringify(STREAM_LINKS));
              } catch (e) {}
              'function' == typeof renderStreams && renderStreams();
            }
          }
        };
        o.onSnapshot((e) => {
          e.exists && r(e.data());
        });
        try {
          const u = await o.get();
          u.exists && r(u.data());
        } catch (e) {}
        a.onAuthStateChanged(async (e) => {
          if (e && 'kbEeYQPq8TRtzHC2SfTizvbButa2' === e.uid) {
            (document.body.classList.add('talk-admin'), L());
            try {
              const n = {
                profile: S.profile,
                settings: S.settings,
                crop_positions: window._cropPositions,
                crop_saturation: window._cropSaturation,
                crop_zoom: window._cropZoom,
                likes_hidden: 'true' === localStorage.getItem('fd_likes_hidden'),
              };
              var t = JSON.parse(localStorage.getItem('famed0ll_pinned') || 'null');
              (t && (n.pinned = t),
                await o.set(n, {
                  merge: !0,
                }));
            } catch (e) {}
            if (y)
              try {
                var i = await y
                  .filter({
                    username: 'famed0ll',
                  })
                  .getList();
                ((P =
                  0 < i.length
                    ? i[0]
                    : await y.create({
                        nickname: 'Fame Doll',
                        bio: '',
                        avatarUrl: '',
                        bannerUrl: '',
                      })),
                  ie(),
                  te(),
                  oe());
              } catch (e) {
                console.warn('[famed0ll] Could not refresh admin profile after auth:', e);
              }
          } else document.body.classList.remove('talk-admin');
        });
        class s {
          constructor(e, t, i) {
            ((this._db = e), (this._storage = t), (this._name = i), (this._col = e.collection(i)));
          }
          async getList(e = {}) {
            e = (e && e.limit) || 1e3;
            const t = await this._col.orderBy('created_at', 'desc').limit(e).get();
            return t.docs.map((e) => ({
              id: e.id,
              ...e.data(),
            }));
          }
          subscribe(t) {
            return this._col.orderBy('created_at', 'desc').onSnapshot(
              (e) =>
                t(
                  e.docs.map((e) => ({
                    id: e.id,
                    ...e.data(),
                  })),
                ),
              (e) => console.warn('Firestore subscribe error:', e),
            );
          }
          async create(e) {
            e = {
              ...e,
              created_at: new Date().toISOString(),
              username: (R && R.username) || 'guest',
            };
            return {
              id: (await this._col.add(e)).id,
              ...e,
            };
          }
          async update(e, t) {
            await this._col.doc(e).update(t);
            const i = await this._col.doc(e).get();
            return {
              id: e,
              ...i.data(),
            };
          }
          async delete(e) {
            await this._col.doc(e).delete();
          }
          filter(e) {
            let i = this._col;
            return (
              Object.entries(e).forEach(([e, t]) => {
                i = i.where(e, '==', t);
              }),
              {
                async getList() {
                  const e = await i.get();
                  return e.docs.map((e) => ({
                    id: e.id,
                    ...e.data(),
                  }));
                },
                subscribe(t) {
                  return i.onSnapshot(
                    (e) =>
                      t(
                        e.docs.map((e) => ({
                          id: e.id,
                          ...e.data(),
                        })),
                      ),
                    (e) => console.warn('Firestore filtered subscribe error:', e),
                  );
                },
              }
            );
          }
        }
        h = {
          collection: (e) => new s(i, n, e),
        };
        try {
          (localStorage.removeItem('twitter_lang'), localStorage.removeItem('twitter_ui_mode'));
        } catch (e) {
          console.warn('LocalStorage cleanup failed:', e);
        }
        ((x = h.collection(m)),
          (y = h.collection(p)),
          ($ = h.collection(g)),
          (k = h.collection(f)),
          (E = h.collection(v)),
          B ||
            ((F = !0),
            (R = {
              username: 'guest',
              id: 'guest',
            })),
          (window._uploadFile = async (e) => {
            var t = 'uploads/' + Date.now() + '_' + e.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const i = n.ref(t);
            return (await i.put(e), i.getDownloadURL());
          }),
          k.subscribe((e) => {
            ((C = e),
              le(),
              oe(),
              (window._cachedBlogPosts = e),
              window.updateLatestPostWidget && window.updateLatestPostWidget(e));
          }),
          E.subscribe((e) => {
            ((T = e), oe());
          }),
          (function () {
            const e = document.getElementById('app-root');
            e.innerHTML = `

    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-left">
          <a href="#" class="mobile-nav-item mobile-only" id="nav-search-mobile"></a>
          <input class="app-search-input" type="text" placeholder="${X('search')}" />
        </div>

        <div class="app-topbar-center-nav">
          <a href="#" id="nav-home" class="talk-nav-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a href="#" id="talk-nav-profile" class="talk-nav-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </a>
        </div>

        <div class="app-topbar-right">
          <button id="topbar-refresh-btn" title="${X('refresh')}" style="background:none; border:none; cursor:pointer; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="opacity:0.85;">
              <path d="M21 12a9 9 0 10-3.22 6.39" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 3v6h-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="app-topbar-user" id="topbar-user-toggle">
            <span class="dropdown-arrow-mobile">▼</span>
            <div class="app-topbar-avatar" id="topbar-avatar"></div>
            <span id="topbar-username" style="margin-right:4px"></span>
            <div class="user-dropdown">
              <a href="#" class="dropdown-item" id="nav-edit-profile">${X('settings')}</a>
            </div>
          </div>
        </div>
      </header>

      <div id="pinned-blog-banner" class="pinned-blog-banner"></div>

      <main class="app-main">
        <section class="app-column-center">
          <div id="view-timeline" class="view-section">
            <div class="update-box">
              <div class="update-header">
                <span>${X('mind')}</span>
                <span class="update-char-count" id="char-count">${b}</span>
              </div>
              <div id="replying-to-indicator" style="display:none; font-size:11px; color:var(--border2); margin-bottom:4px; align-items:center; gap:5px">
                <span>${X('replyingTo')} <span id="replying-to-handle"></span></span>
                <button id="cancel-reply-btn" style="background:none; border:none; color:#d40d12; cursor:pointer; font-size:10px; padding:0">[${X('cancel')}]</button>
              </div>
              <div id="quoting-indicator" style="display:none; font-size:11px; color:var(--border2); margin-bottom:4px; align-items:center; gap:5px">
                <span>${X('quoting')} <span id="quoting-handle"></span></span>
                <button id="cancel-quote-btn" style="background:none; border:none; color:#d40d12; cursor:pointer; font-size:10px; padding:0">[${X('cancel')}]</button>
              </div>
              <div class="update-textarea-wrapper">
                <textarea
                  id="update-textarea"
                  class="update-textarea"
                  maxlength="${2 * b}"
                ></textarea>
              </div>
              <!-- imgur URL input -->
              <div id="imgur-url-wrapper" style="padding:0 0 6px 0;display:none;">
                <input id="imgur-url-input" type="url" placeholder="https://i.imgur.com/abc123.jpg" style="width:100%;padding:6px 10px;background:var(--s2);border:1px solid var(--border2);color:var(--ink);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.5px;border-radius:2px;box-sizing:border-box;" />
              </div>
              <div class="update-footer">
                <div style="display:flex;align-items:center;gap:8px;">
                  <button type="button" id="imgur-toggle-btn" style="background:none;border:1px solid var(--border2);color:var(--ink3);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;cursor:pointer;border-radius:2px;transition:border-color .15s,color .15s;" onclick="(function(){const w=document.getElementById('imgur-url-wrapper');const on=w.style.display==='none';w.style.display=on?'block':'none';document.getElementById('imgur-toggle-btn').style.borderColor=on?'var(--pk)':'var(--border2)';document.getElementById('imgur-toggle-btn').style.color=on?'var(--pk)':'var(--ink3)';if(!on)document.getElementById('imgur-url-input').value='';})()">🖼 Imgur URL</button>
                  <span class="update-selected-image" id="selected-image-name"></span>
                </div>
                <div class="update-actions">
                  <button class="update-button" id="update-submit" disabled>${X('update')}</button>
                </div>
              </div>
            </div>

            <div class="timeline-header" id="timeline-tabs" style="gap: 5px; justify-content: flex-start;">
              <span class="timeline-tab" data-mode="hot">${X('hot')}</span>
              <span class="timeline-tab active" data-mode="latest">${X('latest')}</span>
            </div>
            <ul class="timeline-list" id="timeline-list"></ul>
          </div>

          <div id="view-edit-profile" class="view-section">
            <div class="profile-view profile-edit-container">
              <div class="profile-header-edit">
                <h2>${X('accountProfile')}</h2>
              </div>
              <div class="profile-form-group">
                <label>${X('nickname')}</label>
                <input type="text" id="profile-nickname-input" />
              </div>
              <div class="profile-form-group">
                <label>${X('bio')}</label>
                <textarea id="profile-bio-input" rows="3"></textarea>
              </div>
              <div class="profile-form-group">
                <label>${X('profilePic')}</label>
                <div class="profile-avatar-edit-container">
                  <div class="profile-avatar-preview" id="profile-avatar-preview"></div>
                  <input type="file" id="profile-avatar-input" accept="image/*" />
                </div>
                <input type="text" id="profile-avatar-url-input" placeholder="Or paste image URL (imgur, etc.)" style="margin-top:6px;width:100%;padding:6px 8px;border:1px solid var(--border2);background:var(--s2);color:var(--ink);font-size:11px;font-family:DM Mono,monospace;border-radius:2px;" />
              </div>
              <div class="profile-form-group">
                <label>${X('profileBanner')}</label>
                <div class="profile-banner-preview" id="profile-banner-preview"></div>
                <input type="file" id="profile-banner-input" accept="image/*" />
                <input type="text" id="profile-banner-url-input" placeholder="Or paste banner URL (imgur, etc.)" style="margin-top:6px;width:100%;padding:6px 8px;border:1px solid var(--border2);background:var(--s2);color:var(--ink);font-size:11px;font-family:DM Mono,monospace;border-radius:2px;" />
              </div>
              <div class="profile-form-group" style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
                <label style="margin:0;">Show Likes</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="checkbox" id="profile-likes-toggle" style="width:16px;height:16px;cursor:pointer;" checked />
                  <span style="font-size:11px;color:var(--ink3);font-family:DM Mono,monospace;">Visible to everyone</span>
                </label>
              </div>
              <button class="profile-save-btn" id="profile-save-btn" style="margin-top:10px">${X('saveChanges')}</button>
            </div>
          </div>

          <div id="view-user-profile" class="view-section">
            <div id="user-profile-content"></div>
            <ul class="timeline-list" id="user-profile-timeline"></ul>
          </div>

          <div id="view-hashtag" class="view-section">
            <div class="timeline-header" style="flex-direction: column; align-items: flex-start; padding: 10px 8px;">
              <div id="hashtag-name" style="font-size: 18px; margin-bottom: 2px;"></div>
              <div id="hashtag-count" style="font-weight: normal; font-size: 12px; color: #666;"></div>
            </div>
            <ul class="timeline-list" id="hashtag-list"></ul>
          </div>

          <div id="view-search" class="view-section">
            <div class="timeline-header">
              <span id="search-title">${X('searchResults')}</span>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px">
                <div class="search-tabs">
                  <span class="search-tab" id="search-tab-tweets">${X('searchTweets')}</span>
                  <span class="search-tab" id="search-tab-users">${X('searchUsers')}</span>
                </div>
                <div id="search-mode-toggle" style="font-size: 10px; color: var(--border2); display: none;">
                  ${X('searchMode')} <span class="search-tab" id="search-mode-normal">${X('modeNormal')}</span> | <span class="search-tab" id="search-mode-exact">${X('modeExact')}</span> | <span class="search-tab" id="search-mode-all">${X('modeAll')}</span>
                </div>
              </div>
            </div>
            <ul class="timeline-list" id="search-results-list"></ul>
          </div>

          <div id="view-blog-list" class="view-section">
            <div class="timeline-header">${X('blog')}</div>
            <div id="mobile-blog-container" style="padding: 10px; background: #fff; flex: 1; overflow-y: auto;"></div>
          </div>

          <div id="view-trending-list" class="view-section">
            <div class="timeline-header">${X('trending')}</div>
            <ul class="timeline-list" id="trending-list-expanded"></ul>
          </div>

          <div id="view-blog-detail" class="view-section">
            <div id="blog-detail-content" class="blog-content-view"></div>
          </div>

          <div id="view-tweet-detail" class="view-section">
            <div class="timeline-header" style="display: flex; align-items: center; gap: 10px;">
              <button class="admin-btn" onclick="window.switchToHome()" style="padding: 2px 8px;">← ${X('back')}</button>
              <span id="tweet-detail-title">${X('tweetAndReplies')}</span>
            </div>
            <div id="tweet-detail-original"></div>

            <div id="detail-reply-box" class="update-box" style="display:none; background: var(--s2); border-top: 1px solid var(--border2);">
              <div class="update-header">
                <span id="detail-reply-label">${X('replyingTo')} ...</span>
                <span class="update-char-count" id="detail-char-count">${b}</span>
              </div>
              <div class="update-textarea-wrapper">
                <textarea id="detail-reply-textarea" class="update-textarea" placeholder="${X('tweetYourReply')}"></textarea>
              </div>
              <div class="update-footer">
                <label class="update-image-label">
                  <span class="update-image-placeholder">+</span>
                  <span>${X('addMedia')}</span>
                  <input type="file" accept="image/*,video/*,audio/*" id="detail-reply-image-input" class="update-image-input" />
                </label>
                <div class="update-actions">
                  <span class="update-selected-image" id="detail-selected-image-name"></span>
                  <button class="update-button" id="detail-reply-submit" disabled>${X('reply')}</button>
                </div>
              </div>
            </div>

            <div class="timeline-header" style="background: var(--border2); font-size: 11px;">${X('replies')}</div>
            <ul class="timeline-list" id="tweet-detail-replies"></ul>
          </div>

          <div id="view-blog-admin" class="view-section">
            <div class="admin-blog-form">
              <h2>${X('createBlogPost')}</h2>
              <div class="profile-form-group">
                <label>${X('postTitle')}</label>
                <input type="text" id="blog-title-input" placeholder="Enter title..." />
              </div>
              <div class="profile-form-group">
                <label>${X('mainContent')}</label>
                <textarea id="blog-content-input" rows="15" placeholder="Write your blog post here... HTML allowed."></textarea>
              </div>
              <div style="display:flex; gap:10px">
                <button class="profile-save-btn" id="blog-submit-btn">${X('publishBlog')}</button>
                <button class="admin-btn" id="blog-cancel-btn">${X('cancel')}</button>
              </div>
            </div>
          </div>

        </section>

        <aside class="app-column-right">
          <div class="sidebar-section-header clickable-header" onclick="switchView('blogList')">${X('blog')}</div>
          <div class="blog-sidebar-list" id="blog-sidebar-list">
            </div>

          <div class="sidebar-section-header clickable-header" style="margin-top: 20px;" onclick="switchView('trendingList')">Trending Hashtags</div>
          <div class="trending-sidebar-list" id="trending-sidebar-list">
            </div>
        </aside>
      </main>
    </div>
  `;
          })(R),
          (function () {
            const l = document.getElementById('update-textarea'),
              i = document.getElementById('char-count'),
              d = document.getElementById('update-submit'),
              t = document.getElementById('update-image-input'),
              c = document.getElementById('selected-image-name'),
              n = document.getElementById('replying-to-indicator'),
              a = document.getElementById('replying-to-handle'),
              e = document.getElementById('cancel-reply-btn'),
              o = document.getElementById('quoting-indicator'),
              r = document.getElementById('quoting-handle'),
              s = document.getElementById('cancel-quote-btn');
            let u = null,
              m = !1;

            function p() {
              var e;
              (J
                ? ((n.style.display = 'flex'), (a.textContent = J.handle))
                : (n.style.display = 'none'),
                U
                  ? ((e = I.find((e) => e.id === U)),
                    (o.style.display = 'flex'),
                    (r.textContent = e ? e.username : 'someone'))
                  : (o.style.display = 'none'));
            }
            ((window.setReplyingTo = (e, t) => {
              ((J = {
                id: e,
                handle: t,
              }),
                (U = null),
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                }),
                (l.value = ''),
                l.focus(),
                p(),
                g());
            }),
              (window.setQuoting = (t) => {
                ((U = t), (J = null));
                I.find((e) => e.id === t);
                (window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                }),
                  (l.value = ''),
                  l.focus(),
                  p(),
                  g());
              }),
              e &&
                (e.onclick = () => {
                  ((J = null), p(), g());
                }));
            s &&
              (s.onclick = () => {
                ((U = null), p(), g());
              });

            function g() {
              var e = ((l && l.value) || '').trim(),
                t = b - e.length;
              i && ((i.textContent = t), i.classList.toggle('over', t < 0));
              t = !m && 0 < e.length && 0 <= t;
              d && (d.disabled = !t);
            }
            l && l.addEventListener('input', g);
            t &&
              t.addEventListener('change', () => {
                var e = t.files && t.files[0];
                if (e && e.size > w)
                  return (alert('File is too large. Max size is 25MB.'), void (t.value = ''));
                ((u = e || null), c && (c.textContent = u ? u.name : ''));
              });
            d &&
              d.addEventListener('click', async () => {
                if (!d.disabled && !m)
                  if (B) {
                    var i = ((l && l.value) || '').trim();
                    if (i && !(i.length > b)) {
                      ((m = !0), (d.disabled = !0));
                      var n = d.textContent;
                      d.textContent = 'posting...';
                      let e = null,
                        t = 'image';
                      try {
                        const a = document.getElementById('imgur-url-input'),
                          o = a ? a.value.trim() : '';
                        o
                          ? ((e = o.replace(
                              /^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/,
                              'https://i.imgur.com/$1.jpg',
                            )),
                            (t = 'image'))
                          : u &&
                            ((t = u.type.startsWith('video/')
                              ? 'video'
                              : u.type.startsWith('audio/')
                                ? 'audio'
                                : 'image'),
                            (e = await window._uploadFile(u)));
                        await x.create({
                          text: i,
                          mediaUrl: e,
                          mediaType: t,
                          parent_id: J ? J.id : null,
                          quote_id: U,
                        });
                        (l && (l.value = ''),
                          (J = null),
                          (U = null),
                          p(),
                          (u = null),
                          a && (a.value = ''));
                        const r = document.getElementById('imgur-url-wrapper');
                        r && (r.style.display = 'none');
                        const s = document.getElementById('imgur-toggle-btn');
                        (s && ((s.style.borderColor = ''), (s.style.color = '')),
                          c && (c.textContent = ''));
                      } catch (e) {
                        (console.error('Error creating tweet:', e),
                          alert('Failed to post. Please try again.'));
                      } finally {
                        ((m = !1), (d.textContent = n), g());
                      }
                    }
                  } else alert('Unauthorized.');
              });
            g();
            const f = document.getElementById('blog-title-input'),
              v = document.getElementById('blog-content-input'),
              h = document.getElementById('blog-submit-btn'),
              y = document.getElementById('blog-cancel-btn');
            h &&
              (h.onclick = async () => {
                if (B) {
                  var e = f.value.trim(),
                    t = v.value.trim();
                  if (!e || !t) return alert('Title and Content required.');
                  if (!k) return alert('Blog system is still initializing. Please wait a moment.');
                  h.disabled = !0;
                  var i = h.textContent;
                  h.textContent = O ? 'Updating...' : 'Publishing...';
                  try {
                    (O
                      ? (await k.update(O, {
                          title: e,
                          content: t,
                        }),
                        (O = null))
                      : await k.create({
                          title: e,
                          content: t,
                        }),
                      (f.value = ''),
                      (v.value = ''));
                    const n = document.querySelector('#view-blog-admin h2');
                    (n && (n.textContent = 'Create New Blog Post'),
                      (h.textContent = 'Publish Blog Post'),
                      ae('timeline'));
                  } catch (e) {
                    (console.error('Blog publish error:', e),
                      alert(
                        'Failed to publish blog post. Please check your connection and try again.',
                      ));
                  } finally {
                    ((h.disabled = !1), (h.textContent = i));
                  }
                } else alert('Unauthorized.');
              });
            y && (y.onclick = () => ae('timeline'));
          })(R),
          (function () {
            const r = document.getElementById('detail-reply-textarea'),
              i = document.getElementById('detail-char-count'),
              s = document.getElementById('detail-reply-submit'),
              l = document.getElementById('detail-reply-image-input'),
              d = document.getElementById('detail-selected-image-name');
            if (r) {
              let a = null,
                o = !1;

              function c() {
                var e = (r.value || '').trim(),
                  t = b - e.length;
                ((i.textContent = t), i.classList.toggle('over', t < 0));
                t = !o && 0 < e.length && 0 <= t;
                s.disabled = !t;
              }
              (r.addEventListener('input', c),
                l.addEventListener('change', () => {
                  var e = l.files && l.files[0];
                  if (e && e.size > w)
                    return (alert('File is too large. Max size is 25MB.'), void (l.value = ''));
                  ((a = e || null), (d.textContent = a ? a.name : ''));
                }),
                s.addEventListener('click', async () => {
                  if (!s.disabled && !o)
                    if (B) {
                      var i = (r.value || '').trim();
                      if (i && !(i.length > b) && V) {
                        ((o = !0), (s.disabled = !0));
                        var n = s.textContent;
                        s.textContent = 'sending...';
                        let e = null,
                          t = 'image';
                        try {
                          (a &&
                            ((t = a.type.startsWith('video/')
                              ? 'video'
                              : a.type.startsWith('audio/')
                                ? 'audio'
                                : 'image'),
                            (e = await window._uploadFile(a))),
                            await x.create({
                              text: i,
                              mediaUrl: e,
                              mediaType: t,
                              parent_id: V,
                            }),
                            (r.value = ''),
                            (a = null),
                            (l.value = ''),
                            (d.textContent = ''));
                        } catch (e) {
                          (console.error('Error creating reply:', e),
                            alert('Failed to post reply.'));
                        } finally {
                          ((o = !1), (s.textContent = n), c());
                        }
                      }
                    } else alert('Unauthorized.');
                }));
            }
          })(),
          (function () {
            const e = document.getElementById('profile-save-btn'),
              a = document.getElementById('profile-nickname-input'),
              o = document.getElementById('profile-bio-input'),
              t = document.getElementById('profile-likes-toggle');
            t && (t.checked = 'true' !== localStorage.getItem('fd_likes_hidden'));
            const i = document.getElementById('profile-avatar-input'),
              n = document.getElementById('profile-banner-input'),
              r = document.getElementById('profile-avatar-preview'),
              s = document.getElementById('profile-banner-preview');
            let l = null,
              d = null;
            (i.addEventListener('change', (e) => {
              e = e.target.files[0];
              if (e) {
                if (e.size > w)
                  return (alert('Profile picture must be under 4MB.'), void (i.value = ''));
                l = e;
                const t = new FileReader();
                ((t.onload = (e) => {
                  r.style.backgroundImage = `url('${e.target.result}')`;
                }),
                  t.readAsDataURL(e));
              }
            }),
              n.addEventListener('change', (e) => {
                e = e.target.files[0];
                if (e) {
                  if (e.size > w)
                    return (alert('Banner image must be under 4MB.'), void (n.value = ''));
                  d = e;
                  const t = new FileReader();
                  ((t.onload = (e) => {
                    s.style.backgroundImage = `url('${e.target.result}')`;
                  }),
                    t.readAsDataURL(e));
                }
              }),
              e.addEventListener('click', async () => {
                if (P) {
                  ((e.disabled = !0), (e.textContent = 'Saving...'));
                  try {
                    let e = P.avatarUrl;
                    const i = document.getElementById('profile-avatar-url-input');
                    i && i.value.trim()
                      ? (e = i.value.trim())
                      : l && (e = await window._uploadFile(l));
                    let t = P.bannerUrl;
                    const n = document.getElementById('profile-banner-url-input');
                    (n && n.value.trim()
                      ? (t = n.value.trim())
                      : d && (t = await window._uploadFile(d)),
                      await y.update(P.id, {
                        nickname: a.value,
                        bio: o.value,
                        avatarUrl: e,
                        bannerUrl: t,
                      }),
                      (P.nickname = a.value),
                      (P.bio = o.value),
                      (P.avatarUrl = e),
                      (P.bannerUrl = t),
                      te(),
                      alert('Profile updated!'));
                  } catch (e) {
                    (console.error('Profile update failed:', e), alert('Failed to save profile.'));
                  } finally {
                    ((e.disabled = !1), (e.textContent = 'Save changes'), (l = null), (d = null));
                  }
                }
              }));
          })(),
          (function () {
            const e = document.getElementById('nav-home-logo'),
              t = document.getElementById('nav-blog-mobile'),
              i = document.getElementById('nav-search-mobile'),
              n = document.getElementById('nav-home'),
              a = document.getElementById('talk-nav-profile'),
              o = document.getElementById('topbar-user-toggle'),
              r = document.querySelector('.app-search-input'),
              s = document.getElementById('topbar-refresh-btn');
            s &&
              s.addEventListener('click', (e) => {
                (e.preventDefault(), location.reload());
              });
            ((window.switchToProfile = (e) => {
              ((Y = e), ae('userProfile'));
            }),
              (window.switchToHashtag = (e) => {
                ((W = e.replace(/^#/, '')), ae('hashtag'));
              }),
              (window.switchToTweetDetail = (e, t = !1) => {
                ((V = e), (Z = t), ae('tweetDetail'));
              }),
              (window.switchToSearch = (e, t = 'tweets') => {
                e && e.startsWith('#') && 1 < e.length
                  ? window.switchToHashtag(e)
                  : ((Q = { ...Q, query: e, type: t }), ae('search'));
              }),
              (window.showRetweetChoice = (e) =>
                new Promise((t) => {
                  const i = document.getElementById('retweet-modal'),
                    n = document.getElementById('retweet-modal-normal'),
                    a = document.getElementById('retweet-modal-quote'),
                    o = document.getElementById('retweet-modal-cancel');
                  i.classList.add('active');
                  const e = (e) => {
                    (i.classList.remove('active'),
                      (n.onclick = null),
                      (a.onclick = null),
                      (o.onclick = null),
                      t(e));
                  };
                  ((n.onclick = () => e('normal')),
                    (a.onclick = () => e('quote')),
                    (o.onclick = () => e('cancel')));
                })),
              r.addEventListener('keypress', (e) => {
                'Enter' !== e.key || ((e = r.value.trim()) && window.switchToSearch(e));
              }),
              document.getElementById('search-tab-tweets').addEventListener('click', () => {
                ((Q.type = 'tweets'), fe());
              }),
              document.getElementById('search-tab-users').addEventListener('click', () => {
                ((Q.type = 'users'), fe());
              }),
              document.getElementById('search-mode-normal').addEventListener('click', () => {
                ((Q.matchMode = 'normal'), fe());
              }),
              document.getElementById('search-mode-exact').addEventListener('click', () => {
                ((Q.matchMode = 'exact'), fe());
              }),
              document.getElementById('search-mode-all').addEventListener('click', () => {
                ((Q.matchMode = 'all'), fe());
              }),
              e && e.addEventListener('click', () => ae('timeline')));
            const l = document.querySelector(
              '.app-column-right .sidebar-section-header:first-of-type',
            );
            l && ((l.textContent = X('twitterBlog')), (l.onclick = () => ae('blogList')));
            const d = document.querySelector(
              '.app-column-right .sidebar-section-header:last-of-type',
            );
            d && ((d.textContent = X('trendingHashtags')), (d.onclick = () => ae('trendingList')));
            const c = document.querySelector(
              '.app-column-right .sidebar-section-header:last-of-type',
            );
            c && (c.textContent = X('trending'));
            t &&
              t.addEventListener('click', (e) => {
                (e.preventDefault(), ae('blogList'));
              });
            i &&
              i.addEventListener('click', (e) => {
                (e.preventDefault(), window.switchToSearch(''));
              });
            (n.addEventListener('click', (e) => {
              (e.preventDefault(), ae('timeline'));
            }),
              a.addEventListener('click', (e) => {
                (e.preventDefault(), switchToProfile('famed0ll'));
              }));
            const u = document.getElementById('nav-edit-profile');
            (u.addEventListener('click', (e) => {
              (e.preventDefault(), ae('editProfile'));
            }),
              document.addEventListener('click', (e) => {
                e = e.target.closest('.timeline-tab');
                e && ((K = e.dataset.mode), de(I));
              }));
            const m = document.getElementById('nav-blog-admin');
            m &&
              m.addEventListener('click', async (e) => {
                (e.preventDefault(), (await checkAdminPassword()) && ae('blogAdmin'));
              });
            document.addEventListener('click', (e) => {
              const t = e.target.closest('a');
              t &&
                ('#' === t.getAttribute('href') || t.getAttribute('onclick')) &&
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
            });
            const p = document.getElementById('lightbox-modal'),
              g = document.getElementById('lightbox-img'),
              f = document.getElementById('lightbox-close'),
              v = () => {
                p.style.display = 'none';
              };
            ((f.onclick = v),
              (p.onclick = (e) => {
                e.target === p && v();
              }),
              (window.openLightbox = (e) => {
                ((g.src = e), (p.style.display = 'flex'));
              }),
              o.addEventListener('click', (e) => {
                window.innerWidth <= 640 && (o.classList.toggle('active'), e.stopPropagation());
              }),
              document.addEventListener('click', () => {
                o.classList.remove('active');
              }));
          })(),
          B && L());
        const l = document.querySelector('.app-column-center');
        (l &&
          l.addEventListener('scroll', () => {
            const e = document.querySelector('.view-section.active');
            var t, i, n;
            e &&
              ((t = e.id),
              (i = l.scrollTop + l.clientHeight >= l.scrollHeight - 800),
              (n = ('view-timeline' === t && 'latest' === K) || 'view-user-profile' === t),
              i &&
                n &&
                (async function () {
                  if (!z && N) {
                    ((z = !0), oe());
                    var e = I.length;
                    H += 1e3;
                    try {
                      var t = await x.getList({
                        limit: H,
                      });
                      (ne(t), I.length <= e && t.length < H && (N = !1));
                    } catch (e) {
                      console.error('Load more failed', e);
                    } finally {
                      ((z = !1), oe());
                    }
                  }
                })(),
              ('view-search' === t && 'users' === Q.type) ||
                ![
                  'view-timeline',
                  'view-following',
                  'view-user-profile',
                  'view-hashtag',
                  'view-search',
                  'view-trending-list',
                ].includes(t) ||
                ((i = e.querySelector('.timeline-list')) &&
                  q.length > D &&
                  ((n = l.scrollTop),
                  (n = Math.floor(n / j) - 10),
                  (n = Math.max(0, Math.min(n, q.length - D))),
                  10 <= Math.abs(n - A) && ge(q, i, 'view-search' === t ? Q.query : null, !1))));
          }),
          (e = (e) => {
            (e.forEach((e) => {
              M[e.username] = e;
            }),
              R && M[R.username] && (P = M[R.username]),
              oe(),
              te(),
              ie());
          }));
        try {
          e(
            await y.getList({
              limit: 1e4,
            }),
          );
        } catch (e) {
          console.warn('[famed0ll] profilesCollection.getList failed:', e);
        }
        try {
          y.subscribe(e);
        } catch (e) {
          console.warn('[famed0ll] profilesCollection.subscribe failed:', e);
        }
        try {
          $.subscribe((e) => {
            ((_ = e), oe());
          });
        } catch (e) {
          console.warn('[famed0ll] likesCollection.subscribe failed:', e);
        }
        try {
          x.subscribe((e) => {
            (ne(e), le());
          });
        } catch (e) {
          console.warn('[famed0ll] tweetsCollection.subscribe failed:', e);
        }
        try {
          var d = await y
            .filter({
              username: R.username,
            })
            .getList();
          0 < d.length
            ? (P = d[0])
            : 'guest' !== R.username &&
              (P = await y.create({
                nickname: 'famed0ll' === R.username ? 'Fame Doll' : R.username,
                bio: '',
                avatarUrl: '',
                bannerUrl: '',
              }));
        } catch (e) {
          console.warn('[famed0ll] Per-user profile load/create failed:', e);
        }
        (ie(), te());
        let c = [];
        try {
          c = await x.getList({
            limit: H,
          });
        } catch (e) {
          console.warn('[famed0ll] tweetsCollection.getList failed:', e);
        }
        (ne(c), le(), ae('timeline'));
      })().catch((e) => {
        console.error('Failed to initialize app:', e);
      });
    })();
  }

  // If app-root already exists (page pre-loaded), run immediately
  if (document.getElementById('app-root')) {
    runTeaParty();
  } else {
    // Otherwise hook into _onPageLoad and wait
    var prevHook = window._onPageLoad;
    window._onPageLoad = function (pageName) {
      if (prevHook)
        try {
          prevHook(pageName);
        } catch (e) {}
      if (pageName === 'talk' && !window._teaPartyInitialized) {
        window._teaPartyInitialized = true;
        runTeaParty();
      }
    };
  }
})();
