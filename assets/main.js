/**
 * Pramod Ahire — Portfolio
 *
 * Progressive enhancement only. Every behaviour below is additive: with
 * JavaScript disabled the page still renders completely, and every animation is
 * skipped when the visitor prefers reduced motion.
 */

(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'theme';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- Small helpers ------------------------------------------------------ */

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /** Runs `callback` at most once per animation frame. */
  function onFrame(callback) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        callback();
      });
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* -- Theme toggle ------------------------------------------------------- */

  /**
   * Persists the chosen theme so it survives navigation. The initial value is
   * applied by an inline script in <head> to avoid a flash of the wrong theme.
   */
  function initThemeToggle() {
    var toggle = $('#theme-toggle');
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

  /* -- Scroll progress bar & header state --------------------------------- */

  function initScrollIndicators() {
    var header = $('#site-header');
    var progress = $('#progress');
    if (!header && !progress) return;

    var update = onFrame(function () {
      var scrolled = window.scrollY;

      if (header) header.dataset.scrolled = String(scrolled > 8);

      if (progress) {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = scrollable > 0 ? clamp(scrolled / scrollable, 0, 1) : 0;
        progress.style.setProperty('--progress', String(ratio));
      }
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  /* -- Reveal on scroll ---------------------------------------------------- */

  /**
   * Fades blocks in as they enter the viewport. Children marked
   * `data-stagger` inside a revealed block are delayed in sequence.
   */
  function initRevealOnScroll() {
    var targets = $$('[data-reveal]');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (element) { element.classList.add('is-visible'); });
      return;
    }

    // Stagger siblings by their index so a grid resolves row by row.
    $$('[data-stagger]').forEach(function (container) {
      var step = Number(container.dataset.stagger) || 70;
      $$(':scope > *', container).forEach(function (child, index) {
        child.style.setProperty('--delay', index * step + 'ms');
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    targets.forEach(function (element) { observer.observe(element); });
  }

  /* -- Count-up numbers ---------------------------------------------------- */

  /**
   * Animates `[data-count]` elements from zero to their target value the first
   * time they are scrolled into view. `data-decimals` controls precision and
   * `data-suffix` / `data-prefix` wrap the result.
   */
  function initCounters() {
    var counters = $$('[data-count]');
    if (!counters.length) return;

    var render = function (element, value) {
      var decimals = Number(element.dataset.decimals) || 0;
      element.textContent =
        (element.dataset.prefix || '') +
        value.toFixed(decimals) +
        (element.dataset.suffix || '');
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (element) { render(element, Number(element.dataset.count)); });
      return;
    }

    var DURATION = 1600;

    var run = function (element) {
      var target = Number(element.dataset.count);
      var started = null;

      var step = function (timestamp) {
        if (started === null) started = timestamp;
        var progress = clamp((timestamp - started) / DURATION, 0, 1);
        // Ease-out cubic, so the number decelerates into its final value.
        var eased = 1 - Math.pow(1 - progress, 3);

        render(element, target * eased);
        if (progress < 1) window.requestAnimationFrame(step);
      };

      window.requestAnimationFrame(step);
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (element) {
      render(element, 0);
      observer.observe(element);
    });
  }

  /* -- Career rail --------------------------------------------------------- */

  /** Draws the year rail and pops its stops in sequence once it is in view. */
  function initCareerRail() {
    var rail = $('#rail');
    if (!rail) return;

    $$('.stop', rail).forEach(function (stop, index) {
      stop.style.setProperty('--delay', 350 + index * 130 + 'ms');
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      rail.classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        rail.classList.add('is-visible');
        observer.disconnect();
      });
    }, { threshold: 0.35 });

    observer.observe(rail);
  }

  /* -- Timeline draw ------------------------------------------------------- */

  /**
   * Ties the experience timeline's accent line to scroll position, so it fills
   * downward as the section moves through the viewport.
   */
  function initTimelineDraw() {
    var timeline = $('#timeline');
    if (!timeline || prefersReducedMotion) return;

    var update = onFrame(function () {
      var rect = timeline.getBoundingClientRect();
      var start = window.innerHeight * 0.8;
      var distance = rect.height + start - window.innerHeight * 0.25;
      var drawn = clamp((start - rect.top) / distance, 0, 1);

      timeline.style.setProperty('--draw', String(drawn));
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  /* -- Card spotlight ------------------------------------------------------ */

  /** Points each card's radial highlight at the cursor. */
  function initCardSpotlight() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--my', ((event.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  /* -- Navigation scroll-spy ----------------------------------------------- */

  /**
   * Marks the nav link whose section is currently closest to the top of the
   * viewport, giving the header a sense of place while scrolling.
   */
  function initScrollSpy() {
    var links = $$('.nav__link');
    var sections = links
      .map(function (link) { return $(link.getAttribute('href')); })
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = new Set();

    var setCurrent = function (id) {
      links.forEach(function (link) {
        if (link.getAttribute('href') === '#' + id) {
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

  /* -- Footer year ---------------------------------------------------------- */

  function initFooterYear() {
    var slot = $('#year');
    if (slot) slot.textContent = String(new Date().getFullYear());
  }

  /* -- Bootstrap ------------------------------------------------------------ */

  initThemeToggle();
  initScrollIndicators();
  initRevealOnScroll();
  initCounters();
  initCareerRail();
  initTimelineDraw();
  initCardSpotlight();
  initScrollSpy();
  initFooterYear();
})();
