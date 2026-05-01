// State
let mx = 0, my = 0, cx = 0, cy = 0;
const isCoarse = matchMedia('(pointer: coarse)').matches;
const isMobile = matchMedia('(max-width: 900px)').matches;

// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

if (cursor && ring && !isCoarse && !isMobile) {
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const hover = 'a, button, .work-card, .service, .testimonial, .sticker, .stat, .hero-meta div';
  document.addEventListener('mouseover', e => {
    const t = e.target.closest(hover);
    if (!t) return;
    ring.classList.add('hover');
    const label = t.dataset.cursor;
    if (label) { ring.classList.add('label'); ring.textContent = label; }
  });
  document.addEventListener('mouseout', e => {
    const t = e.target.closest(hover);
    if (!t) return;
    ring.classList.remove('hover', 'label');
    ring.textContent = '';
  });
}

// Single rAF loop
const heroEl = document.querySelector('.hero');
const progress = document.querySelector('.progress-bar');
let heroVisible = false;
if (heroEl) new IntersectionObserver(en => { heroVisible = en[0].isIntersecting; }).observe(heroEl);

function tick() {
  if (cursor && ring && !isCoarse && !isMobile) {
    cursor.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    const r = ring.offsetWidth / 2;
    ring.style.transform = `translate3d(${cx - r}px, ${cy - r}px, 0)`;
  }
  if (heroVisible && heroEl) {
    heroEl.style.setProperty('--mx', mx + 'px');
    heroEl.style.setProperty('--my', my + 'px');
  }
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (window.scrollY / max) * 100 + '%' : '0%';
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Reveal
const obs = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Statement scaling
document.querySelectorAll('.statement').forEach(el => {
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: 0.4 }).observe(el);
});

// Stat counters
document.querySelectorAll('.stat-num[data-target]').forEach(num => {
  const target = +num.dataset.target;
  const suffix = num.dataset.suffix || '';
  new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting || num.dataset.done) return;
      num.dataset.done = '1';
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / 1500, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        num.innerHTML = Math.floor(target * eased) + (suffix ? `<em>${suffix}</em>` : '');
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 }).observe(num);
});

// Magnetic
if (!isCoarse) {
  document.querySelectorAll('.cta-button, .nav-cta, .work-hint').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.2;
      btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// Drag-scroll work strip
const strip = document.querySelector('.work-strip');
if (strip) {
  let isDown = false, startX = 0, scrollStart = 0;
  strip.addEventListener('mousedown', e => {
    isDown = true; strip.classList.add('dragging');
    startX = e.pageX; scrollStart = strip.scrollLeft;
  });
  document.addEventListener('mouseup', () => { isDown = false; strip.classList.remove('dragging'); });
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

// Mobile nav
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

// IST clock
const clockEl = document.getElementById('clock');
if (clockEl) {
  function tk() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
  tk();
  setInterval(tk, 1000);
}
