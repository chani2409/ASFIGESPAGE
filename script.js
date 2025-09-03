// ==============================
// main.js - ASFIGES Portfolio
// ==============================

// Inicialización
const init = () => {
  setYear();
  initAnimations();
  initHeroScene();
  initCursor();
};

// Año dinámico en footer
const setYear = () => {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
};

// ==============================
// Animaciones con GSAP + ScrollTrigger
// ==============================
const initAnimations = () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Títulos de sección
  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.from(title, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: title,
        start: "top 80%",
      },
    });
  });

  // Secciones completas
  gsap.utils.toArray("section").forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 80,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
      },
    });
  });

  // Hero principal
  gsap.from(".hero-title", {
    opacity: 0,
    y: -50,
    duration: 1.2,
    ease: "power3.out",
  });

  gsap.from(".hero-subcopy", {
    opacity: 0,
    y: 30,
    delay: 0.3,
    duration: 1,
    ease: "power3.out",
  });
};

// ==============================
// Escena Hero con Three.js
// ==============================
const initHeroScene = () => {
  const heroCanvas = document.getElementById('hero-canvas');
  if (!heroCanvas || !window.THREE) return;

  const { Scene, PerspectiveCamera, WebGLRenderer, Color,
          TorusKnotGeometry, SphereGeometry, MeshBasicMaterial, Mesh,
          AdditiveBlending, Points, BufferGeometry, BufferAttribute, ShaderMaterial, Vector3, Clock } = THREE;

  // Escena y cámara
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Geometría 3D: un toroide
  const torus = new Mesh(
    new TorusKnotGeometry(2, 0.5, 128, 32),
    new MeshBasicMaterial({ color: 0x2dd4bf, wireframe: true, transparent: true, opacity: 0.6 })
  );
  scene.add(torus);

  // Esfera central glow
  const sphere = new Mesh(
    new SphereGeometry(1.2, 64, 64),
    new MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 })
  );
  scene.add(sphere);

  // Partículas alrededor
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 40;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  const material = new ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      uniform float time;
      void main() {
        vec3 pos = position;
        pos.y += sin(time + pos.x * 0.2) * 0.3;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 2.0;
      }
    `,
    fragmentShader: `void main() { gl_FragColor = vec4(0.18, 0.82, 0.74, 1.0); }`,
    blending: AdditiveBlending,
    transparent: true
  });
  scene.add(new Points(geometry, material));

  // Animación
  const clock = new Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    torus.rotation.x = t * 0.2;
    torus.rotation.y = t * 0.3;

    material.uniforms.time.value = t;

    renderer.render(scene, camera);
  };
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};


// ==============================
// Cursor personalizado
// ==============================
const initCursor = () => {
  const cursor = document.querySelector(".cursor");
  const halo = document.querySelector(".cursor-halo");

  if (!cursor || !halo) return;

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    halo.style.left = `${e.clientX}px`;
    halo.style.top = `${e.clientY}px`;
  });

  // Elementos interactivos que activan cursor
  document.querySelectorAll("a, button, input, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("is-active");
      halo.classList.add("is-active");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-active");
      halo.classList.remove("is-active");
    });
  });
};

// ==============================
// Iniciar cuando DOM está listo
// ==============================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
