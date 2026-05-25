/* =============================================
   SUPABASE CLIENT — Joyería Aravena
   ============================================= */
const SUPA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

let db = null;
try {
  const supa = window.supabase || window.Supabase;
  if (supa && supa.createClient) {
    db = supa.createClient(SUPA_URL, SUPA_KEY);
  } else {
    console.warn('[Auth] Supabase CDN no cargó correctamente');
  }
} catch (e) {
  console.error('[Auth] Error al inicializar Supabase:', e);
}

// Mapa global de imágenes sobreescritas desde Drive/Storage
window.imagenesOverride = {};

async function cargarImagenesOverride() {
  if (!db) return;
  try {
    const { data } = await db.from('imagen_override').select('product_id, url');
    if (data && data.length > 0) {
      data.forEach(row => { window.imagenesOverride[row.product_id] = row.url; });
    }
  } catch (e) { /* silencioso: tabla puede no existir aún */ }
}

// Cargar al inicio de cada página que incluya este script
cargarImagenesOverride();
