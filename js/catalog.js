// Muestra los productos en el grid, filtrando por categoría si se especifica
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
    <div class="producto-card animar" style="transition-delay: ${i * 60}ms" onclick="window.location='producto.html?id=${producto.id}'" role="link">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="producto-info">
        <p class="producto-categoria">${producto.categoria}</p>
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-precio">$${producto.precio.toLocaleString("es-CL")}</p>
        <button class="btn-primary" onclick="event.stopPropagation(); window.location='producto.html?id=${producto.id}'">
          Ver producto
        </button>
      </div>
    </div>
  `).join("");

  setTimeout(() => {
    grid.querySelectorAll(".animar").forEach(el => el.classList.add("visible"));
  }, 50);
}

// Maneja los botones de filtro (activo/inactivo) y llama a renderizarProductos
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

// Punto de entrada: carga todos los productos y activa los filtros
function inicializarCatalogo() {
  renderizarProductos();
  inicializarFiltros();
  inicializarAnimaciones();
}
