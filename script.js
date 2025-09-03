// ==============================
// main.js - ASFIGES Portfolio Optimizado
// ==============================

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  // Hero scene
  initHeroScene();
  // Animaciones GSAP
  initScrollAnimations();
  // Cursor
  initCursor();
  // Año footer
  document.getElementById("year").textContent = new Date().getFullYear();
});

// ==============================
// HERO con Three.js
// ==============================
function initHeroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const geometry = new THREE.IcosahedronGeometry(2.5, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const pointLight = new THREE.PointLight(0x2dd4bf, 2, 100);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);
  camera.position.z = 6;

  const animate = () => {
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.004;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
}

// ==============================
// GSAP Scroll Animations
// ==============================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section-title").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%" },
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
    });
  });

  gsap.utils.toArray(".featured-card, .p-6").forEach((card) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 90%" },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  });
}

// ==============================
// Cursor personalizado
// ==============================
function initCursor() {
  const cursor = document.querySelector(".cursor");
  const halo = document.querySelector(".cursor-halo");
  if (!cursor || !halo) return;

  window.addEventListener("mousemove", (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
    halo.style.top = `${e.clientY}px`;
    halo.style.left = `${e.clientX}px`;
  });

  document.querySelectorAll("a, button, .featured-card, .p-6").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("is-active");
      halo.classList.add("is-active");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-active");
      halo.classList.remove("is-active");
    });
  });
}
