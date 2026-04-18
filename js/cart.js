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

  animarAgregar(producto);
  mostrarToast(producto.nombre);
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(p => p.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
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
    document.getElementById("carrito-total").textContent = "$0 CLP";
    return;
  }

  contenedor.innerHTML = carrito.map(item => `
    <div class="carrito-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="carrito-item-info">
        <p class="carrito-item-nombre">${item.nombre}</p>
        <p class="carrito-item-categoria">${item.categoria}</p>
        <p class="carrito-item-precio">$${item.precio.toLocaleString("es-CL")}</p>
        <div class="cantidad-selector">
          <button onclick="cambiarCantidad(${item.id}, -1)" aria-label="Disminuir">−</button>
          <span class="cantidad-valor">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${item.id}, 1)" aria-label="Aumentar">+</button>
        </div>
      </div>
      <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})" title="Eliminar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `).join("");

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  document.getElementById("carrito-total").textContent = "$" + total.toLocaleString("es-CL") + " CLP";
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
  const contador = document.getElementById("carrito-contador");
  contador.textContent = total;
  contador.classList.remove("pulse");
  void contador.offsetWidth;
  contador.classList.add("pulse");

  const badge = document.getElementById("carrito-header-badge");
  if (badge) badge.textContent = total;
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Animación: imagen volando hasta el ícono del carrito
function animarAgregar(producto) {
  const btn = event && event.currentTarget;
  const carritoIcon = document.getElementById("carrito-btn");
  if (!btn || !carritoIcon) return;

  const card = btn.closest(".producto-card");
  const img = card && card.querySelector("img");
  if (!img) return;

  const imgRect = img.getBoundingClientRect();
  const cartRect = carritoIcon.getBoundingClientRect();

  const flyer = img.cloneNode(true);
  flyer.classList.add("fly-to-cart");
  flyer.style.left = imgRect.left + "px";
  flyer.style.top = imgRect.top + "px";
  flyer.style.width = imgRect.width + "px";
  flyer.style.height = imgRect.height + "px";
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    flyer.style.left = cartRect.left + cartRect.width / 2 + "px";
    flyer.style.top = cartRect.top + cartRect.height / 2 + "px";
    flyer.style.width = "20px";
    flyer.style.height = "20px";
    flyer.style.opacity = "0";
    flyer.style.transform = "rotate(360deg)";
  });

  setTimeout(() => flyer.remove(), 800);
}

// Toast de confirmación
function mostrarToast(nombre) {
  let toast = document.getElementById("toast-carrito");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-carrito";
    toast.className = "toast-carrito";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> ${nombre} agregado al carrito`;
  toast.classList.remove("activo");
  void toast.offsetWidth;
  toast.classList.add("activo");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("activo"), 2200);
}
