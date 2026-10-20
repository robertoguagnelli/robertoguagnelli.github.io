/* Native dialog: keyboard focus is trapped and restored by the browser. */
(() => {
  const dialog = document.querySelector('.image-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  document.querySelectorAll('[data-full]').forEach(button => {
    button.addEventListener('click', () => {
      const original = button.querySelector('img');
      image.src = button.dataset.full;
      image.alt = original.alt;
      caption.textContent = button.closest('figure').querySelector('figcaption')?.textContent || original.alt;
      dialog.showModal();
    });
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
