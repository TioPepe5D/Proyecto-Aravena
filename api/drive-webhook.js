const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const SUPA_ARAVENA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_AMMIRA_URL  = 'https://jgtavepljzcwwagdihgx.supabase.co';

function getDriveAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

function detectarCategoria(nombre) {
  const n = nombre.toUpperCase();
  if (n.includes('COLLAR'))    return 'collares';
  if (n.includes('PULSERA') || n.includes('TOBILLERA')) return 'pulseras';
  if (n.includes('ARO') || n.includes('ARGOLLA') || n.includes('ARITO')) return 'aros';
  if (n.includes('ANILLO'))    return 'anillos';
  if (n.includes('CONJUNTO'))  return 'conjuntos';
  if (n.includes('COLGANTE') || n.includes('CHARM')) return 'colgantes';
  if (n.includes('EXHIBIDOR') || n.includes('MALETA') || n.includes('MANGA')) return 'exhibidores';
  return 'general';
}

function extraerDatos(textoCompleto) {
  const lineas = textoCompleto.split('\n').map(l => l.trim()).filter(Boolean);

  let precio = 0;
  let lineaPrecio = '';
  for (const linea of lineas) {
    const match = linea.match(/\$\s*([\d.,]+)/);
    if (match) {
      const raw = match[1].replace(/\./g, '').replace(/,/g, '');
      precio = parseInt(raw, 10) || 0;
      lineaPrecio = linea;
      break;
    }
  }

  const nombre = lineas.find(l => l !== lineaPrecio && l.length > 3) || '';
  return { nombre: nombre.trim(), precio };
}

// Descarga imagen de Drive y hace OCR — retorna { buffer, mimeType, ext, nombre, precio }
async function descargarYOcr(file) {
  const auth = getDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const resp = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer = Buffer.from(resp.data);
  const mimeType = resp.headers['content-type'] || 'image/jpeg';
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

  const accessToken = await auth.getAccessToken();
  const base64 = buffer.toString('base64');
  const visionResp = await fetch(
    'https://vision.googleapis.com/v1/images:annotate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
    }
  );
  const visionData = await visionResp.json();
  const textoCompleto = visionData?.responses?.[0]?.textAnnotations?.[0]?.description || '';
  const { nombre, precio } = extraerDatos(textoCompleto);

  return { buffer, mimeType, ext, nombre, precio };
}

// Sube imagen y guarda en catálogo de un Supabase dado
async function sincronizarEnSupabase(file, supabase, imageData) {
  const { buffer, mimeType, ext, nombre, precio } = imageData;
  const fileName = `${file.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('productos')
    .upload(fileName, buffer, { contentType: mimeType, upsert: true });
  if (uploadError) throw new Error('Storage: ' + uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('productos').getPublicUrl(fileName);

  const { error: dbError } = await supabase
    .from('catalogo')
    .upsert({
      drive_file_id: file.id,
      nombre,
      precio,
      imagen_url: publicUrl,
      categoria: detectarCategoria(nombre),
      descripcion: nombre,
      activo: true,
      drive_modified_time: file.modifiedTime,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'drive_file_id' });

  if (dbError) throw new Error('DB: ' + dbError.message);
  return publicUrl;
}

module.exports = async (req, res) => {
  const state = req.headers['x-goog-resource-state'];

  // Responder 200 inmediatamente para que Drive no reintente
  res.status(200).end();

  if (!state || state === 'sync') return;

  const serviceKeyAravena = process.env.SUPABASE_SERVICE_KEY;
  const serviceKeyAmmira  = process.env.AMMIRA_SUPABASE_SERVICE_KEY;
  if (!serviceKeyAravena) return;

  const supaAravena = createClient(SUPA_ARAVENA_URL, serviceKeyAravena);
  const supaAmmira  = serviceKeyAmmira
    ? createClient(SUPA_AMMIRA_URL, serviceKeyAmmira)
    : null;

  const auth = getDriveAuth();
  const drive = google.drive({ version: 'v3', auth });
  const folderId = process.env.DRIVE_FOLDER_ID;

  try {
    const driveResp = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, modifiedTime)',
      pageSize: 500,
    });
    const driveFiles = driveResp.data.files || [];
    const driveIds = new Set(driveFiles.map(f => f.id));

    const { data: dbFiles } = await supaAravena
      .from('catalogo').select('drive_file_id, drive_modified_time, activo');
    const dbMap = new Map((dbFiles || []).map(r => [r.drive_file_id, r]));

    const ahora = new Date().toISOString();

    // Archivos eliminados de Drive → desactivar en ambas DBs
    for (const [driveId, row] of dbMap) {
      if (!driveIds.has(driveId) && row.activo) {
        await supaAravena.from('catalogo')
          .update({ activo: false, updated_at: ahora }).eq('drive_file_id', driveId);
        if (supaAmmira) {
          await supaAmmira.from('catalogo')
            .update({ activo: false, updated_at: ahora }).eq('drive_file_id', driveId);
        }
      }
    }

    // Archivos nuevos o modificados → OCR una sola vez, sincronizar en ambas DBs
    for (const file of driveFiles) {
      const existing = dbMap.get(file.id);
      const esNuevo    = !existing;
      const modificado = existing && existing.drive_modified_time !== file.modifiedTime;

      if (esNuevo || modificado) {
        try {
          const imageData = await descargarYOcr(file);
          await sincronizarEnSupabase(file, supaAravena, imageData);
          if (supaAmmira) {
            await sincronizarEnSupabase(file, supaAmmira, imageData);
          }
        } catch (e) {
          console.error(`[webhook] Error procesando ${file.name}:`, e.message);
        }
      }

      // Reactivar si estaba desactivado y volvió a Drive
      if (existing && !existing.activo && driveIds.has(file.id)) {
        await supaAravena.from('catalogo')
          .update({ activo: true, updated_at: ahora }).eq('drive_file_id', file.id);
        if (supaAmmira) {
          await supaAmmira.from('catalogo')
            .update({ activo: true, updated_at: ahora }).eq('drive_file_id', file.id);
        }
      }
    }
  } catch (e) {
    console.error('[webhook] Error general:', e.message);
  }
};
