(() => {
  const data = window.PORTFOLIO;
  const main = document.querySelector('main');
  const menu = document.querySelector('.mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrow = (direction = 'diagonal') => `<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'left' ? 'M20 12H4M10 6l-6 6 6 6' : 'M5 19L19 5M5 5h14v14'}"/></svg>`;
  let currentPage = '';
  let lastMenuFocus = null;
  const homeHref = '#work';
  const artworkMotionObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.toggleAttribute('data-in-view', entry.isIntersecting));
    })
    : null;
  const syncPageVisibility = () => document.body.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncPageVisibility);
  syncPageVisibility();

  // Fixed approved LHW identity.
  const logo = data.logo;
  document.querySelector('.brand-mark').src = logo;
  document.querySelector('.brand-name').textContent = data.name;
  document.querySelector('.wordmark').setAttribute('aria-label', `${data.name}, home`);

  function setMenu(open) {
    if (open) lastMenuFocus = document.activeElement;
    document.body.classList.toggle('menu-open', open);
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    main.inert = open;
    if (open) menu.querySelector('a').focus();
    else if (lastMenuFocus) lastMenuFocus.focus();
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', e => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key === 'Tab') {
      const elements = [toggle, ...menu.querySelectorAll('a')];
      const first = elements[0], last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width:701px)').addEventListener('change', e => { if (e.matches && !menu.hidden) setMenu(false); });

  function contact() {
    const email = data.email.trim();
    return `<section class="contact-section" id="contact" aria-labelledby="contact-title"><h2 id="contact-title">Let's talk.</h2><div class="contact-details"><p>A place for new ideas, conversations and possibilities.</p>${email ? `<a class="email" href="mailto:${escape(email)}">${escape(email)}</a>` : '<span class="email">Your email address</span><p class="contact-placeholder">Contact details to be added.</p>'}</div><a class="contact-back-top" href="#home">Back to top <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></a></section>`;
  }
  function projectTile(p) {
    const cover = p.media?.[0]?.images[0];
    return `<article class="project-item"><a class="project-link" href="#project/${escape(p.slug)}" aria-label="${escape(p.title)} — ${escape(p.type)}${p.summary ? `. ${escape(p.summary)}` : ''}"><div class="project-visual"><img class="project-image" src="${escape(p.image)}" alt="${escape(p.imageAlt)}" width="${cover?.width || 1200}" height="${cover?.height || 1000}"><div class="project-details" aria-hidden="true"><h2>${escape(p.title)}</h2><p class="project-category">${escape(p.type)}</p>${p.summary ? `<p class="project-description">${escape(p.summary)}</p>` : ''}</div></div></a></article>`;
  }
  // Keep the project caption beside the pointer without covering its target.
  main.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const link = event.target.closest('.project-link');
    if (!link) return;
    const panel = link.querySelector('.project-details');
    const gap = 16;
    const width = panel.offsetWidth, height = panel.offsetHeight;
    const x = event.clientX + gap + width <= window.innerWidth - gap ? event.clientX + gap : event.clientX - width - gap;
    const y = event.clientY + gap + height <= window.innerHeight - gap ? event.clientY + gap : event.clientY - height - gap;
    panel.style.setProperty('--caption-x', `${Math.max(gap, x)}px`);
    panel.style.setProperty('--caption-y', `${Math.max(gap, y)}px`);
    link.dataset.pointerReady = 'true';
  });
  main.addEventListener('pointerout', event => {
    const link = event.target.closest('.project-link');
    if (link && !link.contains(event.relatedTarget)) delete link.dataset.pointerReady;
  });
  window.addEventListener('scroll', () => {
    main.querySelectorAll('[data-pointer-ready]').forEach(link => delete link.dataset.pointerReady);
  }, {passive:true});
  function home() {
    main.innerHTML = `<h1 class="visually-hidden">Portfolio</h1><section class="gallery gallery--images" id="work" aria-label="Portfolio projects">${data.projects.map(projectTile).join('')}</section><section class="about-section" id="about" aria-labelledby="about-title"><div><h2 id="about-title">${escape(data.aboutTitle)}</h2></div><div class="about-copy"><p>${escape(data.about)}</p></div></section>${contact()}`;
    document.title = `${data.name} — Creative Portfolio`;
    artworkMotionObserver?.disconnect();
    main.querySelectorAll('.project-item').forEach(item => artworkMotionObserver?.observe(item));
  }
  function mediaSection(section, lead = false) {
    const figures = section.images.map((item, index) => `<figure><img src="${escape(item.src)}" alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" loading="${lead ? 'eager' : 'lazy'}" decoding="async"${lead && index === 0 ? ' fetchpriority="high"' : ''}><figcaption>${escape(item.caption)}</figcaption></figure>`).join('');
    return `<section class="${lead ? 'project-artworks' : 'process-section'}" aria-label="${escape(section.title)}">${lead ? '' : `<div class="process-heading"><h2>${escape(section.title)}</h2></div>`}<div class="process-media${section.layout === 'stack' ? ' project-applications' : ''}">${figures}</div></section>`;
  }
  function project(p) {
    if (p.caseStudy) { window.location.replace(p.caseStudy); return; }
    artworkMotionObserver?.disconnect();
    const index = data.projects.indexOf(p), next = data.projects[(index + 1) % data.projects.length];
    if (p.media) {
      const artwork = p.presentation === 'cinema'
        ? `<section class="cinema-sequence" aria-label="EDIT. website designs">${p.media.flatMap(section => section.images).map((item, index) => `<figure${item.presentation === 'longform' ? ' class="cinema-longform"' : ''}><img src="${escape(item.src)}" alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async"${index === 0 ? ' fetchpriority="high"' : ''}></figure>`).join('')}</section>`
        : `${mediaSection(p.media[0], true)}${p.media.slice(1).map(section => mediaSection(section)).join('')}`;
      main.innerHTML = `<section class="project-heading"><a class="back-link" href="${homeHref}">${arrow('left')} All projects</a><div class="project-title-line"><h1>${escape(p.title)}</h1>${p.website ? `<a class="project-website" href="${escape(p.website)}" target="_blank" rel="noopener" aria-label="Visit ${escape(p.title)} website (opens in a new tab)">Visit website ${arrow()}</a>` : ''}</div><div class="project-heading-bottom"><p>${escape(p.type)}</p><p class="project-brand">${escape(p.projectLabel || `${p.client} Running Club`)}</p></div></section>${artwork}<a class="next-project" href="#project/${escape(next.slug)}"><div><span>Next project</span><strong>${escape(next.title)}</strong></div>${arrow()}</a>${contact()}`;
      document.title = `${p.title} — ${data.name}`;
      return;
    }
    main.innerHTML = `<section class="project-heading"><a class="back-link" href="${homeHref}">${arrow('left')} All projects</a><h1>${escape(p.title)}</h1><div class="project-heading-bottom"><p>${escape(p.type)}</p><p class="draft-label">Sample project slot. Images and project content are placeholders.</p></div></section><figure class="project-cover project-cover--gallery"><img src="${escape(p.image)}" alt="${escape(p.imageAlt)}" width="1200" height="1000"></figure><section class="process-section" aria-label="Project images"><div class="process-media"><figure><img src="assets/process-placeholder.svg" alt="Placeholder for sketches and creative development" width="800" height="600" loading="lazy"><figcaption>Process image placeholder</figcaption></figure><figure><img src="assets/outcome-placeholder.svg" alt="Placeholder for visual experiments" width="800" height="600" loading="lazy"><figcaption>Exploration image placeholder</figcaption></figure></div></section><section class="process-section" aria-label="Project outcome"><div class="project-cover" style="margin:0"><img src="${escape(p.image)}" alt="Placeholder for the final project presentation" width="1200" height="1000" loading="lazy"></div></section><a class="next-project" href="#project/${escape(next.slug)}"><div><span>Next project</span><strong>${escape(next.title)}</strong></div>${arrow()}</a>${contact()}`;
    document.title = `${p.title} — ${data.name}`;
  }
  function navigate() {
    const hash = location.hash.slice(1) || 'home'; 
    if (!menu.hidden) setMenu(false);
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === hash || (link.dataset.nav === 'work' && hash.startsWith('project/'))) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (hash.startsWith('project/')) {
      const p = data.projects.find(item => `project/${item.slug}` === hash);
      if (currentPage !== hash) {
        if (p) project(p);
        else {main.innerHTML = '<section class="not-found"><h1>Project not found.</h1><p>This project link is unavailable.</p><a href="#work">Return to all projects</a></section>';document.title = `Project not found — ${data.name}`;}
        currentPage = hash;
        window.scrollTo({top:0,behavior:'instant'});
        main.focus({preventScroll:true});
      }
      return;
    }
    if (currentPage !== 'home') {home(); currentPage = 'home';}
    const section = document.getElementById(hash === 'projects' ? 'work' : hash);
    if (section) section.scrollIntoView({behavior:'instant',block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.classList.contains('skip-link')) {
      e.preventDefault();
      main.focus({preventScroll:true});
      main.scrollIntoView({behavior:'instant',block:'start'});
      return;
    }
    if (!menu.hidden) setMenu(false);
    if (link.hash === location.hash) {e.preventDefault(); navigate();}
  });
  window.addEventListener('hashchange', navigate);
  navigate();
})();
