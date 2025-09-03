// js/main.js
// Punto de entrada: inicializa año, 3D, animaciones y cursor.

const setYear = () => {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
};

const init = async () => {
  setYear();

  // Detectar si es dispositivo táctil
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!isTouch) document.body.classList.add('cursor-enabled');

  // Cargar módulos en paralelo
  const tasks = [];

  // Cursor neón solo en desktop
  if (!isTouch) {
    tasks.push(import('./cursor.js').then(m => m.initCursor()).catch(console.error));
  }

  // Animaciones GSAP globales
  tasks.push(import('./animations.js').then(m => m.initAnimations()).catch(console.error));

  // Inicializar Hero Cinemático Reactivo
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    try {
      const { initHeroScene } = await import('./hero.js');
      const controller = initHeroScene(heroCanvas);

      // Animaciones de entrada con GSAP
      if (window.gsap) {
        gsap.fromTo('.hero-title', 
          { opacity: 0, y: 40 }, 
          { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
        );
        gsap.fromTo('#hero p', 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
        );
      }

      // Pausar/reanudar según visibilidad
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            controller.resume();
          } else {
            controller.pause();
          }
        });
      }, { threshold: 0.1 });
      io.observe(document.getElementById('hero'));

      // Ejemplo: cambiar color de partículas al pasar sobre el título
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle) {
        heroTitle.addEventListener('mouseenter', () => {
          document.documentElement.style.setProperty('--particle-color', 'var(--accent-sky)');
          controller.setParticleColor(0x38bdf8);
        });
        heroTitle.addEventListener('mouseleave', () => {
          document.documentElement.style.setProperty('--particle-color', 'var(--accent-teal)');
          controller.setParticleColor(0x2dd4bf);
        });
      }

    } catch (err) {
      console.warn('Error al inicializar Hero 3D:', err);
    }
  }

  await Promise.allSettled(tasks);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
