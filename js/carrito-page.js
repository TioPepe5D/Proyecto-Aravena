let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContador() {
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById("carrito-contador");
  if (el) el.textContent = total;
  const badge = document.getElementById("carrito-badge");
  if (badge) badge.textContent = total;
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(p => p.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(p => p.id !== id);
  }
  guardarCarrito();
  actualizarContador();
  renderizarCarritoPage();
}

function eliminarItem(id) {
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();
  actualizarContador();
  renderizarCarritoPage();
}

function renderizarCarritoPage() {
  const contenedor = document.getElementById("carrito-page-items");
  const totalEl = document.getElementById("carrito-aside-total");

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="carrito-vacio-msg">Tu carrito está vacío. <a href="index.html#catalogo">Ver productos →</a></p>';
    if (totalEl) totalEl.textContent = "$0 CLP";
    return;
  }

  contenedor.innerHTML = carrito.map(item => `
    <div class="carrito-page-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="carrito-page-item-info">
        <p class="carrito-page-item-nombre">${item.nombre}</p>
        <p class="carrito-page-item-cat">${item.categoria}</p>
        <p class="carrito-page-item-precio">$${item.precio.toLocaleString("es-CL")}</p>
      </div>
      <div class="cantidad-selector">
        <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
        <span class="cantidad-valor">${item.cantidad}</span>
        <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
      </div>
      <button class="carrito-page-item-eliminar" onclick="eliminarItem(${item.id})" title="Eliminar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `).join("");

  const total = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  if (totalEl) totalEl.textContent = "$" + total.toLocaleString("es-CL") + " CLP";
}

function habilitarBotonPago() {
  const btn   = document.getElementById("btn-pagar");
  const btnTr = document.getElementById("btn-transferencia");
  if (btn)   btn.disabled   = carrito.length === 0;
  if (btnTr) btnTr.disabled = carrito.length === 0;
}

async function iniciarPago() {
  const btn = document.getElementById("btn-pagar");
  const estado = document.getElementById("btn-mp-estado");
  if (carrito.length === 0) return;

  // Verificar sesión antes de proceder al pago
  if (typeof db === 'undefined' || !db) return;
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    document.getElementById('auth-overlay')?.classList.add('activo');
    document.getElementById('auth-panel')?.classList.add('activo');
    if (estado) {
      estado.textContent = "⚠ Debes iniciar sesión para completar tu compra.";
      estado.style.color = "#f59e0b";
    }
    return;
  }

  btn.disabled = true;
  btn.textContent = "Procesando...";
  if (estado) estado.textContent = "";

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision = Math.round(subtotal * 0.05);
  const totalFinal = subtotal + comision;

  const items = carrito.map(i => ({
    id: String(i.id),
    title: i.nombre,
    quantity: i.cantidad,
    unit_price: i.precio,
    currency_id: "CLP"
  }));

  if (comision > 0) {
    items.push({
      id: "comision-bancaria",
      title: "Comisión Bancaria impuesto",
      quantity: 1,
      unit_price: comision,
      currency_id: "CLP"
    });
  }

  // ── Guardar pedido pendiente en Supabase ──
  await guardarPedidoPendiente(totalFinal);
  const pedidoId = localStorage.getItem('pedido_pendiente_id') || "";

  try {
    const res = await fetch("/api/crear-preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, pedidoId })
    });

    if (!res.ok) throw new Error("Error del servidor");

    const data = await res.json();
    window.location.href = data.init_point;
  } catch (err) {
    if (estado) {
      estado.textContent = "⚠ Error al conectar con MercadoPago. Intenta de nuevo.";
      estado.style.color = "#dc2626";
    }
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#009EE3"/><path d="M13 24c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11S13 30.075 13 24z" fill="white"/><path d="M20 24l3 3 6-6" stroke="#009EE3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Pagar con MercadoPago`;
  }
}

