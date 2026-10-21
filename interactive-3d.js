/* Native dialog: keyboard focus is trapped and restored by the browser. */
(() => {
  const dialog = document.querySelector('.image-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-full]');
    if (!button) return;
    const original = button.querySelector('img');
    image.src = button.dataset.full;
    image.alt = original?.alt || '';
    caption.textContent = button.closest('figure')?.querySelector('figcaption')?.textContent || original?.alt || '';
    dialog.showModal();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();

/* Load YouTube embeds only after a visitor chooses a video. */
(() => {
  const dialog = document.querySelector('.video-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const frame = dialog.querySelector('.video-player-frame');
  document.querySelectorAll('[data-video]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.video;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      dialog.querySelector('h3').textContent = button.dataset.title;
      dialog.querySelector('.video-external-link').href = 'https://www.youtube.com/watch?v=' + id;
      const player = document.createElement('iframe');
      player.title = button.dataset.title;
      player.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      player.allowFullscreen = true;
      player.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.replaceChildren(player);
      dialog.showModal();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => frame.replaceChildren());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
})();

/* A progressive gallery: existing site photos are usable while additional user-supplied photos are being published. */
(() => {
  const track = document.querySelector('[data-world-track]');
  if (!track) return;
  const prev = document.querySelector('[data-world-prev]');
  const next = document.querySelector('[data-world-next]');
  const current = document.querySelector('[data-world-current]');
  const total = document.querySelector('[data-world-total]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0;
  const slides = () => Array.from(track.querySelectorAll('.world-carousel-slide'));

  function sync() {
    const items = slides();
    if (!items.length) return;
    const bounds = track.getBoundingClientRect();
    let nearest = 0;
    let distance = Infinity;
    items.forEach((item, index) => {
      const d = Math.abs(item.getBoundingClientRect().left - bounds.left);
      if (d < distance) { distance = d; nearest = index; }
    });
    selected = nearest;
    current.textContent = String(selected + 1).padStart(2, '0');
    total.textContent = String(items.length).padStart(2, '0');
    prev.disabled = selected === 0;
    next.disabled = selected === items.length - 1;
  }

  function go(index) {
    const items = slides();
    const item = items[Math.max(0, Math.min(index, items.length - 1))];
    if (!item) return;
    selected = items.indexOf(item);
    const left = item.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({left, behavior: prefersReduced.matches ? 'instant' : 'smooth'});
    current.textContent = String(selected + 1).padStart(2, '0');
    prev.disabled = selected === 0;
    next.disabled = selected === items.length - 1;
  }

  prev.addEventListener('click', () => go(selected - 1));
  next.addEventListener('click', () => go(selected + 1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      go(selected + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let scheduled = false;
  track.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; sync(); });
  }, {passive:true});
  window.addEventListener('resize', sync);
  sync();

  // Optional expanded collection. The JSON file ships with the image pack.
  fetch('../images/interactive-3d/world-gallery/manifest.json')
    .then(response => { if (!response.ok) throw new Error('Gallery extension not published yet'); return response.json(); })
    .then(entries => {
      if (!Array.isArray(entries) || !entries.length) return;
      const items = entries.filter(entry => entry && typeof entry.file === 'string' &&
        /^[a-z0-9-]+\\.webp$/.test(entry.file) && typeof entry.map === 'string' &&
        typeof entry.caption === 'string' && typeof entry.alt === 'string');
      if (!items.length) return;
      const content = items.map(entry => {
        const path = '../images/interactive-3d/world-gallery/' + entry.file;
        const fig = document.createElement('figure');
        fig.className = 'world-carousel-slide';
        const button = document.createElement('button');
        button.className = 'zoom-image';
        button.type = 'button';
        button.dataset.full = path;
        button.setAttribute('aria-label', 'Enlarge: ' + entry.alt);
        const img = document.createElement('img');
        img.src = path;
        img.alt = entry.alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        const zoom = document.createElement('span');
        zoom.className = 'zoom-hint';
        zoom.setAttribute('aria-hidden', 'true');
        zoom.textContent = '↗';
        button.append(img, zoom);
        const caption = document.createElement('figcaption');
        const map = document.createElement('span');
        map.className = 'world-carousel-project';
        map.textContent = entry.map;
        const detail = document.createElement('span');
        detail.textContent = entry.caption;
        caption.append(map, detail);
        fig.append(button, caption);
        return fig;
      });
      track.replaceChildren(...content);
      track.scrollLeft = 0;
      selected = 0;
      sync();
    })
    .catch(() => { /* Keep the existing project imagery as a complete fallback. */ });
})();
