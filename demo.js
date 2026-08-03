/* The hero window is the demo. The loop plays on repeat — Write →
   Crystalize → Do → Review, a suggestion the app accepts for itself, a
   breath, again — until the visitor steps in: the chapter names above the
   window jump the playhead, and Accept/Reject/Resolve are real. Deciding
   stops the theatre and hands the visitor the pen (the column becomes
   editable, Replay appears).

   The static markup is the FINISHED state, so a dead script still shows a
   complete product shot. This file only ever rearranges what is already
   there. `prefers-reduced-motion` skips the theatre and waits at Review. */
(function () {
  'use strict';

  var demo = document.getElementById('demo');
  if (!demo) return;

  var ORIGINAL = 'Two weeks, or ten days — decide when it gets closer.';
  var REVISED = '10–19 October, nine nights.';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Captured before any mutation: Replay and chapter jumps restore this. */
  var initialHTML = demo.innerHTML;
  var state = 'idle'; /* idle → running → review → done */
  var token = 0;      /* bumping it cancels any sleeping run */

  function $(sel) { return demo.querySelector(sel); }
  function $all(sel) { return demo.querySelectorAll(sel); }

  function sleep(ms, t) {
    return new Promise(function (res) {
      setTimeout(function () { res(t === token); }, ms);
    });
  }

  function setStep(n) {
    $all('.dstep').forEach(function (el, i) {
      el.classList.toggle('on', i === n);
    });
  }

  function reveal(el) {
    if (!el || !el.hasAttribute('data-beat')) return;
    el.removeAttribute('data-beat');
    el.classList.add('din');
  }

  /* ── Instant states ──────────────────────────────────────────────── */

  /* Beat zero: the document as the visitor "left" it. */
  function baseReset() {
    $('#p2').innerHTML = '<span id="p2t"></span><span class="caret-pill" id="caret"></span>';
    $('#app').classList.remove('panel-open');
    $('#bar-label').classList.add('hide');
    $('#doc').classList.remove('dimmed');
    $('#app-note').classList.remove('show');
    var card = $('#pcard');
    if (card) card.classList.remove('resolved');
    $all('.sug-bar, .d-todo, .d-budget').forEach(function (el) {
      el.setAttribute('data-beat', '');
      el.classList.remove('din');
    });
    $all('.d-todo li').forEach(function (li) { li.classList.remove('done'); });
  }

  /* The end-state of every chapter BEFORE n, applied in one frame — this is
     what a chapter jump lands on before playing forward. */
  function applyThrough(n) {
    baseReset();
    if (n >= 1) { /* Write is done */
      $('#p2t').textContent = ORIGINAL;
      $('#bar-label').classList.remove('hide');
    }
    if (n >= 2) { /* Crystalize is done */
      $('#p2t').classList.add('canchor');
      $('#app').classList.add('panel-open');
    }
    if (n >= 3) { /* Do is done */
      reveal($('.d-todo'));
      $all('.d-todo li').forEach(function (li, i) {
        if (i < 2) li.classList.add('done');
      });
      reveal($('.d-budget'));
    }
    setStep(n); /* the rail agrees with the window even before play begins */
  }

  function showSuggestion() {
    var p2 = $('#p2');
    p2.innerHTML = '';
    var del = document.createElement('span');
    del.className = 'sug-del sfade';
    del.textContent = ORIGINAL;
    var add = document.createElement('span');
    add.className = 'sug-add sfade';
    add.textContent = REVISED;
    p2.appendChild(del);
    p2.appendChild(document.createTextNode(' '));
    p2.appendChild(add);
    reveal($('.sug-bar'));
  }

  /* ── Chapters ────────────────────────────────────────────────────── */

  function typeChars(t) {
    return new Promise(function (res) {
      (function step(i) {
        if (t !== token) return res(false);
        var p2t = $('#p2t');
        if (!p2t) return res(false);
        /* Silent, deliberately (owner, 2026-08-03). `sound.js` gives the page a
           keyboard and a mouse, but this loop is the PAGE typing, not the
           visitor, and it runs forever — see that file's header. */
        p2t.textContent = ORIGINAL.slice(0, i + 1);
        if (i + 1 >= ORIGINAL.length) return res(true);
        var pause = /[,—]/.test(ORIGINAL[i]) ? 190 : 20 + Math.random() * 42;
        setTimeout(function () { step(i + 1); }, pause);
      })(0);
    });
  }

  async function chWrite(t) {
    setStep(0);
    if (!(await sleep(650, t))) return false;
    if (!(await typeChars(t))) return false;
    if (!(await sleep(520, t))) return false;
    /* The label is the whole setup: it pops into the bar, and the agent
       starts tending the doc. */
    $('#bar-label').classList.remove('hide');
    return sleep(1000, t);
  }

  async function chCrystalize(t) {
    setStep(1);
    var p2t = $('#p2t');
    if (p2t) p2t.classList.add('canchor');
    if (!(await sleep(420, t))) return false;
    $('#app').classList.add('panel-open');
    return sleep(3300, t);
  }

  async function chDo(t) {
    setStep(2);
    reveal($('.d-todo'));
    var lis = $all('.d-todo li');
    if (!(await sleep(780, t))) return false;
    lis[0].classList.add('done');
    if (!(await sleep(720, t))) return false;
    lis[1].classList.add('done');
    if (!(await sleep(760, t))) return false;
    reveal($('.d-budget'));
    return sleep(1500, t);
  }

  function enterReview() {
    setStep(3);
    var p2t = $('#p2t');
    if (p2t) p2t.classList.remove('canchor');
    var caret = $('#caret');
    if (caret) caret.remove();
    showSuggestion();
    /* Narrow, the comment is a popover OVER the page — left up, it would
       sit on the very controls this beat waits for. It has had its say. */
    if (window.matchMedia('(max-width: 1080px)').matches) {
      $('#app').classList.remove('panel-open');
    }
    state = 'review';
  }

  /* ── The loop ────────────────────────────────────────────────────── */

  async function playFrom(n) {
    var t = ++token;
    state = 'running';
    applyThrough(n);
    if (n <= 0 && !(await chWrite(t))) return;
    if (n <= 1 && !(await chCrystalize(t))) return;
    if (n <= 2 && !(await chDo(t))) return;
    enterReview();
    if (reduced) return; /* no theatre: wait for the visitor */

    /* Left alone, the demo accepts its own suggestion and goes again. */
    if (!(await sleep(3600, t))) return;
    state = 'running';
    applyAccept();
    if (!(await sleep(2800, t))) return;
    $('#doc').classList.add('dimmed');
    if (!(await sleep(480, t))) return;
    applyThrough(0);
    if (!(await sleep(240, t))) return;
    playFrom(0);
  }

  /* Accept, as pixels: the edit merges, the app saves, the thread resolves. */
  function applyAccept() {
    $('#p2').textContent = REVISED;
    var bar = $('.sug-bar');
    if (bar) bar.setAttribute('data-beat', '');
    var note = $('#app-note');
    note.hidden = false;
    requestAnimationFrame(function () { note.classList.add('show'); });
    setTimeout(function () { note.classList.remove('show'); }, 2200);
    resolveComment();
  }

  function resolveComment() {
    var card = $('#pcard');
    if (card) card.classList.add('resolved');
    setTimeout(function () { $('#app').classList.remove('panel-open'); }, 460);
  }

  /* The visitor decided. The theatre stops; they hold the pen. */
  function finish(kind) {
    token++;
    state = 'done';
    if (kind === 'accept') {
      applyAccept();
    } else {
      $('#p2').textContent = ORIGINAL;
      var bar = $('.sug-bar');
      if (bar) bar.setAttribute('data-beat', '');
    }
    var doc = $('#doc');
    doc.setAttribute('contenteditable', 'true');
    doc.setAttribute('spellcheck', 'false');
    var replay = $('.dreplay');
    if (replay) replay.hidden = false;
    var hint = $('.foot-hint');
    if (hint) hint.hidden = false;
  }

  /* One delegated listener survives every innerHTML restore. */
  demo.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (btn) {
      if (btn.classList.contains('ok') && state === 'review') return finish('accept');
      if (btn.classList.contains('rej') && state === 'review') return finish('reject');
      if (btn.dataset.act === 'resolve') return resolveComment();
      if (btn.classList.contains('dreplay')) {
        token++;
        demo.innerHTML = initialHTML;
        state = 'idle';
        playFrom(reduced ? 3 : 0);
        return;
      }
      if (btn.classList.contains('dstep')) {
        /* After 'done' the column may hold the visitor's own edits — a
           chapter jump starts from the pristine markup, not on top of them. */
        if (state === 'done') { token++; demo.innerHTML = initialHTML; }
        playFrom(reduced ? 3 : Number(btn.dataset.ch || 0));
        return;
      }
    }
    /* A click on the window mid-play skips to the part that waits for you. */
    if (state === 'running' && e.target.closest('.app')) playFrom(3);
  });

  /* Snap to beat zero before first paint, then play when the window is
     actually on screen. */
  if (reduced) {
    playFrom(3);
  } else {
    applyThrough(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && state === 'idle') {
          io.disconnect();
          playFrom(0);
        }
      });
    }, { threshold: 0.4 });
    io.observe($('#app'));
  }
})();
