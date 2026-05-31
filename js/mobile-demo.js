/* ============================================================
   SERENO — mobile-only demo carousel
   On phones the pinned scrollytelling demo becomes a self-playing
   carousel: phones auto-advance, the matching step lights up, manual
   swipe is supported, and tapping a step jumps to its screen.
   ============================================================ */
(function () {
  'use strict';
  if (window.innerWidth > 720) return;

  var wrap = document.querySelector('.demo-screens');
  var screens = Array.prototype.slice.call(document.querySelectorAll('.dscreen'));
  var steps = Array.prototype.slice.call(document.querySelectorAll('.demo-step'));
  if (!wrap || screens.length < 2) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var idx = 0;
  var timer = null;
  var settleT = null;
  var holding = false;
  var animating = false;
  var rafId = null;

  function setActive(i) {
    idx = (i + screens.length) % screens.length;
    for (var k = 0; k < steps.length; k++) {
      steps[k].classList.toggle('on', k === idx);
    }
  }

  function centerOf(el) {
    return el.offsetLeft + el.clientWidth / 2;
  }

  function targetLeft(el) {
    var max = wrap.scrollWidth - wrap.clientWidth;
    var l = centerOf(el) - wrap.clientWidth / 2;
    return Math.max(0, Math.min(max, l));
  }

  /* rAF scroll tween — browser-native smooth scroll is unreliable
     when scroll-snap is mandatory, so we drive scrollLeft ourselves
     and switch snap off for the duration. */
  function animateTo(left, dur) {
    if (rafId) cancelAnimationFrame(rafId);
    var start = wrap.scrollLeft;
    var dist = left - start;
    if (Math.abs(dist) < 1) return;
    var t0 = performance.now();
    animating = true;
    wrap.style.scrollSnapType = 'none';
    function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      wrap.scrollLeft = start + dist * e;
      if (p < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        wrap.style.scrollSnapType = '';
        animating = false;
        rafId = null;
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function go(i, instant) {
    setActive(i);
    var left = targetLeft(screens[idx]);
    if (instant || reduce) {
      wrap.scrollLeft = left;
    } else {
      animateTo(left, 520);
    }
  }

  function start() {
    if (reduce || timer) return;
    timer = setInterval(function () {
      if (holding || animating || !inView()) return;
      go(idx + 1);
    }, 3000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function inView() {
    var r = wrap.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    return r.top < h * 0.85 && r.bottom > h * 0.15;
  }

  /* keep the active step in sync while the user swipes */
  wrap.addEventListener('scroll', function () {
    if (animating) return;
    holding = true;
    clearTimeout(settleT);
    settleT = setTimeout(function () {
      var mid = wrap.scrollLeft + wrap.clientWidth / 2;
      var best = 0, bd = Infinity;
      for (var k = 0; k < screens.length; k++) {
        var dd = Math.abs(centerOf(screens[k]) - mid);
        if (dd < bd) { bd = dd; best = k; }
      }
      setActive(best);
      holding = false;
    }, 450);
  }, { passive: true });

  /* tap a step → jump to its screen */
  steps.forEach(function (s, k) {
    s.addEventListener('click', function () {
      holding = true;
      go(k);
      setTimeout(function () { holding = false; }, 900);
    });
  });

  /* start the loop; the interval itself only advances while the
     carousel is actually on screen, so no observer is required */
  start();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  go(0, true);
})();


/* ============================================================
   SERENO — mobile-only "scattered notes → report" assembly
   The desktop scrubbed scatter is disabled on phones; here it
   plays once (rAF-driven) when the section scrolls into view.
   ============================================================ */
(function () {
  'use strict';
  if (window.innerWidth > 720) return;

  var pin = document.querySelector('.report-pin');
  var stage = document.querySelector('.report-stage');
  var scraps = Array.prototype.slice.call(document.querySelectorAll('.report-stage .scrap'));
  var card = document.querySelector('.report-card');
  var hint = document.querySelector('.report-hint');
  if (!pin || !stage || !card || scraps.length < 2) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var F = 0.34;          // shrink the desktop scatter to phone size
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fit = 1;           // scale so the (taller, richer) card fits the stage

  function measureFit() {
    var avail = stage.clientHeight - 12;
    var natural = card.offsetHeight || 1;
    fit = clamp(avail / natural, 0.6, 1);
  }

  // kill CSS transitions so we can drive every frame ourselves
  scraps.forEach(function (s) { s.style.transition = 'none'; });
  card.style.transition = 'none';
  card.classList.remove('show');

  function place(p) {
    // notes converge over the first ~68%, card fades in over the last half
    var f = clamp(p / 0.68, 0, 1);
    var e = 1 - Math.pow(1 - f, 3);
    scraps.forEach(function (s) {
      var x = (parseFloat(s.dataset.x) || 0) * F * (1 - e);
      var y = (parseFloat(s.dataset.y) || 0) * F * (1 - e);
      var r = (parseFloat(s.dataset.r) || 0) * (1 - e);
      var sc = 1 - 0.78 * e;
      s.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg) scale(' + sc + ')';
      s.style.opacity = clamp(1 - e * 1.15, 0, 1);
    });
    var cp = clamp((p - 0.5) / 0.42, 0, 1);
    card.style.opacity = cp;
    card.style.transform = 'translate(-50%,-50%) scale(' + (fit * (0.9 + 0.1 * cp)) + ')';
    if (hint) hint.style.opacity = p > 0.06 ? '0' : '1';
  }

  if (reduce) {
    scraps.forEach(function (s) { s.style.opacity = '0'; });
    card.style.opacity = '1';
    card.style.transform = 'translate(-50%,-50%) scale(1)';
    if (hint) hint.style.opacity = '0';
    return;
  }

  /* progress through the pinned scroll region (same model as desktop):
     section stays centred while the notes assemble, so the user always
     sees the scattered state first and controls the pace. */
  function progress() {
    var r = pin.getBoundingClientRect();
    var total = pin.offsetHeight - (window.innerHeight || document.documentElement.clientHeight);
    if (total <= 0) return 0;
    return clamp(-r.top / total, 0, 1);
  }

  var raf = null;
  function update() { raf = null; place(progress()); }
  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measureFit(); onScroll(); }, { passive: true });
  measureFit();
  update();
})();

