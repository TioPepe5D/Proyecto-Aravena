function renderizarProductos(categoria = "todos") {
  const grid = document.getElementById("productos-grid");
  const titulo = document.getElementById("catalogo-titulo");

  let filtrados;
  if (categoria === "todos") {
    filtrados = productos;
    titulo.textContent = "Nuestra Colección";
  } else if (categoria === "ofertas") {
    filtrados = productos.filter(p => p.precio < 20000);
    titulo.textContent = "Ofertas hasta $20.000";
  } else {
    filtrados = productos.filter(p => p.categoria === categoria);
    titulo.textContent = "Nuestra Colección";
  }

  if (filtrados.length === 0) {
    grid.innerHTML = "<p style='text-align:center;color:#888;'>No hay productos en esta categoría.</p>";
    return;
  }

  grid.innerHTML = filtrados.map((producto, i) => `
    <div class="producto-card animar" style="transition-delay: ${i * 60}ms" data-id="${producto.id}">
      <div class="producto-card-img-wrap">
        <img src="${producto.imagen}" alt="${producto.nombre}">
      </div>
      <div class="producto-info">
        <p class="producto-categoria">${producto.categoria}</p>
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-precio">$${producto.precio.toLocaleString("es-CL")}</p>
      </div>
      <div class="producto-card-btn-wrap">
        <button class="btn-agregar-card" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Agregar al carrito
        </button>
      </div>
    </div>
  `).join("");

  // Abrir panel de detalle al hacer clic en la tarjeta
  grid.querySelectorAll(".producto-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      abrirDetalleProducto(id);
    });
  });

  setTimeout(() => {
    grid.querySelectorAll(".animar").forEach(el => el.classList.add("visible"));
  }, 50);
}

function abrirDetalleProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const panel = document.getElementById("producto-detalle-panel");
  const overlay = document.getElementById("producto-detalle-overlay");
  const contenido = document.getElementById("producto-detalle-contenido");

  contenido.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" class="detalle-imagen">
    <div class="detalle-info">
      <p class="detalle-categoria">${producto.categoria}</p>
      <h2 class="detalle-nombre">${producto.nombre}</h2>
      <p class="detalle-precio">$${producto.precio.toLocaleString("es-CL")} CLP</p>
      <p class="detalle-descripcion">${producto.descripcion}</p>
      <div class="detalle-cantidad-wrap">
        <span class="detalle-cantidad-label">Cantidad</span>
        <div class="cantidad-selector">
          <button onclick="detalleCambiarCantidad(-1)">−</button>
          <span class="cantidad-valor" id="detalle-cantidad">1</span>
          <button onclick="detalleCambiarCantidad(1)">+</button>
        </div>
      </div>
      <button class="btn-detalle-agregar" id="btn-detalle-agregar" onclick="detalleAgregarAlCarrito(${producto.id})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Agregar al carrito
      </button>
      <div class="detalle-badges">
        <span>🚚 Envíos a todo Chile</span>
        <span>🔒 Plata 925 certificada</span>
        <span>✦ Pieza artesanal única</span>
      </div>
    </div>
  `;

  panel.classList.add("activo");
  overlay.classList.add("activo");
  document.body.style.overflow = "hidden";
}

function cerrarDetalleProducto() {
  document.getElementById("producto-detalle-panel").classList.remove("activo");
  document.getElementById("producto-detalle-overlay").classList.remove("activo");
  document.body.style.overflow = "";
}

function detalleCambiarCantidad(delta) {
  const el = document.getElementById("detalle-cantidad");
  if (!el) return;
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  el.textContent = val;
}

function detalleAgregarAlCarrito(id) {
  const cantidad = parseInt(document.getElementById("detalle-cantidad").textContent) || 1;
  for (let i = 0; i < cantidad; i++) agregarAlCarrito(id);
  const btn = document.getElementById("btn-detalle-agregar");
  btn.textContent = "✓ Agregado";
  btn.style.backgroundColor = "#10b981";
  setTimeout(() => {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Agregar al carrito`;
    btn.style.backgroundColor = "";
  }, 1800);
}

function inicializarFiltros() {
  const botones = document.querySelectorAll(".filtro-btn");
  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      botones.forEach(b => b.classList.remove("activo"));
      boton.classList.add("activo");
      renderizarProductos(boton.dataset.categoria);
    });
  });
}

function inicializarCatalogo() {
  renderizarProductos();
  inicializarFiltros();
  inicializarAnimaciones();

  document.getElementById("producto-detalle-overlay").addEventListener("click", cerrarDetalleProducto);
  document.getElementById("producto-detalle-cerrar").addEventListener("click", cerrarDetalleProducto);
}
