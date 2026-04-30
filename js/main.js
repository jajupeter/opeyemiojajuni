/* ============================================================
   Opeyemi Ojajuni — portfolio JS
   Nav, theme, reveal, filters, modals
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const SUN_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const MOON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  /* ── Theme (default light) ── 5*/
  function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
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
      btn.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
    });
  }

  /* ── Nav ── */
  function initNav() {
    const toggle = $('.nav-toggle');
    const mobile = $('.nav-mobile');
    const links  = $$('.nav-links a, .nav-mobile a');

    const page = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
    });

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

  /* ── Reveal ── */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ── Project filter ── */
  function initFilter() {
    const buttons = $$('.filter-btn');
    const cards   = $$('.case-card[data-category]');
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

  /* ── Modals ── */
  function initModals() {
    $$('[data-open]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modal = $(trigger.dataset.open);
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });
    $$('.modal').forEach(modal => {
      const close = () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      };
      const closeBtn = $('.modal-close', modal);
      const overlay  = $('.modal-overlay', modal);
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (overlay)  overlay.addEventListener('click', close);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') $$('.modal.open').forEach(m => {
        m.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Smooth scroll ── */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Metric count-up (plays when value scrolls into view) ── */
  function initCounters() {
    const vals = $$('.metric-value');
    if (!vals.length) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (el) => {
      const original = el.textContent.trim();
      // Matches: optional sign (+, -, −), number (with optional decimals), suffix (%, B+, M, etc.)
      const match = original.match(/^([+\-−]?)(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return;
      const [, prefix, numStr, suffix] = match;
      const target = parseFloat(numStr);
      const decimals = (numStr.split('.')[1] || '').length;

      if (reduce) { el.textContent = original; return; }

      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const v = target * easeOut(t);
        const display = decimals ? v.toFixed(decimals) : Math.round(v);
        el.textContent = `${prefix}${display}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = original; // snap to exact original text (preserves "1B+", "−40%", etc.)
      };
      el.textContent = `${prefix}0${suffix}`;
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    vals.forEach(el => io.observe(el));
  }

  /* ── Mouse-tracking glow on capability cards ── */
  function initCardGlow() {
    const cards = $$('.capability-card');
    if (!cards.length) return;
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  }

  /* ── Featured projects (tabs + prev/next + hero routing) ── */
  function initProjectShowcase() {
    const showcase = $('[data-project-showcase]');
    const tabs     = $$('.project-tab');
    const panels   = $$('.project-panel');
    if (!showcase || !panels.length) return;

    const setActive = (idx) => {
      tabs.forEach(t => {
        const on = Number(t.dataset.project) === idx;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(p => {
        p.classList.toggle('active', Number(p.dataset.projectPanel) === idx);
      });
    };

    const currentIndex = () => {
      const active = panels.find(p => p.classList.contains('active'));
      return active ? Number(active.dataset.projectPanel) : 0;
    };

    tabs.forEach(t => t.addEventListener('click', () => setActive(Number(t.dataset.project))));

    const prev = $('.project-prev', showcase);
    const next = $('.project-next', showcase);
    if (prev) prev.addEventListener('click', () => {
      setActive((currentIndex() - 1 + panels.length) % panels.length);
    });
    if (next) next.addEventListener('click', () => {
      setActive((currentIndex() + 1) % panels.length);
    });

    // Hero routing chips: pre-select panel that matches the route
    $$('.hero-routing a[data-route]').forEach(link => {
      link.addEventListener('click', () => {
        const route = link.dataset.route;
        const match = panels.findIndex(p => (p.dataset.tags || '').split(/\s+/).includes(route));
        if (match !== -1) setActive(match);
      });
    });
  }

  /* ── Scroll progress bar ── */
  function initScrollProgress() {
    const bar = $('.scroll-progress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ── Scroll-spy for in-page nav links ── */
  function initSectionLinks() {
    const links = $$('a[data-section-link]');
    if (!links.length) return;
    const targets = links
      .map(a => ({ link: a, el: document.querySelector(a.getAttribute('href')) }))
      .filter(t => t.el);
    if (!targets.length) return;

    const setActive = (id) => {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    targets.forEach(t => io.observe(t.el));
  }

  /* ── Capability "See examples" toggles ── */
  function initCapabilityToggle() {
    $$('.capability-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.capability-card');
        if (!card) return;
        const open = card.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.firstChild.nodeValue = open ? 'Hide examples' : 'See examples';
      });
    });
  }

  /* ── Career timeline ── */
  function initTimeline() {
    const items = $$('.timeline-item');
    const yearEl  = $('[data-timeline-year]');
    const titleEl = $('[data-timeline-title]');
    const copyEl  = $('[data-timeline-copy]');
    const tagsEl  = $('[data-timeline-tags]');
    if (!items.length || !yearEl) return;

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        yearEl.textContent  = item.dataset.year  || '';
        titleEl.innerHTML   = item.dataset.title || '';
        copyEl.textContent  = item.dataset.copy  || '';
        const tags = (item.dataset.tags || '').split('|').filter(Boolean);
        tagsEl.innerHTML = tags.map(t => `<span class="chip">${t}</span>`).join('');
      });
    });
  }

  /* ── Calendly popup ── */
  function initCalendly() {
    $$('[data-calendly-url]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const url = el.dataset.calendlyUrl;
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          window.Calendly.initPopupWidget({ url });
        } else {
          window.open(url, '_blank', 'noopener');
        }
      });
    });
  }

  /* ── Quick explorer ── */
  function initExplorer() {
    const buttons = $$('[data-explorer]');
    const out = $('[data-explorer-output]');
    if (!buttons.length || !out) return;

    const messages = {
      AI: 'AI/ML: Engineered production-grade GenAI pipelines and predictive models (95.18% cognitive classification accuracy) and built risk-modeling frameworks at Amazon, accelerating the capacity-planning cycle by 60%.',
      XR: 'XR:  Driving research and productization for CAVE-based and immersive applications—building adaptive environments that capture and translate user behavior into insights for rapid, data-driven decisions.',
      Product: 'Product impact: An immersive AI-driven XR platform for public health training, enabling 100+ leaders across 10+ modules with >80% engagement while generating real-time behavioral and performance insights.',
      Research: 'Research: PhD work on AI, XR, and computational thinking development — peer-reviewed publications and applied studies bridging cognitive science and intelligent systems. See the Research page for the full list.'
    };

    buttons.forEach(b => {
      b.addEventListener('click', () => {
        buttons.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const key = b.dataset.explorer;
        out.textContent = messages[key] || out.textContent;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initReveal();
    initFilter();
    initModals();
    initSmoothScroll();
    initCounters();
    initCardGlow();
    initProjectShowcase();
    initTimeline();
    initExplorer();
    initScrollProgress();
    initSectionLinks();
    initCapabilityToggle();
    initCalendly();
  });
})();
