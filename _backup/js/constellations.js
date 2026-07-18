// ============================================
// 星图 · Star Atlas — 星座渲染
// 升级：激活星点为3D球体(仿行星)，配光晕精灵
// ============================================
import * as THREE from 'three';
import { getScene, onFrame } from './scene.js';
import { createGlowTexture } from './starfield.js';
import { ALL_CONSTELLATIONS } from './data.js';
import { COLORS, INTERACTION } from './config.js';

// Track all star objects for interaction
const starSprites = new Map();       // starId -> { group, mesh, glowSprite, hitMesh, data, baseScale, baseOpacity }
const constellationLines = new Map(); // constellationId -> { group, lineSegments }

/**
 * Initialize all constellations
 */
export function initConstellations() {
  for (const constellation of ALL_CONSTELLATIONS) {
    createConstellation(constellation);
  }
}

/**
 * Create a single constellation: stars + connecting lines
 */
function createConstellation(constellation) {
  const scene = getScene();

  // --- Create star objects ---
  for (const star of Object.values(constellation.stars)) {
    const isActive = star.status === 'active';
    const isLife = star.type === 'life';
    const careerColor = '#72c6ff';
    const lifeColor = '#c89eff';
    const colorHex = isLife ? lifeColor : careerColor;
    const colorNum = isLife ? COLORS.life : COLORS.career;

    const group = new THREE.Group();
    const pos = star.position;
    group.position.set(pos.x, pos.y, pos.z);

    if (isActive) {
      // --- 3D Sphere (planet) ---
      const sphereGeo = new THREE.SphereGeometry(1.6, 24, 24);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: colorNum,
        emissive: colorNum,
        emissiveIntensity: 0.5,
        shininess: 40,
        specular: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 0.95,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.castShadow = false;
      group.add(sphere);

      // --- Glow sprite halo ---
      const glowCanvas = createGlowTexture(128, colorHex);
      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
        color: colorNum,
      });
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.set(6, 6, 1);
      group.add(glowSprite);

      // --- Hit mesh (slightly larger than sphere) ---
      const hitGeo = new THREE.SphereGeometry(2.2, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { starId: star.id, constellationId: constellation.id, isActive: true };
      group.add(hitMesh);

      scene.add(group);

      starSprites.set(star.id, {
        group,
        mesh: sphere,
        glowSprite,
        hitMesh,
        data: star,
        baseScale: 1.0,
        baseOpacity: 0.7,
      });
    } else {
      // --- Dormant star: simple dim sprite ---
      const glowCanvas = createGlowTexture(48, colorHex);
      const texture = new THREE.CanvasTexture(glowCanvas);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.15,
        color: colorNum,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.8, 1.8, 1);

      // Small hit mesh (needed for hover detection on dormant stars)
      const hitGeo = new THREE.SphereGeometry(1.5, 4, 4);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(sprite.position);
      hitMesh.userData = { starId: star.id, constellationId: constellation.id, isActive: false };

      scene.add(sprite);
      scene.add(hitMesh);

      starSprites.set(star.id, {
        group: null,
        mesh: null,
        glowSprite: sprite,
        hitMesh,
        data: star,
        baseScale: 1.8,
        baseOpacity: 0.15,
      });
    }
  }

  // --- Create connecting lines ---
  const lineGroup = new THREE.Group();
  lineGroup.name = `${constellation.id}-lines`;
  const lineSegments = [];

  for (const [fromId, toId] of constellation.connections) {
    const fromStar = constellation.stars[fromId];
    const toStar = constellation.stars[toId];
    if (!fromStar || !toStar) continue;

    const fromPos = fromStar.position;
    const toPos = toStar.position;

    const points = [
      new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z),
      new THREE.Vector3(toPos.x, toPos.y, toPos.z),
    ];

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: COLORS.line,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });

    const line = new THREE.Line(lineGeo, lineMat);
    line.userData = { from: fromId, to: toId };
    lineGroup.add(line);
    lineSegments.push({ line, from: fromId, to: toId });
  }

  scene.add(lineGroup);

  constellationLines.set(constellation.id, { group: lineGroup, lineSegments });
}

/**
 * Get all hit-test meshes for raycasting
 */
export function getHitTargets() {
  return [...starSprites.values()].map(s => s.hitMesh);
}

/**
 * Get active stars only for raycasting
 */
export function getActiveHitTargets() {
  return [...starSprites.values()]
    .filter(s => s.data.status === 'active')
    .map(s => s.hitMesh);
}

/**
 * Pulse animation — active stars slowly breathe
 */
