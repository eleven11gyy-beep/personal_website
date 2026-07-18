// ============================================
// 星图 · Star Atlas — 底部悬浮控制栏
// ============================================
import { PERSONAL } from './data.js';
import { toggleNebula } from './starfield.js';
import bus, { Events } from './event-bus.js';

const FOCUS_MAP = {
  'big-dipper': { theta: 0.50, phi: 1.20, radius: 160 },
  'skills':     { theta: 0.00, phi: 1.26, radius: 175 },
  'life':       { theta: 0.76, phi: 1.10, radius: 180 },
  'overview':   { theta: 0.42, phi: 1.15, radius: 300 },
};

let currentFocus = 'big-dipper';
let atmosphereOn = true;

export function initControls() {
  // --- Constellation focus buttons ---
  document.querySelectorAll('[data-constellation]').forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.constellation;

      document.querySelectorAll('[data-constellation]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFocus = viewId;

      const target = FOCUS_MAP[viewId];
      if (target) {
        bus.emit(Events.FOCUS_CONSTELLATION, target);
      }
    });
  });

  // --- About button ---
  document.querySelector('[data-action="about"]')?.addEventListener('click', () => {
    const modal = document.getElementById('about-modal');
    const content = document.getElementById('about-content');
    if (content) content.textContent = PERSONAL.about;
    modal?.classList.remove('hidden');
    modal?.classList.add('visible');
  });

  // --- Contact button ---
  document.querySelector('[data-action="contact"]')?.addEventListener('click', () => {
    const modal = document.getElementById('contact-modal');
    const content = document.getElementById('contact-content');
    if (content) {
      const c = PERSONAL.contact;
      const links = [];
      if (c.email) links.push(`<a class="contact-link" href="mailto:${c.email}"><svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 6l8 5.5L18 6" stroke="currentColor" stroke-width="1.2"/></svg>${c.email}</a>`);
      if (c.github) links.push(`<a class="contact-link" href="${c.github}" target="_blank" rel="noopener"><svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 00-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.67 7.67 0 0110 5.87c.68 0 1.36.09 2 .26 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.5v2.22c0 .21.15.46.55.38A8 8 0 0010 2z" fill="currentColor"/></svg>GitHub</a>`);
      if (c.blog) links.push(`<a class="contact-link" href="${c.blog}" target="_blank" rel="noopener"><svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.2"/><path d="M7 10h6M10 7v6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>Blog</a>`);
      content.innerHTML = links.join('');
    }
    modal?.classList.remove('hidden');
    modal?.classList.add('visible');
  });

  // --- Atmosphere toggle ---
  const atmoBtn = document.getElementById('atmo-toggle');
  atmoBtn?.addEventListener('click', () => {
    atmosphereOn = !atmosphereOn;
    const icon = atmoBtn.querySelector('.atmo-icon');
    if (atmosphereOn) {
      icon?.classList.remove('off');
      atmoBtn.classList.remove('inactive');
    } else {
      icon?.classList.add('off');
      atmoBtn.classList.add('inactive');
    }
    toggleNebula(atmosphereOn);
  });

  // --- Modal close overlay click ---
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('visible');
      }
    });
  });

  // --- Modal close buttons ---
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('visible');
      }
    });
  });

  // --- Easter egg dismiss ---
  document.getElementById('easter-egg')?.addEventListener('click', () => {
    document.getElementById('easter-egg')?.classList.remove('visible');
  });

  // --- Keyboard shortcuts ---
  window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case '1': document.querySelector('[data-constellation="big-dipper"]')?.click(); break;
      case '2': document.querySelector('[data-constellation="skills"]')?.click(); break;
      case '3': document.querySelector('[data-constellation="life"]')?.click(); break;
      case '4': document.querySelector('[data-constellation="overview"]')?.click(); break;
      case 'escape':
        document.querySelectorAll('.modal-overlay.visible').forEach(m => {
          m.classList.add('hidden');
          m.classList.remove('visible');
        });
        document.getElementById('easter-egg')?.classList.remove('visible');
        bus.emit(Events.CARD_CLOSE);
        break;
    }
  });
}

export function getCurrentFocus() {
  return currentFocus;
}
