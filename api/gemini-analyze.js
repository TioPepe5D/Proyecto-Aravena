// Descarga una imagen de Drive vía service account y la analiza con Gemini
const { google } = require('googleapis');
const { analizarConGemini } = require('./_gemini');

function getDriveAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { driveFileId, base64, mimeType } = req.body || {};

  try {
    let imageBase64 = base64;
    let imageMime   = mimeType || 'image/jpeg';

    if (!imageBase64) {
      if (!driveFileId) return res.status(400).json({ error: 'Falta driveFileId o base64' });
      // Descargar la imagen con la service account (autenticado, sin CORS)
      const drive = google.drive({ version: 'v3', auth: getDriveAuth() });
      const resp = await drive.files.get(
        { fileId: driveFileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      imageBase64 = Buffer.from(resp.data).toString('base64');
      imageMime   = resp.headers['content-type'] || 'image/jpeg';
    }

    const resultado = await analizarConGemini(imageBase64, imageMime);
    return res.status(200).json({ ok: true, ...resultado });
  } catch (e) {
    console.error('[gemini-analyze]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
