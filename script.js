document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");

  // Año dinámico
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Animación de texto del Hero
  if (window.gsap) {
    const tl = gsap.timeline();
    tl.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
      .from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5");
  }

  // Inicializar Hero con shader animado
  initHeroShader();

  // Animaciones de scroll
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from("#featured .featured-card", {
      scrollTrigger: { trigger: "#featured", start: "top 80%" },
      opacity: 0, y: 50, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    document.querySelectorAll('#featured .featured-card img').forEach(img => {
      gsap.to(img, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: img, scrub: true }
      });
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
      x: 50, rotation: 2, opacity: 0, duration: 0.8, ease: "power2.out"
    });

    gsap.from("#footer", {
      scrollTrigger: { trigger: "#footer", start: "top 90%" },
      opacity: 0, y: 40, duration: 0.8, ease: "power2.out"
    });
  }

  // Parallax hover Featured
  initFeaturedParallax();
});

function initHeroShader() {
  const container = document.getElementById('hero-canvas');
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 10.0; // Escala del patrón
      vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
      float line = min(grid.x, grid.y);

      // Brillo animado
      float glow = 0.3 + 0.7 * sin(uTime * 3.0 + uv.x + uv.y);

      // Color neón azul
      vec3 color = vec3(0.0, 1.0, 1.0) * smoothstep(1.0, 0.0, line) * glow;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const geometry = new THREE.PlaneGeometry(6, 6, 1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Movimiento de cámara con el mouse
  document.addEventListener('mousemove', (e) => {
    uniforms.uMouse.value.x = e.clientX / window.innerWidth;
    uniforms.uMouse.value.y = 1.0 - e.clientY / window.innerHeight;
    camera.position.x = (uniforms.uMouse.value.x - 0.5) * 0.5;
    camera.position.y = (uniforms.uMouse.value.y - 0.5) * 0.5;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
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
      img.style.transform = "scale(1) translate(0, 0)";
    }

    img.addEventListener("mousemove", onMove);
    img.addEventListener("mouseleave", reset);
  });
}
