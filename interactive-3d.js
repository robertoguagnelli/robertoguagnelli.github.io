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

/* Independent seamless galleries with user-controlled seek bars. */
(() => {
  function initializeCarousel(root) {
    const track = root.querySelector('[data-world-track]');
      const range = root.querySelector('[data-world-progress]');
      const previousButton = root.querySelector('[data-world-prev]');
      const nextButton = root.querySelector('[data-world-next]');
      const current = root.querySelector('[data-world-current]');
      const total = root.querySelector('[data-world-total]');
      if (!track || !range || !previousButton || !nextButton || !current || !total) return;
    
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const imageDialog = document.querySelector('.image-dialog');
      const speed = 105; // Pixels per second; continuous movement with small subpixel frame advances.
      const idleDelay = 5000; // Resume five seconds after the last manual interaction.
      let originals = [];
      let after = [];
      let cycleWidth = 0;
      let fraction = 0;
      let pauseUntil = 0;
      let pointerHeld = false;
      let inView = true;
      let lastFrame = null;
    
      function pauseForInteraction() {
        pauseUntil = performance.now() + idleDelay;
      }
    
      function modulo(value, period) {
        return ((value % period) + period) % period;
      }
    
      function updatePosition() {
        if (!cycleWidth || !originals.length) return;
        const oldPosition = track.scrollLeft;
        const logical = modulo(oldPosition - cycleWidth, cycleWidth);
        const normalized = cycleWidth + logical;
        // The three identical image sets make this reset visually invisible.
        if (oldPosition < cycleWidth || oldPosition >= 2 * cycleWidth) {
          track.scrollLeft = normalized;
        }
        fraction = logical / cycleWidth;
        const step = cycleWidth / originals.length;
        const visibleIndex = Math.floor((logical + step / 2) / step) % originals.length;
        const countText = String(visibleIndex + 1).padStart(2, '0');
        if (current.textContent !== countText) current.textContent = countText;
        const totalText = String(originals.length).padStart(2, '0');
        if (total.textContent !== totalText) total.textContent = totalText;
        const progress = String(Math.round(fraction * 1000));
        if (range.value !== progress) {
          range.value = progress;
          range.style.setProperty('--world-progress', (fraction * 100).toFixed(2) + '%');
        }
      }
    
      function makeCopy(node) {
        const copy = node.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelectorAll('button, a, input').forEach(element => {
          element.tabIndex = -1;
        });
        return copy;
      }
    
      function setSlides(slides) {
        if (!slides.length) return;
        originals = slides;
        const before = slides.map(makeCopy);
        after = slides.map(makeCopy);
        track.replaceChildren(...before, ...slides, ...after);
        // The first original and its first repeated copy are exactly one loop apart.
        cycleWidth = after[0].offsetLeft - originals[0].offsetLeft;
        if (cycleWidth <= 0) return;
        fraction = 0;
        track.scrollLeft = cycleWidth;
        updatePosition();
      }
    
      function seek(value) {
        if (!cycleWidth) return;
        track.scrollLeft = cycleWidth * (1 + modulo(value, 1));
        updatePosition();
      }
    
      function moveOne(direction) {
        if (!cycleWidth || !originals.length) return;
        pauseForInteraction();
        const oneSlide = 1 / originals.length;
        seek(fraction + direction * oneSlide);
      }
    
      previousButton.addEventListener('click', () => moveOne(-1));
      nextButton.addEventListener('click', () => moveOne(1));
    
      range.addEventListener('input', () => {
        pauseForInteraction();
        seek(Number(range.value) / 1000);
      });
    
      [track, range].forEach(element => {
        element.addEventListener('pointerdown', () => {
          pointerHeld = true;
          pauseForInteraction();
        });
        element.addEventListener('wheel', pauseForInteraction, {passive: true});
      });
    
      function releasePointer() {
        if (!pointerHeld) return;
        pointerHeld = false;
        pauseForInteraction();
      }
      window.addEventListener('pointerup', releasePointer);
      window.addEventListener('pointercancel', releasePointer);
      window.addEventListener('blur', releasePointer);
    
      track.addEventListener('keydown', event => {
        if (event.target !== track) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          moveOne(event.key === 'ArrowRight' ? 1 : -1);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          pauseForInteraction();
          seek(event.key === 'Home' ? 0 : 0.999);
        }
      });
      track.addEventListener('scroll', updatePosition, {passive: true});
    
      function syncLayout() {
        if (!originals.length || !after.length) return;
        const oldFraction = fraction;
        cycleWidth = after[0].offsetLeft - originals[0].offsetLeft;
        if (cycleWidth <= 0) return;
        track.scrollLeft = cycleWidth * (1 + oldFraction);
        updatePosition();
      }
      window.addEventListener('resize', syncLayout);
    
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          inView = entries.some(entry => entry.isIntersecting);
        }, {threshold: 0}).observe(track);
      }
    
      function tick(now) {
        if (lastFrame !== null && cycleWidth &&
            now >= pauseUntil && !pointerHeld && inView &&
            document.visibilityState !== 'hidden' &&
            !prefersReducedMotion.matches && !(imageDialog && imageDialog.open)) {
          const elapsed = Math.min((now - lastFrame) / 1000, 0.08);
          track.scrollLeft += speed * elapsed;
          updatePosition();
        }
        lastFrame = now;
        requestAnimationFrame(tick);
      }
    
      setSlides(Array.from(track.querySelectorAll('.world-carousel-slide')));
      requestAnimationFrame(tick);
  }

  document.querySelectorAll(".world-showcase").forEach(initializeCarousel);
})();
