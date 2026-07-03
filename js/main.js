/* ============================================
   MAIN.JS — Navigation, scroll animations,
             marquee, clock, skills, interactions
   ============================================ */

(function () {

  // ===== 1. GSAP PLUGIN REGISTRATION =====
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ===== 3. LIVE CLOCK (IST) =====
  function updateClock() {
    const el = document.getElementById('local-time');
    if (!el) return;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    const h   = String(ist.getHours()).padStart(2, '0');
    const m   = String(ist.getMinutes()).padStart(2, '0');
    el.textContent = `${h}:${m} IST KOLKATA`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ===== 4. NAVIGATION =====
  const navLinks = document.querySelectorAll('[data-nav], [data-mobile-nav]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target   = document.querySelector(targetId);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileMenu();
    });
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 200) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ===== 5. MOBILE MENU =====
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  function openMobileMenu() {
    menuOpen = true;
    menuToggle.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    menuOpen = false;
    menuToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => menuOpen ? closeMobileMenu() : openMobileMenu());
  }

  // ===== 6. SCROLL HINT HIDE =====
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      scrollHint.classList.toggle('visible', window.scrollY < 100);
    }, { passive: true });
  }

  // ===== 7. MARQUEE =====
  function setupMarquee() {
    const track = document.getElementById('marquee-track');
    if (!track) return;
    let pos   = 0;
    let speed = 0.5;
    const halfW = track.scrollWidth / 2;

    function tick() {
      pos -= speed;
      if (Math.abs(pos) >= halfW) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      requestAnimationFrame(tick);
    }
    tick();

    const wrap = document.querySelector('.contact-marquee-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => speed = 1.8);
      wrap.addEventListener('mouseleave', () => speed = 0.5);
    }
  }

  // ===== 8. HERO PARALLAX =====
  function setupHeroParallax() {
    const photo = document.querySelector('.hero-photo-container');
    if (!photo) return;
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
      onUpdate: (self) => {
        gsap.set(photo, { y: self.progress * 70, opacity: 1 - self.progress * 0.5 });
      }
    });
  }

  // ===== 9. SCROLL REVEAL =====
  function setupReveal() {
    // Simple fade-up for .reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
      gsap.set(el, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: parseFloat(getComputedStyle(el).getPropertyValue('--delay') || '0') / 1000
          });
          el.classList.add('reveal-done');
        }
      });
    });

    // Project items - staggered scale reveal
    document.querySelectorAll('.project-item').forEach((item, i) => {
      gsap.set(item, { opacity: 0, y: 50, scale: 0.97 });
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(item, {
            opacity: 1, y: 0, scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            delay: i * 0.08
          });
        }
      });
    });

    // Skill bars animate on scroll
    document.querySelectorAll('.skill-bar').forEach(bar => {
      const fill  = bar.querySelector('.skill-bar-fill');
      const level = parseInt(bar.getAttribute('data-level')) || 50;
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 82%',
        onEnter: () => {
          gsap.to(fill, { width: level + '%', duration: 1.4, ease: 'power3.out', delay: 0.2 });
        }
      });
    });

    // Section label lines expand
    document.querySelectorAll('.section-label').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => el.classList.add('reveal-done')
      });
    });
  }

  // ===== 10. TIMELINE DOTS =====
  function setupTimeline() {
    document.querySelectorAll('.timeline-item').forEach(item => {
      const dot = item.querySelector('.timeline-dot');
      if (!dot) return;
      ScrollTrigger.create({
        trigger: item,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
        }
      });
    });
  }

  // ===== 11. ACHIEVEMENT HOVER =====
  function setupAchievements() {
    document.querySelectorAll('.achievement-item').forEach(item => {
      const badge = item.querySelector('.achievement-badge');
      if (!badge) return;
      item.addEventListener('mouseenter', () => {
        gsap.to(badge, { backgroundColor: 'var(--col-blue)', color: '#000', borderColor: 'var(--col-blue)', duration: 0.3 });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(badge, { backgroundColor: 'transparent', color: 'var(--col-blue)', borderColor: 'var(--col-blue-dim)', duration: 0.3 });
      });
    });
  }

  // ===== 12. EMAIL COPY =====
  function setupEmailCopy() {
    const btn   = document.getElementById('copy-email-btn');
    const toast = document.getElementById('copy-toast');
    if (!btn || !toast) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText('rohanchakraborty766.work@gmail.com')
        .then(() => {
          toast.classList.add('visible');
          setTimeout(() => toast.classList.remove('visible'), 2200);
        })
        .catch(() => {
          window.location.href = 'mailto:rohanchakraborty766.work@gmail.com';
        });
    });
  }

  // ===== INIT =====
  function init() {
    ScrollTrigger.refresh();
    setupReveal();
    setupHeroParallax();
    setupTimeline();
    setupAchievements();
    setupEmailCopy();
    setupMarquee();
  }

  // Safe initialization checking document readyState
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 2500);
  } else {
    window.addEventListener('load', () => {
      setTimeout(init, 2500);
    });
  }

})();
