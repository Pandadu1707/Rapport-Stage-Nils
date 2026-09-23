/* SEEDERS — interactions (vanilla JS, no dependencies, no tracking) */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) {
      closeMenu();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Active section in nav ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav a[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Language switcher ---------- */
  var langSwitcher = document.querySelector('.lang-switcher');
  if (langSwitcher) {
    var langToggle = langSwitcher.querySelector('.lang-toggle');

    function closeLang() {
      langSwitcher.classList.remove('is-open');
      langToggle.setAttribute('aria-expanded', 'false');
    }

    langToggle.addEventListener('click', function () {
      var open = langSwitcher.classList.toggle('is-open');
      langToggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', function (e) {
      if (langSwitcher.classList.contains('is-open') && !e.target.closest('.lang-switcher')) {
        closeLang();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && langSwitcher.classList.contains('is-open')) {
        closeLang();
        langToggle.focus();
      }
    });
  }

  /* ---------- Prototype carousel ---------- */
  var carousel = document.querySelector('.carousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var cards = Array.prototype.slice.call(track.querySelectorAll('.carousel-card'));
    var dotsBox = carousel.querySelector('.carousel-dots');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var behavior = reduced ? 'auto' : 'smooth';

    var dots = cards.map(function (card, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Scene ' + (i + 1) + ' of ' + cards.length);
      dot.addEventListener('click', function () {
        track.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: behavior });
      });
      dotsBox.appendChild(dot);
      return dot;
    });

    function cardStep() {
      return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    }

    function currentIndex() {
      var i = Math.round(track.scrollLeft / cardStep());
      return Math.max(0, Math.min(cards.length - 1, i));
    }

    function goTo(i) {
      if (i >= cards.length) { i = 0; }
      if (i < 0) { i = cards.length - 1; }
      track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: behavior });
    }

    /* the track hits its scroll limit before the last card reaches the left
       edge on wide screens, so wrap on the actual scroll bounds */
    function atEnd() { return track.scrollLeft >= track.scrollWidth - track.clientWidth - 4; }
    function atStart() { return track.scrollLeft <= 4; }

    function stepForward() {
      if (atEnd()) { goTo(0); } else { goTo(currentIndex() + 1); }
    }
    function stepBack() {
      if (atStart()) {
        track.scrollTo({ left: track.scrollWidth, behavior: behavior });
      } else {
        goTo(currentIndex() - 1);
      }
    }

    Array.prototype.slice.call(carousel.querySelectorAll('.carousel-btn')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (Number(btn.getAttribute('data-dir')) > 0) { stepForward(); } else { stepBack(); }
        restartAutoplay();
      });
    });

    function syncDots() {
      var i = atEnd() ? cards.length - 1 : currentIndex();
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
    }
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(syncDots);
    }, { passive: true });
    syncDots();

    /* Auto-advance right-to-left, looping back to the first scene */
    var autoplayId = null;
    function stopAutoplay() {
      if (autoplayId) { window.clearInterval(autoplayId); autoplayId = null; }
    }
    function startAutoplay() {
      if (reduced || autoplayId) { return; }
      autoplayId = window.setInterval(stepForward, 5000);
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    carousel.addEventListener('pointerenter', stopAutoplay);
    carousel.addEventListener('pointerleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    track.addEventListener('touchstart', stopAutoplay, { passive: true });
    track.addEventListener('touchend', function () {
      window.setTimeout(startAutoplay, 4000);
    }, { passive: true });
    startAutoplay();
  }

  /* ---------- Click-to-load video (no third-party request before play) ---------- */
  var videoFrame = document.querySelector('.video-frame');
  if (videoFrame) {
    videoFrame.querySelector('.video-poster').addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' +
        videoFrame.getAttribute('data-video-id') + '?autoplay=1&rel=0';
      iframe.title = videoFrame.getAttribute('data-video-title') || 'Seeders video';
      iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      /* YouTube's player requires a referrer (error 153 without one) */
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      videoFrame.innerHTML = '';
      videoFrame.appendChild(iframe);
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
