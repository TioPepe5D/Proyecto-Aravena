/* =============================================
   ANIMACIONES - JOYERÍA ARAVENA
   Loader, scroll reveal, header glass, parallax, counters
   ============================================= */

function inicializarAnimaciones() {
  initLoader();
  initScrollReveal();
  initHeaderScroll();
  initParallax();
  initCounters();
}

/* Loader inicial con brillo azul */
function initLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  const inicio = performance.now();
  const ocultar = () => {
    const transcurrido = performance.now() - inicio;
    const espera = Math.max(0, 800 - transcurrido);
    setTimeout(() => {
      loader.classList.add("oculto");
      setTimeout(() => loader.remove(), 600);
    }, espera);
  };
  if (document.readyState === "complete") ocultar();
  else window.addEventListener("load", ocultar);
  setTimeout(() => {
    if (document.body.contains(loader)) {
      loader.classList.add("oculto");
      setTimeout(() => loader.remove(), 600);
    }
  }, 1500);
}

/* Fade-in al hacer scroll (IntersectionObserver) */
function initScrollReveal() {
  const elementos = document.querySelectorAll(".animar");
  if (!elementos.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  elementos.forEach((el) => observer.observe(el));
}

/* Header con glassmorphism reforzado al hacer scroll */
function initHeaderScroll() {
  const header = document.querySelector(".header");
  if (!header) return;
  const toggle = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* Parallax leve en hero */
function initParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const capa = hero.querySelector("[data-parallax]") || hero;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, 600);
      capa.style.setProperty("--parallax-y", `${y * 0.15}px`);
      ticking = false;
    });
  }, { passive: true });
}

/* Animación de contadores en sección stats */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;
  const animar = (el) => {
    const destino = parseInt(el.dataset.count, 10) || 0;
    const duracion = 1600;
    const inicio = performance.now();
    const tick = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const eased = 1 - Math.pow(1 - progreso, 3);
      el.textContent = Math.floor(destino * eased).toLocaleString("es-CL");
      if (progreso < 1) requestAnimationFrame(tick);
      else el.textContent = destino.toLocaleString("es-CL");
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animar(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => observer.observe(el));
}
