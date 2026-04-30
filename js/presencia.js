/* =============================================
   PRESENCIA EN TIEMPO REAL — Joyería Aravena
   Registra visitantes activos en Supabase para
   mostrarlos en el panel de admin.
   ============================================= */

(function () {
  const INTERVALO = 30_000; // heartbeat cada 30s
  const PAGINAS = {
    'index.html':       'Inicio',
    'producto.html':    'Producto',
    'carrito.html':     'Carrito',
    'perfil.html':      'Mi perfil',
    'contacto.html':    'Contacto',
    'nosotros.html':    'Nosotros',
    'pago-exitoso.html':'Pago exitoso',
    'pago-fallido.html':'Pago fallido',
    'pago-pendiente.html':'Pago pendiente',
    'admin.html':       'Admin',
  };

  // Nombre amigable de la página actual
  const ruta = window.location.pathname.split('/').pop() || 'index.html';
  const pagina = PAGINAS[ruta] || ruta || 'Inicio';

  // ID único por pestaña (no persiste entre cierres)
  let sessionId = sessionStorage.getItem('_presencia_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem('_presencia_id', sessionId);
  }

  async function ping() {
    if (typeof db === 'undefined' || !db) return;
    try {
      await db.from('presencia').upsert(
        { session_id: sessionId, pagina, updated_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
    } catch (_) {}
  }

  async function salir() {
    if (typeof db === 'undefined' || !db) return;
    try {
      await db.from('presencia').delete().eq('session_id', sessionId);
    } catch (_) {}
  }

  // Limpiar registros viejos (> 2 min) al entrar
  async function limpiarViejos() {
    if (typeof db === 'undefined' || !db) return;
    try {
      const hace2min = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await db.from('presencia').delete().lt('updated_at', hace2min);
    } catch (_) {}
  }

  // Iniciar cuando Supabase esté listo
  function iniciar() {
    if (typeof db === 'undefined' || !db) {
      setTimeout(iniciar, 500);
      return;
    }
    limpiarViejos();
    ping();
    setInterval(ping, INTERVALO);
    window.addEventListener('beforeunload', salir);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') ping();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
