// Import Three.js y post-procesado
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ JS cargado correctamente');

  // Año dinámico en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Animación de texto del Hero
  if (window.gsap) {
    const tl = gsap.timeline();
    tl.from('#hero h1', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' })
      .from('#hero p', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.5');
  }

  // Inicializar Hero cinematográfico
  initCinematicHero();

  // Animaciones de scroll con GSAP
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Featured Work - entrada
    gsap.from('#featured .featured-card', {
      scrollTrigger: { trigger: '#featured', start: 'top 80%' },
      opacity: 0, y: 50, duration: 0.8, stagger: 0.2, ease: 'power2.out'
    });

    // Featured Work - parallax vertical en scroll
    document.querySelectorAll('#featured .featured-card img').forEach(img => {
      gsap.to(img, {
        yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: img, scrub: true }
      });
    });

    // About - texto e imagen
    gsap.from('#about h2', {
      scrollTrigger: { trigger: '#about', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
    gsap.from('#about p', {
      scrollTrigger: { trigger: '#about', start: 'top 75%' },
      y: 20, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out'
    });
    gsap.from('#about img', {
      scrollTrigger: { trigger: '#about', start: 'top 75%' },
      x: 50, rotation: 2, opacity: 0, duration: 0.8, ease: 'power2.out'
    });

    // Footer
    gsap.from('#footer', {
      scrollTrigger: { trigger: '#footer', start: 'top 90%' },
      opacity: 0, y: 40, duration: 0.8, ease: 'power2.out'
    });
  }

  // Parallax hover Featured
  initFeaturedParallax();
});

/* ================================
   HERO CINEMATOGRÁFICO (Neón + Grid reactivo + Bloom + Partículas)
   ================================ */
function initCinematicHero() {
  const container = document.getElementById('hero-canvas');
  if (!container) return;

  // Config
  const COLORS = {
    baseHex: 0x02080b,
    neonHex: 0x7cf2d4
  };
  const CONFIG = {
    fogDensity: 0.12,
    pixelRatioMax: 1.6,
    cameraBaseY: 2.0,
    cameraDepth: 6.0,
    parallaxX: 1.6,
    parallaxY: 1.2,
    grid: { scale: 0.4, lineWidth: 0.06, glow: 1.3, waveAmp: 0.35, waveFreq: 0.9, waveSpeed: 1.2 },
    particles: { count: 520, size: 0.08, bounds: 22, repulseStrength: 0.045, damping: 0.94 },
    bloom: { strength: 1.15, radius: 0.4, threshold: 0.82 }
  };

  // Escena
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.baseHex, CONFIG.fogDensity);

  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 220);
  camera.position.set(0, CONFIG.cameraBaseY, CONFIG.cameraDepth);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioMax));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Post-procesado (Bloom)
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold
  );
  composer.addPass(bloomPass);

  // Luces
  scene.add(new THREE.AmbientLight(COLORS.neonHex, 0.12));
  const dir = new THREE.DirectionalLight(COLORS.neonHex, 0.7);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  // GRID Shader (suelo)
  const gridUniforms = {
    uTime: { value: 0 },
    uScale: { value: CONFIG.grid.scale },
    uLine: { value: CONFIG.grid.lineWidth },
    uGlow: { value: CONFIG.grid.glow },
    uBase: { value: new THREE.Color(COLORS.baseHex) },
    uNeon: { value: new THREE.Color(COLORS.neonHex) },
    uWaveAmp: { value: CONFIG.grid.waveAmp },
    uWaveFreq: { value: CONFIG.grid.waveFreq },
    uWaveSpeed: { value: CONFIG.grid.waveSpeed },
    uMouseXZ: { value: new THREE.Vector2(0.0, 0.0) }
  };

  const gridVertex = `
    varying vec3 vWorld;
    varying vec2 vXZ;
    uniform float uTime;
    uniform float uWaveAmp;
    uniform float uWaveFreq;
    uniform float uWaveSpeed;
    void main() {
      vec3 pos = position;
      float h = sin(pos.x * uWaveFreq + uTime * uWaveSpeed) * uWaveAmp
              + cos(pos.z * uWaveFreq * 0.7 + uTime * uWaveSpeed * 0.8) * (uWaveAmp * 0.6);
      pos.y += h;
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorld = worldPos.xyz;
      vXZ = position.xz; // para el patrón del grid en base plana
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const gridFragment = `
    precision highp float;
    varying vec3 vWorld;
    varying vec2 vXZ;

    uniform float uTime;
    uniform float uScale;
    uniform float uLine;
    uniform float uGlow;
    uniform vec3 uBase;
    uniform vec3 uNeon;
    uniform vec2 uMouseXZ;

    float neonGrid(vec2 p) {
      // Densidad
      p *= uScale * 8.0;

      // Distancia a líneas de la celda
      vec2 g = abs(fract(p) - 0.5);
      float d = min(g.x, g.y);

      // Grosor virtual de línea
      float line = smoothstep(uLine, 0.0, d);

      // Pulso de energía viajando en Z
      float travel = 0.5 + 0.5 * sin(uTime * 2.0 + p.y * 1.2);

      // Glow compuesto
      float glow = pow(line, 1.0) + pow(line, 2.5) * 0.5 + pow(line, 6.0) * 0.35;
      return glow * travel * uGlow;
    }

    void main() {
      // Influencia del mouse: “sobrealimenta” el grid cerca del puntero
      float mouseInf = 0.0;
      {
        vec2 d = vXZ - uMouseXZ;
        float dist = length(d);
        mouseInf = smoothstep(1.8, 0.0, dist); // más cerca => más intensidad
      }

      float baseIntensity = neonGrid(vXZ);
      baseIntensity += mouseInf * 0.8;

      // Atenuación por distancia al centro para horizonte
      float distXZ = length(vWorld.xz) * 0.03;
      float horizon = clamp(1.0 - distXZ, 0.0, 1.0);

      vec3 color = uBase + uNeon * baseIntensity * horizon;

      // Vignette sutil
      float vign = smoothstep(1.0, 0.0, distXZ * 0.6);
      color *= mix(0.9, 1.0, vign);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: gridUniforms,
    vertexShader: gridVertex,
    fragmentShader: gridFragment,
    fog: true
  });

  const gridPlane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 1, 1), gridMaterial);
  gridPlane.rotation.x = -Math.PI / 2;
  gridPlane.position.y = -1.2;
  scene.add(gridPlane);

  // Objeto central (torus knot + wire)
  const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.9, 0.28, 220, 32),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0b2a24),
      emissive: new THREE.Color(COLORS.neonHex),
      emissiveIntensity: 2.4,
      metalness: 0.1,
      roughness: 0.35,
      transparent: true,
      opacity: 0.95
    })
  );
  torus.position.y = 0.4;
  scene.add(torus);

  const edges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.25, 2));
  const wire = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: COLORS.neonHex, transparent: true, opacity: 0.35 })
  );
  wire.position.y = 0.4;
  scene.add(wire);

  // Partículas con ligera física y repulsión al mouse
  const particles = createNeonParticles(THREE, {
    count: CONFIG.particles.count,
    size: CONFIG.particles.size,
    color: new THREE.Color(COLORS.neonHex),
    bounds: CONFIG.particles.bounds
  });
  scene.add(particles.points);

  // Raycaster para interacción
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), gridPlane.position.y); // y = -1.2

  function updateMouseUniform(e) {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    const hit = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, hit);
    if (hit) {
      gridUniforms.uMouseXZ.value.set(hit.x, hit.z);
      particles.targetPoint.copy(hit);
    }
  }
  window.addEventListener('mousemove', updateMouseUniform, { passive: true });

  // Parallax de cámara
  const mouseSmooth = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    mouseSmooth.x = nx;
    mouseSmooth.y = ny;
  }, { passive: true });

  // Variables animación/scroll
  const clock = new THREE.Clock();
  const speed = { rot: 1.0 };
  if (window.gsap && window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress; // 0..1
        speed.rot = 1.0 + p * 1.2;
        bloomPass.strength = CONFIG.bloom.strength + p * 0.6;
        renderer.toneMappingExposure = 1.0 + p * 0.25;
      }
    });
  }

  // Loop
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Tiempo del shader
    gridUniforms.uTime.value = t;

    // Camara parallax
    const targetX = mouseSmooth.x * CONFIG.parallaxX;
    const targetY = -mouseSmooth.y * CONFIG.parallaxY + CONFIG.cameraBaseY;
    camera.position.x += (targetX - camera.position.x) * 0.06;
    camera.position.y += (targetY - camera.position.y) * 0.06;
    camera.lookAt(0, 0.3, 0);

    // Torus + wire
    torus.rotation.x += 0.24 * 0.01 * speed.rot;
    torus.rotation.y += 0.32 * 0.01 * speed.rot;
    wire.rotation.x += 0.18 * 0.01 * speed.rot;
    wire.rotation.y += 0.24 * 0.01 * speed.rot;

    // Partículas
    particles.update({
      dt: Math.min(0.033, clock.getDelta()),
      repulseStrength: CONFIG.particles.repulseStrength,
      damping: CONFIG.particles.damping,
      bounds: CONFIG.particles.bounds
    });

    // Render + post
    composer.render();
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioMax));
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  });
}

