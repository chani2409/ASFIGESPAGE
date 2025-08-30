document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (window.gsap) {
    const tl = gsap.timeline();
    tl.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
      .from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5");
  }

  initHeroShader();

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from("#featured .featured-card", {
      scrollTrigger: { trigger: "#featured", start: "top 80%" },
      opacity:
