const { createClient } = require('@supabase/supabase-js');

const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { items, total, estado, datosEnvio, userToken } = req.body || {};

  if (!items || !total || !estado) {
    return res.status(400).json({ error: 'Faltan datos requeridos (items, total, estado)' });
  }

  // Intentar obtener user_id si hay token de sesión
  let userId = null;
  if (userToken) {
    try {
      const supabaseAnon = createClient(SUPA_URL, SUPA_ANON);
      const { data: { user } } = await supabaseAnon.auth.getUser(userToken);
      if (user) userId = user.id;
    } catch (_) {}
  }

  // Usar service key para bypass RLS (funciona tanto para sesión como para invitados)
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  const supabaseAdmin = createClient(SUPA_URL, serviceKey);

  const payload = {
    items,
    total: Number(total),
    estado,
  };

  // Solo incluir user_id si el usuario está autenticado
  if (userId) payload.user_id = userId;

  // Intentar con datos_envio primero
  if (datosEnvio) payload.datos_envio = datosEnvio;

  let { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .insert(payload)
    .select('id')
    .single();

  // Si falló por columna datos_envio inexistente, reintentar sin ella
  if (error && error.message && error.message.includes('datos_envio')) {
    console.warn('[guardar-pedido] Columna datos_envio no existe, reintentando sin ella...');
    const payloadSinEnvio = { ...payload };
    delete payloadSinEnvio.datos_envio;
    const res2 = await supabaseAdmin
      .from('pedidos')
      .insert(payloadSinEnvio)
      .select('id')
      .single();
    pedido = res2.data;
    error  = res2.error;
  }

  if (error) {
    console.error('[guardar-pedido] Error Supabase:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ id: pedido.id });
};