// Sistema de partículas con textura radial + “microfísica” simple
function createNeonParticles(THREE, { count = 400, size = 0.08, color = new THREE.Color(0xffffff), bounds = 20 } = {}) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  // Posiciones iniciales y veloc. aleatorias
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 2 * bounds; // x
    positions[i * 3 + 1] = Math.random() * (bounds * 0.4) + 0.2; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2 * bounds; // z

    velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const sprite = generateRadialSprite();
  const material = new THREE.PointsMaterial({
    color: color.getHex(),
    size: size,
    map: sprite,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  const targetPoint = new THREE.Vector3(0, 0, 0);

  function update({ dt = 0.016, repulseStrength = 0.04, damping = 0.94, bounds = 20 }) {
    const pos = geometry.attributes.position.array;
    const vel = velocities;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = pos[ix + 0];
      const y = pos[ix + 1];
      const z = pos[ix + 2];

      // Fuerza de repulsión respecto al punto objetivo en el plano XZ
      const dx = x - targetPoint.x;
      const dz = z - targetPoint.z;
      const distSq = dx * dx + dz * dz + 0.001;
      const inv = 1.0 / distSq;
      const force = repulseStrength * inv;

      vel[ix + 0] += (dx * force) * dt;
      vel[ix + 2] += (dz * force) * dt;
      vel[ix + 1] += Math.sin((x + z) * 0.05) * 0.002 * dt; // pequeño vaivén vertical

      // Amortiguación
      vel[ix + 0] *= damping;
      vel[ix + 1] *= damping;
      vel[ix + 2] *= damping;

      // Integración
      pos[ix + 0] += vel[ix + 0];
      pos[ix + 1] += vel[ix + 1];
      pos[ix + 2] += vel[ix + 2];

      // Límite espacial con wrap-around suave
      if (pos[ix + 0] > bounds) pos[ix + 0] = -bounds;
      if (pos[ix + 0] < -bounds) pos[ix + 0] = bounds;
      if (pos[ix + 2] > bounds) pos[ix + 2] = -bounds;
      if (pos[ix + 2] < -bounds) pos[ix + 2] = bounds;
      // altura
      if (pos[ix + 1] < 0.1) { pos[ix + 1] = 0.1; vel[ix + 1] *= -0.3; }
      if (pos[ix + 1] > bounds * 0.5) { pos[ix + 1] = bounds * 0.5; vel[ix + 1] *= -0.3; }
    }

    geometry.attributes.position.needsUpdate = true;
  }

  return { points, update, targetPoint };
}

