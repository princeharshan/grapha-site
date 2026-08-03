/* The page is audible. Every click and every keystroke, anywhere on it — not
   just inside the product mock — using the app's OWN samples from
   `references/sounds/keys/`. The picture of Grapha sounds like Grapha.

   There is no mute (owner, 2026-08-03: *"It does not have to be mutable."*).
   No toggle, no preference, nothing remembered. What follows is the whole
   contract.

   ## Only the visitor makes noise

   **The demo's auto-typing is deliberately silent** (owner, 2026-08-03). It
   types on a loop, on its own, forever — and a page that clatters at someone
   who is only reading it has stopped being a product shot and started being a
   nuisance. Sound here means "you did something", every time, with no
   exceptions: hands on the page, not the page on its own.

   That is why nothing in this file is exported. `demo.js` used to call in per
   character, and the silence is enforced by there being no way to.

   ## The one constraint that is not ours

   No browser will play a sound before the visitor has interacted with the page.
   That is not a setting we can opt out of — it is enforced, everywhere, and a
   page that tried would simply be silent. So the samples are DOWNLOADED and
   DECODED on load, which needs no gesture, and the first click is the gesture —
   which, because everything is already decoded by then, is itself audible.

   Loading eagerly is the deliberate cost of having no toggle: 168 kB that
   nobody opted into. It is fetched at low priority, behind the fonts, and it is
   the price of the first click making a sound instead of the second.

   ## Two ways to play, because one of them fails on a file:// URL

   WebAudio is the real path — sub-millisecond, overlapping, no allocation per
   keystroke. But it needs `fetch`, and `fetch` is blocked under `file://`, so
   opening the page by double-clicking it would be silent with no error. The
   `<audio>` fallback covers exactly that case, which is how this page gets
   previewed locally. Over https — how anyone actually reaches grapha.ai — the
   WebAudio path is the one that runs. */
