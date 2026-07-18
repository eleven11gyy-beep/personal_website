// ============================================
// 星图 · Star Atlas — Three.js 场景管理
// ============================================
import * as THREE from 'three';
import { SCENE, COLORS, IS_MOBILE } from './config.js';
import bus, { Events } from './event-bus.js';

let scene, camera, renderer;
let composer = null;
let bloomPass = null;
let animationCallbacks = [];

/**
 * Initialize the Three.js scene, camera, and renderer
 */
export function init() {
  // --- Scene ---
  scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.bgDeep);
  scene.fog = new THREE.FogExp2(COLORS.bgDeep, 0.00008);

  // --- Lighting for 3D planet spheres ---
  const ambient = new THREE.AmbientLight(0x446688, 0.6);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x72c6ff, 0x020308, 0.8);
  scene.add(hemi);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(10, 15, 10);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x72c6ff, 0.5);
  dirLight2.position.set(-8, 5, -10);
  scene.add(dirLight2);

  // --- Camera ---
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(SCENE.cameraFov, aspect, SCENE.cameraNear, SCENE.cameraFar);

  // --- Renderer ---
  renderer = new THREE.WebGLRenderer({
    antialias: !IS_MOBILE,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(SCENE.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping || THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const container = document.getElementById('canvas-container');
  container.appendChild(renderer.domElement);

  // --- Handle resize ---
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));

  bus.emit(Events.LOAD_PROGRESS, 10);
}

/**
 * Render loop
 */
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Run animation callbacks
  for (const cb of animationCallbacks) {
    try { cb(delta, elapsed); } catch (e) { console.error(e); }
  }

  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

/**
 * Start the animation loop
 */
export function startLoop() {
  animate();
}

/**
 * Register a per-frame callback
 */
export function onFrame(cb) {
  animationCallbacks.push(cb);
  return () => {
    animationCallbacks = animationCallbacks.filter(c => c !== cb);
  };
}

/**
 * Handle window resize
 */
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  if (composer) {
    composer.setSize(w, h);
  }
}

/**
 * Set up post-processing (UnrealBloomPass)
 */
export async function setupBloom() {
  if (IS_MOBILE) return; // Skip bloom on mobile for performance

  try {
    const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
    const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
    const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8,  // strength
      0.5,  // radius
      0.1,  // threshold
    );
    composer.addPass(bloomPass);
  } catch (e) {
    console.warn('Bloom post-processing not available:', e.message);
  }
}

/**
 * Set bloom intensity
 */
export function setBloomIntensity(val) {
  if (bloomPass) {
    bloomPass.strength = val;
  }
}

/**
 * Get scene objects
 */
export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }
export function getComposer() { return composer; }
export function getBloomPass() { return bloomPass; }

// --- Parallax mouse tracking ---
export const mouseNormal = { x: 0, y: 0 };
export const parallaxOffset = { x: 0, y: 0 };

// Initialize mouse tracking
export function initParallax() {
  window.addEventListener('mousemove', (e) => {
    mouseNormal.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormal.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // Update parallax offset each frame (smooth interpolation)
  onFrame((_delta, _elapsed) => {
    const targetX = mouseNormal.x * 0.6;
    const targetY = mouseNormal.y * 0.3;
    parallaxOffset.x += (targetX - parallaxOffset.x) * 0.05;
    parallaxOffset.y += (targetY - parallaxOffset.y) * 0.05;
  });
}
