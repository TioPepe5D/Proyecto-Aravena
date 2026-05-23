const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAILS = ['diegoaravenavera@gmail.com'];
const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const adminToken = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!adminToken) return res.status(401).json({ error: 'Sin token de autenticación' });

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

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey  = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const folderId    = process.env.DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey || !folderId) {
    return res.status(503).json({
      error: 'Google Drive no configurado. Agrega GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY y DRIVE_FOLDER_ID en Vercel.'
    });
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, thumbnailLink, mimeType)',
      pageSize: 200,
      orderBy: 'name',
    });

    const files = (response.data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      thumbnail: f.thumbnailLink
        ? f.thumbnailLink.replace(/=s\d+/, '=s220')
        : null,
      mimeType: f.mimeType,
    }));

    return res.status(200).json({ files });
  } catch (e) {
    console.error('[drive-list]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
