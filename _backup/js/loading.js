// ============================================
// 星图 · Star Atlas — 启动加载动画
// ============================================
import { ANIMATION, IS_MOBILE } from './config.js';
import bus, { Events } from './event-bus.js';

let progress = 0;
let loadingComplete = false;

/**
 * Initialize loading screen
 */
export function initLoading() {
  createLoadingStars();

  // Listen for progress updates
  bus.on(Events.LOAD_PROGRESS, (pct) => {
    progress = pct;
    updateProgressBar(pct);

    if (pct >= 100 && !loadingComplete) {
      loadingComplete = true;
      startStarLightingSequence();
    }
  });

  // If loading is already at 100%+ when we register, trigger immediately
  if (progress >= 100 && !loadingComplete) {
    loadingComplete = true;
    startStarLightingSequence();
  }
}

/**
 * Update the loading progress
 */
function updateProgressBar(pct) {
  const textEl = document.getElementById('loader-text');
  const pctEl = document.getElementById('loader-percent');
  if (textEl) textEl.textContent = pct < 100 ? '加载中' : '开始探索';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
}

/**
 * Create background star dots in loading screen
 */
function createLoadingStars() {
  const container = document.getElementById('loading-stars');
  if (!container) return;

  const count = IS_MOBILE ? 60 : 120;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'loading-star';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = Math.random() * 100 + '%';
    dot.style.animationDelay = Math.random() * 2 + 's';
    dot.dataset.index = i;
    container.appendChild(dot);
  }
}

/**
 * Sequential star lighting animation
 */
async function startStarLightingSequence() {
  await delay(200);

  const allDots = [...document.querySelectorAll('.loading-star')];
  if (allDots.length === 0) {
    finishLoading();
    return;
  }

  const dipperDots = allDots.slice(0, 7); // First 7 dots represent Big Dipper
  const otherDots = allDots.slice(7);

  // Phase 1: Light up random background stars in batches
  for (let i = 0; i < otherDots.length; i += 5) {
    const batch = otherDots.slice(i, i + 5);
    for (const dot of batch) {
      dot.classList.add('lit');
      if (Math.random() > 0.7) dot.classList.add('life');
    }
    await delay(ANIMATION.loadingStarDelay);
  }

  // Brief pause before Big Dipper
  await delay(ANIMATION.loadingDipperPause);

  // Phase 2: Big Dipper stars light up in sequence
  for (const dot of dipperDots) {
    dot.classList.add('dipper-star', 'lit');
    await delay(ANIMATION.loadingDipperDelay);
  }

  await delay(400);
  finishLoading();
}

/**
 * Fade out loading screen and complete
 */
function finishLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  screen.classList.add('fade-out');

  setTimeout(() => {
    bus.emit(Events.LOAD_COMPLETE);
  }, 800);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
