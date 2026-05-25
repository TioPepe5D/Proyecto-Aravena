const { createClient } = require('@supabase/supabase-js');

const SUPA_URL   = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';
const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Sin autorización' });

  const supaAuth = createClient(SUPA_URL, SUPA_ANON);
  const { data: { user }, error: authError } = await supaAuth.auth.getUser(token);
  if (authError || !user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY no configurada' });

  const { id, nombre, precio, categoria, activo } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Falta id del producto' });

  const supaAdmin = createClient(SUPA_URL, serviceKey);
  const updates = { updated_at: new Date().toISOString() };
  if (nombre    !== undefined) updates.nombre    = nombre;
  if (precio    !== undefined) updates.precio    = Number(precio) || 0;
  if (categoria !== undefined) updates.categoria = categoria;
  if (activo    !== undefined) updates.activo    = Boolean(activo);

  const { error } = await supaAdmin.from('catalogo').update(updates).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
};