(function () {
  'use strict';

  var DIR = 'sounds/';

  /* Round-robin sets, matching the app's own buckets. More than one sample per
     key type is the whole trick — one sample repeated at typing speed reads as
     a machine gun rather than a keyboard. */
  var BUCKETS = {
    key: ['key1', 'key2', 'key3', 'key4', 'key5', 'key6',
          'key7', 'key8', 'key9', 'key10', 'key11', 'key12'],
    space: ['space1', 'space2', 'space3', 'space4'],
    enter: ['enter1', 'enter2', 'enter3', 'enter4', 'enter5'],
    del: ['delete1', 'delete2'],
    click: ['leftclick1']
  };

  var GAIN = { key: 0.3, space: 0.3, enter: 0.3, del: 0.3, click: 0.42 };
  var THROTTLE = 30; /* ms — the app's figure; below it, two samples smear */

  var ctx = null;
  var buffers = {};   /* name -> AudioBuffer, the WebAudio path */
  var tags = {};      /* name -> HTMLAudioElement, the file:// fallback */
  var order = {};     /* bucket -> shuffled queue */
  var lastAt = 0;

  function names() {
    var all = [];
    for (var b in BUCKETS) all = all.concat(BUCKETS[b]);
    return all;
  }

  /* ── Loading ─────────────────────────────────────────────────────────── */

  /* An AudioContext may be CREATED without a gesture — it simply starts
     suspended — and `decodeAudioData` works on a suspended one. Only playback
     waits for the visitor. That is what lets the first click make a sound. */
  function audioContext() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (C) ctx = new C();
    }
    return ctx;
  }

  function viaFetch(name) {
    var opts = {};
    try { opts.priority = 'low'; } catch (e) { /* older browsers ignore it */ }
    return fetch(DIR + name + '.mp3', opts)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.arrayBuffer();
      })
      .then(function (raw) {
        return new Promise(function (res, rej) {
          /* The callback form, not the promise form: Safari still ships the old
             signature, and this is the one both understand. */
          audioContext().decodeAudioData(raw, res, rej);
        });
      })
      .then(function (buf) { buffers[name] = buf; });
  }

  function viaTag(name) {
    var el = new Audio(DIR + name + '.mp3');
    el.preload = 'auto';
    tags[name] = el;
  }

  /* One probe decides the path for all of them: a `file://` page fails the
     first fetch and every subsequent one for the same reason. */
  function load() {
    if (!audioContext()) { names().forEach(viaTag); return; }
    viaFetch(BUCKETS.click[0]).then(function () {
      names().forEach(function (n) {
        if (n !== BUCKETS.click[0]) viaFetch(n).catch(function () { viaTag(n); });
      });
    }, function () {
      names().forEach(viaTag);
    });
  }

  /* ── Playing ─────────────────────────────────────────────────────────── */

  function shuffled(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Next sample from a bucket. The queue is reshuffled when it empties, so a
     sample cannot come up twice running unless the bucket holds one. */
  function next(bucket) {
    if (!order[bucket] || !order[bucket].length) {
      order[bucket] = shuffled(BUCKETS[bucket]);
    }
    return order[bucket].pop();
  }

  function emit(bucket, name) {
    var src = ctx.createBufferSource();
    src.buffer = buffers[name];
    var gain = ctx.createGain();
    gain.gain.value = GAIN[bucket];
    src.connect(gain).connect(ctx.destination);
    src.start(0);
  }

  /* Every caller below is a real user event — that is the file's whole design,
     and it is what makes the wake-up safe. `resume()` only takes effect when it
     is called DURING a gesture; a resume issued at any other moment does not
     retroactively succeed once the visitor finally clicks, it just stays
     pending forever. An earlier version let the demo's auto-typing call in
     here, its first keystroke took the one wake-up attempt, and the page then
     played nothing at all, ever, over http. Measured, not reasoned. */
  function play(bucket) {
    /* Wall clock, NOT `ctx.currentTime`: a suspended context's clock does not
       advance, so every keypress would read as 0ms since the last one and be
       throttled away for good. Measured — with the context clock, nothing but
       the click sound ever played. */
    var now = Date.now();
    if (bucket !== 'click' && now - lastAt < THROTTLE) return;
    lastAt = now;

    var name = next(bucket);

    if (ctx && buffers[name]) {
      if (ctx.state === 'running') { emit(bucket, name); return; }
      /* Asleep — the visitor's first press, or a tab back from the
         back/forward cache. Wake it, then play: a source started against a
         clock that is not moving is not played, it is queued, and every queued
         source fires together the moment the clock starts. */
      ctx.resume().then(function () { emit(bucket, name); }, function () {});
      return;
    }

    /* The `<audio>` fallback: no context, nothing queued, a blocked play simply
       rejects. */
    var el = tags[name];
    if (!el) return;
    el.volume = GAIN[bucket];
    try { el.currentTime = 0; } catch (e) { /* not seekable yet */ }
    var p = el.play();
    if (p && p.catch) p.catch(function () { /* still waiting for a gesture */ });
  }

  /* ── Every interaction on the page ───────────────────────────────────── */

  /* `pointerdown`, not `click`: a real mouse makes its noise when the button
     goes DOWN, and a click event does not fire until the button comes back up.
     On the whole document, not on the controls — a click on the margin is
     still a click. */
  document.addEventListener('pointerdown', function () { play('click'); }, true);

  /* Navigation keys stay silent: someone paging down the article with the
     arrow keys is reading, not typing, and clacking at them would be a bug.
     Everything that puts a character somewhere — or takes one away — sounds. */
  var SILENT = {
    Shift: 1, Control: 1, Alt: 1, Meta: 1, CapsLock: 1, Tab: 1, Escape: 1,
    ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1,
    PageUp: 1, PageDown: 1, Home: 1, End: 1, Insert: 1,
    ContextMenu: 1, NumLock: 1, ScrollLock: 1, Pause: 1
  };

  document.addEventListener('keydown', function (e) {
    if (e.repeat) return;               /* a held key is one press, not fifty */
    if (e.metaKey || e.ctrlKey) return; /* ⌘F is a command, not a keystroke  */
    var k = e.key;
    if (!k || SILENT[k] || /^F\d+$/.test(k)) return;

    if (k === 'Enter') return play('enter');
    if (k === 'Backspace' || k === 'Delete') return play('del');
    if (k === ' ' || k === 'Spacebar') return play('space');
    if (k.length === 1) play('key');
  }, true);

  load();
})();
