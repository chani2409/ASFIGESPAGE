document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");

  // Año dinámico en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Animación de texto del Hero
  if (window.gsap) {
    const tl = gsap.timeline();
    tl.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
      .from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5");
  }

  // Inicializar Hero con shader + esfera
  initHeroShaderWithSphere();

  // Animaciones de scroll con GSAP
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Featured Work - entrada
    gsap.from("#featured .featured-card", {
      scrollTrigger: { trigger: "#featured", start: "top 80%" },
      opacity: 0, y: 50, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    // Featured Work - parallax vertical en scroll
    document.querySelectorAll('#featured .featured-card img').forEach(img => {
      gsap.to(img, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: img, scrub: true }
      });
    });

    // About - texto e imagen
    gsap.from("#about h2", {
      scrollTrigger: { trigger: "#about", start: "top 80%" },
      y: 40, opacity: 0, duration: 0.8, ease: "power2.out"
    });
    gsap.from("#about p", {
      scrollTrigger: { trigger: "#about", start: "top 75%" },
      y: 20, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power2.out"
    });
    gsap.from("#about img", {
      scrollTrigger: { trigger: "#about", start: "top 75%" },
      x: 50, rotation: 2, opacity: 0, duration: 0.8, ease: "power2.out"
    });

    // Footer
    gsap.from("#footer", {
      scrollTrigger: { trigger: "#footer", start: "top 90%" },
      opacity: 0, y: 40, duration: 0.8, ease: "power2.out"
    });
  }

  // Parallax hover Featured
  initFeaturedParallax();
});

function initHeroShaderWithSphere() {
  const container = document.getElementById('hero-canvas');
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Shader futurista orgánico
  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vec2 uv = vUv * 4.0;
      uv.x += uTime * 0.05;

      float n = noise(uv * 2.0 + uTime * 0.1);
      uv += n * 0.3;

      float lines = abs(sin(uv.x * 3.1415) * cos(uv.y * 3.1415));
      lines = smoothstep(0.45, 0.5, lines);

      float nodes = smoothstep(0.02, 0.0, length(fract(uv) - 0.5));

      vec3 baseColor = mix(vec3(0.02, 0.05, 0.1), vec3(0.0, 0.0, 0.0), vUv.y);
      vec3 circuitColor = mix(vec3(0.0, 1.0, 1.0), vec3(0.5, 0.0, 1.0), vUv.y);

      float glow = 0.5 + 0.5 * sin(uTime * 2.0 + uv.x * 5.0);

      vec3 color = baseColor + circuitColor * (lines + nodes) * glow;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Plano con shader (fondo)
  const planeGeometry = new THREE.PlaneGeometry(6, 6, 1, 1);
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  // Esfera (icosaedro) wireframe
  const sphereGeometry = new THREE.IcosahedronGeometry(1.5, 1);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x7cf2d4, wireframe: true });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  // Luz para la esfera
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.004;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
  });
}

function initFeaturedParallax() {
  const images = document.querySelectorAll("#featured .featured-card img");
  if (!images.length) return;

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
      targetX = targetY = 0;
     
