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

  // Inicializar Hero Three.js (con guards)
  try {
    if (typeof initHeroThree === "function") {
      initHeroThree();
    } else {
      initHeroThree();
    }
  } catch (err) {
    console.error("Error iniciando Hero Three.js:", err);
  }

  // Animaciones de scroll (GSAP + ScrollTrigger)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Featured Work - entrada
    if (document.querySelector("#featured .featured-card")) {
      gsap.from("#featured .featured-card", {
        scrollTrigger: { trigger: "#featured", start: "top 80%" },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });
    }

    // Featured Work - parallax vertical en scroll
    document.querySelectorAll('#featured .featured-card img').forEach(img => {
      gsap.to(img, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: img,
          scrub: true
        }
      });
    });

    // About - texto e imagen
    if (document.getElementById("about")) {
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
    }

    // Footer
    if (document.getElementById("footer")) {
      gsap.from("#footer", {
        scrollTrigger: { trigger: "#footer", start: "top 90%" },
        opacity: 0, y: 40, duration: 0.8, ease: "power2.out"
      });
    }
  }

  // Parallax en hover para Featured Work
  initFeaturedParallax();
});

// ---------- Three.js Hero ----------
function initHeroThree() {
  const container = document.getElementById('hero-canvas');
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Luz ambiental y direccional
  const ambientLight = new THREE.AmbientLight(0x00ffff, 0.4);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0x00ffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Geometría de plano para el circuito
  const geometry = new THREE.PlaneGeometry(10, 10, 40, 40);

  // Material con líneas tipo neón
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });

  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // Animación de parpadeo en la opacidad
  let time = 0;

  // Movimiento de cámara con el mouse
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);

    // Rotación lenta del plano
    plane.rotation.x = Math.sin(time * 0.5) * 0.05;
    plane.rotation.y = Math.cos(time * 0.5) * 0.05;

    // Parpadeo sutil
    material.opacity = 0.5 + Math.sin(time * 3) * 0.1;

    // Movimiento de cámara suave hacia el mouse
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    time += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  // Ajuste en resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

  // Icosaedro wireframe
  const geometry = new THREE.IcosahedronGeometry(1.5, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x7cf2d4, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Movimiento de cámara con el mouse (sutil)
  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    camera.position.x = nx * 2;
    camera.position.y = -ny * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.004;
    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// ---------- Parallax hover Featured ----------
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
