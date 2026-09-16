import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import express from 'express';
import multer from 'multer';

const port = Number(process.env.PORT ?? 3400);
const dataDir = process.env.DATA_DIR ?? '/data';
const uploadDir = path.join(dataDir, 'uploads');
const adminUsername = process.env.ADMIN_USERNAME;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const sessionSecret = process.env.SESSION_SECRET;
const publicBaseUrl = (process.env.PUBLIC_BASE_URL ?? '').replace(/\/$/, '');

if (!adminUsername || !adminPasswordHash || !sessionSecret) {
  throw new Error('ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET are required');
}

fs.mkdirSync(uploadDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'content.sqlite'));
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site TEXT NOT NULL CHECK (site IN ('lucknow', 'foreign', 'both')),
    title TEXT NOT NULL,
    date_label TEXT NOT NULL,
    place TEXT NOT NULL,
    time_label TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_events_site_published_sort
  ON events(site, published, sort_order);
`);

const eventCount = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
if (eventCount === 0) {
  const insert = db.prepare(`
    INSERT INTO events
      (site, title, date_label, place, time_label, description, image_url, published, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const defaults = [
    ['both', 'Heritage Walk at Bara Imambara', '22 Jun', 'Bara Imambara, Lucknow', '7:00 AM – 10:30 AM', 'Walk through one of Awadh’s most ingenious monuments with storytellers who bring its courtyards, corridors and legends to life.', '/images/events/heritage-walk.webp', 1],
    ['both', 'The Music Evening', '06 Jul', 'Rumi Darwaza Courtyard', '6:30 PM – 9:00 PM', 'An intimate evening of ghazal, thumri, poetry and conversation in the heart of Lucknow.', '/images/events/music-evening.webp', 2],
    ['both', 'Craft & Culture Baithak', '19 Jul', 'Husainabad Heritage Centre', '4:00 PM – 7:00 PM', 'Meet the artisans keeping chikankari and zardozi alive through material, memory and making.', '/images/events/craft-baithak.webp', 3],
  ];
  defaults.forEach((event) => insert.run(...event));
}
db.exec('PRAGMA optimize');

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
      callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype));
  },
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir, { maxAge: '30d', immutable: true }));
app.use('/admin/assets', express.static(path.join(process.cwd(), 'public')));

function parseCookies(request) {
  return Object.fromEntries(
    (request.headers.cookie ?? '').split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
    }),
  );
}

function signSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasValidSession(request) {
  const token = parseCookies(request).aadaab_admin;
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(request, response, next) {
  if (!hasValidSession(request)) return response.status(401).json({ error: 'Authentication required' });
  next();
}

function verifyPassword(password) {
  const [salt, stored] = adminPasswordHash.split(':');
  if (!salt || !stored) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return stored.length === actual.length && crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(actual));
}

function eventPayload(row, request) {
  let imageUrl = row.image_url;
  if (imageUrl.startsWith('/uploads/')) {
    const origin = publicBaseUrl || `${request.protocol}://${request.get('host')}`;
    imageUrl = `${origin}${imageUrl}`;
  }
  return {
    id: row.id,
    site: row.site,
    title: row.title,
    dateLabel: row.date_label,
    place: row.place,
    time: row.time_label,
    description: row.description,
    imageUrl,
    published: Boolean(row.published),
    sortOrder: row.sort_order,
  };
}

function cleanEventInput(body) {
  const site = ['lucknow', 'foreign', 'both'].includes(body.site) ? body.site : 'both';
  const title = String(body.title ?? '').trim();
  const dateLabel = String(body.dateLabel ?? '').trim();
  const place = String(body.place ?? '').trim();
  const time = String(body.time ?? '').trim();
  const description = String(body.description ?? '').trim();
  const published = body.published === 'true' || body.published === true || body.published === 'on' ? 1 : 0;
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  if (!title || !dateLabel || !place || !time) throw new Error('Title, date, place and time are required');
  return { site, title, dateLabel, place, time, description, published, sortOrder };
}

