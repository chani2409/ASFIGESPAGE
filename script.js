// js/main.js
// Punto de entrada: inicializa año, 3D, animaciones y cursor con arquitectura optimizada.

// ----------------------
// Utilidades globales
// ----------------------

// Manejo centralizado de errores
const logError = (context, err) => {
  console.error(`[ASFIGES] Error en ${context}:`, err);
  // Aquí podrías enviar a un servicio de monitoreo si lo deseas
};

// Helper para observar visibilidad de elementos
const observeVisibility = (el, onEnter, onLeave, threshold = 0.1) => {
  if (!el) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? onEnter?.() : onLeave?.());
  }, { threshold });
  io.observe(el);
  return io;
};

// Helper para setear variables CSS dinámicamente
const setThemeVars = vars => {
  Object.entries(vars).forEach(([key, val]) => {
    document.documentElement.style.setProperty(`--${key}`, val);
  });
};

// ----------------------
// Funciones principales
// ----------------------

const setYear = () => {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
};

const initCursor = async () => {
  try {
    const { initCursor } = await import('./cursor.js');
    initCursor();
  } catch (err) {
    logError('cursor', err);
  }
};

const initAnimations = async () => {
  try {
    const { initAnimations } = await import('./animations.js');
    initAnimations();
  } catch (err) {
    logError('animations', err);
  }
};

const initHero = async () => {
  const heroCanvas = document.getElementById('hero-canvas');
  if (!heroCanvas) return;

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
    observeVisibility(
      document.getElementById('hero'),
      () => controller.resume(),
      () => controller.pause()
    );

    // Cambiar color de partículas al pasar sobre el título
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.addEventListener('mouseenter', () => {
        setThemeVars({ 'particle-color': 'var(--accent-sky)' });
        controller.setParticleColor(0x38bdf8);
      });
      heroTitle.addEventListener('mouseleave', () => {
        setThemeVars({ 'particle-color': 'var(--accent-teal)' });
        controller.setParticleColor(0x2dd4bf);
      });
    }

  } catch (err) {
    logError('Hero 3D', err);
  }
};

// ----------------------
// Inicialización global
// ----------------------

const init = async () => {
  setYear();

  // Detectar si es dispositivo táctil
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!isTouch) document.body.classList.add('cursor-enabled');

  // Cargar módulos en paralelo
  const tasks = [];

  // Cursor neón solo en desktop (carga diferida para no bloquear)
  if (!isTouch) {
    requestIdleCallback(() => initCursor());
  }

  // Animaciones GSAP globales
  tasks.push(initAnimations());

  // Hero Cinemático Reactivo
  tasks.push(initHero());

  await Promise.allSettled(tasks);
};

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
