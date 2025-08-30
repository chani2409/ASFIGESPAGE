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
  if (!isTouch) {
    tasks.push(import('./cursor.js').then(m => m.initCursor()).catch(console.error));
  }
  tasks.push(import('./animations.js').then(m => m.initAnimations()).catch(console.error));

  // Inicializar escena 3D si existe el contenedor
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    try {
      const { initFuturisticBackground } = await import('./threeBackground.js');
      const controller = await initFuturisticBackground(heroCanvas);

      // Pausar/reanudar según visibilidad
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) controller.resume();
          else controller.pause();
        });
      }, { threshold: 0.1 });
      io.observe(document.getElementById('hero'));
    } catch (err) {
      console.warn('Error al inicializar Three.js:', err);
    }
  }

  await Promise.allSettled(tasks);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
