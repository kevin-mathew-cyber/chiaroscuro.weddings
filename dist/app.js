(() => {
  const menu = document.querySelector('.menu');
  const navigation = document.querySelector('#navigation');

  function setMenuOpen(open, returnFocus = true) {
    navigation.classList.toggle('open', open);
    navigation.inert = !open && innerWidth < 768;
    navigation.setAttribute('aria-hidden', String(navigation.inert));
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', open);
    if (open) navigation.querySelector('a').focus();
    else if (returnFocus) menu.focus();
  }

  menu.addEventListener('click', () => {
    setMenuOpen(menu.getAttribute('aria-expanded') !== 'true');
  });
  navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  navigation.inert = innerWidth < 768;
  navigation.setAttribute('aria-hidden', String(navigation.inert));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
  });
  addEventListener('resize', () => {
    if (innerWidth >= 768 && menu.getAttribute('aria-expanded') === 'true') setMenuOpen(false, false);
    else {
      navigation.inert = innerWidth < 768 && menu.getAttribute('aria-expanded') !== 'true';
      navigation.setAttribute('aria-hidden', String(navigation.inert));
    }
  });

  const gallery = [...document.querySelectorAll('.photo')];
  const dialog = document.querySelector('#lightbox');
  const image = document.querySelector('#lightbox-image');
  const count = document.querySelector('#gallery-count');
  let selected = 0;
  let crossfadeTimer;

  function resetZoom() {
    image.style.setProperty('--zoom', '1');
    image.style.setProperty('--pan-x', '0px');
    image.style.setProperty('--pan-y', '0px');
  }

  function showPhoto(index, animate = true) {
    selected = (index + gallery.length) % gallery.length;
    const button = gallery[selected];
    const thumbnail = button.querySelector('img');
    if (animate) {
      image.classList.add('is-changing');
      clearTimeout(crossfadeTimer);
      crossfadeTimer = setTimeout(() => image.classList.remove('is-changing'), 350);
    }
    image.srcset = thumbnail.srcset;
    image.sizes = '100vw';
    image.width = thumbnail.width;
    image.height = thumbnail.height;
    image.src = button.dataset.image;
    image.alt = thumbnail.alt;
    dialog.querySelector('p').textContent = button.dataset.caption;
    count.textContent = `${selected + 1} / ${gallery.length}`;
    resetZoom();
  }

  gallery.forEach((button, index) => {
    button.addEventListener('click', () => {
      showPhoto(index, false);
      dialog.showModal();
    });
  });
  document.querySelector('#close-gallery').addEventListener('click', () => dialog.close());
  document.querySelector('#gallery-prev').addEventListener('click', () => showPhoto(selected - 1));
  document.querySelector('#gallery-next').addEventListener('click', () => showPhoto(selected + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(selected - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(selected + 1);
    }
  });

  const pointers = new Map();
  let gestureStart = null;
  let pinchStart = 0;
  let pinchZoom = 1;
  image.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    image.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) gestureStart = { x: event.clientX, y: event.clientY };
    if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      pinchStart = Math.hypot(first.x - second.x, first.y - second.y);
      pinchZoom = Number(image.style.getPropertyValue('--zoom')) || 1;
      gestureStart = null;
    }
  });
  image.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && pinchStart > 0) {
      const [first, second] = [...pointers.values()];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      image.style.setProperty('--zoom', String(Math.min(4, Math.max(1, pinchZoom * distance / pinchStart))));
    } else if (pointers.size === 1 && (Number(image.style.getPropertyValue('--zoom')) || 1) > 1) {
      image.style.setProperty('--pan-x', `${event.clientX - gestureStart.x}px`);
      image.style.setProperty('--pan-y', `${event.clientY - gestureStart.y}px`);
    }
  });
  function endGesture(event) {
    const start = gestureStart;
    const wasSingleTouch = pointers.size === 1;
    pointers.delete(event.pointerId);
    if (wasSingleTouch && start && (Number(image.style.getPropertyValue('--zoom')) || 1) === 1) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) showPhoto(selected + (dx < 0 ? 1 : -1));
      else if (dy > 70 && Math.abs(dy) > Math.abs(dx)) dialog.close();
    }
    if (pointers.size === 0) {
      gestureStart = null;
      pinchStart = 0;
    } else if (pointers.size === 1) {
      // Continue panning safely after one finger leaves a pinch gesture.
      const remaining = [...pointers.values()][0];
      gestureStart = { x: remaining.x, y: remaining.y };
      pinchStart = 0;
    }
  }
  image.addEventListener('pointerup', endGesture);
  image.addEventListener('pointercancel', endGesture);

  const form = document.querySelector('#enquiry');
  const draft = document.querySelector('#draft');
  const message = document.querySelector('#message');
  const copyButton = document.querySelector('.copy');
  const copyStatus = document.querySelector('#copy-status');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const story = String(data.get('story') || '').trim();
    message.value = `Hello Chiaroscuro Weddings!\n\nWe’re ${String(data.get('name')).trim()} and ${String(data.get('partner')).trim()}, and we’re planning our celebration on ${data.get('date')} at ${String(data.get('location')).trim()}.\n\nWe’re interested in ${String(data.get('service')).toLowerCase()}.\n${story ? `\nA little about our plans: ${story}\n` : ''}\nCould you share your availability and collections?`;
    draft.hidden = false;
    copyButton.classList.remove('is-copied');
    copyStatus.textContent = '';
    message.focus();
  });

  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable');
      await navigator.clipboard.writeText(message.value);
      copyButton.classList.add('is-copied');
      copyStatus.textContent = 'Copied. Open Instagram and paste it into your message.';
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = 'Select and copy the draft, then paste it into Instagram.';
    }
  });
})();
