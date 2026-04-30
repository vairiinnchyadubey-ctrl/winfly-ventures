// =====================================================
// State (shared across the single rAF loop)
// =====================================================
let mx = 0, my = 0;          // raw mouse
let cx = 0, cy = 0;          // eased cursor outline
const isCoarse = matchMedia('(pointer: coarse)').matches;
const isMobile = matchMedia('(max-width: 900px)').matches;

// =====================================================
// Cursor
// =====================================================
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

if (cursor && ring && !isCoarse && !isMobile) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  // Hover state
  const hover = 'a, button, .cap, .work-card, .step, .marquee-track, .clients-track, .hero-meta div, .marquee-track span, .client';
  document.addEventListener('mouseover', e => {
    const t = e.target.closest(hover);
    if (!t) return;
    ring.classList.add('hover');
    if (t.dataset.cursor) {
      ring.classList.add('label');
      ring.textContent = t.dataset.cursor;
    }
  });
  document.addEventListener('mouseout', e => {
    const t = e.target.closest(hover);
    if (!t) return;
    ring.classList.remove('hover', 'label');
    ring.textContent = '';
  });

  // Invert when over dark sections
  const darkObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        ring.classList.add('invert');
      } else {
        // only un-invert if no other dark section is visible
        const anyDark = [...document.querySelectorAll('.dark-section')]
          .some(el => {
            const r = el.getBoundingClientRect();
            return r.top < window.innerHeight / 2 && r.bottom > window.innerHeight / 2;
          });
        if (!anyDark) ring.classList.remove('invert');
      }
    });
  }, { threshold: [0, 0.3, 0.7, 1], rootMargin: '-40% 0px -40% 0px' });
  document.querySelectorAll('.dark-section').forEach(el => darkObs.observe(el));
}

// =====================================================
// Single rAF loop — cursor, hero parallax, hero glow, scroll bar
// =====================================================
const heroEl = document.querySelector('.hero');
const heroH1 = document.querySelector('.hero h1');
const progressBar = document.querySelector('.progress-bar');

let heroVisible = false;
if (heroEl) {
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
  }).observe(heroEl);
}

function tick() {
  if (cursor && ring && !isCoarse && !isMobile) {
    cursor.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    const r = ring.offsetWidth / 2;
    ring.style.transform = `translate3d(${cx - r}px, ${cy - r}px, 0)`;
  }

  // Hero text parallax (subtle, GPU-cheap)
  if (heroVisible && heroH1 && !isCoarse) {
    const px = (mx / window.innerWidth - 0.5) * 18;
    const py = (my / window.innerHeight - 0.5) * 12;
    heroH1.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    heroEl.style.setProperty('--mx', mx + 'px');
    heroEl.style.setProperty('--my', my + 'px');
  }

  // Scroll progress
  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// =====================================================
// Reveal on scroll
// =====================================================
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// =====================================================
// Stat counters
// =====================================================
document.querySelectorAll('.stat-num[data-target]').forEach(num => {
  const target = +num.dataset.target;
  const suffix = num.dataset.suffix || '';
  const sObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting || num.dataset.done) return;
      num.dataset.done = '1';
      const start = performance.now();
      const dur = 1500;
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        num.innerHTML = Math.floor(target * eased) + (suffix ? `<em>${suffix}</em>` : '');
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      sObs.unobserve(num);
    });
  }, { threshold: 0.5 });
  sObs.observe(num);
});

// =====================================================
// Tilt on capability tiles (only when hovered)
// =====================================================
document.querySelectorAll('.cap').forEach(el => {
  let raf = null;
  el.addEventListener('mousemove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -8;
      const ry = ((x / r.width) - 0.5) * 8;
      el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty('--cx', x + 'px');
      el.style.setProperty('--cy', y + 'px');
      raf = null;
    });
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

// =====================================================
// Magnetic CTA buttons
// =====================================================
if (!isCoarse) {
  document.querySelectorAll('.cta-button, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
      btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// =====================================================
// Click ripples
// =====================================================
document.querySelectorAll('.cap, .cta-button, .nav-cta, .work-card, .step').forEach(el => {
  el.addEventListener('click', e => {
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.width = ripple.style.height = '20px';
    el.style.position ||= 'relative';
    el.style.overflow ||= 'hidden';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// =====================================================
// Drag-to-scroll work strip
// =====================================================
const strip = document.querySelector('.work-strip');
if (strip) {
  let isDown = false, startX = 0, scrollStart = 0;
  strip.addEventListener('mousedown', e => {
    isDown = true;
    strip.classList.add('dragging');
    startX = e.pageX;
    scrollStart = strip.scrollLeft;
  });
  document.addEventListener('mouseup', () => {
    isDown = false;
    strip.classList.remove('dragging');
  });
  strip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    strip.scrollLeft = scrollStart - (e.pageX - startX) * 1.6;
  });
  strip.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      strip.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

// =====================================================
// Nav theme switch (dark over dark sections)
// =====================================================
const nav = document.querySelector('nav');
if (nav) {
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        nav.classList.add('dark');
      } else {
        const anyDark = [...document.querySelectorAll('.dark-section')]
          .some(el => {
            const r = el.getBoundingClientRect();
            return r.top < 60 && r.bottom > 60;
          });
        if (!anyDark) nav.classList.remove('dark');
      }
    });
  }, { rootMargin: '-60px 0px 0px 0px', threshold: [0, 0.05] });
  document.querySelectorAll('.dark-section').forEach(el => navObs.observe(el));
}

// =====================================================
// Live IST clock
// =====================================================
const clockEl = document.getElementById('clock');
if (clockEl) {
  function tickClock() {
    const now = new Date();
    const opts = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    clockEl.textContent = now.toLocaleTimeString('en-IN', opts);
  }
  tickClock();
  setInterval(tickClock, 1000);
}

// =====================================================
// Mobile nav
// =====================================================
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}
