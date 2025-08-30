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

  // Inicializar Hero futurista
  initHeroFuturisticBackground();

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
   HERO FUTURISTA 3D (Neón + Grid)
   ================================ */
function initHeroFuturisticBackground() {
  const container = document.getElementById('hero-canvas');
  if (!container || !window.THREE) return;

  // Constantes tunables
  const COLORS = {
    base: new THREE.Color(0x02080b),
    neon: new THREE.Color(0x7cf2d4) // teal/cyan
  };
  const CONFIG = {
    gridScale: 0.4,      // densidad del grid (mayor => más líneas)
    lineWidth: 0.06,     // grosor virtual de la línea
    glowIntensity: 1.2,  // multiplicador de brillo del neón
    fogDensity: 0.12,    // densidad de neblina
    particleCount: 420,  // número de partículas
    particleSize: 0.08,  // tamaño base de partículas
    cameraBaseY: 2.0,    // altura base de la cámara
    cameraDepth: 6.0     // distancia base de la cámara
  };

  // Escena, cámara, renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.base.getHex(), CONFIG.fogDensity);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  );
  camera.position.set(0, CONFIG.cameraBaseY, CONFIG.cameraDepth);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0); // alpha para integrar con el fondo
  container.appendChild(renderer.domElement);

  // Luces sutiles
  scene.add(new THREE.AmbientLight(COLORS.neon.getHex(), 0.15));
  const key = new THREE.DirectionalLight(COLORS.neon.getHex(), 0.6);
  key.position.set(5, 10, 7);
  scene.add(key);

  // Plano infinito con shader de grid neón
  const gridUniforms = {
    uTime: { value: 0 },
    uScale: { value: CONFIG.gridScale },
    uLine: { value: CONFIG.lineWidth },
    uGlow: { value: CONFIG.glowIntensity },
    uBase: { value: COLORS.base },
    uNeon: { value: COLORS.neon }
  };

  const gridVertex = `
    varying vec3 vWorld;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorld = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const gridFragment = `
    precision highp float;
    uniform float uTime;
    uniform float uScale;
    uniform float uLine;
    uniform float uGlow;
    uniform vec3 uBase;
    uniform vec3 uNeon;
    varying vec3 vWorld;

    // Función de brillo de línea con glow
    float neonGrid(vec2 p) {
      // Escalar a densidad del grid
      p *= uScale * 8.0;
      // Distancia a centro de celda
      vec2 g = abs(fract(p) - 0.5);
      float d = min(g.x, g.y);
      // Línea: a menor distancia, mayor intensidad
      float line = smoothstep(uLine, 0.0, d);
      // Pulso suave animado
      float pulse = 0.6 + 0.4 * sin(uTime * 2.0 + p.x * 0.35 + p.y * 0.45);
      // Glow: potencia decreciente alrededor de la línea
      float glow = pow(line, 1.0) + pow(line, 2.5) * 0.5 + pow(line, 6.0) * 0.35;
      return glow * pulse * uGlow;
    }

    void main() {
      // Coordenadas en el plano XZ
      vec2 p = vWorld.xz;
      // Atenuación por distancia para "horizonte"
      float dist = length(p) * 0.03;
      float horizon = clamp(1.0 - dist, 0.0, 1.0);

      // Intensidad del grid
      float intensity = neonGrid(p) * horizon;

      vec3 color = uBase + uNeon * intensity;
      // Vignette sutil hacia los bordes por distancia
      float vign = smoothstep(1.0, 0.0, dist * 0.6);
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

  // Plano grande a modo "suelo" con ligera inclinación
  const gridPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200, 1, 1),
    gridMaterial
  );
  gridPlane.rotation.x = -Math.PI / 2;
  gridPlane.position.y = -1.2;
  scene.add(gridPlane);

  // Partículas flotantes con sprite radial (neón)
  const particles = createNeonParticles({
    count: CONFIG.particleCount,
    size: CONFIG.particleSize,
    color: COLORS.neon
  });
  scene.add(particles);

  // Elemento focal sutil: icosaedro wireframe
  const icoGroup = new THREE.Group();
  const icoGeo = new THREE.IcosahedronGeometry(1.2, 2);
  const edges = new THREE.EdgesGeometry(icoGeo);
  const lineMat = new THREE.LineBasicMaterial({
    color: COLORS.neon.getHex(),
    transparent: true,
    opacity: 0.45
  });
  const wire = new THREE.LineSegments(edges, lineMat);
  wire.position.set(0, 0.4, 0);
  icoGroup.add(wire);
  scene.add(icoGroup);

  // Interacción con el mouse (suave con rAF)
  const mouse = { x: 0, y: 0 };
  let rafMouse = null;
  function onPointerMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.x = nx;
    mouse.y = ny;
    if (!rafMouse) {
      rafMouse = requestAnimationFrame(() => {
        rafMouse = null;
      });
    }
  }
  window.addEventListener('mousemove', onPointerMove, { passive: true });

  // Animación
  const clock = new THREE.Clock();
  const sceneGroup = new THREE.Group();
  sceneGroup.add(gridPlane, particles, icoGroup);
  scene.add(sceneGroup);

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    gridUniforms.uTime.value = t;

    // Movimiento orgánico de partículas
    particles.rotation.y = t * 0.06;
    particles.position.y = Math.sin(t * 0.6) * 0.25;

    // Wireframe sutil
    icoGroup.rotation.x = t * 0.15;
    icoGroup.rotation.y = t * 0.2;

    // Cámara: parallax suave hacia el mouse
    const targetX = mouse.x * 1.6;
    const targetY = -mouse.y * 1.2 + CONFIG.cameraBaseY;
    camera.position.x += (targetX - camera.position.x) * 0.06;
    camera.position.y += (targetY - camera.position.y) * 0.06;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  });
}

// Crea un sistema de partículas con un sprite radial generado en runtime
function createNeonParticles({ count = 300, size = 0.08, color = new THREE.Color(0xffffff) } = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const ranges = new Float32Array(count); // factor para animación sutil por partícula

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 40; // X
    positions[i * 3 + 1] = Math.random() * 8 + 0.2;    // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z
    ranges[i] = Math.random() * 1.5 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aRange', new THREE.BufferAttribute(ranges, 1));

  const map = generateRadialSprite();
  map.anisotropy = 2;

  const material = new THREE.PointsMaterial({
    color: color.getHex(),
    size: size,
    map,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);

  // Animación interna basada en el tiempo global (hook en render externo)
  const clock = new THREE.Clock();
  function update() {
    const t = clock.getElapsedTime();
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const baseY = pos.getY(i);
      pos.setY(i, baseY + Math.sin(t * 0.8 + i * 0.15) * 0.002);
    }
    pos.needsUpdate = true;
    requestAnimationFrame(update);
  }
  update();

  return points;
}

// Sprite radial suave para partículas (sin depender de assets externos)
function generateRadialSprite(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  grad.addColorStop(0, 'rgba(124,242,212,1)');  // centro teal
  grad.addColorStop(0.3, 'rgba(124,242,212,0.6)');
  grad.addColorStop(0.6, 'rgba(124,242,212,0.25)');
  grad.addColorStop(1, 'rgba(124,242,212,0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
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
      // Interpolar de vuelta suavemente
      const startX = currentX, startY = currentY;
      const startTime = performance.now();
      const dur = 180;
      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
      function back() {
        const now = performance.now();
        const p = Math.min(1, (now - startTime) / dur);
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
