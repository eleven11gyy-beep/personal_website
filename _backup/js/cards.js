// ============================================
// 星图 · Star Atlas — 玻璃态卡片系统
// ============================================
import { getStarById } from './data.js';
import bus, { Events } from './event-bus.js';

let isOpen = false;
let currentStarId = null;

/**
 * Initialize card system
 */
export function initCards() {
  // Close button
  const closeBtn = document.getElementById('card-close');
  closeBtn.addEventListener('click', closeCard);

  // Click overlay background to close
  const overlay = document.getElementById('card-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCard();
  });

  // Listen for star click
  bus.on(Events.STAR_CLICK, (data) => {
    openCard(data.starId);
  });

  // Listen for card close
  bus.on(Events.CARD_CLOSE, () => {
    closeCard();
  });

  // Light burst
  bus.on(Events.LIGHT_BURST, (pos) => {
    triggerLightBurst(pos.x, pos.y);
  });

  // Hover tooltip
  bus.on(Events.STAR_HOVER, (data) => {
    updateTooltip(data);
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.add('hidden');
    });
  });

  // Modal overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // About modal content
  const aboutContent = document.getElementById('about-content');
  if (aboutContent) {
    aboutContent.textContent = ''; // Will be loaded from data
  }

  // Easter egg
  initEasterEgg();
}

/**
 * Open card for a given star
 */
function openCard(starId) {
  const starData = getStarById(starId);
  if (!starData || !starData.content) return;

  const card = document.getElementById('glass-card');
  const overlay = document.getElementById('card-overlay');

  // Set card accent color
  const isLife = starData.type === 'life';
  card.style.borderColor = isLife
    ? 'rgba(200, 158, 255, 0.25)'
    : 'rgba(114, 198, 255, 0.25)';

  // Populate content
  card.querySelector('.card-title').textContent = starData.content.title;
  const periodParts = [starData.label];
  if (starData.year) periodParts.push(starData.year);
  card.querySelector('.card-period').textContent = periodParts.join(' · ');
  card.querySelector('.card-description').textContent = starData.content.description;

  // Badge
  const badge = card.querySelector('.card-badge');
  badge.textContent = starData.name;
  badge.className = 'card-badge' + (isLife ? ' life' : '');

  // Highlights
  const highlightsHtml = starData.content.highlights
    ? starData.content.highlights.map(h => `<span style="display:inline-block;margin:2px 4px;padding:2px 10px;border-radius:12px;font-size:0.7rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">${h}</span>`).join('')
    : '';

  // Images
  const imagesHtml = starData.content.images
    ? starData.content.images.map(img => `<img src="${img}" alt="" />`).join('')
    : '';
  card.querySelector('.card-images').innerHTML = imagesHtml;

  // Links
  const linksHtml = starData.content.links && starData.content.links.length > 0
    ? starData.content.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')
    : '';
  card.querySelector('.card-links').innerHTML = linksHtml;

  // Quote
  card.querySelector('.card-quote').textContent = starData.content.quote || '';

  // Show overlay
  overlay.classList.add('visible');
  isOpen = true;
  currentStarId = starId;

  bus.emit(Events.CARD_OPEN, { starId });
}

/**
 * Close the card
 */
function closeCard() {
  if (!isOpen) return;

  const overlay = document.getElementById('card-overlay');
  overlay.classList.remove('visible');
  isOpen = false;
  currentStarId = null;
}

/**
 * Update hover tooltip
 */
function updateTooltip(data) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  if (!data || !data.starId) {
    tooltip.classList.add('hidden');
    tooltip.classList.remove('visible');
    return;
  }

  const labelEl = tooltip.querySelector('.tooltip-label');
  const yearEl = tooltip.querySelector('.tooltip-year');

  if (labelEl) labelEl.textContent = data.label || '';
  if (yearEl) yearEl.textContent = data.year || '';

  tooltip.style.left = data.screenX + 'px';
  tooltip.style.top = data.screenY + 'px';
  tooltip.classList.remove('hidden');
  tooltip.classList.add('visible');
}

/**
 * Trigger light burst effect at position
 */
function triggerLightBurst(x, y) {
  const burst = document.getElementById('light-burst');
  burst.style.left = x + 'px';
  burst.style.top = y + 'px';
  burst.classList.remove('active');
  burst.classList.remove('hidden');

  // Force reflow
  void burst.offsetWidth;
  burst.classList.add('active');

  // Cleanup
  setTimeout(() => {
    burst.classList.add('hidden');
    burst.classList.remove('active');
  }, 750);
}

// ============================================
// Easter Egg
// ============================================

const ACTIVE_DIPPER_STARS = ['tianshu', 'tianji', 'tianquan', 'kaiyang', 'yaoguang'];
const clickedEasterStars = new Set();
let easterEggTriggered = false;

function initEasterEgg() {
  bus.on(Events.STAR_CLICK, ({ starId }) => {
    if (easterEggTriggered) return;
    if (!ACTIVE_DIPPER_STARS.includes(starId)) return;

    clickedEasterStars.add(starId);

    if (clickedEasterStars.size >= ACTIVE_DIPPER_STARS.length) {
      triggerEasterEgg();
    }
  });
}

function triggerEasterEgg() {
  if (easterEggTriggered) return;
  easterEggTriggered = true;

  bus.emit(Events.EASTER_EGG);

  const overlay = document.getElementById('easter-egg');
  const sloganEl = overlay.querySelector('.easter-egg-slogan');
  const subEl = overlay.querySelector('.easter-egg-sub');

  const slogan = '人活无数瞬间，星亮漫漫长夜';
  const sub = '所有细碎闪光，都是人生的支点';

  sloganEl.textContent = '';
  subEl.textContent = '';

  overlay.classList.add('visible');

  // Typewriter effect
  let i = 0;
  const interval = setInterval(() => {
    sloganEl.textContent = slogan.slice(0, i + 1);
    i++;
    if (i >= slogan.length) {
      clearInterval(interval);
      // Show subtitle after slogan
      setTimeout(() => {
        subEl.textContent = sub;
      }, 400);

      // Auto-dismiss
      setTimeout(() => {
        overlay.classList.remove('visible');
      }, 5000);
    }
  }, 100);
}
