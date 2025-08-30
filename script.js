document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ JS cargado correctamente");

  // Animación de texto del Hero
  gsap.from("#hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
  gsap.from("#hero p", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });

  // Hero estilo Lusion con Three.js
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
    side: THREE.DoubleSide
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
});
