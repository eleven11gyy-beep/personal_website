// ============================================
// 星图 · Star Atlas — 主入口
// ============================================
import { init as initScene, startLoop, setupBloom, initParallax } from './scene.js';
import { initStarfield } from './starfield.js';
import { initConstellations } from './constellations.js';
import { initInteractions } from './interactions.js';
import { initCards } from './cards.js';
import { initLoading } from './loading.js';
import { initControls } from './controls.js';
import bus, { Events } from './event-bus.js';

/**
 * Bootstrap: sequential initialization
 */
async function bootstrap() {
  console.log('🌌 星图 · Star Atlas — Initializing...');

  // Register loading screen listener FIRST so it catches all progress events
  initLoading();

  // Phase 1: Scene
  initScene();

  // Phase 2: Star field (background particles + nebula)
  initStarfield();
  bus.emit(Events.LOAD_PROGRESS, 30);

  // Phase 3: Constellations (stars + lines)
  initConstellations();
  bus.emit(Events.LOAD_PROGRESS, 55);

  // Phase 4: Parallax (mouse camera offset)
  initParallax();

  // Phase 5: Interactions (raycaster + camera orbit)
  initInteractions();
  bus.emit(Events.LOAD_PROGRESS, 70);

  // Phase 6: Post-processing (bloom)
  await setupBloom();
  bus.emit(Events.LOAD_PROGRESS, 82);

  // Phase 6: UI layer
  initCards();
  initControls();
  bus.emit(Events.LOAD_PROGRESS, 92);

  // Signal 100% to trigger star lighting sequence
  bus.emit(Events.LOAD_PROGRESS, 100);

  // Start animation loop
  startLoop();

  console.log('✨ Star Atlas ready.');
}

// Handle errors
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

// Start!
bootstrap().catch(err => {
  console.error('Failed to initialize:', err);
  document.getElementById('loading-screen')?.classList.add('fade-out');
});
