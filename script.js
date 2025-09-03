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
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Cubo simple con material wireframe
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    wireframe: true,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Animación del cubo
  const animate = () => {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.002;
    cube.rotation.y += 0.003;
    renderer.render(scene, camera);
  };
  animate();

  // Ajuste en resize
  window.addEventListener("resize", () => {
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
