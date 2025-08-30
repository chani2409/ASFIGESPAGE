document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");

  // Año dinámico en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Animación de texto del Hero
  if (window.gsap) {
    gsap.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    gsap.from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });
  }

  // Inicializar Hero Three.js
  initHeroThree();

  // Animaciones de scroll con GSAP
  if (window