/* ── Guardar pedido en Supabase ───────────── */
async function guardarPedidoPendiente(total) {
  if (typeof db === 'undefined' || !db) return;
  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return;

    const itemsGuardar = carrito.map(i => ({
      id: i.id,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precio: i.precio,
      imagen: i.imagen || ''
    }));

    const { data: pedido, error } = await db
      .from('pedidos')
      .insert({
        user_id: session.user.id,
        items: itemsGuardar,
        total: total,
        estado: 'pendiente'
      })
      .select('id')
      .single();

    if (!error && pedido) {
      localStorage.setItem('pedido_pendiente_id', pedido.id);
    }
  } catch (e) {
    console.warn('[Pedidos] No se pudo guardar el pedido:', e);
  }
}

/* ── Manejar retorno desde MercadoPago ────── */
async function manejarRetornoPago() {
  const params = new URLSearchParams(window.location.search);
  const pago = params.get('pago');
  if (!pago) return;

  // Limpiar URL sin recargar la página
  history.replaceState({}, '', window.location.pathname);

  const pedidoId = localStorage.getItem('pedido_pendiente_id');

  if (pago === 'ok') {
    // Actualizar estado en Supabase
    if (pedidoId && typeof db !== 'undefined' && db) {
      try {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
          await db.from('pedidos')
            .update({ estado: 'pagado' })
            .eq('id', pedidoId)
            .eq('user_id', session.user.id);
          localStorage.removeItem('pedido_pendiente_id');
        }
      } catch (e) { console.warn('[Pedidos] Error al actualizar estado:', e); }
    }

    // Vaciar carrito
    carrito = [];
    guardarCarrito();
    actualizarContador();
    renderizarCarritoPage();
    habilitarBotonPago();

    mostrarBannerPago(
      '¡Pago realizado con éxito! Gracias por tu compra, pronto te contactaremos.',
      'ok',
      'Ver mis pedidos →',
      'perfil.html#pedidos'
    );

  } else if (pago === 'pendiente') {
    mostrarBannerPago(
      'Tu pago está siendo procesado. Te avisaremos cuando se confirme.',
      'pendiente'
    );

  } else if (pago === 'error') {
    // Marcar pedido como fallido
    if (pedidoId && typeof db !== 'undefined' && db) {
      try {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
          await db.from('pedidos')
            .update({ estado: 'fallido' })
            .eq('id', pedidoId)
            .eq('user_id', session.user.id);
          localStorage.removeItem('pedido_pendiente_id');
        }
      } catch (e) {}
    }

    mostrarBannerPago(
      'Hubo un problema con el pago. Puedes intentarlo de nuevo.',
      'error'
    );
  }
}

function mostrarBannerPago(texto, tipo, linkTexto = '', linkUrl = '') {
  const main = document.querySelector('.carrito-page');
  if (!main) return;

  const banner = document.createElement('div');
  banner.className = `pago-banner pago-banner-${tipo}`;
  const icono = tipo === 'ok' ? '✓' : tipo === 'pendiente' ? '⏳' : '⚠';
  banner.innerHTML = `
    <span class="pago-banner-icono">${icono}</span>
    <span>${texto}</span>
    ${linkTexto ? `<a href="${linkUrl}" class="pago-banner-link">${linkTexto}</a>` : ''}
  `;
  main.prepend(banner);
}

/* ══════════════════════════════════════════
   TRANSFERENCIA BANCARIA
   ══════════════════════════════════════════ */

// ── Datos bancarios (actualizar con los datos reales) ──
const DATOS_BANCO = {
  banco:   'TU BANCO',            // ← reemplazar
  nombre:  'NOMBRE TITULAR',      // ← reemplazar
  rut:     'XX.XXX.XXX-X',        // ← reemplazar
  tipo:    'Cuenta Corriente',    // ← reemplazar
  numero:  'XXXXXXXXXX',          // ← reemplazar
  email:   'TU@EMAIL.CL'          // ← reemplazar
};

async function iniciarTransferencia() {
  // 1. Verificar sesión
  if (typeof db === 'undefined' || !db) return;
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    document.getElementById('auth-overlay')?.classList.add('activo');
    document.getElementById('auth-panel')?.classList.add('activo');
    const estado = document.getElementById("btn-mp-estado");
    if (estado) {
      estado.textContent = "⚠ Debes iniciar sesión para continuar.";
      estado.style.color = "#f59e0b";
    }
    return;
  }

  // 2. Calcular total
  const subtotal  = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision  = Math.round(subtotal * 0.05);
  const total     = subtotal + comision;

  // 3. Guardar pedido en Supabase con estado transferencia_pendiente
  try {
    const itemsGuardar = carrito.map(i => ({
      id: i.id, nombre: i.nombre, cantidad: i.cantidad,
      precio: i.precio, imagen: i.imagen || ''
    }));
    const { data: pedido, error } = await db
      .from('pedidos')
      .insert({ user_id: session.user.id, items: itemsGuardar,
                total, estado: 'transferencia_pendiente' })
      .select('id').single();
    if (!error && pedido) localStorage.setItem('pedido_pendiente_id', pedido.id);
  } catch (e) {
    console.warn('[Transferencia] No se pudo guardar el pedido:', e);
  }

  // 4. Mostrar modal con datos bancarios
  abrirModalTransferencia(total);
}

function abrirModalTransferencia(total) {
  // Rellenar datos en el modal
  document.getElementById('modal-total-valor').textContent =
    '$' + total.toLocaleString('es-CL') + ' CLP';
  document.getElementById('dato-banco').textContent  = DATOS_BANCO.banco;
  document.getElementById('dato-nombre').textContent = DATOS_BANCO.nombre;
  document.getElementById('dato-rut').textContent    = DATOS_BANCO.rut;
  document.getElementById('dato-tipo').textContent   = DATOS_BANCO.tipo;
  document.getElementById('dato-numero').textContent = DATOS_BANCO.numero;
  document.getElementById('dato-email').textContent  = DATOS_BANCO.email;

  // Link de WhatsApp con el comprobante
  const resumen = carrito.map(i => `• ${i.nombre} x${i.cantidad}`).join('%0A');
  const msg = encodeURIComponent(
    `Hola! Acabo de hacer una transferencia por $${total.toLocaleString('es-CL')} CLP.\n\nPedido:\n${carrito.map(i=>`• ${i.nombre} x${i.cantidad}`).join('\n')}\n\nAdjunto el comprobante.`
  );
  document.getElementById('btn-confirmar-transferencia').href =
    `https://wa.me/56966497904?text=${msg}`;

  // Abrir modal
  document.getElementById('modal-transferencia-overlay')?.classList.add('activo');
}

function cerrarModalTransferencia() {
  document.getElementById('modal-transferencia-overlay')?.classList.remove('activo');
}

function copiarDatosBancarios() {
  const total = document.getElementById('modal-total-valor').textContent;
  const texto =
    `Datos de transferencia — Joyería Aravena\n` +
    `Total: ${total}\n` +
    `Banco: ${DATOS_BANCO.banco}\n` +
    `Nombre: ${DATOS_BANCO.nombre}\n` +
    `RUT: ${DATOS_BANCO.rut}\n` +
    `Tipo de cuenta: ${DATOS_BANCO.tipo}\n` +
    `N° de cuenta: ${DATOS_BANCO.numero}\n` +
    `Email: ${DATOS_BANCO.email}`;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById('btn-copiar-datos');
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ ¡Copiado!';
    btn.style.color = '#10b981';
    btn.style.borderColor = '#10b981';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 2000);
  }).catch(() => {
    alert('No se pudo copiar. Por favor copia los datos manualmente.');
  });
}

/* ── Configurar botones ── */
function configurarPago() {
  const btn   = document.getElementById("btn-pagar");
  const btnTr = document.getElementById("btn-transferencia");
  const btnCerrar   = document.getElementById("modal-transferencia-cerrar");
  const overlay     = document.getElementById("modal-transferencia-overlay");
  const btnCopiar   = document.getElementById("btn-copiar-datos");

  if (btn)        btn.addEventListener("click", iniciarPago);
  if (btnTr)      btnTr.addEventListener("click", iniciarTransferencia);
  if (btnCerrar)  btnCerrar.addEventListener("click", cerrarModalTransferencia);
  if (overlay)    overlay.addEventListener("click", e => {
    if (e.target === overlay) cerrarModalTransferencia();
  });
  if (btnCopiar)  btnCopiar.addEventListener("click", copiarDatosBancarios);
}

actualizarContador();
renderizarCarritoPage();
habilitarBotonPago();
configurarPago();