export function updatePulse(delta, elapsed) {
  for (const [id, entry] of starSprites) {
    if (entry.data.status !== 'active') continue;
    if (entry._hoverScale || entry._clickScale) continue;

    const pulse = 1 + Math.sin(elapsed * INTERACTION.pulseSpeed + id.charCodeAt(0)) * 0.08;
    if (entry.glowSprite) {
      const s = 6 * pulse;
      entry.glowSprite.scale.set(s, s, 1);
    }
    if (entry.mesh) {
      entry.mesh.material.emissiveIntensity = 0.4 + Math.sin(elapsed * INTERACTION.pulseSpeed + id.charCodeAt(0)) * 0.15;
    }
  }
}

export function startPulseAnimation() {
  let registered = false;
  return () => {
    if (registered) return;
    registered = true;
    onFrame(updatePulse);
    onFrame(updateStarRotation);
  };
}
export const startAnimations = startPulseAnimation();

/**
 * Set star hover state
 */
export function setStarHover(starId, isHover) {
  const entry = starSprites.get(starId);
  if (!entry || entry.data.status !== 'active') return;
  const isLife = entry.data.type === 'life';

  if (isHover) {
    entry._hoverScale = true;
    if (entry.mesh) {
      entry.mesh.material.emissiveIntensity = 1.2;
    }
    if (entry.glowSprite) {
      entry.glowSprite.scale.set(9, 9, 1);
      entry.glowSprite.material.opacity = 1;
      entry.glowSprite.material.color.setHex(0xffffff);
    }
  } else {
    entry._hoverScale = null;
    if (entry.mesh) {
      entry.mesh.material.emissiveIntensity = entry._clickScale ? 1.0 : 0.5;
    }
    if (entry.glowSprite) {
      entry.glowSprite.scale.set(6, 6, 1);
      entry.glowSprite.material.opacity = entry._clickScale ? 1.0 : 0.7;
      entry.glowSprite.material.color.setHex(isLife ? COLORS.life : COLORS.career);
    }
  }

  brightenConnectedLines(starId, isHover);
}

/**
 * Set star click state
 */
export function setStarClick(starId, isClick) {
  const entry = starSprites.get(starId);
  if (!entry || entry.data.status !== 'active') return;
  const isLife = entry.data.type === 'life';

  if (isClick) {
    entry._clickScale = true;
    if (entry.mesh) {
      entry.mesh.material.emissiveIntensity = 1.0;
    }
    if (entry.glowSprite) {
      entry.glowSprite.scale.set(10, 10, 1);
      entry.glowSprite.material.opacity = 1;
      entry.glowSprite.material.color.setHex(0xffffff);
    }
  } else {
    entry._clickScale = null;
    if (entry.mesh) {
      entry.mesh.material.emissiveIntensity = entry._hoverScale ? 1.2 : 0.5;
    }
    if (entry.glowSprite) {
      entry.glowSprite.scale.set(entry._hoverScale ? 9 : 6, entry._hoverScale ? 9 : 6, 1);
      entry.glowSprite.material.opacity = 0.7;
      entry.glowSprite.material.color.setHex(isLife ? COLORS.life : COLORS.career);
    }
  }
}

/**
 * Brighten constellation lines connected to a star
 */
function brightenConnectedLines(starId, brighten) {
  for (const [, cData] of constellationLines) {
    for (const seg of cData.lineSegments) {
      if (seg.from === starId || seg.to === starId) {
        seg.line.material.opacity = brighten ? 0.5 : 0.12;
        seg.line.material.color.setHex(brighten ? 0xd0e8ff : COLORS.line);
      }
    }
  }
}

/**
 * Get star screen position (for card/tooltip positioning)
 */
export function getStarScreenPosition(starId, camera) {
  const entry = starSprites.get(starId);
  if (!entry) return null;

  const pos = entry.group
    ? entry.group.position
    : entry.glowSprite.position;

  const vector = pos.clone();
  vector.project(camera);

  return {
    x: (vector.x * 0.5 + 0.5) * window.innerWidth,
    y: (-vector.y * 0.5 + 0.5) * window.innerHeight,
    visible: vector.z < 1,
  };
}

/**
 * Get star data by id
 */
export function getStarData(starId) {
  return starSprites.get(starId)?.data || null;
}

/**
 * Get all star sprites map
 */
export function getStarSprites() {
  return starSprites;
}

/**
 * Highlight all lines for a constellation
 */
export function highlightConstellation(constellationId, highlight) {
  const cData = constellationLines.get(constellationId);
  if (!cData) return;
  cData.group.children.forEach(line => {
    line.material.opacity = highlight ? 0.3 : 0.12;
  });
}

/**
 * Make all active stars rotate slowly
 */
export function updateStarRotation(delta, _elapsed) {
  for (const [, entry] of starSprites) {
    if (entry.data.status !== 'active' || !entry.mesh) continue;
    entry.mesh.rotation.y += delta * 0.3;
    entry.mesh.rotation.x += delta * 0.1;
  }
}
