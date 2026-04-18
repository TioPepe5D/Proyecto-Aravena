document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productos-grid")) inicializarCatalogo();
  inicializarCarrito();
  inicializarAnimaciones();
  inicializarBuscador();
});

function inicializarBuscador() {
  const btn = document.getElementById("buscar-btn");
  const overlay = document.getElementById("buscador-overlay");
  const cerrar = document.getElementById("buscador-cerrar");
  const input = document.getElementById("buscador-input");

  if (!btn || !overlay) return;

  btn.addEventListener("click", () => {
    overlay.classList.add("activo");
    input.focus();
  });

  cerrar.addEventListener("click", () => {
    overlay.classList.remove("activo");
    input.value = "";
  });
}
