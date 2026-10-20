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
