import { initScene } from "./threeScene.js";

// ==============================
// Inicialización
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  initScene();         // Three.js fondo animado
  initAnimations();    // GSAP
  initCursor();        // Cursor personalizado
  initTilt();          // Tilt en tarjetas
  document.getElementById("year").textContent = new Date().getFullYear();
});

// ==============================
// GSAP Scroll Animations
// ==============================
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section-title").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%" },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  });

  gsap.utils.toArray(".card-tilt").forEach((card) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 90%" },
      y: 30,
      opacity: 0,
      duration: 0.9,
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

  document.querySelectorAll("a, button, .card-tilt").forEach((el) => {
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

// ==============================
// Tilt Effect
// ==============================
function initTilt() {
  VanillaTilt.init(document.querySelectorAll(".card-tilt"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": 0.4,
  });
}
// ==============================
// Fondo animado con Three.js
// ==============================
export function initScene() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Partículas
  const particlesCount = 4000;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x00f5ff, size: 0.05 });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Malla geométrica
  const icoGeometry = new THREE.IcosahedronGeometry(2.5, 2);
  const icoMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
  scene.add(icoMesh);

  camera.position.z = 8;

  const animate = () => {
    icoMesh.rotation.x += 0.002;
    icoMesh.rotation.y += 0.003;
    particles.rotation.y += 0.0005;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
