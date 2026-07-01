/* ============================================================
   SERENO — interactions
   Perf rules: IntersectionObserver for reveals; a single rAF
   loop drives the two pinned scroll sections; transform/opacity
   only. prefers-reduced-motion + mobile freeze respected.
   ============================================================ */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = function () { return window.innerWidth > 720; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- i18n ---------------- */
  var I18N = window.SERENO_I18N || {};
  var supported = ['en', 'it', 'es'];
  function detectLang() {
    var saved = localStorage.getItem('sereno-lang');
    if (saved && supported.indexOf(saved) > -1) return saved;
    var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported.indexOf(n) > -1 ? n : 'en';
  }
  var lang = detectLang();
  /* render text with the ® trademark mark shrunk to a superscript,
     using DOM nodes so no HTML escaping is needed */
  function setI18nText(el, str) {
    if (str.indexOf('®') === -1) { el.textContent = str; return; }
    el.textContent = '';
    var parts = str.split('®');
    parts.forEach(function (part, i) {
      if (part) el.appendChild(document.createTextNode(part));
      if (i < parts.length - 1) {
        var sup = document.createElement('sup');
        sup.className = 'tm';
        sup.textContent = '®';
        el.appendChild(sup);
      }
    });
  }
  function applyLang(l) {
    lang = l;
    var dict = I18N[l] || I18N.en;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (dict[k] != null) setI18nText(el, dict[k]);
    });
    localStorage.setItem('sereno-lang', l);
    $$('[data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === l);
    });
    var cur = $('#langCurrent');
    if (cur) cur.textContent = l.toUpperCase();
    buildHeroTitle(dict['hero.title'] || '');
    buildTypo(dict['type.line'] || '');
    // re-evaluate any dynamic price labels
    updatePriceLabels();
  }

  /* hero split-text — rebuilt per language, last word accented */
  function buildHeroTitle(text) {
    var h = document.getElementById('heroTitle');
    if (!h) return;
    h.innerHTML = '';
    var words = text.split(' ');
    words.forEach(function (w, i) {
      var word = document.createElement('span');
      word.className = 'word' + (i === words.length - 1 ? ' accent' : '');
      var inner = document.createElement('span');
      setI18nText(inner, w);
      inner.style.transitionDelay = (0.1 + i * 0.07) + 's';
      word.appendChild(inner);
      h.appendChild(word);
      h.appendChild(document.createTextNode(' '));
    });
  }

  /* typographic moment — rebuilt per language, last 2 words highlighted */
  var typoIO = null;
  function buildTypo(text) {
    var p = document.getElementById('typoLine');
    if (!p) return;
    if (typoIO) typoIO.disconnect();
    p.innerHTML = '';
    var words = text.split(' ');
    words.forEach(function (w, i) {
      var sp = document.createElement('span');
      sp.className = 'w' + (i >= words.length - 2 ? ' hl' : '');
      sp.textContent = w;
      p.appendChild(sp);
    });
    var ws = Array.prototype.slice.call(p.querySelectorAll('.w'));
    if (reduce) { ws.forEach(function (w) { w.classList.add('on'); }); return; }
    typoIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('on'); });
    }, { threshold: 1, rootMargin: '-32% 0px -32% 0px' });
    ws.forEach(function (w) { typoIO.observe(w); });
  }

  /* ---------------- Language switcher ---------------- */
  var langWrap = $('.lang');
  if (langWrap) {
    $('.lang-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      langWrap.classList.toggle('open');
    });
    document.addEventListener('click', function () { langWrap.classList.remove('open'); });
  }
  // bind every language button (desktop menu + mobile menu)
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyLang(b.dataset.lang);
      if (langWrap) langWrap.classList.remove('open');
      closeMobileNav();
    });
  });

  /* ---------------- Mobile hamburger menu ---------------- */
  var navEl = $('.nav'), burger = $('#navBurger'), navMobile = $('#navMobile');
  function closeMobileNav() { if (navEl) navEl.classList.remove('menu-open'); }
  if (burger) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      navEl.classList.toggle('menu-open');
    });
  }
  if (navMobile) {
    $$('a', navMobile).forEach(function (a) { a.addEventListener('click', closeMobileNav); });
  }
  document.addEventListener('click', function (e) {
    if (navEl && navEl.classList.contains('menu-open') && !e.target.closest('.nav')) closeMobileNav();
  });

  /* ---------------- Navbar scroll state ---------------- */
  var nav = $('.nav');
  function onNav() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  onNav();

  /* ---------------- Reveal on scroll ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .mask-reveal, .timeline').forEach(function (el, i) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d + 'ms');
    io.observe(el);
  });

  /* ---------------- Hero reveal trigger ---------------- */
  var hero = $('.hero');
  if (hero) {
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add('lit'); }, 90);
    });
  }

  /* ---------------- Image loading: shimmer + graceful fallback ---------------- */
  function markLoaded(img) {
    var p = img.parentElement;
    if (p) p.classList.add('is-loaded');
  }
  function failImage(img) {
    if (!img || img.dataset.failed) return;
    img.dataset.failed = '1';
    var p = img.parentElement;
    if (p) { p.classList.add('img-fail', 'is-loaded'); p.setAttribute('data-label', img.getAttribute('data-label') || ''); }
    img.style.opacity = '0';
  }
  $$('img.photo').forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) { markLoaded(img); return; }
    img.addEventListener('load', function () { markLoaded(img); });
    img.addEventListener('error', function () { failImage(img); });
    // Only fall back if the request HARD-FAILS (complete but zero size).
    // A slow/pending request (complete === false) is left alone so it can finish.
    setTimeout(function () {
      if (img.complete && img.naturalWidth === 0) failImage(img);
    }, 12000);
  });

  /* ---------------- Testimonial filters ---------------- */
  var filters = $('.filters');
  if (filters) {
    var pill = $('.filter-pill');
    var btns = $$('.filter', filters);
    function movePill(btn) {
      pill.style.left = btn.offsetLeft + 'px';
      pill.style.width = btn.offsetWidth + 'px';
    }
    function setFilter(btn) {
      btns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      movePill(btn);
      var f = btn.dataset.filter;
      $$('.tcard').forEach(function (c) {
        var show = f === 'all' || c.dataset.cat === f;
        c.classList.toggle('hide', !show);
      });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { setFilter(b); }); });
    requestAnimationFrame(function () { movePill($('.filter.active') || btns[0]); });
    window.addEventListener('resize', function () { movePill($('.filter.active') || btns[0]); });
  }

  /* ---------------- Pricing toggle ---------------- */
  var billing = 'monthly';
  var PRICES = {
    monthly: { plus: '$4.99', pro: '$9.99' },
    yearly: { plus: '$39', pro: '$79' }
  };
  var SAVE = { plus: '35%', pro: '34%' };
  function updatePriceLabels() {
    var dict = I18N[lang] || I18N.en;
    var suffix = billing === 'monthly' ? dict['price.mo'] : dict['price.yr'];
    var pp = $('#plusPrice'), ppu = $('#plusUnit'), op = $('#proPrice'), opu = $('#proUnit');
    if (pp) pp.textContent = PRICES[billing].plus;
    if (op) op.textContent = PRICES[billing].pro;
    if (ppu) ppu.textContent = suffix;
    if (opu) opu.textContent = suffix;
    var ps = $('#plusSave'), os = $('#proSave');
    var yearly = billing === 'yearly';
    var word = dict['price.save'] || 'Save';
    if (ps) { ps.textContent = yearly ? word + ' ' + SAVE.plus : ''; ps.style.display = yearly ? '' : 'none'; }
    if (os) { os.textContent = yearly ? word + ' ' + SAVE.pro : ''; os.style.display = yearly ? '' : 'none'; }
  }
  var sw = $('#billingSwitch');
  if (sw) {
    sw.addEventListener('click', function () {
      billing = billing === 'monthly' ? 'yearly' : 'monthly';
      sw.classList.toggle('yr', billing === 'yearly');
      $('#lblMonthly').classList.toggle('on', billing === 'monthly');
      $('#lblYearly').classList.toggle('on', billing === 'yearly');
      $('#trialNote').style.opacity = billing === 'yearly' ? '1' : '0';
      updatePriceLabels();
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  $$('.faq-item').forEach(function (item) {
    var q = $('.faq-q', item), a = $('.faq-a', item);
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      $$('.faq-item').forEach(function (o) {
        o.classList.remove('open'); $('.faq-a', o).style.maxHeight = null;
      });
      if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------------- Feature comparison collapsible ---------------- */
  var cmpBtn = document.querySelector('.cmp-toggle');
  var cmpPanel = document.getElementById('cmpPanel');
  if (cmpBtn && cmpPanel) {
    // open by default; user can close it
    if (cmpBtn.getAttribute('aria-expanded') === 'true') cmpPanel.style.maxHeight = 'none';
    cmpPanel.addEventListener('transitionend', function () {
      if (cmpBtn.getAttribute('aria-expanded') === 'true') cmpPanel.style.maxHeight = 'none';
    });
    cmpBtn.addEventListener('click', function () {
      var open = cmpBtn.getAttribute('aria-expanded') === 'true';
      if (open) {
        cmpPanel.style.maxHeight = cmpPanel.scrollHeight + 'px';
        requestAnimationFrame(function () { cmpPanel.style.maxHeight = '0px'; });
        cmpBtn.setAttribute('aria-expanded', 'false');
      } else {
        cmpBtn.setAttribute('aria-expanded', 'true');
        cmpPanel.style.maxHeight = cmpPanel.scrollHeight + 'px';
      }
    });
    window.addEventListener('resize', function () {
      if (cmpBtn.getAttribute('aria-expanded') === 'true' && cmpPanel.style.maxHeight !== 'none') {
        cmpPanel.style.maxHeight = cmpPanel.scrollHeight + 'px';
      }
    });
  }

  /* ---------------- Stats count-up ---------------- */
  var statsDone = false;
  var statsEl = $('.stat-grid');
  if (statsEl) {
    var sio = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && !statsDone) {
        statsDone = true;
        $$('.stat-num').forEach(function (el) { countUp(el); });
        sio.disconnect();
      }
    }, { threshold: 0.4 });
    sio.observe(statsEl);
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.to);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var pre = el.dataset.pre || '';
    var suf = el.dataset.suf || '';
    if (reduce) { el.textContent = pre + target.toFixed(dec) + suf; return; }
    var start = performance.now(), dur = 1700;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      var v = target * e;
      el.textContent = pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suf;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = pre + (dec ? target.toFixed(dec) : Math.round(target).toLocaleString()) + suf;
    }
    requestAnimationFrame(tick);
  }


  /* ============================================================
     PINNED SCROLL SECTIONS — single rAF loop
     ============================================================ */
  var demoPin = $('.demo-pin');
  var demoSticky = $('.demo-sticky');
  var demoScreens = $$('.dscreen');
  var demoSteps = $$('.demo-step');

  // Tap a step to scroll to that screen (works whenever the section is pinned:
  // desktop + phones with motion enabled). Intuitive, never auto-playing.
  demoSteps.forEach(function (s, i) {
    s.addEventListener('click', function () {
      if (reduce || !demoPin || !demoSticky) return;
      if (getComputedStyle(demoSticky).position !== 'sticky') return;
      var total = demoPin.offsetHeight - window.innerHeight;
      if (total <= 1) return;
      var n = demoSteps.length;
      var target = demoPin.getBoundingClientRect().top + window.pageYOffset + (i / (n - 1)) * total;
      window.scrollTo({ top: Math.round(target), behavior: 'smooth' });
    });
  });

  var reportPin = $('.report-pin');
  var scraps = $$('.scrap');
  var reportCard = $('.report-card');
  var reportHint = $('.report-hint');

  // cache scattered transforms for scraps
  scraps.forEach(function (s) {
    s._x = parseFloat(s.dataset.x);
    s._y = parseFloat(s.dataset.y);
    s._r = parseFloat(s.dataset.r);
  });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function sectionProgress(pin) {
    // 0 when section top hits viewport top, 1 when bottom of pinned scroll reached
    var rect = pin.getBoundingClientRect();
    var total = pin.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function nearViewport(el) {
    // only drive scroll animation while the section is on/near screen
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > -h * 0.25 && r.top < h * 1.25;
  }

  function updateDemo(p) {
    var n = demoScreens.length;
    var prog = p * (n - 1);          // which phone is centered (0..n-1)
    demoScreens.forEach(function (sc, i) {
      var off = i - prog;            // 0 = centered, + = to the right, - = to the left
      var a = Math.abs(off);
      var tx = off * 56;             // % horizontal slide
      var rotY = off * -22;          // coverflow turn
      var tz = -Math.min(a, 2.2) * 130;
      var scl = 1 - Math.min(a, 2) * 0.13;
      var op = clamp(1.25 - a * 0.85, 0, 1);
      sc.style.transform = 'translateX(' + tx + '%) translateZ(' + tz + 'px) rotateY(' + rotY + 'deg) scale(' + scl + ')';
      sc.style.opacity = op;
      sc.style.zIndex = Math.round(100 - a * 10);
    });
    var active = clamp(Math.round(prog), 0, n - 1);
    demoSteps.forEach(function (s, i) { s.classList.toggle('on', i === active); });
  }

  function updateReport(p) {
    // Lead-in: hold the notes scattered & readable while the section pins,
    // THEN fly them together. Assembly runs from START→END of the scroll.
    var START = 0.24, END = 0.84;
    var f = clamp((p - START) / (END - START), 0, 1);
    var ease = 1 - Math.pow(1 - f, 3);
    scraps.forEach(function (s) {
      var tx = s._x * (1 - ease);
      var ty = s._y * (1 - ease);
      var rot = s._r * (1 - ease);
      var sc = 1 - 0.82 * ease;
      s.style.transform = 'translate(-50%,-50%) translate(' + tx + 'px,' + ty + 'px) rotate(' + rot + 'deg) scale(' + sc + ')';
      s.style.opacity = clamp(1 - ease * 1.15, 0, 1);
    });
    if (reportCard) reportCard.classList.toggle('show', p > 0.74);
    if (reportHint) reportHint.style.opacity = p > 0.14 ? '0' : '1';
  }

  function setStaticReport() {
    // mobile / reduced motion: show assembled card, hide scraps
    scraps.forEach(function (s) { s.style.opacity = '0'; });
    if (reportCard) reportCard.classList.add('show');
    if (reportHint) reportHint.style.opacity = '0';
  }

  /* desktop: scale the assembled card so it always fits the stage
     height (the richer report is tall; short laptops would clip it) */
  function measureReportFit() {
    if (!reportCard || !reportCard.parentElement) return;
    if (!isDesktop()) { reportCard.style.removeProperty('--rc-fit'); return; }
    var avail = reportCard.parentElement.clientHeight - 28;
    var natural = reportCard.offsetHeight || 1;
    var fit = Math.min(1, avail / natural);
    reportCard.style.setProperty('--rc-fit', fit.toFixed(3));
  }
  measureReportFit();
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measureReportFit); }
  window.addEventListener('load', measureReportFit);

  var ticking = false;
  function frame() {
    ticking = false;
    onNav();
    if (!reduce) {
      // demo coverflow is scroll-driven on every width (desktop, tablet, phone)
      if (demoPin && nearViewport(demoPin)) updateDemo(sectionProgress(demoPin));
      // report scatter→assemble stays desktop/tablet only
      if (isDesktop() && reportPin && nearViewport(reportPin)) updateReport(sectionProgress(reportPin));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    measureReportFit();
    if (!isDesktop() || reduce) { setStaticReport(); if (demoPin) updateDemo(0); }
    onScroll();
  });

  // init
  applyLang(lang);
  if (!isDesktop() || reduce) {
    setStaticReport();
    if (demoPin) updateDemo(0);
  } else {
    if (demoPin) updateDemo(0);
    if (reportPin) updateReport(0);
  }
  frame();

  /* --------- Attention pulse on store buttons when a CTA jumps to them --------- */
  (function () {
    function pulse(container) {
      if (!container) return;
      var btns = $$('.store', container);
      if (!btns.length) return;
      btns.forEach(function (b) { b.classList.remove('store-attn'); });
      void btns[0].offsetWidth; // force reflow so it can replay
      btns.forEach(function (b) { b.classList.add('store-attn'); });
    }
    document.addEventListener('animationend', function (e) {
      if (e.target.classList && e.target.classList.contains('store-attn')) {
        e.target.classList.remove('store-attn');
      }
    });
    document.addEventListener('click', function (e) {
      // top-of-page "Download the app" buttons: animate the hero store buttons in place, no scroll
      var dl = e.target.closest('.dl-hero');
      if (dl) {
        e.preventDefault();
        pulse(document.getElementById('download'));
        if (navEl) navEl.classList.remove('menu-open');
        return;
      }
      var a = e.target.closest('a[href="#get-app"]');
      if (!a) return;
      var target = document.getElementById('get-app');
      if (!target) return;
      var container = target.classList.contains('stores') ? target : $('.stores', target);
      // wait for the native smooth-scroll to land, then call attention
      setTimeout(function () { pulse(container); }, 620);
    });
  })();

  /* mobile menu (simple anchor scroll) handled by native links */
})();
