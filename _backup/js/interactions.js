// ============================================
// 星图 · Star Atlas — 交互系统
// (Raycaster + Camera Orbit + Hover/Click)
// ============================================
import * as THREE from 'three';
import { getCamera, getRenderer, onFrame, parallaxOffset } from './scene.js';
import { getActiveHitTargets, setStarHover, setStarClick, getStarScreenPosition, getStarData, startAnimations } from './constellations.js';
import { SCENE, INTERACTION } from './config.js';
import bus, { Events } from './event-bus.js';

// --- State ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredStarId = null;
let clickedStarId = null;
let lastRaycastTime = 0;

// Camera orbit state (spherical coordinates)
let cameraState = {
  theta: SCENE.defaultTheta,
  phi: SCENE.defaultPhi,
  radius: SCENE.defaultRadius,
};

let targetState = { ...cameraState };
let isAnimating = false;
let animStartTime = 0;
let animDuration = INTERACTION.cameraTransitionDuration;
let animStartState = { ...cameraState };
let isInputLocked = false;

// Drag state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragMoved = false;
const dragSensitivity = 0.004;

/**
 * Initialize all interactions
 */
export function initInteractions() {
  const canvas = getRenderer().domElement;

  // --- Set initial camera position ---
  updateCameraPosition();

  // --- Mouse events ---
  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // --- Touch events ---
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  // --- Keyboard ---
  window.addEventListener('keydown', onKeyDown);

  // --- Start pulse animation ---
  startAnimations();

  // --- Camera transition in animation loop ---
  onFrame(updateCameraTransition);

  // --- Listen for focus events ---
  bus.on(Events.FOCUS_CONSTELLATION, (data) => {
    animateCameraTo(data.theta, data.phi, data.radius);
  });

  bus.on(Events.FOCUS_OVERVIEW, () => {
    animateCameraTo(SCENE.defaultTheta, SCENE.defaultPhi, SCENE.defaultRadius);
  });

  bus.on(Events.CARD_CLOSE, () => {
    if (clickedStarId) {
      setStarClick(clickedStarId, false);
      clickedStarId = null;
    }
  });
}

// ============================================
// Camera
// ============================================

function updateCameraPosition() {
  const camera = getCamera();
  const baseX = cameraState.radius * Math.sin(cameraState.phi) * Math.cos(cameraState.theta);
  const baseY = cameraState.radius * Math.cos(cameraState.phi);
  const baseZ = cameraState.radius * Math.sin(cameraState.phi) * Math.sin(cameraState.theta);

  // Apply subtle parallax offset from mouse position
  const pScale = 1.5;
  const rightX = Math.cos(cameraState.theta);
  const rightZ = Math.sin(cameraState.theta);
  camera.position.set(
    baseX + rightX * parallaxOffset.x * pScale,
    baseY + parallaxOffset.y * pScale,
    baseZ + rightZ * parallaxOffset.x * pScale,
  );
  camera.lookAt(0, 0, 0);
}

function animateCameraTo(theta, phi, radius, duration = INTERACTION.cameraTransitionDuration) {
  targetState = { theta, phi, radius };
  animStartState = { ...cameraState };
  animStartTime = performance.now();
  animDuration = duration;
  isAnimating = true;
  isInputLocked = true;
  bus.emit(Events.CAMERA_TRANSITION_START);
}

function updateCameraTransition() {
  if (!isAnimating) return;

  const elapsed = performance.now() - animStartTime;
  const t = Math.min(elapsed / animDuration, 1);
  const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

  cameraState.theta = animStartState.theta + (targetState.theta - animStartState.theta) * ease;
  cameraState.phi = animStartState.phi + (targetState.phi - animStartState.phi) * ease;
  cameraState.radius = animStartState.radius + (targetState.radius - animStartState.radius) * ease;

  updateCameraPosition();

  if (t >= 1) {
    isAnimating = false;
    isInputLocked = false;
    cameraState = { ...targetState };
    bus.emit(Events.CAMERA_TRANSITION_END);
  }
}

/**
 * Get current camera spherical coordinates
 */
export function getCameraState() {
  return { ...cameraState };
}

/**
 * Check if camera is currently animating
 */
export function isCameraAnimating() {
  return isAnimating;
}

// ============================================
// Mouse Handlers
// ============================================

function getEventPos(event) {
  return {
    x: (event.clientX / window.innerWidth) * 2 - 1,
    y: -(event.clientY / window.innerHeight) * 2 + 1,
    screenX: event.clientX,
    screenY: event.clientY,
  };
}

