// Recibe base64 de una imagen (o URL de thumbnail), llama a Gemini y devuelve análisis
const { analizarConGemini } = require('./_gemini');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { base64, thumbnailUrl, mimeType = 'image/jpeg' } = req.body || {};

  try {
    let imageBase64 = base64;

    if (!imageBase64 && thumbnailUrl) {
      // Fallback: descargar desde URL (puede fallar si requiere sesión Google)
      const resp = await fetch(thumbnailUrl);
      if (!resp.ok) throw new Error(`No se pudo descargar miniatura: ${resp.status}`);
      const buffer = Buffer.from(await resp.arrayBuffer());
      imageBase64 = buffer.toString('base64');
    }

    if (!imageBase64) return res.status(400).json({ error: 'Falta base64 o thumbnailUrl' });

    const resultado = await analizarConGemini(imageBase64, mimeType);
    return res.status(200).json({ ok: true, ...resultado });
  } catch (e) {
    console.error('[gemini-analyze]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
