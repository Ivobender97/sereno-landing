/* ============================================================
   SERENO — home v3 interactions
   3D phones are built here (plates = the body's thickness).
   One rAF scroll handler drives the sticky sections; loops pause
   off-screen; reduced motion turns them off.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var I18N = window.SERENO_I18N || {};
  var supported = ['en', 'it', 'es'];
  var lang = 'en';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function detectLang() {
    var saved = store('sereno-lang');
    if (saved && supported.indexOf(saved) > -1) return saved;
    var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported.indexOf(n) > -1 ? n : 'en';
  }
  function t(k) { var d = I18N[lang] || I18N.en || {}; return d[k] != null ? d[k] : ((I18N.en || {})[k] || ''); }

  /* text with ® as a small superscript, built with DOM nodes */
  function setText(el, str) {
    if (str.indexOf('®') === -1) { el.textContent = str; return; }
    el.textContent = '';
    str.split('®').forEach(function (part, i, arr) {
      if (part) el.appendChild(document.createTextNode(part));
      if (i < arr.length - 1) { var s = document.createElement('sup'); s.className = 'tm'; s.textContent = '®'; el.appendChild(s); }
    });
  }
  function mk(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  /* ---------------- 3D phone ---------------- */
  /* plates stacked in depth give the body a real edge when it turns;
     lighter in the middle, like a brushed metal band */
  function buildPhone(el) {
    var kids = Array.prototype.slice.call(el.childNodes);
    var n = el.classList.contains('p3--mini') ? 9 : 14;
    var body = document.createDocumentFragment();
    for (var k = 0; k < n; k++) {
      var tt = k / (n - 1) - 0.5;
      var p = mk('i', 'p3-plate');
      p.style.setProperty('--t', tt.toFixed(3));
      p.style.setProperty('--l', (22 + 34 * Math.pow(Math.cos(tt * Math.PI), 1.6)).toFixed(1) + '%');
      body.appendChild(p);
    }
    /* side keys: action + volume on the left, power on the right */
    [['left', 19, 4.5], ['left', 27, 8], ['left', 37, 8], ['right', 30, 12]].forEach(function (b) {
      [-0.18, 0, 0.18].forEach(function (z) {
        var key = mk('i', 'p3-key');
        key.style[b[0]] = 'calc(var(--w) * -.012)';
        key.style.top = b[1] + '%'; key.style.height = b[2] + '%';
        key.style.setProperty('--t', z);
        key.style.setProperty('--l', z === 0 ? '46%' : '30%');
        body.appendChild(key);
      });
    });
    var back = mk('div', 'p3-back');
    var cam = mk('div', 'p3-cam'); cam.appendChild(mk('i')); cam.appendChild(mk('i')); cam.appendChild(mk('i')); cam.appendChild(mk('b'));
    back.appendChild(cam);
    var logo = mk('img', 'p3-logo'); logo.src = 'assets/logo-192.png'; logo.alt = ''; logo.loading = 'lazy'; logo.width = 96; logo.height = 96;
    back.appendChild(logo);
    body.appendChild(back);
    var front = mk('div', 'p3-front'), screen = mk('div', 'p3-screen');
    var src = el.getAttribute('data-src');
    if (src) {
      var img = mk('img'); img.src = src; img.alt = el.getAttribute('data-alt') || ''; img.width = 640; img.height = 1385;
      if (el.hasAttribute('data-eager')) img.setAttribute('fetchpriority', 'high'); else img.loading = 'lazy';
      screen.appendChild(img);
    }
    kids.forEach(function (c) { screen.appendChild(c); });
    screen.appendChild(mk('i', 'p3-island'));
    screen.appendChild(mk('i', 'p3-glare'));
    front.appendChild(screen);
    body.appendChild(front);
    el.textContent = '';
    el.appendChild(body);
  }
  $$('.p3').forEach(buildPhone);

  /* ---------------- conditions marquee ---------------- */
  var CONDS = ['diabetes', 'epilepsy', 'kidney_disease', 'heart_disease', 'cancer', 'gi_lymphoma', 'hyperthyroidism', 'cushings', 'addisons', 'hypothyroidism', 'arthritis', 'cognitive_dysfunction', 'senior', 'ibd', 'pancreatitis', 'epi', 'megaesophagus', 'feline_asthma', 'imha', 'felv', 'myasthenia_gravis', 'allergies', 'anxiety'];
  function condLabel(c) { return t('cond.' + c) || t('v2.cond.' + c) || c; }
  function buildMarquee() {
    var a = $('#marqueeA'), b = $('#marqueeB'); if (!a || !b) return;
    var half = Math.ceil(CONDS.length / 2);
    function fill(el, list) {
      el.textContent = '';
      for (var r = 0; r < 2; r++) list.forEach(function (c) { var s = document.createElement('span'); s.textContent = condLabel(c); el.appendChild(s); });
    }
    fill(a, CONDS.slice(0, half).concat(CONDS.slice(0, half)));
    fill(b, CONDS.slice(half).concat(CONDS.slice(half)));
  }

  /* ---------------- i18n apply ---------------- */
  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v) setText(el, v);
    });
    var GUIDES = { it: '/guida/guida-sereno', en: '/guida/sereno-guide', es: '/guida/guia-sereno' };
    $$('[data-guide-link]').forEach(function (a) { a.setAttribute('href', GUIDES[l] || GUIDES.en); });
    store('sereno-lang', l);
    $$('[data-lang]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-lang') === l); });
    var cur = $('#langCurrent'); if (cur) cur.textContent = l.toUpperCase();
    buildHeroTitle(t('hero.title'));
    buildTypo(t('type.line'));
    buildMarquee();
    buildCmp();
    updatePrices();
    measureSparks();
  }

  function buildHeroTitle(text) {
    var h = $('#heroTitle'); if (!h || !text) return;
    h.textContent = '';
    var words = text.split(' ');
    words.forEach(function (w, i) {
      var word = document.createElement('span');
      word.className = 'word' + (i === words.length - 1 ? ' accent' : '');
      var inner = document.createElement('span');
      setText(inner, w);
      inner.style.transitionDelay = (0.12 + i * 0.07) + 's';
      word.appendChild(inner);
      h.appendChild(word);
      h.appendChild(document.createTextNode(' '));
    });
  }

  var typoWords = [];
  function buildTypo(text) {
    var p = $('#typoLine'); if (!p || !text) return;
    p.textContent = '';
    var words = text.split(' ');
    typoWords = words.map(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w' + (i >= words.length - 2 ? ' hl' : '');
      s.textContent = w;
      p.appendChild(s); p.appendChild(document.createTextNode(' '));
      return s;
    });
    if (reduce) typoWords.forEach(function (w) { w.classList.add('on'); });
  }

  /* ---------------- pricing ---------------- */
  var billing = 'monthly';
  var SAVE = { plus: '35%', pro: '34%' };
  function updatePrices() {
    var yearly = billing === 'yearly';
    var suf = yearly ? t('price.yr') : t('price.mo');
    var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
    set('plusPrice', t(yearly ? 'p1.priceYr' : 'p1.priceMo'));
    set('proPrice', t(yearly ? 'p2.priceYr' : 'p2.priceMo'));
    set('plusUnit', suf); set('proUnit', suf);
    set('plusSave', yearly ? (t('price.save') || 'Save') + ' ' + SAVE.plus : '');
    set('proSave', yearly ? (t('price.save') || 'Save') + ' ' + SAVE.pro : '');
    /* the 7-day free trial exists on the yearly plan only */
    set('plusCta', yearly ? t('p1.cta') : (t('p1.ctaMo') || t('p1.cta')));
    set('proCta', yearly ? t('p2.cta') : (t('p2.ctaMo') || t('p2.cta')));
    var tn = $('#trialNote'); if (tn) tn.classList.toggle('show', yearly);
    $$('.bill').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-bill') === billing); });
    movePill();
  }
  function movePill() {
    var on = $('.bill.on'), pill = $('.bill-pill'); if (!on || !pill) return;
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + (on.offsetLeft - 5) + 'px)';
  }
  $$('.bill').forEach(function (b) { b.addEventListener('click', function () { billing = b.getAttribute('data-bill'); updatePrices(); }); });

  /* comparison table — same rows and limits as the current site */
  var Y = 'Y', N = 'N', U = 'U', L = 'L';
  var CMP = [
    ['cmp.gCore'],
    ['cmp.r1', Y, Y, Y], ['cmp.r2', Y, Y, Y], ['cmp.r3', Y, Y, Y], ['cmp.r4', Y, Y, Y], ['cmp.r5', Y, Y, Y], ['cmp.r6', Y, Y, Y], ['cmp.r19', Y, Y, Y], ['cmp.r20', Y, Y, Y], ['cmp.r21', Y, Y, Y],
    ['cmp.gLimits'],
    ['cmp.r7', '1', '3', '10'], ['cmp.r26', L, L, L], ['cmp.r8', '2', '10', U], ['cmp.r9', '5', '25', U], ['cmp.r25', '3', '25', U], ['cmp.r10', '1', '2', U], ['cmp.r11', '1', '5', U], ['cmp.r22', '1', U, U], ['cmp.r12', N, Y, Y],
    ['cmp.gPlus'],
    ['cmp.r13', N, Y, Y], ['cmp.r14', N, Y, Y],
    ['cmp.gPro'],
    ['cmp.r24', N, N, Y], ['cmp.r15', N, N, Y], ['cmp.r16', N, N, Y], ['cmp.r17', N, N, Y], ['cmp.r23', N, N, U]
  ];
  function buildCmp() {
    var box = $('#cmpTable'); if (!box) return;
    box.textContent = '';
    var head = document.createElement('div'); head.className = 'cmp-row head';
    ['', t('p0.name'), t('p1.name'), t('p2.name')].forEach(function (x, i) { var d = document.createElement('div'); d.textContent = x; if (i === 2) d.className = 'plus'; head.appendChild(d); });
    box.appendChild(head);
    CMP.forEach(function (r) {
      if (r.length === 1) { var g = document.createElement('div'); g.className = 'cmp-grp'; g.textContent = t(r[0]); box.appendChild(g); return; }
      var row = document.createElement('div'); row.className = 'cmp-row';
      var f = document.createElement('div'); f.textContent = t(r[0]); row.appendChild(f);
      for (var i = 1; i < 4; i++) {
        var c = document.createElement('div'); if (i === 2) c.className = 'plus';
        var v = r[i];
        if (v === Y) { var s = document.createElement('span'); s.className = 'ck'; c.appendChild(s); }
        else if (v === N) { var n = document.createElement('span'); n.className = 'no'; n.textContent = '—'; c.appendChild(n); }
        else if (v === U) c.textContent = t('cmp.unlimited');
        else if (v === L) c.textContent = t('cmp.noLimit');
        else c.textContent = v;
        row.appendChild(c);
      }
      box.appendChild(row);
    });
  }

  function measureSparks() {
    $$('.spark-line').forEach(function (p) { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2); } catch (e) {} });
  }

  /* ---------------- nav, language, menu ---------------- */
  var nav = $('#nav'), langWrap = $('.lang');
  if (langWrap) {
    $('.lang-btn').addEventListener('click', function (e) { e.stopPropagation(); langWrap.classList.toggle('open'); });
    document.addEventListener('click', function () { langWrap.classList.remove('open'); });
  }
  function closeMenu() { if (nav) nav.classList.remove('menu-open'); }
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); if (langWrap) langWrap.classList.remove('open'); closeMenu(); }); });
  var burger = $('#navBurger');
  if (burger) burger.addEventListener('click', function (e) { e.stopPropagation(); nav.classList.toggle('menu-open'); });
  $$('#navMobile a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('click', function (e) { if (nav && nav.classList.contains('menu-open') && !e.target.closest('.nav')) closeMenu(); });

  /* ---------------- reveal ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px 6% 0px' });
  $$('.reveal').forEach(function (el) {
    var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
    if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(sib, 4) * 60 + 'ms');
    io.observe(el);
  });
  $$('.b-chart').forEach(function (el) { io.observe(el.closest('.bcard')); });

  function watch(el, on, off, th) {
    if (!el) return;
    new IntersectionObserver(function (en) { en.forEach(function (x) { x.isIntersecting ? on() : (off && off()); }); }, { threshold: th || 0.25 }).observe(el);
  }

  /* family demo loop: Marco taps, the dot travels, your phone gets the notification */
  var fam = $('#famDemo'), famTimer = null;
  function famCycle() {
    fam.classList.remove('go', 'tap');
    setTimeout(function () { fam.classList.add('tap'); }, 900);
    setTimeout(function () { fam.classList.add('go'); }, 1100);
  }
  watch(fam, function () {
    if (!fam || famTimer) return;
    if (reduce) { fam.classList.add('go'); return; }
    famCycle(); famTimer = setInterval(famCycle, 5200);
  }, function () { if (famTimer) { clearInterval(famTimer); famTimer = null; } }, 0.35);

  /* running timers */
  var timers = [[$('#liveTimer'), 42], [$('.story-timer'), 78]];
  if (!reduce) setInterval(function () {
    timers.forEach(function (x) {
      if (!x[0]) return;
      x[1] = x[1] >= 299 ? 0 : x[1] + 1;
      x[0].textContent = ('0' + Math.floor(x[1] / 60)).slice(-2) + ':' + ('0' + x[1] % 60).slice(-2);
    });
  }, 1000);

  /* stories: duplicate the row so the marquee loops seamlessly */
  var row = $('#storiesRow');
  if (row) {
    $$('.story', row).forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });
    row.addEventListener('touchstart', function () { row.classList.toggle('paused'); }, { passive: true });
  }

  /* bento: light follows the pointer */
  if (fine) $$('.bcard').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------------- hero ---------------- */
  var hero = $('.hero'), heroTilt = $('#heroTilt'), visual = $('#heroVisual');
  /* plain timeout, not rAF: rAF is paused in hidden tabs */
  setTimeout(function () { if (hero) hero.classList.add('lit'); }, 120);
  function setTilt(el, rx, ry) {
    el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    /* the glare slides across the glass as the phone turns */
    var g = el.querySelector('.p3-glare'); if (g) g.style.setProperty('--gx', (40 + ry * 2.2).toFixed(1) + '%');
  }
  if (heroTilt && visual && fine && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = visual.getBoundingClientRect();
      var x = clamp((e.clientX - r.left) / r.width - 0.5, -0.8, 0.8), y = clamp((e.clientY - r.top) / r.height - 0.5, -0.8, 0.8);
      setTilt(heroTilt, 7 - y * 14, -22 + x * 34);
    });
    hero.addEventListener('pointerleave', function () { setTilt(heroTilt, 7, -22); });
  }

  /* ---------------- scroll-driven sections ---------------- */
  var storyTrack = $('#storyTrack'), storyStage = $('#storyStage'), storyTilt = $('#storyTilt');
  var steps = $$('.sstep'), scrs = $$('#storyPhone .scr'), scards = $$('.scard'), rails = $$('.story-rail button');
  var STORY_C = steps.map(function (s) { return s.style.getPropertyValue('--c'); });
  var storySpin = $('#storySpin'), storyIdx = -1, scrTimer = null, spinTurns = 0;
  function showScreen(i) { scrs.forEach(function (s, k) { s.classList.toggle('on', k <= i); }); }
  function setStory(i, dir) {
    if (i === storyIdx) return;
    var first = storyIdx < 0;
    if (!first) spinTurns -= (dir || (i > storyIdx ? 1 : -1));
    storyIdx = i;
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); });
    scards.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    if (storyStage) storyStage.style.setProperty('--c', STORY_C[i]);
    /* a full turn per chapter: the new screen goes in while the back is showing */
    if (storySpin && !reduce) storySpin.style.transform = 'rotateY(' + (spinTurns * 360) + 'deg)';
    clearTimeout(scrTimer);
    if (first || reduce) showScreen(i);
    else scrTimer = setTimeout(function () { showScreen(i); }, 380);
  }
  setStory(0);

  /* phones and tablets: the chapters change by swiping the phone sideways
     (or with the arrows and the rail); it also moves on by itself every few
     seconds until the visitor touches it. Computers keep the scroll version. */
  var swipeMQ = window.matchMedia ? matchMedia('(max-width:999px)') : { matches: false };
  function swipeMode() { return swipeMQ.matches; }
  var storyUser = false, storyAuto = null;
  function paintRails() { rails.forEach(function (r, k) { r.style.setProperty('--f', k <= storyIdx ? 1 : 0); }); }
  function goStory(i, dir) {
    var n = steps.length;
    setStory((i + n) % n, dir);
    paintRails();
  }
  function userTook() { storyUser = true; if (storyAuto) { clearInterval(storyAuto); storyAuto = null; } if (storyStage) storyStage.classList.add('touched'); }
  $$('.story-arrow').forEach(function (b) {
    b.addEventListener('click', function () { userTook(); var d = b.classList.contains('next') ? 1 : -1; goStory(storyIdx + d, d); });
  });
  rails.forEach(function (r, k) {
    r.addEventListener('click', function () {
      if (swipeMode()) { userTook(); goStory(k, k > storyIdx ? 1 : -1); return; }
      /* computers: jump the scroll to the middle of that chapter */
      var top = storyTrack.getBoundingClientRect().top + scrollY;
      window.scrollTo({ top: top + (storyTrack.offsetHeight - innerHeight) * (k + 0.5) / steps.length, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  if (storyStage) {
    var sx = 0, sy = 0, sdx = 0, sdir = 0; /* sdir: 0 undecided, 1 sideways, -1 vertical */
    storyStage.addEventListener('touchstart', function (e) {
      if (!swipeMode()) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; sdx = 0; sdir = 0;
    }, { passive: true });
    storyStage.addEventListener('touchmove', function (e) {
      if (!swipeMode() || sdir === -1) return;
      var dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (!sdir && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) sdir = Math.abs(dx) > Math.abs(dy) ? 1 : -1;
      if (sdir !== 1) return;
      sdx = dx;
      /* the phone follows the finger */
      if (storyTilt && !reduce) { storyTilt.classList.add('dragging'); setTilt(storyTilt, 6, -22 + clamp(dx * 0.35, -70, 70)); }
    }, { passive: true });
    storyStage.addEventListener('touchend', function () {
      if (!swipeMode()) return;
      if (storyTilt) { storyTilt.classList.remove('dragging'); setTilt(storyTilt, 6, -22); }
      if (sdir === 1 && Math.abs(sdx) > 45) { userTook(); var d = sdx < 0 ? 1 : -1; goStory(storyIdx + d, d); }
      sdir = 0; sdx = 0;
    }, { passive: true });
  }
  watch(storyStage, function () {
    if (!swipeMode() || reduce || storyUser || storyAuto) return;
    storyAuto = setInterval(function () { if (swipeMode() && !storyUser) goStory(storyIdx + 1, 1); }, 4200);
  }, function () { if (storyAuto) { clearInterval(storyAuto); storyAuto = null; } }, 0.5);
  function enterMode() { if (swipeMode()) { paintRails(); if (storyTilt) setTilt(storyTilt, 6, -22); } }
  if (swipeMQ.addEventListener) swipeMQ.addEventListener('change', function () { enterMode(); onScroll(); });
  enterMode();

  var repTrack = $('#repTrack'), repStage = $('#reportStage');
  var caps = $$('.caps i'), scrubs = $$('.scrub');
  var joySec = $('#joy'), joyRow = $('#joyRow'), lifeTl = $('#lifeTl'), lifeNodes = $$('.tl-node');
  watch(joySec, function () { joySec.classList.add('is-on'); }, null, 0.15);
  function progress(track) {
    var r = track.getBoundingClientRect(), span = r.height - innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  }

  var bar = $('#progressBar'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 20);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (reduce) return;

    /* hero: capsules drift at different depths; on touch the phone turns with the scroll */
    if (y < innerHeight * 1.3) {
      caps.forEach(function (c) { c.style.setProperty('--py', (-y * 0.6) + 'px'); });
      if (heroTilt && !fine) { var p = y / innerHeight; setTilt(heroTilt, 7 + p * 12, -22 + p * 40); }
    }

    /* questions and the answer light up as they cross the lower third */
    var line = innerHeight * 0.72;
    scrubs.forEach(function (s) { s.classList.toggle('on', s.getBoundingClientRect().top < line); });

    /* story: chapter from progress, the phone swings a little inside each one */
    if (storyTrack && !swipeMode()) {
      var sp = progress(storyTrack), n = steps.length, f = sp * n;
      setStory(Math.min(n - 1, Math.floor(f)));
      rails.forEach(function (r, k) { r.style.setProperty('--f', clamp(f - k, 0, 1).toFixed(3)); });
      storyStage.classList.toggle('start', sp < 0.04);
      if (storyTilt) {
        var local = f - Math.floor(f);
        setTilt(storyTilt, 6 + Math.sin(sp * Math.PI) * 4, -26 + Math.sin(local * Math.PI) * 30);
      }
    }

    /* report: one number (0→1) and CSS does the rest */
    if (repTrack) repStage.style.setProperty('--p', progress(repTrack).toFixed(4));

    /* joy: the row slides sideways while the section crosses the screen */
    if (joyRow) {
      var jr = joySec.getBoundingClientRect();
      if (jr.bottom > 0 && jr.top < innerHeight) {
        var jp = clamp((innerHeight - jr.top) / (innerHeight + jr.height), 0, 1);
        var jt = clamp((jp - 0.18) / 0.64, 0, 1);
        var span = Math.max(0, joyRow.scrollWidth - document.documentElement.clientWidth);
        joyRow.style.setProperty('--jx', (-span * jt).toFixed(1) + 'px');
        joyRow.style.setProperty('--jp', ((jt - 0.5) * 36).toFixed(1) + 'px');
      }
    }

    /* life stages: the line grows down (or across) and each stage lights up when reached */
    if (lifeTl) {
      var lr = lifeTl.getBoundingClientRect(), wide = innerWidth >= 1000;
      var lp = clamp((innerHeight * 0.72 - lr.top) / (wide ? innerHeight * 0.35 : lr.height * 0.8), 0, 1);
      lifeTl.style.setProperty('--lp', lp.toFixed(3));
      lifeNodes.forEach(function (n, k) {
        var at = wide ? k / (lifeNodes.length - 1) * 0.9 : (n.offsetTop + 30) / lifeTl.offsetHeight;
        n.classList.toggle('on', lp >= at - 0.02);
      });
    }

    /* closing line, word by word */
    if (typoWords.length) {
      var mid = innerHeight * 0.62;
      typoWords.forEach(function (w) { w.classList.toggle('on', w.getBoundingClientRect().top < mid); });
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { movePill(); onScroll(); });

  if (reduce) {
    scrubs.forEach(function (s) { s.classList.add('on'); });
    lifeNodes.forEach(function (n) { n.classList.add('on'); });
    if (joySec) joySec.classList.add('is-on');
    if (repStage) repStage.style.setProperty('--p', 1);
  }
  applyLang(detectLang());
  onScroll();
})();