function removeUploadedImage(imageUrl) {
  if (!imageUrl?.startsWith('/uploads/')) return;
  const file = path.join(uploadDir, path.basename(imageUrl));
  if (file.startsWith(uploadDir) && fs.existsSync(file)) fs.unlinkSync(file);
}

app.get('/admin', (_request, response) => response.sendFile(path.join(process.cwd(), 'public', 'admin.html')));
app.get('/admin/api/session', requireAdmin, (_request, response) => response.json({ authenticated: true, username: adminUsername }));
app.post('/admin/api/login', (request, response) => {
  const usernameMatches = request.body?.username === adminUsername;
  const passwordMatches = typeof request.body?.password === 'string' && verifyPassword(request.body.password);
  if (!usernameMatches || !passwordMatches) return response.status(401).json({ error: 'Invalid username or password' });
  response.cookie('aadaab_admin', signSession(), { httpOnly: true, secure: process.env.COOKIE_SECURE !== 'false', sameSite: 'lax', maxAge: 12 * 60 * 60 * 1000, path: '/' });
  response.json({ authenticated: true });
});
app.post('/admin/api/logout', (_request, response) => {
  response.clearCookie('aadaab_admin', { path: '/' });
  response.json({ ok: true });
});

app.get('/api/public/events', (request, response) => {
  const site = request.query.site === 'foreign' ? 'foreign' : 'lucknow';
  const rows = db.prepare(`
    SELECT * FROM events
    WHERE published = 1 AND (site = ? OR site = 'both')
    ORDER BY sort_order ASC, id ASC
  `).all(site);
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Cache-Control', 'no-store');
  response.json(rows.map((row) => eventPayload(row, request)));
});

app.get('/admin/api/events', requireAdmin, (request, response) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY sort_order ASC, id ASC').all();
  response.json(rows.map((row) => eventPayload(row, request)));
});

app.post('/admin/api/events', requireAdmin, upload.single('image'), (request, response) => {
  try {
    const input = cleanEventInput(request.body);
    const imageUrl = request.file ? `/uploads/${request.file.filename}` : '/images/heritage-arch.webp';
    const result = db.prepare(`
      INSERT INTO events (site, title, date_label, place, time_label, description, image_url, published, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(input.site, input.title, input.dateLabel, input.place, input.time, input.description, imageUrl, input.published, input.sortOrder);
    const row = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    response.status(201).json(eventPayload(row, request));
  } catch (error) {
    if (request.file) removeUploadedImage(`/uploads/${request.file.filename}`);
    response.status(400).json({ error: error.message });
  }
});

app.put('/admin/api/events/:id', requireAdmin, upload.single('image'), (request, response) => {
  const current = db.prepare('SELECT * FROM events WHERE id = ?').get(request.params.id);
  if (!current) return response.status(404).json({ error: 'Event not found' });
  try {
    const input = cleanEventInput(request.body);
    const imageUrl = request.file ? `/uploads/${request.file.filename}` : current.image_url;
    db.prepare(`
      UPDATE events SET site = ?, title = ?, date_label = ?, place = ?, time_label = ?, description = ?, image_url = ?, published = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(input.site, input.title, input.dateLabel, input.place, input.time, input.description, imageUrl, input.published, input.sortOrder, request.params.id);
    if (request.file) removeUploadedImage(current.image_url);
    const row = db.prepare('SELECT * FROM events WHERE id = ?').get(request.params.id);
    response.json(eventPayload(row, request));
  } catch (error) {
    if (request.file) removeUploadedImage(`/uploads/${request.file.filename}`);
    response.status(400).json({ error: error.message });
  }
});

app.delete('/admin/api/events/:id', requireAdmin, (request, response) => {
  const current = db.prepare('SELECT * FROM events WHERE id = ?').get(request.params.id);
  if (!current) return response.status(404).json({ error: 'Event not found' });
  db.prepare('DELETE FROM events WHERE id = ?').run(request.params.id);
  removeUploadedImage(current.image_url);
  response.json({ ok: true });
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) return response.status(400).json({ error: error.message });
  response.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, '0.0.0.0', () => console.log(`Admin service listening on ${port}`));
