(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const enquiry = document.querySelector('#enquire');
  const stickyCta = document.querySelector('.sticky-cta');
  const progress = document.querySelector('.reading-progress');
  const filmImage = document.querySelector('.film-image');
  const reveals = [...document.querySelectorAll(
    '.definition, .section-head, .photo, .gallery-bottom, .film-image, .film-copy, .steps, .steps article, .contact-copy, #enquiry, footer'
  )];
  let enabled = !reducedMotion.matches;
  let observer;
  let slideIndex = 0;
  let slideTimer;
  let slideshowPaused = false;
  let scrollPending = false;
  let heroPassed = false;
  let enquiryVisible = false;
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.slide-dot')];
  const slideshowToggle = document.querySelector('#slideshow-toggle');

  document.querySelectorAll('.definition .word').forEach((word, index) => {
    word.style.setProperty('--word-delay', `${Math.min(index * 65, 520)}ms`);
  });

  reveals.forEach((element, index) => {
    element.classList.add('reveal');
    if (element.matches('.photo')) element.style.setProperty('--reveal-delay', `${index % 3 * 90}ms`);
    if (element.matches('.steps article')) element.style.setProperty('--reveal-delay', `${index % 3 * 120}ms`);
  });

  function setSlide(index) {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => slide.classList.toggle('active', current === slideIndex));
    dots.forEach((dot, current) => {
      dot.classList.toggle('active', current === slideIndex);
      dot.setAttribute('aria-pressed', String(current === slideIndex));
    });
  }

  function scheduleSlides() {
    clearInterval(slideTimer);
    if (enabled && !slideshowPaused && !document.hidden) {
      slideTimer = setInterval(() => setSlide(slideIndex + 1), 20000);
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      setSlide(index);
      scheduleSlides();
    });
  });
  slideshowToggle.addEventListener('click', () => {
    slideshowPaused = !slideshowPaused;
    slideshowToggle.textContent = slideshowPaused ? '▷' : 'Ⅱ';
    slideshowToggle.setAttribute('aria-label', slideshowPaused ? 'Play hero slideshow' : 'Pause hero slideshow');
    scheduleSlides();
  });
  document.addEventListener('visibilitychange', scheduleSlides);

  function updateStickyCta() {
    stickyCta.hidden = !(innerWidth < 768 && heroPassed && !enquiryVisible);
  }

  function observePage() {
    observer?.disconnect();
    if (enabled && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target === hero) {
            heroPassed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
            updateStickyCta();
          } else if (entry.target === enquiry) {
            enquiryVisible = entry.isIntersecting;
            updateStickyCta();
          } else if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(element => observer.observe(element));
      observer.observe(hero);
      observer.observe(enquiry);
    } else {
      reveals.forEach(element => element.classList.add('in-view'));
      heroPassed = scrollY > hero.offsetHeight;
      enquiryVisible = false;
      updateStickyCta();
    }
  }

  function applyMotion() {
    root.classList.toggle('motion-on', enabled);
    root.classList.toggle('motion-off', !enabled);
    toggle.textContent = `Motion: ${enabled ? 'on' : 'off'}`;
    toggle.setAttribute('aria-pressed', String(enabled));
    slideshowToggle.hidden = !enabled;
    observePage();
    scheduleSlides();
    requestScrollUpdate();
  }

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    applyMotion();
  });
  reducedMotion.addEventListener('change', event => {
    enabled = !event.matches;
    applyMotion();
  });

  function updateScroll() {
    const range = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
    header.classList.toggle('is-scrolled', scrollY > 50);
    if (enabled && innerWidth >= 1024 && finePointer.matches) {
      const heroBounds = hero.getBoundingClientRect();
      const offset = Math.max(-1, Math.min(1, (innerHeight / 2 - heroBounds.top - heroBounds.height / 2) / heroBounds.height));
      root.style.setProperty('--hero-parallax', `${offset * 32}px`);
    } else {
      root.style.setProperty('--hero-parallax', '0px');
    }
    if (enabled && filmImage) {
      const filmBounds = filmImage.getBoundingClientRect();
      if (filmBounds.bottom > 0 && filmBounds.top < innerHeight) {
        const progressThrough = 1 - (filmBounds.bottom / (innerHeight + filmBounds.height));
        filmImage.style.setProperty('--film-scale', String(1 + Math.max(0, Math.min(1, progressThrough)) * 0.025));
      }
    } else if (filmImage) {
      filmImage.style.setProperty('--film-scale', '1');
    }
    heroPassed = hero.getBoundingClientRect().bottom <= 0;
    const enquiryBounds = enquiry.getBoundingClientRect();
    enquiryVisible = enquiryBounds.top < innerHeight * 0.7 && enquiryBounds.bottom > innerHeight * 0.25;
    updateStickyCta();
    scrollPending = false;
  }

  function requestScrollUpdate() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(updateScroll);
  }

  addEventListener('scroll', requestScrollUpdate, { passive: true });
  addEventListener('resize', requestScrollUpdate);

  if (finePointer.matches && innerWidth >= 1024) {
    document.querySelectorAll('.magnetic').forEach(link => {
      link.addEventListener('pointermove', event => {
        if (!enabled) return;
        const bounds = link.getBoundingClientRect();
        link.style.setProperty('--mag-x', `${(event.clientX - bounds.left - bounds.width / 2) * 0.06}px`);
        link.style.setProperty('--mag-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.08}px`);
      });
      link.addEventListener('pointerleave', () => {
        link.style.setProperty('--mag-x', '0px');
        link.style.setProperty('--mag-y', '0px');
      });
    });
  }

  applyMotion();
})();
