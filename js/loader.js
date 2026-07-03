/* ============================================
   LOADER.JS — Animated preloader
   ============================================ */

(function () {
  const loader = document.getElementById('loader');
  const loaderNum = document.getElementById('loader-num');
  const loaderBar = document.querySelector('.loader-bar');
  const loaderNameText = document.querySelector('.loader-name-text');

  let progress = 0;
  const duration = 2000;
  const startTime = performance.now();

  // Reveal name text
  gsap.to(loaderNameText, {
    y: '0%',
    duration: 0.9,
    ease: 'power4.out',
    delay: 0.2
  });

  function updateLoader(timestamp) {
    const elapsed = timestamp - startTime;
    progress = Math.min(elapsed / duration, 1);
    const pct = Math.round(progress * 100);

    loaderNum.textContent = String(pct).padStart(3, '0');
    loaderBar.style.width = pct + '%';

    if (progress < 1) {
      requestAnimationFrame(updateLoader);
    } else {
      loaderNum.textContent = '100';
      loaderBar.style.width = '100%';
      setTimeout(hideLoader, 200);
    }
  }

  requestAnimationFrame(updateLoader);

  function hideLoader() {
    loader.style.pointerEvents = 'none'; // Prevent blocking clicks immediately
    gsap.to(loader, {
      yPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        revealPage();
      }
    });
  }

  function revealPage() {
    // Show BG canvas
    const canvas = document.getElementById('bg-canvas');
    if (canvas) canvas.classList.add('visible');

    // Show header
    const header = document.getElementById('header');
    if (header) header.classList.add('visible');

    // Show side infos
    document.querySelectorAll('.side-info').forEach(el => el.classList.add('visible'));

    // Show scroll hint
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) scrollHint.classList.add('visible');

    // Animate hero elements
    gsap.to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
    gsap.to('.hero-since-num', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 });
    gsap.to('.hero-since-label', { opacity: 1, y: 0, duration: 0.8, delay: 0.4 });

    // Animate hero name letters sliding up
    gsap.to('.hero-name-inner', {
      y: '0%',
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.12,
      delay: 0.15
    });
  }
})();
