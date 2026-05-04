/* ─── Theme Toggle ─── */
const themeToggle = document.querySelector('.theme-toggle');
const applyTheme = t => document.documentElement.setAttribute('data-theme', t);
applyTheme(localStorage.getItem('theme') || 'light');
themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

/* ─── Custom Cursor ─── */
const cursor = document.querySelector('.cursor');
const ring   = document.querySelector('.cursor-ring');

if (cursor && ring) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });
  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();
}

/* ─── Scroll Reveal ─── */
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseFloat(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay * 1000);
    revealObs.unobserve(el);
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObs.observe(el));

/* ─── Page Transition ─── */
const overlay = document.querySelector('.page-overlay');
if (overlay) {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('http')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('entering');
        overlay.addEventListener('animationend', () => {
          window.location.href = href;
        }, { once: true });
      });
    }
  });
  window.addEventListener('pageshow', () => {
    overlay.classList.add('leaving');
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('entering', 'leaving');
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, { once: true });
  });
}

/* ─── Lightbox ─── */
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lbImg   = lightbox.querySelector('.lb-img');
  const lbClose = lightbox.querySelector('.lb-close');
  const lbPrev  = lightbox.querySelector('.lb-prev');
  const lbNext  = lightbox.querySelector('.lb-next');
  const items   = [...document.querySelectorAll('.gallery-item img')];
  let current   = 0;
  let lbScale   = 1;
  let lbX = 0, lbY = 0;
  let isDragging = false, hasDragged = false;
  let dragStartX = 0, dragStartY = 0;

  function applyLbTransform(animated) {
    lbImg.style.transition = animated ? 'transform 0.15s ease' : 'none';
    lbImg.style.transform  = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
  }

  function resetLb() {
    lbScale = 1; lbX = 0; lbY = 0;
    lbImg.style.cursor = 'default';
    applyLbTransform(false);
  }

  function openLb(i) {
    current = i;
    lbImg.src = items[i].src;
    resetLb();
    lightbox.classList.add('active');
  }

  function closeLb() {
    lightbox.classList.remove('active');
    resetLb();
  }

  items.forEach((img, i) => {
    img.closest('.gallery-item').addEventListener('click', e => {
      e.preventDefault();
      openLb(i);
    });
  });

  lbClose?.addEventListener('click', closeLb);
  lightbox.addEventListener('click', e => { if (e.target === lightbox && !hasDragged) closeLb(); });
  lbPrev?.addEventListener('click', () => openLb((current - 1 + items.length) % items.length));
  lbNext?.addEventListener('click', () => openLb((current + 1) % items.length));

  /* Wheel zoom */
  lightbox.addEventListener('wheel', e => {
    if (!lightbox.classList.contains('active')) return;
    e.preventDefault();
    lbScale += e.deltaY > 0 ? -0.12 : 0.12;
    lbScale = Math.min(Math.max(lbScale, 0.5), 5);
    if (lbScale <= 1) { lbScale = 1; lbX = 0; lbY = 0; }
    lbImg.style.cursor = lbScale > 1 ? 'grab' : 'default';
    applyLbTransform(true);
  }, { passive: false });

  /* Drag to pan */
  lightbox.addEventListener('mousedown', e => {
    if (lbScale <= 1 || e.target === lbClose || e.target === lbPrev || e.target === lbNext) return;
    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX - lbX;
    dragStartY = e.clientY - lbY;
    lbImg.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    lbX = e.clientX - dragStartX;
    lbY = e.clientY - dragStartY;
    hasDragged = true;
    applyLbTransform(false);
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    lbImg.style.cursor = lbScale > 1 ? 'grab' : 'default';
    setTimeout(() => { hasDragged = false; }, 50);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLb();
    if (e.key === 'ArrowRight')  openLb((current + 1) % items.length);
    if (e.key === 'ArrowLeft')   openLb((current - 1 + items.length) % items.length);
    if (e.key === '+' || e.key === '=') { lbScale = Math.min(lbScale + 0.2, 5); applyLbTransform(true); }
    if (e.key === '-') { lbScale = Math.max(lbScale - 0.2, 0.5); applyLbTransform(true); }
  });
}

