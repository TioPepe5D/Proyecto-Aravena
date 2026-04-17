let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function inicializarCarrito() {
  actualizarContador();

  document.getElementById("carrito-btn").addEventListener("click", abrirCarrito);
  document.getElementById("carrito-cerrar").addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-overlay").addEventListener("click", cerrarCarrito);
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
  abrirCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-items");

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p class='carrito-vacio'>Tu carrito está vacío</p>";
    document.getElementById("carrito-total").textContent = "$0";
    return;
  }

  contenedor.innerHTML = carrito.map(item => `
    <div class="carrito-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="carrito-item-info">
        <p class="carrito-item-nombre">${item.nombre}</p>
        <p class="carrito-item-precio">$${(item.precio * item.cantidad).toLocaleString("es-CL")} (x${item.cantidad})</p>
      </div>
      <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})">✕</button>
    </div>
  `).join("");

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  document.getElementById("carrito-total").textContent = "$" + total.toLocaleString("es-CL");
}

function abrirCarrito() {
  document.getElementById("carrito-panel").classList.add("activo");
  document.getElementById("carrito-overlay").classList.add("activo");
  renderizarCarrito();
}

function cerrarCarrito() {
  document.getElementById("carrito-panel").classList.remove("activo");
  document.getElementById("carrito-overlay").classList.remove("activo");
}

function actualizarContador() {
  const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  document.getElementById("carrito-contador").textContent = total;
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}
