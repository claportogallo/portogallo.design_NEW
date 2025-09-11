
(function () {
  try {
    const supportsReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (supportsReduced) return;

    let ticking = false;
    const layers = document.querySelectorAll('[data-parallax-layer]');

    function updateLayers() {
      const y = window.scrollY || window.pageYOffset || 0;
      layers.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed') || '0.2');
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateLayers();
          ticking = false;
        });
        ticking = true;
      }
    }
    function updateGrid() {
      const grid = document.querySelector('[data-project-grid]');
      if (!grid) return;
      const scrolled = (window.scrollY || 0);
      grid.querySelectorAll('.project-card').forEach((card, i) => {
        const speed = 0.1 + (i % 3) * 0.05;
        card.style.transform = `translate3d(0, ${scrolled * speed * 0.15}px, 0)`;
      });
    }
    function onScrollAll() { onScroll(); updateGrid(); }

    window.addEventListener('scroll', onScrollAll, { passive: true });
    window.addEventListener('load', () => { updateLayers(); updateGrid(); });
  } catch (e) { console && console.warn && console.warn("[parallax] disabled:", e); }
})();
