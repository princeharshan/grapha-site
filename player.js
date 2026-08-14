/* The demo player.
 *
 * The browser's own controls are a different product's design language sitting
 * inside a portrait of ours, and they differ per browser — so the one element
 * the page is built around would look different to every second visitor. These
 * are ours: same type, same easing, same focus ring as the rest of the page.
 *
 * Everything here is progressive, and in the only direction that survives a
 * script that never parses: the markup ships WITH `controls`, and this file
 * takes them away as its first act. The cover and the bar are hidden until
 * the `js` root class says a script ran. So the failure mode is the browser's
 * own player — plain, but a working demo.
 */
(function () {
  'use strict';

  var vid = document.getElementById('vid');
  var film = document.getElementById('vfilm');
  if (!vid || !film) return;

  var frame = document.getElementById('vframe');
  var cover = document.getElementById('vcover');
  var bar = document.getElementById('vbar');
  var playBtn = document.getElementById('vplay');
  var muteBtn = document.getElementById('vmute');
  var fullBtn = document.getElementById('vfull');
  var seek = document.getElementById('vseek');
  var fill = document.getElementById('vfill');
  var buf = document.getElementById('vbuf');
  var knob = document.getElementById('vknob');
  var nowEl = document.getElementById('vnow');
  var durEl = document.getElementById('vdur');

  var HIDE_AFTER = 2400;   // ms of stillness before the bar gets out of the way
  var hideTimer = null;
  var scrubbing = false;

  film.controls = false;   // ours from here; the attribute was the fallback

  /* ── Small helpers ──────────────────────────────────────────────────── */

  function clock(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60);
    var r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function spoken(s, d) {
    return clock(s) + ' of ' + clock(d);
  }

  function duration() {
    return isFinite(film.duration) && film.duration > 0 ? film.duration : 157.2;
  }

  /* ── Showing and hiding the bar ─────────────────────────────────────── */

  /* The bar is present while paused, while the pointer is on the film, and
     while anything inside it holds focus. It only leaves during playback, and
     only after a stretch of genuine stillness. */
  function show() {
    vid.classList.add('is-showing');
    clearTimeout(hideTimer);
    if (!film.paused && !scrubbing) hideTimer = setTimeout(hide, HIDE_AFTER);
  }

  function hide() {
    if (film.paused || scrubbing) return;
    if (bar.contains(document.activeElement)) return;   // never steal focus's home
    vid.classList.remove('is-showing');
  }

  /* ── Transport ──────────────────────────────────────────────────────── */

  function start() {
    vid.classList.add('is-live');
    film.play().catch(function () {
      /* A refused play (an autoplay policy we did not trip, a codec the
         browser will not take) must not leave a dead cover over a dead film:
         hand the visitor the browser's controls and get out of the way. */
      film.controls = true;
    });
  }

  function toggle() {
    if (!vid.classList.contains('is-live')) return start();
    if (film.paused) film.play(); else film.pause();
  }

  function nudge(by) {
    film.currentTime = Math.max(0, Math.min(duration(), film.currentTime + by));
    show();
  }

  /* ── Painting the scrubber ──────────────────────────────────────────── */

  /* scaleX on a full-width child, so the browser animates a transform rather
     than re-laying-out a width four times a second. */
  function paint() {
    var d = duration();
    var t = Math.max(0, Math.min(d, film.currentTime));
    var p = d ? t / d : 0;

    fill.style.transform = 'scaleX(' + p + ')';
    knob.style.left = (p * 100) + '%';
    nowEl.textContent = clock(t);
    seek.setAttribute('aria-valuenow', Math.round(t));
    seek.setAttribute('aria-valuetext', spoken(t, d));

    if (film.buffered && film.buffered.length) {
      var end = film.buffered.end(film.buffered.length - 1);
      buf.style.transform = 'scaleX(' + (d ? Math.min(1, end / d) : 0) + ')';
    }
  }

  function seekToEvent(e) {
    var box = seek.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - box.left;
    var p = box.width ? Math.max(0, Math.min(1, x / box.width)) : 0;
    film.currentTime = p * duration();
    paint();
  }

  /* ── Wiring ─────────────────────────────────────────────────────────── */

  cover.addEventListener('click', start);
  playBtn.addEventListener('click', toggle);

  muteBtn.addEventListener('click', function () {
    film.muted = !film.muted;
    vid.classList.toggle('is-muted', film.muted);
    muteBtn.setAttribute('aria-label', film.muted ? 'Unmute' : 'Mute');
    show();
  });

  fullBtn.addEventListener('click', function () {
    var doc = document;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
    } else if (frame.requestFullscreen) {
      frame.requestFullscreen();
    } else if (frame.webkitRequestFullscreen) {
      frame.webkitRequestFullscreen();
    } else if (film.webkitEnterFullscreen) {
      film.webkitEnterFullscreen();       // iPhone: only the film may go full
    }
  });

  function fullChanged() {
    var on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    vid.classList.toggle('is-full', on);
    fullBtn.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
    show();
  }
  document.addEventListener('fullscreenchange', fullChanged);
  document.addEventListener('webkitfullscreenchange', fullChanged);

  film.addEventListener('play', function () {
    vid.classList.add('is-live', 'is-playing');
    playBtn.setAttribute('aria-label', 'Pause');
    show();
  });
  film.addEventListener('pause', function () {
    vid.classList.remove('is-playing');
    playBtn.setAttribute('aria-label', 'Play');
    show();
  });
  film.addEventListener('ended', function () {
    vid.classList.remove('is-playing');
    show();
  });
  film.addEventListener('timeupdate', paint);
  film.addEventListener('progress', paint);
  film.addEventListener('loadedmetadata', function () {
    var d = duration();
    durEl.textContent = clock(d);
    seek.setAttribute('aria-valuemax', Math.round(d));
    paint();
  });

  /* Clicking the picture itself is the oldest play/pause gesture there is. */
  film.addEventListener('click', toggle);

  /* Pointer presence. `pointerleave` hides at once rather than waiting out the
     timer: the visitor has already left. */
  frame.addEventListener('pointermove', show);
  frame.addEventListener('pointerenter', show);
  frame.addEventListener('pointerleave', function () {
    clearTimeout(hideTimer);
    hide();
  });

  /* Focus keeps the bar up for as long as a keyboard is using it. */
  bar.addEventListener('focusin', show);
  bar.addEventListener('focusout', function () { hideTimer = setTimeout(hide, 600); });

  /* Scrubbing. Pointer capture means a drag that wanders off the track still
     belongs to the track until the button comes up. */
  seek.addEventListener('pointerdown', function (e) {
    scrubbing = true;
    seek.classList.add('is-held');
    seek.setPointerCapture(e.pointerId);
    seekToEvent(e);
    show();
  });
  seek.addEventListener('pointermove', function (e) {
    if (scrubbing) seekToEvent(e);
  });
  function endScrub(e) {
    if (!scrubbing) return;
    scrubbing = false;
    seek.classList.remove('is-held');
    if (e && e.pointerId != null && seek.hasPointerCapture(e.pointerId)) {
      seek.releasePointerCapture(e.pointerId);
    }
    show();
  }
  seek.addEventListener('pointerup', endScrub);
  seek.addEventListener('pointercancel', endScrub);

  /* The scrubber is a real slider, so it owns the keys a slider owns — and it
     stops each one HERE, which is what keeps the page-wide handler below from
     acting on the same press twice. Keys it does not own (m, f) fall through
     on purpose: a keyboard visitor holding the scrubber can still mute. */
  seek.addEventListener('keydown', function (e) {
    var step = e.shiftKey ? 10 : 5;
    var mine = true;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nudge(-step);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nudge(step);
    else if (e.key === 'Home') { film.currentTime = 0; paint(); }
    else if (e.key === 'End') { film.currentTime = duration(); paint(); }
    else if (e.key === ' ' || e.key === 'Enter') toggle();
    else mine = false;
    if (mine) { e.preventDefault(); e.stopPropagation(); }
  });

  /* Page-wide shortcuts, but only once the film is the thing being used, and
     never while the visitor is typing somewhere. */
  document.addEventListener('keydown', function (e) {
    if (!vid.classList.contains('is-live')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var el = document.activeElement;
    if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;

    var k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { toggle(); e.preventDefault(); }
    else if (k === 'arrowleft') { nudge(-5); e.preventDefault(); }
    else if (k === 'arrowright') { nudge(5); e.preventDefault(); }
    else if (k === 'j') { nudge(-10); e.preventDefault(); }
    else if (k === 'l') { nudge(10); e.preventDefault(); }
    else if (k === 'm') { muteBtn.click(); e.preventDefault(); }
    else if (k === 'f') { fullBtn.click(); e.preventDefault(); }
  });

  /* A film that has scrolled off screen should not keep talking. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (rows) {
      rows.forEach(function (row) {
        if (!row.isIntersecting && !film.paused) film.pause();
      });
    }, { threshold: 0.15 }).observe(frame);
  }

  durEl.textContent = clock(duration());
  paint();
})();
