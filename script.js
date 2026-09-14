(() => {
  const cfg = window.WEDDING_CONFIG;
  if (!cfg) return;

  const setTextAll = (selector, value) => {
    document.querySelectorAll(selector).forEach((el) => { el.textContent = value; });
  };

  setTextAll('[data-partner-one]', cfg.couple.partnerOne);
  setTextAll('[data-partner-two]', cfg.couple.partnerTwo);
  setTextAll('[data-monogram]', cfg.couple.monogram);
  setTextAll('[data-tagline]', cfg.couple.tagline);
  setTextAll('[data-display-date]', cfg.wedding.displayDate);
  setTextAll('[data-city]', cfg.wedding.city);
  setTextAll('[data-ceremony-time]', cfg.wedding.ceremonyTime);
  setTextAll('[data-reception-time]', cfg.wedding.receptionTime);
  setTextAll('[data-story-eyebrow]', cfg.story.eyebrow);
  setTextAll('[data-story-heading]', cfg.story.heading);
  setTextAll('[data-story-body]', cfg.story.body);
  setTextAll('[data-ceremony-name]', cfg.venues.ceremony.name);
  setTextAll('[data-ceremony-address]', cfg.venues.ceremony.address);
  setTextAll('[data-reception-name]', cfg.venues.reception.name);
  setTextAll('[data-reception-address]', cfg.venues.reception.address);
  setTextAll('[data-dress-title]', cfg.dressCode.title);
  setTextAll('[data-dress-text]', cfg.dressCode.text);
  setTextAll('[data-gift-note]', cfg.giftNote);
  setTextAll('[data-rsvp-deadline]', cfg.rsvpDeadline);

  document.title = `${cfg.couple.partnerOne} & ${cfg.couple.partnerTwo} | Wedding Invitation`;
  document.querySelector('[data-ceremony-map]').href = cfg.venues.ceremony.mapUrl;
  document.querySelector('[data-reception-map]').href = cfg.venues.reception.mapUrl;

  const targetDate = new Date(cfg.wedding.dateISO);
  const dayFormatter = new Intl.DateTimeFormat('en', { day: '2-digit' });
  const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
  setTextAll('[data-date-day]', dayFormatter.format(targetDate));
  setTextAll('[data-date-month]', monthFormatter.format(targetDate));

  const palette = document.querySelector('[data-palette]');
  cfg.dressCode.colors.forEach((color) => {
    const swatch = document.createElement('span');
    swatch.style.background = color;
    swatch.title = color;
    palette.appendChild(swatch);
  });

  const timeline = document.querySelector('[data-timeline]');
  cfg.timeline.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'timeline-item reveal';
    row.innerHTML = `<div class="timeline-time">${escapeHtml(item.time)}</div><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div>`;
    timeline.appendChild(row);
  });

  const gallery = document.querySelector('[data-gallery]');
  cfg.gallery.forEach((url, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item reveal';
    figure.innerHTML = `<img src="${url}" alt="Wedding inspiration photo ${index + 1}" loading="lazy" referrerpolicy="no-referrer" />`;
    gallery.appendChild(figure);
  });

  const entourage = document.querySelector('[data-entourage]');
  cfg.entourage.forEach((person) => {
    const card = document.createElement('article');
    card.className = 'entourage-card reveal';
    card.innerHTML = `<span>${escapeHtml(person.role)}</span><strong>${escapeHtml(person.names)}</strong>`;
    entourage.appendChild(card);
  });

  const faq = document.querySelector('[data-faq]');
  cfg.faq.forEach((item, index) => {
    const wrapper = document.createElement('article');
    wrapper.className = 'faq-item reveal';
    wrapper.innerHTML = `
      <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-${index}">
        <span>${escapeHtml(item.q)}</span><span>+</span>
      </button>
      <div class="faq-answer" id="faq-${index}"><p>${escapeHtml(item.a)}</p></div>`;
    const button = wrapper.querySelector('button');
    button.addEventListener('click', () => {
      const isOpen = wrapper.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
    faq.appendChild(wrapper);
  });

  function updateCountdown() {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) {
      setTextAll('[data-days]', '000');
      setTextAll('[data-hours]', '00');
      setTextAll('[data-minutes]', '00');
      setTextAll('[data-seconds]', '00');
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    setTextAll('[data-days]', String(days).padStart(3, '0'));
    setTextAll('[data-hours]', String(hours).padStart(2, '0'));
    setTextAll('[data-minutes]', String(minutes).padStart(2, '0'));
    setTextAll('[data-seconds]', String(seconds).padStart(2, '0'));
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  const form = document.querySelector('#rsvp-form');
  const status = document.querySelector('#form-status');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = 'Sending your RSVP...';

    if (!form.reportValidity()) {
      status.className = 'form-status error';
      status.textContent = 'Please complete the required fields.';
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.guests = Number(data.guests || 1);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to submit RSVP');

      if (result.stored === false) {
        const demo = JSON.parse(localStorage.getItem('wedding-demo-rsvps') || '[]');
        demo.push({ ...data, createdAt: new Date().toISOString() });
        localStorage.setItem('wedding-demo-rsvps', JSON.stringify(demo));
        status.textContent = 'RSVP received in demo mode. Connect Cloudflare D1 to store real guest responses.';
      } else {
        status.textContent = 'Thank you! Your RSVP has been received.';
      }
      form.reset();
    } catch (error) {
      const demo = JSON.parse(localStorage.getItem('wedding-demo-rsvps') || '[]');
      demo.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem('wedding-demo-rsvps', JSON.stringify(demo));
      status.textContent = 'Saved locally as a demo RSVP. Add the Cloudflare D1 binding for live storage.';
    }
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
