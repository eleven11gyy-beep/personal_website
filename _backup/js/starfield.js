// ============================================
// 星图 · Star Atlas — 三层星空粒子系统
// ============================================
import * as THREE from 'three';
import { getScene, onFrame } from './scene.js';
import { STARFIELD, COLORS, IS_MOBILE, ATMOSPHERE } from './config.js';

let nebulaGroup;
let nebulaEnabled = true;
let starTwinkleMaterial = null;

/**
 * Initialize all star field layers
 */
export function initStarfield() {
  createDistantStars();
  createNebulaClouds();
  createConstellationPoints();
}

/**
 * Layer 1: Distant static background stars
 */
function createDistantStars() {
  const scene = getScene();
  const count = STARFIELD.distantCount;
  const radiusMin = STARFIELD.distantMinRadius;
  const radiusMax = STARFIELD.distantRadius;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Uniform spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radiusMin + Math.random() * (radiusMax - radiusMin);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Slight color variation: mostly white-blue with occasional warm
    const colorChoice = Math.random();
    if (colorChoice < 0.7) {
      colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
    } else if (colorChoice < 0.85) {
      colors[i * 3] = 0.78; colors[i * 3 + 1] = 0.62; colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 1.0;
    }

    // Size distribution: 70% tiny, 25% medium, 5% bright
    const sizeRand = Math.random();
    if (sizeRand < 0.70) {
      sizes[i] = STARFIELD.starSizeSmall + Math.random() * 0.15;
    } else if (sizeRand < 0.95) {
      sizes[i] = STARFIELD.starSizeSmall + 0.15 + Math.random() * 0.3;
    } else {
      sizes[i] = STARFIELD.starSizeLarge * (0.6 + Math.random() * 0.4);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Use a circular sprite texture
  const spriteCanvas = createGlowTexture(64, '#ffffff');
  const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

  starTwinkleMaterial = new THREE.PointsMaterial({
    size: 0.8,
    map: spriteTexture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, starTwinkleMaterial);
  points.name = 'distantStars';
  scene.add(points);

  // Gentle twinkle animation
  onFrame((delta, elapsed) => {
    if (starTwinkleMaterial) {
      starTwinkleMaterial.opacity = 0.6 + Math.sin(elapsed * ATMOSPHERE.starTwinkleSpeed) * 0.08;
    }
  });
}

/**
 * Create a radial glow texture via Canvas
 */
export function createGlowTexture(size, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.05, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.15, colorHex + 'cc');
  gradient.addColorStop(0.4, colorHex + '40');
  gradient.addColorStop(0.7, colorHex + '08');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}

/**
 * Layer 2: Nebula / galaxy clouds
 */
function createNebulaClouds() {
  if (IS_MOBILE && STARFIELD.nebulaCount < 4) return;

  const scene = getScene();
  nebulaGroup = new THREE.Group();
  nebulaGroup.name = 'nebulaClouds';

  for (let i = 0; i < STARFIELD.nebulaCount; i++) {
    const size = 80 + Math.random() * 200;
    const canvas = createNebulaTexture(256, size);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: ATMOSPHERE.nebulaOpacity * (0.6 + Math.random() * 0.4),
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size * 0.6, 1);

    // Random position on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = STARFIELD.nebulaRadius + Math.random() * 80;
    sprite.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );

    // Random rotation
    sprite.material.rotation = Math.random() * Math.PI * 2;

    nebulaGroup.add(sprite);
  }

  scene.add(nebulaGroup);

  // Slow rotation
  onFrame((delta) => {
    if (nebulaEnabled && nebulaGroup) {
      nebulaGroup.rotation.y += ATMOSPHERE.nebulaRotationSpeed * (0.5 + Math.random() * 0.1);
      nebulaGroup.rotation.x += ATMOSPHERE.nebulaRotationSpeed * 0.3;
    }
  });
}

/**
 * Create a nebula cloud texture
 */
function createNebulaTexture(size, _displaySize) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base gradient
  const baseGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  baseGrad.addColorStop(0, 'rgba(100, 140, 220, 0.15)');
  baseGrad.addColorStop(0.3, 'rgba(80, 100, 200, 0.08)');
  baseGrad.addColorStop(0.6, 'rgba(140, 100, 220, 0.04)');
  baseGrad.addColorStop(0.85, 'rgba(60, 80, 180, 0.01)');
  baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Add some irregular blobs
  for (let i = 0; i < 5; i++) {
    const x = size * (0.2 + Math.random() * 0.6);
    const y = size * (0.2 + Math.random() * 0.6);
    const r = size * (0.1 + Math.random() * 0.3);

    const blobGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const hue = Math.random() < 0.5 ? '180, 200, 255' : '200, 160, 255';
    blobGrad.addColorStop(0, `rgba(${hue}, ${0.06 + Math.random() * 0.06})`);
    blobGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = blobGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/**
 * Layer 3: Constellation-background points (mid-layer decorative)
 */
function createConstellationPoints() {
  if (IS_MOBILE && STARFIELD.constellationPointCount < 40) return;

  const scene = getScene();
  const count = STARFIELD.constellationPointCount;
  const radius = STARFIELD.constellationPointRadius;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius + (Math.random() - 0.5) * 60;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.4,
    color: 0xb8e0ff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.25,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'constellationPoints';
  scene.add(points);
}

/**
 * Toggle nebula visibility
 */
export function toggleNebula(enabled) {
  nebulaEnabled = enabled;
  if (nebulaGroup) {
    nebulaGroup.visible = enabled;
  }
}

/**
 * Get nebula enabled state
 */
export function isNebulaEnabled() { return nebulaEnabled; }

/**
 * Flash galaxy (for easter egg)
 */
export function flashGalaxy() {
  if (starTwinkleMaterial) {
    const orig = starTwinkleMaterial.opacity;
    starTwinkleMaterial.opacity = 0.9;
    setTimeout(() => { starTwinkleMaterial.opacity = orig; }, 2000);
  }
}
