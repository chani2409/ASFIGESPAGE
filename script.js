// /assets/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS cargado correctamente");

  initYear();
  initHeroAnimations();
  initHeroShaderWithSphere();
  initScrollAnimations();
  initFeaturedParallax();
});

// Footer dinámico
function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Animación texto Hero
function initHeroAnimations() {
  if (!window.gsap) return;

  gsap.timeline()
    .from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
    .from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5");
}

// Scroll animations con GSAP
function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const fadeInConfig = { opacity: 0, duration: 0.8, ease: "power2.out" };

  gsap.from("#featured .featured-card", {
    ...fadeInConfig, y: 50, stagger: 0.2,
    scrollTrigger: { trigger: "#featured", start: "top 80%" }
  });

  document.querySelectorAll("#featured .featured-card img").forEach(img => {
    gsap.to(img, {
      yPercent: -10, ease: "none",
      scrollTrigger: { trigger: img, scrub: true }
    });
  });

  gsap.from("#about h2", {
    ...fadeInConfig, y: 40,
    scrollTrigger: { trigger: "#about", start: "top 80%" }
  });

  gsap.from("#about p", {
    ...fadeInConfig, y: 20, duration: 0.6, stagger: 0.15,
    scrollTrigger: { trigger: "#about", start: "top 75%" }
  });

  gsap.from("#about img", {
    ...fadeInConfig, x: 50, rotation: 2,
    scrollTrigger: { trigger: "#about", start: "top 75%" }
  });

  gsap.from("#footer", {
    ...fadeInConfig, y: 40,
    scrollTrigger: { trigger: "#footer", start: "top 90%" }
  });
}

// Shader del Hero con esfera 3D
function initHeroShaderWithSphere() {
  const container = document.getElementById("hero-canvas");
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 4;

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
      vec2 uv = vUv * 10.0;
      vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
      float line = min(grid.x, grid.y);
      float glow = 0.3 + 0.7 * sin(uTime * 3.0 + uv.x + uv.y);
      vec3 lineColor = vec3(0.0, 1.0, 1.0) * smoothstep(1.0, 0.0, line) * glow;
      vec3 baseColor = vec3(0.02, 0.08, 0.1);
      gl_FragColor = vec4(baseColor + lineColor, 1.0);
    }
  `;

  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
  ));

  const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 1),
    new THREE.MeshStandardMaterial({ color: 0x7cf2d4, wireframe: true })
  );
  scene.add(sphere);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  document.addEventListener("pointermove", e => {
    uniforms.uMouse.value.x = e.clientX / window.innerWidth;
    uniforms.uMouse.value.y = 1.0 - e.clientY / window.innerHeight;
    camera.position.x = (uniforms.uMouse.value.x - 0.5) * 0.5;
    camera.position.y = (uniforms.uMouse.value.y - 0.5) * 0.5;
  }, { passive: true });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.004;
    renderer.render(scene, camera);
  })();

  window.addEventListener("resize", debounce(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
  }, 150));
}

// Parallax hover en Featured
function initFeaturedParallax() {
  const images = document.querySelectorAll("#featured .featured-card img");
  if (!images.length) return;

  images.forEach(img => {
    let raf = null, targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    function onMove(e) {
      const rect = img.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
      if (!raf) raf = requestAnimationFrame(apply);
    }

    function apply() {
      raf = null;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      img.style.transform = `scale(1.05) translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
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

// Utilidad: debounce
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}
