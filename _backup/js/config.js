// ============================================
// 星图 · Star Atlas — 全局配置常量
// ============================================

// --- Device Detection ---
export const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || window.innerWidth < 768;

export const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// --- Color System ---
export const COLORS = {
  bgDeep: 0x020308,
  career: 0x72c6ff,       // 职业/成长 冷调青蓝
  life: 0xc89eff,         // 生活/爱好 淡紫柔光
  line: 0xb8e0ff,         // 星座连线 浅冰蓝半透明
  text: 0xf0f5ff,         // 文字色 浅灰白
};

// --- Scene ---
export const SCENE = {
  cameraFov: 60,
  cameraNear: 0.1,
  cameraFar: 2000,
  defaultRadius: 300,      // Closer default for compact layout
  defaultTheta: 0.45,
  defaultPhi: 1.15,
  minRadius: 100,
  maxRadius: 500,
  minPhi: 0.1,
  maxPhi: Math.PI - 0.1,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// --- Star Field (increased density) ---
export const STARFIELD = {
  distantCount: IS_MOBILE ? 4000 : 6000,  // ↑ 1500/5000 → denser
  distantRadius: 500,
  distantMinRadius: 250,
  starSizeSmall: 0.25,       // Smaller for more natural look
  starSizeLarge: 1.8,
  // Size distribution: 70% tiny, 25% medium, 5% bright
  nebulaCount: IS_MOBILE ? 8 : 16,        // ↑ more nebula
  nebulaRadius: 380,
  constellationPointCount: IS_MOBILE ? 120 : 350,  // ↑
  constellationPointRadius: 280,
};

// --- Constellation Sphere ---
export const CONSTELLATION_SPHERE = {
  dipperRadius: 200,     // Compressed
  majorRadius: 185,      // Orion/Andromeda/Lyra/Scorpius
  miniRadius: 175,       // Mini constellations
};

// --- Interaction ---
export const INTERACTION = {
  raycastThrottle: IS_MOBILE ? 150 : 40,
  clickDragThreshold: 4,
  starHoverScale: 1.6,
  starClickScale: 2.2,
  pulseSpeed: 1.5,
  cameraTransitionDuration: 800,   // ↓ 1200 → faster
  tooltipOffsetY: -30,
};

// --- Animation ---
export const ANIMATION = {
  loadingStarDelay: 50,
  loadingDipperDelay: 180,
  loadingDipperPause: 200,
  cardEnterDuration: 400,
  lightBurstDuration: 700,
  easterEggDuration: 5000,
  cameraEasing: (t) => 1 - Math.pow(1 - t, 3),
};

// --- Atmospheric Effects ---
export const ATMOSPHERE = {
  bloomStrength: 0.8,
  bloomRadius: 0.5,
  bloomThreshold: 0.1,
  nebulaOpacity: 0.08,       // ↑ slightly denser
  nebulaRotationSpeed: 0.0002,
  starTwinkleSpeed: 0.8,
};
