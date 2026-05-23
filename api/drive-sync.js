const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAILS = ['diegoaravenavera@gmail.com'];
const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { driveFileId, productId, adminToken } = req.body || {};
  if (!driveFileId || !productId || !adminToken) {
    return res.status(400).json({ error: 'Faltan parámetros: driveFileId, productId, adminToken' });
  }

  // Verificar admin
  const supabaseAuth = createClient(SUPA_URL, SUPA_ANON);
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(adminToken);
    if (error || !user || !ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Error de autenticación' });
  }

  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey  = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!serviceKey)  return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY no configurada' });
  if (!clientEmail || !privateKey) return res.status(503).json({ error: 'Google Drive no configurado' });

  try {
    // Descargar archivo de Drive
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const fileMeta = await drive.files.get({ fileId: driveFileId, fields: 'mimeType' });
    const mimeType = fileMeta.data.mimeType || 'image/jpeg';

    const fileResponse = await drive.files.get(
      { fileId: driveFileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const buffer = Buffer.from(fileResponse.data);

    const ext = mimeType.includes('png') ? 'png'
      : mimeType.includes('webp') ? 'webp'
      : mimeType.includes('gif')  ? 'gif'
      : 'jpg';
    const fileName = `${productId}.${ext}`;

    // Subir a Supabase Storage (bucket "productos")
    const supabaseAdmin = createClient(SUPA_URL, serviceKey);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('productos')
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) throw new Error('Storage upload: ' + uploadError.message);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('productos')
      .getPublicUrl(fileName);

    // Guardar mapeo en la tabla imagen_override
    const { error: dbError } = await supabaseAdmin
      .from('imagen_override')
      .upsert({
        product_id: parseInt(productId, 10),
        url: publicUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id' });

    if (dbError) throw new Error('DB upsert: ' + dbError.message);

    return res.status(200).json({ ok: true, url: publicUrl, productId: parseInt(productId, 10) });
  } catch (e) {
    console.error('[drive-sync]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