// Sprite radial suave para partículas (sin assets externos)
function generateRadialSprite(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, 'rgba(124,242,212,1)');
  grad.addColorStop(0.25, 'rgba(124,242,212,0.6)');
  grad.addColorStop(0.6, 'rgba(124,242,212,0.22)');
  grad.addColorStop(1.0, 'rgba(124,242,212,0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/* ================================
   PARALLAX HOVER FEATURED
   ================================ */
function initFeaturedParallax() {
  const images = document.querySelectorAll('#featured .featured-card img');
  if (!images.length) return;

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) return; // Evitar en táctiles

  images.forEach(img => {
    let raf = null;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    function onMove(e) {
      const rect = img.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 15;
      targetY = y * 15;
      if (!raf) raf = requestAnimationFrame(apply);
    }

    function apply() {
      raf = null;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      img.style.transform = `scale(1.08) translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
      if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
        raf = requestAnimationFrame(apply);
      }
    }

    function reset() {
      targetX = 0; targetY = 0;
      const startX = currentX, startY = currentY;
      const startTime = performance.now();
      const dur = 180;
      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      function back() {
        const p = Math.min(1, (performance.now() - startTime) / dur);
        const e = easeOutCubic(p);
        currentX = startX * (1 - e);
        currentY = startY * (1 - e);
        img.style.transform = `scale(${1 + 0.08 * (1 - e)}) translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
        if (p < 1) requestAnimationFrame(back);
        else img.style.transform = 'scale(1) translate(0, 0)';
      }
      requestAnimationFrame(back);
    }

    img.addEventListener('mousemove', onMove, { passive: true });
    img.addEventListener('mouseleave', reset, { passive: true });
  });
}
