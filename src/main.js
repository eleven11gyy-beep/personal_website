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
import { PERSONAL } from './star-data.js';
import planetVertexShader from './shaders/planets/vertex.glsl';
import planetFragmentShader from './shaders/planets/fragment.glsl';
import jupiterFragmentShader from './shaders/planets/jupiterFragment.glsl';
import marsFragmentShader from './shaders/planets/marsFragment.glsl';
import neptuneFragmentShader from './shaders/planets/neptuneFragment.glsl';
import saturnRingVertexShader from './shaders/planets/saturnRingVertex.glsl';
import saturnRingFragmentShader from './shaders/planets/saturnRingFragment.glsl';

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

    // Planet state
    this.planets = [];
    this.planetHitSpheres = [];
    this.planetGroup = null;
    this.planetParams = {
      lightPosition: new THREE.Vector3(-2, 8, 8),
      orbitRadius: 12,
      startAngle: -2.9415,
      verticalOffset: 6.0,
      orbitTilt: 0.0,
    };

    this.init();
  }

  async init() {
    this.initNebula();
    this.initStars();
    this.initAmbientStars();
    this.initSpaceSphere();
    this.initLights();
    this.initCubeMap();
    this.initPlanets();
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

  // ============ PLANETS (Celestial-Drift 行星系统 + 点击交互) ============
  initPlanets() {
    this.planetGroup = new THREE.Group();

    this.planetGroup.rotation.set(
      this.nebulaTransformParams.rotationX,
      this.nebulaTransformParams.rotationY,
      this.nebulaTransformParams.rotationZ
    );

    this.planetGroup.position.y = this.planetParams.verticalOffset;

    this.scene.add(this.planetGroup);

    const textureLoader = new THREE.TextureLoader(this.loadingManager);

    const planetConfigs = [
      {
        name: 'Earth',
        texture: '/assets/textures/planets/1k_earth.jpg',
        size: 1.3,
        atmosphereColor: new THREE.Color(0x26e6ff),
        atmosphereIntensity: 0.7,
        rotationSpeed: 0.007,
        content: {
          title: '地球 · 蓝色家园',
          description: '我们的母星，承载着已知宇宙中唯一的生命。用科技与人文的视角探索世界的无限可能。',
          highlights: ['全栈开发', '开源贡献', '技术写作'],
          quote: '脚踏实地，仰望星空。',
        },
      },
      {
        name: 'Venus',
        texture: '/assets/textures/planets/1k_venus.jpg',
        size: 1.0,
        atmosphereColor: new THREE.Color(0xff9800),
        atmosphereIntensity: 0.8,
        rotationSpeed: 0.005,
        content: {
          title: '金星 · 启明之光',
          description: '清晨与黄昏最亮的星。对美的追求，对设计的热爱，是前行路上的启明星。',
          highlights: ['UI/UX 设计', '前端美学', '品牌视觉'],
          quote: '美是所有伟大产品的第一印象。',
        },
      },
      {
        name: 'Saturn',
        texture: '/assets/textures/planets/1k_saturn.jpg',
        size: 1.3,
        atmosphereColor: new THREE.Color(0xffd095),
        atmosphereIntensity: 0.6,
        rotationSpeed: 0.012,
        hasRing: true,
        content: {
          title: '土星 · 光环之下',
          description: '美丽的光环并非一日形成。持续积累的项目经验，就是环绕在你身上的独特光环。',
          highlights: ['项目经验', '团队协作', '持续交付'],
          quote: '积累让平凡变得璀璨。',
        },
      },
      {
        name: 'Mars',
        texture: '/assets/textures/planets/1k_mars.jpg',
        size: 1.1,
        atmosphereColor: new THREE.Color(1.0, 0.5, 0.3),
        atmosphereIntensity: 0.4,
        rotationSpeed: 0.008,
        isMars: true,
        content: {
          title: '火星 · 探索精神',
          description: '人类下一个家园的梦想。勇于踏入未知领域，保持对新技术的好奇与探索。',
          highlights: ['技术探索', '创新项目', '前沿研究'],
          quote: '去向没有人到达过的地方。',
        },
      },
      {
        name: 'Mercury',
        texture: '/assets/textures/planets/1k_mercury_fictional.jpg',
        size: 1.2,
        atmosphereColor: new THREE.Color(0.7, 0.6, 0.5),
        atmosphereIntensity: 0.3,
        rotationSpeed: 0.01,
        content: {
          title: '水星 · 极速思维',
          description: '离太阳最近的行星，以最快速度公转。高效学习，快速响应，敏捷执行。',
          highlights: ['快速学习', '敏捷开发', '高效执行'],
          quote: '速度也是一种竞争力。',
        },
      },
      {
        name: 'Jupiter',
        texture: '/assets/textures/planets/1k_jupiter.jpg',
        size: 1.8,
        atmosphereColor: new THREE.Color(1.0, 0.7, 0.5),
        atmosphereIntensity: 1.0,
        rotationSpeed: 0.015,
        isJupiter: true,
        content: {
          title: '木星 · 宏伟格局',
          description: '太阳系最大的行星，拥有强大的引力场。培养系统性思维与架构设计能力。',
          highlights: ['系统架构', '战略思考', '技术领导力'],
          quote: '格局决定了你能走多远。',
        },
      },
      {
        name: 'Neptune',
        texture: '/assets/textures/planets/1k_neptune.jpg',
        size: 1.2,
        atmosphereColor: new THREE.Color(0x8a8fff),
        atmosphereIntensity: 0.8,
        rotationSpeed: 0.009,
        isNeptune: true,
        content: {
          title: '海王星 · 深邃洞察',
          description: '遥远的冰巨星，深蓝如海。冷静分析，深入思考，看透问题本质。',
          highlights: ['深度思考', '根因分析', '批判性思维'],
          quote: '在深邃的思考中找到答案。',
        },
      },
      {
        name: 'Pluto',
        texture: '/assets/textures/planets/1k_pluto.jpg',
        size: 1.2,
        atmosphereColor: new THREE.Color(0xab8c6c),
        atmosphereIntensity: 0.8,
        rotationSpeed: 0.009,
        isNeptune: true,
        content: {
          title: '冥王星 · 坚韧之心',
          description: '虽被重新分类，却从未停止公转。在逆境中坚持，在质疑中成长。',
          highlights: ['坚韧不拔', '自我驱动', '持续成长'],
          quote: '即便不再是"行星"，我也依然闪亮。',
        },
      },
    ];

    planetConfigs.forEach((config, index) => {
      const angleStep = (Math.PI * 2) / planetConfigs.length;
      const angle = this.planetParams.startAngle + index * angleStep;

      const x = Math.cos(angle) * this.planetParams.orbitRadius;
      const z = Math.sin(angle) * this.planetParams.orbitRadius;

      const y = Math.sin(angle * 2) * this.planetParams.orbitTilt;

      this.createPlanet(
        config,
        new THREE.Vector3(x, y, z),
        textureLoader,
        angle
      );
    });
  }

  createPlanet(config, position, textureLoader, angle) {
    const geometry = new THREE.SphereGeometry(config.size, 64, 64);

    let fragmentShader = planetFragmentShader;

    if (config.isJupiter) {
      fragmentShader = jupiterFragmentShader;
    } else if (config.isMars) {
      fragmentShader = marsFragmentShader;
    } else if (config.isNeptune) {
      fragmentShader = neptuneFragmentShader;
    }

    const uniforms = {
      uTexture: { value: textureLoader.load(config.texture) },
      uTime: { value: 0 },
      uLightPosition: { value: this.planetParams.lightPosition.clone() },
      uPlanetPosition: { value: position.clone() },
      uAtmosphereColor: { value: config.atmosphereColor },
      uAtmosphereIntensity: { value: config.atmosphereIntensity },
      uRotationSpeed: { value: config.rotationSpeed },
    };

    if (config.isJupiter) {
      uniforms.uStormIntensity = { value: 0.5 };
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: planetVertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      transparent: false,
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.copy(position);
    planet.userData.config = config;
    planet.userData.angle = angle;
    planet.userData.baseY = position.y;
    planet.userData.isPlanet = true;

    // Glow sprite for hover highlight
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128; glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.1, 'rgba(255,255,255,0.7)');
    grad.addColorStop(0.4, 'rgba(114,198,255,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    gctx.fillStyle = grad; gctx.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(config.size * 3, config.size * 3, 1);
    glow.position.copy(position);
    glow.visible = true;
    planet.add(glow);
    planet.userData.glow = glow;

    // Saturn ring
    if (config.hasRing) {
      const ringGeometry = new THREE.RingGeometry(
        config.size * 1.5,
        config.size * 2.8,
        128
      );
      const ringMaterial = new THREE.ShaderMaterial({
        vertexShader: saturnRingVertexShader,
        fragmentShader: saturnRingFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uLightPosition: { value: this.planetParams.lightPosition.clone() },
          uOpacity: { value: 0.7 },
          uRingColor: { value: new THREE.Color(0.9, 0.85, 0.7) },
          uRingCount: { value: 30.0 },
          uGlowIntensity: { value: 0.8 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
      planet.userData.ring = ring;
    }

    // Invisible hit sphere for raycaster
    const hitGeo = new THREE.SphereGeometry(config.size * 1.2, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitSphere = new THREE.Mesh(hitGeo, hitMat);
    hitSphere.position.copy(position);
    hitSphere.userData = {
      planetId: config.name,
      isPlanet: true,
      config: config,
    };
    this.planetGroup.add(hitSphere);
    this.planetHitSpheres.push(hitSphere);

    this.planetGroup.add(planet);
    this.planets.push(planet);
  }

  updatePlanets(elapsedTime) {
    this.planets.forEach((planet) => {
      planet.material.uniforms.uTime.value = elapsedTime;

      const rotationSpeed = planet.userData.config.rotationSpeed || 0.01;
      planet.rotation.y = elapsedTime * rotationSpeed * 2;

      if (planet.userData.ring) {
        planet.userData.ring.material.uniforms.uTime.value = elapsedTime;
        planet.userData.ring.rotation.z = elapsedTime * 0.05;
      }

      const floatSpeed = 0.3;
      const floatAmount = 0.05;
      planet.position.y =
        planet.userData.baseY +
        Math.sin(elapsedTime * floatSpeed + planet.userData.angle) *
          floatAmount;
    });
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

  // ============ INTERACTION (Click/Hover on planets) ============
  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hoveredPlanetId = null;

    this.canvas.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const planetHits = this.raycaster.intersectObjects(this.planetHitSpheres);

      if (planetHits.length > 0) {
        const planetId = planetHits[0].object.userData.planetId;
        if (this.hoveredPlanetId !== planetId) {
          this.clearHover();
          this.hoveredPlanetId = planetId;
          this.setPlanetGlow(planetId, true);
          this.showPlanetTooltip(planetId, e);
        }
      } else {
        if (this.hoveredPlanetId) {
          this.clearHover();
          this.hoveredPlanetId = null;
          this.hideTooltip();
        }
      }
    });

    this.canvas.addEventListener('click', (e) => {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const planetHits = this.raycaster.intersectObjects(this.planetHitSpheres);

      if (planetHits.length > 0) {
        const planetId = planetHits[0].object.userData.planetId;
        this.handlePlanetClick(planetId, e);
      } else {
        this.closeCard();
      }
    });
  }

  setPlanetGlow(planetId, on) {
    const planet = this.planets.find(p => p.userData.config.name === planetId);
    if (!planet || !planet.userData.glow) return;
    if (on) {
      planet.userData.glow.material.opacity = 0.9;
      const size = planet.userData.config.size;
      planet.userData.glow.scale.set(size * 5, size * 5, 1);
    } else {
      planet.userData.glow.material.opacity = 0.3;
      const size = planet.userData.config.size;
      planet.userData.glow.scale.set(size * 3, size * 3, 1);
    }
  }

  showPlanetTooltip(planetId, event) {
    const planet = this.planets.find(p => p.userData.config.name === planetId);
    if (!planet) return;
    const config = planet.userData.config;
    const el = document.getElementById('tooltip');
    el.querySelector('.tooltip-label').textContent = config.name;
    el.querySelector('.tooltip-year').textContent = config.content?.title || '';
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

  handlePlanetClick(planetId, event) {
    const planet = this.planets.find(p => p.userData.config.name === planetId);
    if (!planet || !planet.userData.config.content) return;

    this.selectedPlanetId = planetId;

    // Light burst
    this.triggerLightBurst(event.clientX, event.clientY);
    setTimeout(() => this.openPlanetCard(planet.userData.config), 250);
  }

  openPlanetCard(config) {
    const overlay = document.getElementById('card-overlay');
    const card = document.getElementById('glass-card');
    const content = config.content;

    card.style.borderColor = 'rgba(114,198,255,0.25)';
    card.querySelector('.card-title').textContent = content.title;
    card.querySelector('.card-period').textContent = config.name;
    card.querySelector('.card-description').textContent = content.description;

    const badge = card.querySelector('.card-badge');
    badge.textContent = config.name;
    badge.className = 'card-badge';

    const highlights = card.querySelector('.card-highlights');
    highlights.innerHTML = (content.highlights || [])
      .map(h => `<span style="display:inline-block;margin:2px 4px;padding:2px 10px;border-radius:12px;font-size:0.7rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">${h}</span>`)
      .join('');

    card.querySelector('.card-quote').textContent = content.quote || '';
    overlay.classList.add('visible');
  }

  clearHover() {
    if (this.hoveredPlanetId) {
      this.setPlanetGlow(this.hoveredPlanetId, false);
      this.hoveredPlanetId = null;
    }
  }

  closeCard() {
    if (this.selectedPlanetId) {
      this.selectedPlanetId = null;
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

  // ============ UI INIT (Controls, Modals) ============
  initUI() {
    // Card close
    document.getElementById('card-close').addEventListener('click', () => this.closeCard());
    document.getElementById('card-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeCard();
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

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCard();
        document.querySelectorAll('.modal-overlay.visible').forEach(m => { m.classList.add('hidden'); m.classList.remove('visible'); });
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

    // Planet animations
    this.updatePlanets(elapsedTime);

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
