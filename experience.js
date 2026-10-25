(() => {
  // Enhance original artwork in place; a failed enhancement leaves images visible.
  const selector = '.process-media > figure > img, .cinema-sequence > figure > img, .media-stack figure > img, .identity-boards > figure > img';
  let images = [], index = 0, opener;
  const dialog = document.createElement('dialog');
  dialog.className = 'artwork-viewer';
  dialog.setAttribute('aria-label', 'Artwork viewer');
  dialog.innerHTML = `<div class="viewer-toolbar"><span class="viewer-count" aria-live="polite"></span><div class="viewer-controls"><button type="button" data-viewer="previous" aria-label="Previous image">Prev</button><button type="button" data-viewer="next" aria-label="Next image">Next</button><button type="button" data-viewer="zoom" aria-pressed="false">Zoom in</button><button type="button" data-viewer="close" autofocus>Close</button></div></div><div class="viewer-stage"><img alt=""></div><p class="viewer-caption" aria-live="polite"></p>`;
  document.body.append(dialog);
  const stage = dialog.querySelector('.viewer-stage');
  const fullImage = stage.querySelector('img');
  const zoomButton = dialog.querySelector('[data-viewer="zoom"]');
  fullImage.addEventListener('load', () => fullImage.style.setProperty('--original-width', `${fullImage.naturalWidth}px`));
  function zoom(on) {
    stage.classList.toggle('is-zoomed', on);
    zoomButton.textContent = on ? 'Fit image' : 'Zoom in';
    zoomButton.setAttribute('aria-pressed', String(on));
    stage.scrollTo(0, 0);
  }
  function show(next) {
    index = (next + images.length) % images.length;
    const image = images[index];
    fullImage.src = image.currentSrc || image.src;
    fullImage.alt = image.alt;
    fullImage.style.setProperty('--original-width', `${image.naturalWidth || Number(image.getAttribute('width')) || image.width}px`);
    dialog.querySelector('.viewer-count').textContent = `${index + 1} / ${images.length}`;
    dialog.querySelector('.viewer-caption').textContent = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
    zoom(false);
  }
  function enhance() {
    document.querySelectorAll(selector).forEach(image => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'artwork-open';
      button.setAttribute('aria-label', `Enlarge: ${image.alt}`);
      button.setAttribute('aria-haspopup', 'dialog');
      image.replaceWith(button);
      button.append(image);
    });
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('.artwork-open');
    if (!button) return;
    opener = button;
    images = [...document.querySelectorAll('.artwork-open > img')];
    show(images.indexOf(button.querySelector('img')));
    dialog.showModal();
    document.body.classList.add('artwork-viewing');
  });
  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-viewer]')?.dataset.viewer;
    if (action === 'close') dialog.close();
    else if (action === 'previous') show(index - 1);
    else if (action === 'next') show(index + 1);
    else if (action === 'zoom' || event.target === fullImage) zoom(!stage.classList.contains('is-zoomed'));
    else if (event.target === stage) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && !stage.classList.contains('is-zoomed')) { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight' && !stage.classList.contains('is-zoomed')) { event.preventDefault(); show(index + 1); }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('artwork-viewing');
    if (opener?.isConnected) opener.focus({preventScroll:true});
    fullImage.removeAttribute('src');
  });
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
  enhance();
  const main = document.querySelector('main');
  if (main) new MutationObserver(enhance).observe(main, {childList:true});
})();
