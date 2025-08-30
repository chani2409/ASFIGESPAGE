// script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Animación de texto del Hero
  if (window.gsap) {
    gsap.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    gsap.from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });
  }

  // Hero Three.js (icosaedro wireframe)
  initHeroThree();

  // GSAP ScrollTrigger para Featured y About y Footer
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from("#featured .featured-card", {
      scrollTrigger: { trigger: "#featured", start: "top 80%" },
      opacity: 0, y: 50, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

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
      scale: 0.9, opacity: 0, duration: 0.8, ease: "power2.out"
    });

    gsap.from("#footer", {
      scrollTrigger: { trigger: "#footer", start: "top 90%" },
      opacity: 0, y: 40, duration: 0.8, ease: "power2.out"
    });
  }

  // Parallax suave en imágenes de Featured (mouse)
  initFeaturedParallax();
});

function initHeroThree() {
  const container = document.getElementById('hero-canvas');
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Icosaedro wireframe (look “esfera facetada”)
  const geometry = new THREE.IcosahedronGeometry(1.5, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x7cf2d4, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.004;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

function initFeaturedParallax() {
  const images = document.querySelectorAll("#featured .featured-card img");
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
      // Lerp para suavidad
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      img.style.transform = `scale(1.08) translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
      if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
        raf = requestAnimationFrame(apply);
      }
    }

    function reset() {
      targetX = targetY = 0;
      img.style.transform = "scale(1) translate(0, 0)";
    }

    img.addEventListener("mousemove", onMove);
    img.addEventListener("mouseleave", reset);
  });
}
