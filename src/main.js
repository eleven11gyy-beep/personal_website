import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { lerp } from './utils/helpers';

import nebulaVertexShader from './shaders/nebula/vertex.glsl';
import nebulaFragmentShader from './shaders/nebula/fragment.glsl';
import starsVertexShader from './shaders/stars/vertex.glsl';
import starsFragmentShader from './shaders/stars/fragment.glsl';
import ambientStarsVertexShader from './shaders/ambientStars/vertex.glsl';
import ambientStarsFragmentShader from './shaders/ambientStars/fragment.glsl';
import spaceVertexShader from './shaders/spaceFog/vertex.glsl';
import spaceFragmentShader from './shaders/spaceFog/fragment.glsl';
import { ALL_CONSTELLATIONS, PERSONAL, getStarById } from './star-data.js';

// ============================================
// 星图 · Star Atlas — Main Renderer
// Celestial-Drift engine + Constellation system
// ============================================

class SpaceRenderer {
  constructor() {
    this.canvas = document.querySelector('canvas.webgl');
    this.scene = new THREE.Scene();
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.clock = new THREE.Clock();

    // Loading Manager
    this.loadingManager = new THREE.LoadingManager();
    this.loaderDiv = document.getElementById('loader');
    this.loaderButton = document.getElementById('loader-button');
    this.loaderText = document.getElementById('loader-text');
    this.loaderProgress = document.querySelector('.loader-progress');
    this.isLoaded = false;
    this.assetsLoaded = 0;
    this.assetsTotal = 8;

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.assetsLoaded = itemsLoaded;
      this.assetsTotal = itemsTotal;
      const pct = Math.round((itemsLoaded / itemsTotal) * 100);
      if (this.loaderProgress) this.loaderProgress.textContent = pct + '%';
    };
    this.loadingManager.onLoad = () => {
      this.isLoaded = true;
      this.loaderText.textContent = 'BEGIN';
      this.loaderButton.classList.remove('loading');
      if (this.loaderProgress) this.loaderProgress.textContent = '100%';
      this.loaderButton.addEventListener('click', () => {
        if (this.isLoaded) {
          this.loaderDiv.classList.add('hidden');
          this.startAnimationLoop();
        }
      });
    };

    // Nebula params (simplified)
    this.nebulaTransformParams = {
      scaleX: 22, scaleY: 22, scaleZ: 22,
      positionX: 0, positionY: 5.5, positionZ: 0,
      rotationX: 3.03, rotationY: 0, rotationZ: 5.668,
    };

    // Parallax
    this.mouse = { x: 0, y: 0 };
    this.targetCameraOffset = { x: 0, y: 0 };
    this.currentCameraOffset = { x: 0, y: 0 };
    this.initialCameraPosition = null;
    this.adjustedCameraPosition = null;
    this.parallaxStrength = 1.5;

    // Space sphere params
    this.spaceSphereParams = {
      stop0Color: '#02272c', stop0Pos: 0, stop1Color: '#021022', stop1Pos: 0.35,
      stop2Color: '#001d33', stop2Pos: 0.65, stop3Color: '#011618', stop3Pos: 0.71,
      uScale: 1.5, uDensity: 1.11, uOpacity: 0.9,
      uNoiseScale: 2.87, uNoiseStrength: 1.05,
      uEdgeSoftness: 0.5, uGlowIntensity: 0.5,
    };

    // State
    this.constellationStars = [];  // { mesh, glow, data, hitSphere }
    this.constellationLines = [];
    this.selectedStarId = null;
    this.hoveredStarId = null;
    this.easterClicked = new Set();
    this.easterTriggered = false;

