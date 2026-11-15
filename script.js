// ==========================================================================
// YAZID RIZKY — PORTFOLIO SCRIPT
// Consistent, Reversible 3D Scroll Animations powered by Lenis & GSAP ScrollTrigger
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check user preference for reduced motion
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // --- 1. Lenis Smooth Scrolling Integration with GSAP ---
  let lenis = null;
  if (!isReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.8
    });

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      // Synchronize Lenis scroll with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Drive Lenis RAF from GSAP ticker
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      // Disable lag smoothing to prevent stutter
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth anchor navigation using Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetElem, { offset: -80, duration: 1.2 });
        } else {
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // --- 2. Navbar Shrink & Blur on Scroll ---
  const navbar = document.getElementById('navbar');
  function updateNavbar(scrollY) {
    if (!navbar) return;
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  if (lenis) {
    lenis.on('scroll', (e) => {
      updateNavbar(e.scroll);
    });
  } else {
    window.addEventListener('scroll', () => {
      updateNavbar(window.pageYOffset || document.documentElement.scrollTop);
    }, { passive: true });
  }
  updateNavbar(window.pageYOffset || document.documentElement.scrollTop);

  // --- 3. GSAP Animations & Reusable Scroll Reveal Function ---
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !isReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Top Red Scroll Progress Bar (Scrubbed with ScrollTrigger)
    gsap.fromTo('#scrollProgressBar',
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.15
        }
      }
    );

    // Parallax Ambient Background Elements
    gsap.to('.ambient-glow-1', {
      y: 200,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    gsap.to('.ambient-glow-2', {
      y: -160,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      }
    });

    gsap.to('.ambient-glow-3', {
      y: 150,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.1
      }
    });

    // Hero Section Entrance (on initial page load)
    gsap.from('#heroContent > *', {
      y: 40,
      opacity: 0,
      rotateX: 8,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12,
      immediateRender: false
    });

    gsap.from('#heroPortrait', {
      y: 50,
      opacity: 0,
      scale: 0.95,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.15,
      immediateRender: false
    });

    gsap.from('#heroSidebar > *', {
      x: 30,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.25,
      immediateRender: false
    });

    // Soft Parallax on Hero Portrait during scroll
    gsap.to('#heroPortraitWrapper', {
      y: 70,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      }
    });

    // --- REUSABLE UNIFORM SECTION ANIMATION FUNCTION ---
    // Uniform settings: y: 60, opacity: 0, rotateX: 8°, duration: 1, ease: power3.out, toggleActions: "play none none reverse", start: "top 85%"
    function animateSection(target, customOptions = {}) {
      const elements = typeof target === 'string' ? document.querySelectorAll(target) : target;
      if (!elements || elements.length === 0) return;

      const trigger = customOptions.trigger || target;
      const stagger = customOptions.stagger !== undefined ? customOptions.stagger : 0;

      gsap.from(elements, {
        y: 60,
        opacity: 0,
        rotateX: 8,
        z: -30,
        transformOrigin: '50% 0%',
        duration: 1,
        ease: 'power3.out',
        immediateRender: false,
        stagger: stagger,
        scrollTrigger: {
          trigger: trigger,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    }

    // Apply uniform animation to all sections below hero
    // 1. About section container
    animateSection('#about .section-container');

    // 2. Featured Projects Header
    animateSection('#projects .projects-header');

    // 3. Featured Projects Cards (with stagger 0.1)
    animateSection('#projectsGrid .project-card', {
      trigger: '#projectsGrid',
      stagger: 0.1
    });

    // 4. Contact section grid
    animateSection('#contact .contact-grid');

    // 5. Site footer
    animateSection('#contact .site-footer');

    // Floating animation on Tech Stack Badges
    const techBadges = document.querySelectorAll('.tech-badge');
    techBadges.forEach((badge, idx) => {
      const depth = parseFloat(badge.getAttribute('data-depth')) || 1.5;
      const floatDist = 5 + depth * 3;
      const floatDur = 2.4 + (idx % 3) * 0.5;
      const floatDelay = idx * 0.16;

      gsap.to(badge, {
        y: -floatDist,
        rotateZ: (idx % 2 === 0 ? 0.6 : -0.6) * depth,
        duration: floatDur,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: floatDelay
      });
    });

    // --- REFRESH SCROLLTRIGGER AFTER ASSETS LOAD & ON RESIZE ---
    // Refresh when web fonts are loaded
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    // Refresh when all images (portrait, icons) are completely loaded
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });

    // Refresh on window resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    });
  }

  // --- 4. Hero 3D Mouse Tilt & Shifting Red Glow (Desktop only) ---
  const heroSection = document.getElementById('home');
  const heroPortrait = document.getElementById('heroPortrait');
  const portraitGlow = document.getElementById('portraitGlow');

  if (heroSection && heroPortrait && !isReducedMotion && !isMobile && typeof gsap !== 'undefined') {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(heroPortrait, {
        rotateY: x * 14,
        rotateX: -y * 11,
        z: 16,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000
      });

      if (portraitGlow) {
        gsap.to(portraitGlow, {
          x: x * 50,
          y: y * 40,
          scale: 1 + Math.abs(x) * 0.15,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      gsap.to(heroPortrait, {
        rotateY: 0,
        rotateX: 0,
        z: 0,
        duration: 0.7,
        ease: 'power3.out'
      });
      if (portraitGlow) {
        gsap.to(portraitGlow, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out'
        });
      }
    });
  }

  // --- 5. Project Cards 3D Hover Tilt & Light Sheen ---
  const cards = document.querySelectorAll('.project-card');
  if (!isReducedMotion && !isMobile && typeof gsap !== 'undefined') {
    cards.forEach(card => {
      const sheen = card.querySelector('.project-card-sheen');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 9,
          rotateX: -y * 9,
          z: 18,
          duration: 0.35,
          ease: 'power2.out',
          transformPerspective: 1200
        });

        if (sheen) {
          card.style.setProperty('--mouse-x', `${(x + 0.5) * 100}%`);
          card.style.setProperty('--mouse-y', `${(y + 0.5) * 100}%`);
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          z: 0,
          duration: 0.6,
          ease: 'power3.out'
        });
      });
    });
  }

  // --- 6. Scroll Spy for Active Nav Link ---
  const sections = document.querySelectorAll('section[id], div[id="skills"]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function updateActiveLink() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 140;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });

        mobileNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // --- 7. Mobile Drawer Toggle ---
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileClose = document.getElementById('mobileClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // --- 8. Contact Form Validation & Submission ---
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        showError('nameError', 'Please enter your name');
        isValid = false;
      } else {
        clearError('nameError');
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
      } else {
        clearError('emailError');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        showError('messageError', 'Please write a message');
        isValid = false;
      } else {
        clearError('messageError');
      }

      if (isValid) {
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerHTML = '<span>Sending…</span><span class="submit-arrow">…</span>';

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';

          contactForm.reset();
          if (formFeedback) {
            formFeedback.classList.add('show');
            setTimeout(() => {
              formFeedback.classList.remove('show');
            }, 6000);
          }
        }, 800);
      }
    });
  }

  function showError(elementId, msg) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('active');
    }
  }

  function clearError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('active');
    }
  }

  [nameInput, emailInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        clearError(`${input.id}Error`);
      });
    }
  });
});