function onMouseMove(event) {
  const now = performance.now();

  // Handle dragging
  if (isDragging && !isInputLocked) {
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;

    cameraState.theta -= dx * dragSensitivity;
    cameraState.phi -= dy * dragSensitivity;
    cameraState.phi = THREE.MathUtils.clamp(cameraState.phi, SCENE.minPhi, SCENE.maxPhi);

    dragStartX = event.clientX;
    dragStartY = event.clientY;
    updateCameraPosition();
    return;
  }

  // Throttle raycast for hover
  if (now - lastRaycastTime < INTERACTION.raycastThrottle) return;
  lastRaycastTime = now;

  const { x, y, screenX, screenY } = getEventPos(event);
  pointer.set(x, y);
  raycaster.setFromCamera(pointer, getCamera());

  const targets = getActiveHitTargets();
  const intersects = raycaster.intersectObjects(targets);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const starId = hit.userData.starId;

    if (hoveredStarId !== starId) {
      // Unhover previous
      if (hoveredStarId) {
        setStarHover(hoveredStarId, false);
        bus.emit(Events.STAR_HOVER, { starId: null });
      }
      // Hover new
      hoveredStarId = starId;
      setStarHover(starId, true);
      const starData = getStarData(starId);
      bus.emit(Events.STAR_HOVER, {
        starId,
        screenX,
        screenY,
        label: starData?.label || '',
        year: starData?.year || '',
      });
    }
  } else {
    if (hoveredStarId) {
      setStarHover(hoveredStarId, false);
      bus.emit(Events.STAR_HOVER, { starId: null });
      hoveredStarId = null;
    }
  }
}

function onMouseDown(event) {
  if (event.button !== 0) return; // left click only
  isDragging = true;
  dragMoved = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
}

function onMouseUp(event) {
  isDragging = false;

  if (!dragMoved && !isInputLocked) {
    // It's a click
    handleStarClick(event);
  }
}

function onWheel(event) {
  event.preventDefault();
  if (isInputLocked) return;

  cameraState.radius += event.deltaY * 0.5;
  cameraState.radius = THREE.MathUtils.clamp(cameraState.radius, SCENE.minRadius, SCENE.maxRadius);
  updateCameraPosition();
}

// ============================================
// Touch Handlers
// ============================================

let touchStartDist = 0;
let touchStartRadius = 0;
let lastTouchX = 0;
let lastTouchY = 0;

function onTouchStart(event) {
  if (event.touches.length === 1) {
    isDragging = true;
    dragMoved = false;
    dragStartX = event.touches[0].clientX;
    dragStartY = event.touches[0].clientY;
    lastTouchX = dragStartX;
    lastTouchY = dragStartY;
  } else if (event.touches.length === 2) {
    isDragging = false;
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    touchStartDist = Math.sqrt(dx * dx + dy * dy);
    touchStartRadius = cameraState.radius;
  }
}

function onTouchMove(event) {
  event.preventDefault();

  if (event.touches.length === 1 && isDragging && !isInputLocked) {
    const dx = event.touches[0].clientX - lastTouchX;
    const dy = event.touches[0].clientY - lastTouchY;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragMoved = true;

    cameraState.theta -= dx * dragSensitivity * 1.2;
    cameraState.phi -= dy * dragSensitivity * 1.2;
    cameraState.phi = THREE.MathUtils.clamp(cameraState.phi, SCENE.minPhi, SCENE.maxPhi);

    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
    updateCameraPosition();
  } else if (event.touches.length === 2 && !isInputLocked) {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = touchStartDist / Math.max(dist, 1);
    cameraState.radius = THREE.MathUtils.clamp(
      touchStartRadius * scale,
      SCENE.minRadius,
      SCENE.maxRadius,
    );
    updateCameraPosition();
  }
}

function onTouchEnd(event) {
  if (event.touches.length === 0) {
    // All fingers lifted - check for tap/click
    if (!dragMoved && !isInputLocked && event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      pointer.set(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, getCamera());
      const targets = getActiveHitTargets();
      const intersects = raycaster.intersectObjects(targets);

      if (intersects.length > 0) {
        const starId = intersects[0].object.userData.starId;
        handleStarClick({ clientX: touch.clientX, clientY: touch.clientY }, starId);
      } else {
        bus.emit(Events.CARD_CLOSE);
      }
    }
    isDragging = false;
  } else if (event.touches.length === 1) {
    // Pinch ended (went from 2 fingers to 1) - resume single-finger drag
    isDragging = true;
    dragMoved = false;
    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
  }
}

// ============================================
// Star Click
// ============================================

function handleStarClick(event, forceStarId) {
  let starId = forceStarId;

  if (!starId) {
    pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, getCamera());
    const targets = getActiveHitTargets();
    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      starId = intersects[0].object.userData.starId;
    }
  }

  if (!starId) {
    // Click on empty space
    bus.emit(Events.CARD_CLOSE);
    return;
  }

  const starData = getStarData(starId);
  if (!starData || starData.status !== 'active') return;

  // Visual feedback
  setStarClick(starId, true);
  clickedStarId = starId;

  // Light burst animation
  const screenPos = getStarScreenPosition(starId, getCamera());
  bus.emit(Events.LIGHT_BURST, { x: screenPos?.x || event.clientX, y: screenPos?.y || event.clientY });

  // Open card
  setTimeout(() => {
    bus.emit(Events.STAR_CLICK, {
      starId,
      constellationId: starData.constellationId || 'unknown',
      screenX: screenPos?.x || event.clientX,
      screenY: screenPos?.y || event.clientY,
    });
  }, 200);
}

// ============================================
// Keyboard
// ============================================

function onKeyDown(event) {
  switch (event.key) {
    case 'Escape':
      bus.emit(Events.CARD_CLOSE);
      break;
    case 'r':
    case 'R':
      animateCameraTo(SCENE.defaultTheta, SCENE.defaultPhi, SCENE.defaultRadius);
      break;
  }
}
