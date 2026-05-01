// Minimal — cursor + magnetic CTA + drag-scroll work strip + stat counter + reveal + clock + mobile nav

const isCoarse = matchMedia('(pointer: coarse)').matches;
const isMobile = matchMedia('(max-width: 900px)').matches;

// Cursor (no labels, no morphing)
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

if (cursor && ring && !isCoarse && !isMobile) {
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function loop() {
    cursor.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    const r = ring.offsetWidth / 2;
    ring.style.transform = `translate3d(${cx - r}px, ${cy - r}px, 0)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Single hover state — no labels
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button')) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button')) ring.classList.remove('hover');
  });
}

// Reveal on scroll
const obs = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

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

// Magnetic — only on the main CTA buttons
if (!isCoarse) {
  document.querySelectorAll('.cta-button, .nav-cta').forEach(btn => {
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

// Live IST clock
const clockEl = document.getElementById('clock');
if (clockEl) {
  function tk() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
  tk();
  setInterval(tk, 1000);
}
