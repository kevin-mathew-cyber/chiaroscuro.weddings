(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let enabled = !reduced.matches;
  let observer;
  const reveals = [...document.querySelectorAll('.definition > *, .section-head, .photo, .gallery-bottom, .film-copy, .film-image, .steps article, .contact-copy, #enquiry')];
  reveals.forEach((element, index) => {
    element.classList.add('reveal');
    if (element.matches('.photo, .steps article')) element.style.setProperty('--reveal-delay', `${index % 3 * 90}ms`);
  });
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.slide-dot')];
  const pause = document.querySelector('#slideshow-toggle');
  let current = 0, timer, paused = false;
  function setSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => { dot.classList.toggle('active', i === current); dot.setAttribute('aria-pressed', String(i === current)); });
  }
  function scheduleSlides() {
    clearInterval(timer);
    if (enabled && !paused && !document.hidden) timer = setInterval(() => setSlide(current + 1), 6500);
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => { setSlide(index); scheduleSlides(); }));
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.textContent = paused ? '▷' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Play hero slideshow' : 'Pause hero slideshow');
    scheduleSlides();
  });
  document.addEventListener('visibilitychange', scheduleSlides);
  function applyMotion() {
    root.classList.toggle('motion-on', enabled);
    root.classList.toggle('motion-off', !enabled);
    toggle.textContent = enabled ? 'Motion: on' : 'Motion: off';
    toggle.setAttribute('aria-pressed', String(!enabled));
    pause.hidden = !enabled;
    observer?.disconnect();
    if (enabled && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
      }), { threshold: .08, rootMargin: '0px 0px 35px 0px' });
      reveals.forEach(element => observer.observe(element));
    } else reveals.forEach(element => element.classList.add('in-view'));
    scheduleSlides();
  }
  toggle.addEventListener('click', () => { enabled = !enabled; applyMotion(); });
  reduced.addEventListener('change', () => { enabled = !reduced.matches; applyMotion(); });
  applyMotion();
  const progress = document.querySelector('.reading-progress');
  let pending = false;
  function updateScroll() {
    const range = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
    pending = false;
  }
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();
  if (matchMedia('(pointer: fine)').matches) document.querySelectorAll('.magnetic').forEach(link => {
    link.addEventListener('pointermove', event => {
      if (!enabled) return;
      const box = link.getBoundingClientRect();
      link.style.setProperty('--mag-x', `${(event.clientX - box.left - box.width / 2) * .08}px`);
      link.style.setProperty('--mag-y', `${(event.clientY - box.top - box.height / 2) * .12}px`);
    });
    link.addEventListener('pointerleave', () => { link.style.setProperty('--mag-x', '0px'); link.style.setProperty('--mag-y', '0px'); });
  });
  const gallery = [...document.querySelectorAll('.photo')];
  const dialog = document.querySelector('#lightbox');
  let selected = 0;
  function showPhoto(index) {
    selected = (index + gallery.length) % gallery.length;
    const button = gallery[selected];
    dialog.querySelector('img').src = button.dataset.image;
    dialog.querySelector('img').alt = button.querySelector('img').alt;
    dialog.querySelector('p').textContent = button.dataset.caption;
    document.querySelector('#gallery-count').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
  }
  gallery.forEach((button, index) => button.addEventListener('click', () => showPhoto(index)));
  document.querySelector('#gallery-prev').addEventListener('click', () => showPhoto(selected - 1));
  document.querySelector('#gallery-next').addEventListener('click', () => showPhoto(selected + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(selected + (event.key === 'ArrowLeft' ? -1 : 1)); }
  });
})();
