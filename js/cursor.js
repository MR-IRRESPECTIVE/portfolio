/* ============================================
   CURSOR.JS — Premium magnetic cursor with GSAP
   ============================================ */

(function () {
  // Only run on devices that support hover
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Wait for GSAP to be ready
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

  const xDot  = gsap.quickTo(dot,  'x', { duration: 0.1, ease: 'power3' });
  const yDot  = gsap.quickTo(dot,  'y', { duration: 0.1, ease: 'power3' });
  const xRing = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const yRing = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

  document.addEventListener('mousemove', (e) => {
    xDot(e.clientX);
    yDot(e.clientY);
    xRing(e.clientX);
    yRing(e.clientY);
  });

  // --- HOVER STATE: standard interactive elements ---
  document.querySelectorAll('a, button, .skill-card, .achievement-item, [data-cursor-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // --- VIEW STATE: project items ---
  document.querySelectorAll('.project-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.remove('cursor-hover');
      document.body.classList.add('cursor-view');
    });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
  });

  // --- HIDE STATE: portrait area ---
  const portrait = document.getElementById('portrait-canvas');
  if (portrait) {
    portrait.addEventListener('mouseenter', () => document.body.classList.add('cursor-hide'));
    portrait.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hide'));
  }

  // Click pulse
  document.addEventListener('mousedown', () => {
    gsap.to([dot, ring], { scale: 0.8, duration: 0.1 });
  });
  document.addEventListener('mouseup', () => {
    gsap.to([dot, ring], { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
  });
})();
