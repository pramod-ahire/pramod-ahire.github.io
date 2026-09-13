/**
 * Pramod Ahire — Portfolio
 *
 * Progressive enhancement only: every behaviour below is optional, and the page
 * remains fully readable with JavaScript disabled.
 */

(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'theme';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- Theme toggle ------------------------------------------------------ */

  /**
   * Persists the chosen theme so it survives navigation. The initial value is
   * applied by an inline script in <head> to avoid a flash of the wrong theme.
   */
  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;

      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (error) {
        /* Storage unavailable — the choice simply won't persist. */
      }
    });
  }

  /* -- Header shadow on scroll ------------------------------------------- */

  function initHeaderState() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var update = function () {
      header.dataset.scrolled = String(window.scrollY > 8);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* -- Reveal on scroll --------------------------------------------------- */

  /**
   * Fades blocks in as they enter the viewport. Elements are revealed
   * immediately when IntersectionObserver is unsupported or motion is reduced.
   */
  function initRevealOnScroll() {
    var targets = document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (element) { element.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    targets.forEach(function (element) { observer.observe(element); });
  }

  /* -- Navigation scroll-spy ---------------------------------------------- */

  /**
   * Marks the nav link whose section is currently closest to the top of the
   * viewport, giving the header a sense of place while scrolling.
   */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = new Set();

    var setCurrent = function (id) {
      links.forEach(function (link) {
        var isCurrent = link.getAttribute('href') === '#' + id;
        if (isCurrent) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      });

      // Of the sections on screen, the first in document order wins.
      var current = sections.find(function (section) { return visible.has(section.id); });
      if (current) setCurrent(current.id);
    }, { rootMargin: '-20% 0px -65% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* -- Footer year -------------------------------------------------------- */

  function initFooterYear() {
    var slot = document.getElementById('year');
    if (slot) slot.textContent = String(new Date().getFullYear());
  }

  /* -- Bootstrap ---------------------------------------------------------- */

  initThemeToggle();
  initHeaderState();
  initRevealOnScroll();
  initScrollSpy();
  initFooterYear();
})();
