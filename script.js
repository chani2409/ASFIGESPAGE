document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");

  // Animación GSAP para título y subtítulo del Hero
  gsap.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
  gsap.from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });

  // Escena Three.js para el Hero
  const container = document.getElementById('hero-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.5, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x7cf2d4, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  camera.position.z = 4;

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
  function initHeroLusionStyle() {
  const container = document.getElementById('hero-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
  const material = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z = sin(pos.x * 2.0 + uTime) * 0.2 + cos(pos.y * 2.0 + uTime) * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        vec3 colorA = vec3(0.49, 0.95, 0.83);
        vec3 colorB = vec3(0.1, 0.15, 0.25);
        vec3 color = mix(colorB, colorA, vUv.y);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    wireframe: false
  });

  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

  // Animación GSAP para Featured Work
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from("#featured .featured-card", {
      scrollTrigger: {
        trigger: "#featured",
        start: "top 80%"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
 // Animación GSAP para sección About
if (window.gsap && window.ScrollTrigger) {
  gsap.from("#about h2", {
    scrollTrigger: {
      trigger: "#about",
      start: "top 80%"
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from("#about p", {
    scrollTrigger: {
      trigger: "#about",
      start: "top 75%"
    },
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "power2.out"
  });

  gsap.from("#about img", {
    scrollTrigger: {
      trigger: "#about",
      start: "top 75%"
    },
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  });
}

  // Efecto Parallax en imágenes de Featured Work
  const featuredCards = document.querySelectorAll("#featured .featured-card img");

  featuredCards.forEach(img => {
    img.addEventListener("mousemove", (e) => {
      const rect = img.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `scale(1.1) translate(${x * 15}px, ${y * 15}px)`;
    });

    img.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1.0) translate(0, 0)";
    });
  });
});
 // Año dinámico en el footer
 document.getElementById('year').textContent = new Date().getFullYear();

// Animación de entrada del footer
if (window.gsap && window.ScrollTrigger) {
  gsap.from("#footer", {
    scrollTrigger: {
      trigger: "#footer",
      start: "top 90%"
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: "power2.out"
  });
}
