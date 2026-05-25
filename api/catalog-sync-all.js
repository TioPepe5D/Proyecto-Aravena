const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { analizarConGemini } = require('./_gemini');

const SUPA_ARAVENA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_AMMIRA_URL  = 'https://jgtavepljzcwwagdihgx.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';
const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];
const BATCH_SIZE = 8; // fotos por llamada (evita timeout)

function getDriveAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

async function procesarArchivo(file) {
  const auth  = getDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const resp = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer   = Buffer.from(resp.data);
  const mimeType = resp.headers['content-type'] || 'image/jpeg';
  const ext      = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

  const { nombre, precio, categoria } = await analizarConGemini(buffer.toString('base64'), mimeType);
  return { buffer, mimeType, ext, nombre, precio, categoria };
}

async function subirYGuardar(file, supabase, imageData) {
  const { buffer, mimeType, ext, nombre, precio, categoria } = imageData;
  const fileName = `${file.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('productos').upload(fileName, buffer, { contentType: mimeType, upsert: true });
  if (uploadError) throw new Error('Storage: ' + uploadError.message);

  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(fileName);

  const { error: dbError } = await supabase.from('catalogo').upsert({
    drive_file_id: file.id,
    nombre, precio, imagen_url: publicUrl, categoria,
    descripcion: nombre, activo: true,
    drive_modified_time: file.modifiedTime,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'drive_file_id' });

  if (dbError) throw new Error('DB: ' + dbError.message);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Sin autorización' });

  const supaAuth = createClient(SUPA_ARAVENA_URL, SUPA_ANON);
  const { data: { user }, error: authError } = await supaAuth.auth.getUser(token);
  if (authError || !user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const serviceKeyAravena = process.env.SUPABASE_SERVICE_KEY;
  const serviceKeyAmmira  = process.env.AMMIRA_SUPABASE_SERVICE_KEY;
  if (!serviceKeyAravena) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY no configurada' });

  const supaAravena = createClient(SUPA_ARAVENA_URL, serviceKeyAravena);
  const supaAmmira  = serviceKeyAmmira ? createClient(SUPA_AMMIRA_URL, serviceKeyAmmira) : null;

  const { offset = 0 } = req.body || {};
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) return res.status(500).json({ error: 'DRIVE_FOLDER_ID no configurado' });

  try {
    // Listar todos los archivos de Drive
    const auth  = getDriveAuth();
    const drive = google.drive({ version: 'v3', auth });
    const driveResp = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, modifiedTime)',
      pageSize: 500,
    });
    const driveFiles = driveResp.data.files || [];

    // Procesar solo el lote actual
    const lote = driveFiles.slice(offset, offset + BATCH_SIZE);
    const resultados = { procesados: 0, errores: [] };

    for (const file of lote) {
      try {
        const imageData = await procesarArchivo(file);
        await subirYGuardar(file, supaAravena, imageData);
        if (supaAmmira) await subirYGuardar(file, supaAmmira, imageData);
        resultados.procesados++;
      } catch (e) {
        console.error(`[sync-all] Error ${file.name}:`, e.message);
        resultados.errores.push({ archivo: file.name, error: e.message });
      }
    }

    const siguiente = offset + BATCH_SIZE;
    return res.status(200).json({
      ok: true,
      total: driveFiles.length,
      procesados: resultados.procesados,
      errores: resultados.errores,
      pendientes: Math.max(0, driveFiles.length - siguiente),
      siguiente: siguiente < driveFiles.length ? siguiente : null,
    });

  } catch (e) {
    console.error('[catalog-sync-all]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
