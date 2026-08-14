/* The demo player.
 *
 * There are no controls. Not a bar that hides, not a bar that returns on
 * hover — none (owner, 2026-08-14). A visitor presses the cover once, and from
 * then on the film is the whole object: clicking it pauses, clicking it again
 * resumes. That is the oldest video gesture there is, and the only one nobody
 * needs told.
 *
 * The browser's own controls would be a different product's design language
 * sitting inside a portrait of ours, and they differ per browser, so the one
 * element the page is built around would look different to every second
 * visitor. This file takes them away as its first act.
 *
 * Everything here is progressive, and in the only direction that survives a
 * script that never parses: the markup ships WITH `controls`, and the cover is
 * hidden until the `js` root class says a script ran. So the failure mode is
 * the browser's own player — plain, but a working demo.
 */
(function () {
  'use strict';

  var vid = document.getElementById('vid');
  var film = document.getElementById('vfilm');
  if (!vid || !film) return;

  var frame = document.getElementById('vframe');
  var cover = document.getElementById('vcover');

  film.controls = false;   // ours from here; the attribute was the fallback

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

  cover.addEventListener('click', start);
  film.addEventListener('click', toggle);

  film.addEventListener('play', function () { vid.classList.add('is-live', 'is-playing'); });
  film.addEventListener('pause', function () { vid.classList.remove('is-playing'); });
  film.addEventListener('ended', function () { vid.classList.remove('is-playing'); });

  /* The keyboard reaches the cover, and after that the film has no focusable
     control left — so space and K stay, as the one way to pause without a
     mouse. Nothing else: a shortcut for a control that is not drawn is a
     secret, and secrets are not an interface. */
  document.addEventListener('keydown', function (e) {
    if (!vid.classList.contains('is-live')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var el = document.activeElement;
    if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;

    var k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { toggle(); e.preventDefault(); }
  });

  /* A film that has scrolled off screen should not keep talking. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (rows) {
      rows.forEach(function (row) {
        if (!row.isIntersecting && !film.paused) film.pause();
      });
    }, { threshold: 0.15 }).observe(frame);
  }
})();