    this.init();
  }

  async init() {
    this.initNebula();
    this.initStars();
    this.initAmbientStars();
    this.initSpaceSphere();
    this.initLights();
    this.initCubeMap();
    this.initConstellations();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initInteraction();
    this.initUI();
    this.initEventListeners();
  }

  // ============ NEBULA ============
  initNebula() {
    const gltfLoader = new GLTFLoader(this.loadingManager);
    const texLoader = new THREE.TextureLoader(this.loadingManager);
    const placeholder = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1, THREE.RGBAFormat);
    placeholder.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
        uNoiseTexture: { value: placeholder },
        uNoiseTextureSize: { value: new THREE.Vector2(1, 1) },
        uPaletteA: { value: new THREE.Vector3(0.14, 0.45, 0.42) },
        uPaletteB: { value: new THREE.Vector3(1.0, 0.3, 0.13) },
        uPaletteC: { value: new THREE.Vector3(1.2, 1.1, 2.1) },
        uPaletteD: { value: new THREE.Vector3(0, 0.1, 0.2) },
        uBaseColor: { value: new THREE.Vector3(0.35, 0.24, 0.21) },
        uColorT_sceneNoise: { value: 0.7 },
        uColorT_lowFreqNoise: { value: 0.2 },
        uWarpAmount: { value: 0.6 },
        uRotationAmount: { value: 0.25 },
        uFbmOctaves: { value: 6 },
        uFbmScale: { value: 2.8 },
        uFbmLacunarity: { value: 2.5 },
        uBackgroundIntensity: { value: 4.5 },
        uAccentIntensity: { value: 4.5 },
        uVibrantMix: { value: 1.0 },
        uCentralFalloffPower: { value: 0.4 },
        uAccentFalloffPower: { value: 1.5 },
        uTimeScale: { value: 1.2 },
        uEdgeSmoothMin: { value: 0.4 },
        uEdgeSmoothMax: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
    });
    this.nebulaMaterial = material;

    texLoader.load('/assets/textures/noise/noise.png', (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.LinearSRGBColorSpace;
      material.uniforms.uNoiseTexture.value = tex;
      if (tex.image) material.uniforms.uNoiseTextureSize.value.set(tex.image.width, tex.image.height);
    });

    gltfLoader.load('/assets/models/nebula_model.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(22, 22, 22);
      model.position.set(0, 5.5, 0);
      model.rotation.set(3.03, 0, 5.668);
      model.traverse(c => { if (c.isMesh) c.material = material; });
      this.scene.add(model);
      this.nebulaMesh = model;
    });
  }

  // ============ STARS ============
  initStars() {
    this.starsMaterial = new THREE.ShaderMaterial({
      vertexShader: starsVertexShader,
      fragmentShader: starsFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
        uTexture: { value: new THREE.TextureLoader(this.loadingManager).load('/assets/textures/particles/particle.jpg') },
        uMouse: { value: new THREE.Vector3() },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const starsCount = 10000;
    const minRadius = 6, maxRadius = 17;
    const baseGeo = new THREE.PlaneGeometry(1, 1);
    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.instanceCount = starsCount;
    instGeo.setAttribute('position', baseGeo.getAttribute('position'));
    instGeo.index = baseGeo.index;

    const pos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = lerp(minRadius, maxRadius, Math.random());
      const x = r * Math.sin(angle), z = r * Math.cos(angle);
      const nd = (Math.sqrt(x*x + z*z) - minRadius) / (maxRadius - minRadius);
      const y = -Math.pow(nd, 8.0) * 2.7 + Math.random() * 1.5;
      pos.set([x, y, z], i * 3);
    }
    instGeo.setAttribute('pos', new THREE.InstancedBufferAttribute(pos, 3, false));

    this.stars = new THREE.Mesh(instGeo, this.starsMaterial);
    this.stars.position.y = 4.5;
    this.stars.rotation.set(3.03, 0, 5.668);
    this.scene.add(this.stars);
  }

  // ============ AMBIENT STARS ============
  initAmbientStars() {
    this.ambientStarsMaterial = new THREE.ShaderMaterial({
      vertexShader: ambientStarsVertexShader,
      fragmentShader: ambientStarsFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
        uTexture: { value: new THREE.TextureLoader(this.loadingManager).load('/assets/textures/particles/particle.jpg') },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const count = 2500;
    const minR = 2, maxR = 100;
    const baseGeo = new THREE.PlaneGeometry(1, 1);
    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.instanceCount = count;
    instGeo.setAttribute('position', baseGeo.getAttribute('position'));
    instGeo.index = baseGeo.index;

    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = lerp(minR, maxR, Math.random());
      pos.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);
    }
    instGeo.setAttribute('pos', new THREE.InstancedBufferAttribute(pos, 3, false));

    this.ambientStars = new THREE.Mesh(instGeo, this.ambientStarsMaterial);
    this.ambientStars.renderOrder = -1;
    this.scene.add(this.ambientStars);
  }

  // ============ SPACE SPHERE ============
  initSpaceSphere() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 2;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#02272c'); grad.addColorStop(0.35, '#021022');
    grad.addColorStop(0.65, '#001d33'); grad.addColorStop(0.71, '#011618');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 2);
    const tex = new THREE.CanvasTexture(canvas);

    this.sphereMaterial = new THREE.ShaderMaterial({
      vertexShader: spaceVertexShader,
      fragmentShader: spaceFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: this.spaceSphereParams.uScale },
        uDensity: { value: this.spaceSphereParams.uDensity },
        uOpacity: { value: this.spaceSphereParams.uOpacity },
        uGradient: { value: tex },
        uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
        uNoiseScale: { value: this.spaceSphereParams.uNoiseScale },
        uNoiseStrength: { value: this.spaceSphereParams.uNoiseStrength },
        uEdgeSoftness: { value: this.spaceSphereParams.uEdgeSoftness },
        uGlowIntensity: { value: this.spaceSphereParams.uGlowIntensity },
      },
      side: THREE.BackSide,
    });
    this.spaceSphere = new THREE.Mesh(new THREE.SphereGeometry(500, 16, 16), this.sphereMaterial);
    this.scene.add(this.spaceSphere);
  }

  // ============ CONSTELLATIONS (核心改造) ============
  initConstellations() {
    const careerColor = new THREE.Color(0x72c6ff);
    const lifeColor = new THREE.Color(0xc89eff);
    const lineColor = new THREE.Color(0xb8e0ff);

    // Star glow texture (generated via canvas)
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128; glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.1, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.3, 'rgba(114,198,255,0.3)');
    grad.addColorStop(0.6, 'rgba(114,198,255,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    gctx.fillStyle = grad; gctx.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    for (const constellation of ALL_CONSTELLATIONS) {
      // Star meshes
      for (const star of Object.values(constellation.stars)) {
        const isActive = star.status === 'active';
        const isLife = star.type === 'life';
        const color = isLife ? lifeColor : careerColor;
        const pos = star.position;

        if (isActive) {
          // Sphere
          const geo = new THREE.SphereGeometry(0.5, 24, 24);
          const mat = new THREE.MeshPhongMaterial({
            color, emissive: color, emissiveIntensity: 0.4,
            shininess: 60, transparent: true, opacity: 0.95,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.copy(pos);
          this.scene.add(mesh);

          // Glow sprite
          const glowMat = new THREE.SpriteMaterial({
            map: glowTexture, blending: THREE.AdditiveBlending,
            depthWrite: false, transparent: true, opacity: 0.5, color,
          });
          const glow = new THREE.Sprite(glowMat);
          glow.scale.set(2.5, 2.5, 1);
          glow.position.copy(pos);
          this.scene.add(glow);

          // Hit sphere
          const hitGeo = new THREE.SphereGeometry(0.8, 8, 8);
          const hitMat = new THREE.MeshBasicMaterial({ visible: false });
          const hit = new THREE.Mesh(hitGeo, hitMat);
          hit.position.copy(pos);
          hit.userData = { starId: star.id, isActive: true };
          this.scene.add(hit);

          this.constellationStars.push({ mesh, glow, hit, data: star, baseEmissive: 0.4 });
        } else {
          // Dormant: tiny dim glow
          const dMat = new THREE.SpriteMaterial({
            map: glowTexture, blending: THREE.AdditiveBlending,
            depthWrite: false, transparent: true, opacity: 0.08, color,
          });
          const d = new THREE.Sprite(dMat);
          d.scale.set(1.0, 1.0, 1);
          d.position.copy(pos);
          this.scene.add(d);

          const hitGeo = new THREE.SphereGeometry(0.5, 4, 4);
          const hitMat = new THREE.MeshBasicMaterial({ visible: false });
          const hit = new THREE.Mesh(hitGeo, hitMat);
          hit.position.copy(pos);
          hit.userData = { starId: star.id, isActive: false };
          this.scene.add(hit);
          this.constellationStars.push({ mesh: null, glow: d, hit, data: star, baseEmissive: 0 });
        }
      }

      // Constellation lines
      if (constellation.connections) {
        for (const [fromId, toId] of constellation.connections) {
          const from = constellation.stars[fromId]?.position;
          const to = constellation.stars[toId]?.position;
          if (!from || !to) continue;
          const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
          const lineMat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.15, depthWrite: false });
          const line = new THREE.Line(lineGeo, lineMat);
          this.scene.add(line);
          this.constellationLines.push(line);
        }
      }
    }
  }

  // ============ LIGHTS ============
  initLights() {
    this.scene.add(new THREE.AmbientLight(0x446688, 0.5));
    this.scene.add(new THREE.HemisphereLight(0x72c6ff, 0x020308, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 12, 8);
    this.scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x72c6ff, 0.4);
    dl2.position.set(-5, 3, -8);
    this.scene.add(dl2);
  }

  // ============ CUBE MAP ============
  initCubeMap() {
    const loader = new THREE.CubeTextureLoader(this.loadingManager);
    this.environmentMap = loader.load([
      '/assets/environmentMaps/2/px.png', '/assets/environmentMaps/2/nx.png',
      '/assets/environmentMaps/2/py.png', '/assets/environmentMaps/2/ny.png',
      '/assets/environmentMaps/2/pz.png', '/assets/environmentMaps/2/nz.png',
    ]);
    this.scene.environment = this.environmentMap;
  }

  // ============ CAMERA ============
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.1, 1000);
    this.camera.position.set(-28, 5, 18);
    this.camera.lookAt(0, 3, 0);
    this.scene.add(this.camera);
    this.initialCameraPosition = this.camera.position.clone();
  }

  // ============ RENDERER ============
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.scene.background = null;
  }

  // ============ CONTROLS ============
  initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 3, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 80;
    this.controls.autoRotate = false;
    this.controls.update();
  }

  // ============ INTERACTION (Click/Hover on constellation stars) ============
  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.canvas.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(
        this.constellationStars.filter(s => s.data.status === 'active').map(s => s.hit)
      );

      if (hits.length > 0) {
        const starId = hits[0].object.userData.starId;
        if (this.hoveredStarId !== starId) {
          this.clearHover();
          this.hoveredStarId = starId;
          this.setStarGlow(starId, true);
          this.showTooltip(starId, e);
        }
      } else {
        if (this.hoveredStarId) {
          this.clearHover();
          this.hoveredStarId = null;
          this.hideTooltip();
        }
      }
    });

    this.canvas.addEventListener('click', (e) => {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(
        this.constellationStars.filter(s => s.data.status === 'active').map(s => s.hit)
      );
      if (hits.length > 0) {
        const starId = hits[0].object.userData.starId;
        this.handleStarClick(starId, e);
      } else {
        this.closeCard();
      }
    });
  }

  setStarGlow(starId, on) {
    const entry = this.constellationStars.find(s => s.data.id === starId);
    if (!entry || !entry.mesh) return;
    if (on) {
      entry.mesh.material.emissiveIntensity = 1.2;
      if (entry.glow) {
        entry.glow.scale.set(4, 4, 1);
        entry.glow.material.opacity = 0.9;
        entry.glow.material.color.setHex(0xffffff);
      }
    } else {
      entry.mesh.material.emissiveIntensity = entry.baseEmissive;
      if (entry.glow) {
        entry.glow.scale.set(2.5, 2.5, 1);
        entry.glow.material.opacity = 0.5;
        entry.glow.material.color.setHex(entry.data.type === 'life' ? 0xc89eff : 0x72c6ff);
      }
    }
  }

  clearHover() {
    if (this.hoveredStarId) {
      this.setStarGlow(this.hoveredStarId, false);
      this.hoveredStarId = null;
    }
  }

  handleStarClick(starId, event) {
    const star = getStarById(starId);
    if (!star || !star.content) return;

    this.selectedStarId = starId;
    const entry = this.constellationStars.find(s => s.data.id === starId);
    if (entry && entry.mesh) {
      entry.mesh.material.emissiveIntensity = 1.5;
    }

    // Light burst
    this.triggerLightBurst(event.clientX, event.clientY);
    setTimeout(() => this.openCard(star), 250);

    // Easter egg
    const activeDipper = ['tianshu','tianji','tianquan','kaiyang','yaoguang'];
    if (activeDipper.includes(starId)) {
      this.easterClicked.add(starId);
      if (this.easterClicked.size >= 5) this.triggerEasterEgg();
    }
  }

  // ============ UI METHODS ============
  showTooltip(starId, event) {
    const star = getStarById(starId);
    if (!star) return;
    const el = document.getElementById('tooltip');
    el.querySelector('.tooltip-label').textContent = star.label || '';
    el.querySelector('.tooltip-year').textContent = star.year || '';
    el.style.left = event.clientX + 'px';
    el.style.top = event.clientY + 'px';
    el.classList.remove('hidden');
    el.classList.add('visible');
  }

  hideTooltip() {
    const el = document.getElementById('tooltip');
    el.classList.remove('visible');
    el.classList.add('hidden');
  }

  openCard(star) {
    const overlay = document.getElementById('card-overlay');
    const card = document.getElementById('glass-card');
    const isLife = star.type === 'life';

    card.style.borderColor = isLife ? 'rgba(200,158,255,0.25)' : 'rgba(114,198,255,0.25)';
    card.querySelector('.card-title').textContent = star.content.title;
    const period = [star.label, star.year].filter(Boolean).join(' · ');
    card.querySelector('.card-period').textContent = period;
    card.querySelector('.card-description').textContent = star.content.description;

    const badge = card.querySelector('.card-badge');
    badge.textContent = star.name;
    badge.className = 'card-badge' + (isLife ? ' life' : '');

    const highlights = card.querySelector('.card-highlights');
    highlights.innerHTML = (star.content.highlights || [])
      .map(h => `<span style="display:inline-block;margin:2px 4px;padding:2px 10px;border-radius:12px;font-size:0.7rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">${h}</span>`)
      .join('');

    card.querySelector('.card-quote').textContent = star.content.quote || '';
    overlay.classList.add('visible');
  }

  closeCard() {
    if (this.selectedStarId) {
      const entry = this.constellationStars.find(s => s.data.id === this.selectedStarId);
      if (entry && entry.mesh) entry.mesh.material.emissiveIntensity = entry.baseEmissive;
      this.selectedStarId = null;
    }
    document.getElementById('card-overlay').classList.remove('visible');
  }

  triggerLightBurst(x, y) {
    const burst = document.getElementById('light-burst');
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    burst.classList.remove('hidden');
    burst.classList.remove('active');
    void burst.offsetWidth;
    burst.classList.add('active');
    setTimeout(() => { burst.classList.add('hidden'); burst.classList.remove('active'); }, 750);
  }

  triggerEasterEgg() {
    if (this.easterTriggered) return;
    this.easterTriggered = true;
    const overlay = document.getElementById('easter-egg');
    const sloganEl = overlay.querySelector('.easter-egg-slogan');
    const subEl = overlay.querySelector('.easter-egg-sub');
    sloganEl.textContent = ''; subEl.textContent = '';
    overlay.classList.add('visible');

    const slogan = '人活无数瞬间，星亮漫漫长夜';
    const sub = '所有细碎闪光，都是人生的支点';
    let i = 0;
    const interval = setInterval(() => {
      sloganEl.textContent = slogan.slice(0, i + 1);
      i++;
      if (i >= slogan.length) {
        clearInterval(interval);
        setTimeout(() => { subEl.textContent = sub; }, 400);
        setTimeout(() => { overlay.classList.remove('visible'); }, 5000);
      }
    }, 100);
  }

  // ============ UI INIT (Controls, Modals) ============
  initUI() {
    // Card close
    document.getElementById('card-close').addEventListener('click', () => this.closeCard());
    document.getElementById('card-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeCard();
    });

    // Control buttons
    const focusMap = {
      'big-dipper': new THREE.Vector3(0.55, 3.5, 2),
      'skills': new THREE.Vector3(-2, 3, 1),
      'life': new THREE.Vector3(6, 5, -2),
      'overview': new THREE.Vector3(0, 3, 0),
    };
    document.querySelectorAll('[data-constellation]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-constellation]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = focusMap[btn.dataset.constellation];
        if (target) {
          this.controls.target.copy(target);
        }
      });
    });

    // About/Contact
    document.querySelector('[data-action="about"]')?.addEventListener('click', () => {
      document.getElementById('about-content').textContent = PERSONAL.about;
      document.getElementById('about-modal').classList.remove('hidden');
      document.getElementById('about-modal').classList.add('visible');
    });
    document.querySelector('[data-action="contact"]')?.addEventListener('click', () => {
      const c = PERSONAL.contact;
      const html = [];
      if (c.email) html.push(`<a class="contact-link" href="mailto:${c.email}"><svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 6l8 5.5L18 6" stroke="currentColor" stroke-width="1.2"/></svg>${c.email}</a>`);
      if (c.github) html.push(`<a class="contact-link" href="${c.github}" target="_blank"><svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 00-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.67 7.67 0 0110 5.87c.68 0 1.36.09 2 .26 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.5v2.22c0 .21.15.46.55.38A8 8 0 0010 2z" fill="currentColor"/></svg>GitHub</a>`);
      document.getElementById('contact-content').innerHTML = html.join('');
      document.getElementById('contact-modal').classList.remove('hidden');
      document.getElementById('contact-modal').classList.add('visible');
    });

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) { modal.classList.add('hidden'); modal.classList.remove('visible'); }
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.classList.add('hidden'); overlay.classList.remove('visible'); } });
    });

    // Easter egg dismiss
    document.getElementById('easter-egg').addEventListener('click', () => {
      document.getElementById('easter-egg').classList.remove('visible');
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCard();
        document.querySelectorAll('.modal-overlay.visible').forEach(m => { m.classList.add('hidden'); m.classList.remove('visible'); });
        document.getElementById('easter-egg')?.classList.remove('visible');
      }
    });
  }

  // ============ EVENT LISTENERS ============
  initEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.targetCameraOffset.x = this.mouse.x * this.parallaxStrength * 0.5;
      this.targetCameraOffset.y = -this.mouse.y * this.parallaxStrength;
    });
  }

  handleResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (this.nebulaMaterial && this.nebulaMaterial.uniforms.uResolution) {
      this.nebulaMaterial.uniforms.uResolution.value.set(this.sizes.width, this.sizes.height);
    }
  }

  // ============ ANIMATION LOOP ============
  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = this.clock.getDelta();

    // Update shader uniforms
    if (this.nebulaMaterial) this.nebulaMaterial.uniforms.uTime.value = elapsedTime;
    if (this.starsMaterial) {
      this.starsMaterial.uniforms.uTime.value = elapsedTime;
      this.starsMaterial.uniforms.uMouse.value.set(0, 0, 0);
    }
    if (this.ambientStarsMaterial) this.ambientStarsMaterial.uniforms.uTime.value = elapsedTime;
    if (this.sphereMaterial) this.sphereMaterial.uniforms.uTime.value = elapsedTime;

    // Nebula slow rotation
    if (this.nebulaMesh) {
      const localY = new THREE.Vector3(0, -1, 0);
      localY.applyQuaternion(this.nebulaMesh.quaternion);
      this.nebulaMesh.rotateOnWorldAxis(localY, 0.001);
    }

    // Constellation star pulse animation
    for (const entry of this.constellationStars) {
      if (!entry.mesh || entry.data.status !== 'active') continue;
      if (entry.data.id === this.hoveredStarId || entry.data.id === this.selectedStarId) continue;
      const pulse = 0.85 + 0.15 * Math.sin(elapsedTime * 1.5 + entry.data.id.charCodeAt(0));
      entry.mesh.material.emissiveIntensity = entry.baseEmissive * pulse;
    }

    // Parallax camera offset
    if (this.initialCameraPosition) {
      this.currentCameraOffset.x += (this.targetCameraOffset.x - this.currentCameraOffset.x) * 0.05;
      this.currentCameraOffset.y += (this.targetCameraOffset.y - this.currentCameraOffset.y) * 0.05;
      // The OrbitControls handles the main camera position;
      // parallax is applied as a slight target offset
      const baseTarget = new THREE.Vector3(0, 3, 0);
      this.controls.target.lerp(
        baseTarget.clone().add(new THREE.Vector3(this.currentCameraOffset.x * 0.03, this.currentCameraOffset.y * 0.03, 0)),
        0.05
      );
    }

    // Update controls
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  startAnimationLoop() {
    this.animate();
  }
}

// ============ START ============
const renderer = new SpaceRenderer();
