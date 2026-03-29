/* ============================================================
   Portfolio — Dr. Opeyemi Ojajuni
   Vanilla JS: nav, scroll animations, stats counter, filter, modals
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ================================================================
     STICKY NAV — highlight active link + mobile toggle
     ================================================================ */
  function initNav() {
    const toggle = $('.nav-toggle');
    const mobile = $('.nav-mobile');
    const links  = $$('.nav-links a, .nav-mobile a');

    // Set active link based on current page filename
    const page = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    // Mobile toggle
    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        mobile.classList.toggle('open');
        document.body.style.overflow = mobile.classList.contains('open') ? 'hidden' : '';
      });
      $$('a', mobile).forEach(a => {
        a.addEventListener('click', () => {
          toggle.classList.remove('open');
          mobile.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ================================================================
     SCROLL REVEAL — fade/slide elements in on viewport entry
     ================================================================ */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(el => observer.observe(el));
  }

  /* ================================================================
     STATS COUNTER — animated count-up on first viewport entry
     ================================================================ */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function animateCounter(el) {
      const raw    = el.dataset.count;         // e.g. "1M", "20", "10"
      const suffix = el.dataset.suffix || '';  // e.g. "+"
      const prefix = el.dataset.prefix || '';

      let multiplier = 1;
      let numStr = raw;
      if (raw.endsWith('M')) { multiplier = 1000000; numStr = raw.slice(0, -1); }
      else if (raw.endsWith('K')) { multiplier = 1000; numStr = raw.slice(0, -1); }

      const target   = parseFloat(numStr) * multiplier;
      const duration = 1800;
      const start    = performance.now();

      function format(val) {
        if (multiplier === 1000000) return (val / 1000000 < 1 ? (val / 1000000).toFixed(1) : Math.round(val / 1000000)) + 'M';
        if (multiplier === 1000)    return (val / 1000).toFixed(1) + 'K';
        return Math.round(val).toString();
      }

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const current  = target * easeOut(progress);
        el.textContent = prefix + format(current) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + format(target) + suffix;
      }

      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(el => observer.observe(el));
  }

  /* ================================================================
     PROJECT FILTER — show/hide cards by category
     ================================================================ */
  function initFilter() {
    const buttons = $$('.filter-btn');
    const cards   = $$('.proj-card[data-category]');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        cards.forEach(card => {
          card.hidden = !(cat === 'all' || card.dataset.category === cat);
        });
      });
    });
  }

  /* ================================================================
     MODALS — open/close project detail panels
     ================================================================ */
  function initModals() {
    // Open
    $$('[data-open]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modal = $(trigger.dataset.open);
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // Close
    $$('.modal').forEach(modal => {
      function close() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
      const closeBtn = $('.modal-close', modal);
      const overlay  = $('.modal-overlay', modal);
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (overlay)  overlay.addEventListener('click', close);
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal.open').forEach(m => {
          m.classList.remove('open');
          document.body.style.overflow = '';
        });
      }
    });
  }

  /* ================================================================
     CONTACT FORM — client-side validation before Formspree submit
     ================================================================ */
  function initContactForm() {
    const form = $('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      let valid = true;

      $$('[required]', form).forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#f87171';
          valid = false;
        }
      });

      const emailField = form.querySelector('[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.style.borderColor = '#f87171';
        valid = false;
      }

      if (!valid) e.preventDefault();
    });
  }

  /* ================================================================
     SMOOTH SCROLL for same-page anchor links
     ================================================================ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          const navH = 64;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ================================================================
     THEME TOGGLE — dark / light with localStorage persistence
     ================================================================ */
  function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateToggleIcon(saved);

    $$('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateToggleIcon(next);
      });
    });
  }

  function updateToggleIcon(theme) {
    $$('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initReveal();
    initCounters();
    initFilter();
    initModals();
    initContactForm();
    initSmoothScroll();
  });

})();
