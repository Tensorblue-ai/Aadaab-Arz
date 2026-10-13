import crypto from 'node:crypto';
import path from 'node:path';
import { MongoClient } from 'mongodb';
import express from 'express';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT ?? 3400);
const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
const adminUsername = process.env.ADMIN_USERNAME;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const sessionSecret = process.env.SESSION_SECRET;

if (!adminUsername || !adminPasswordHash || !sessionSecret) {
  throw new Error('ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET are required');
}

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const events = client.db('aadaab_arz').collection('events');
await events.createIndex({ slug: 1 }, { unique: true });
await events.createIndex({ id: 1 }, { unique: true });
await events.createIndex({ site: 1, published: 1, sort_order: 1 });

function slugify(value) {
  return String(value ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function calendarDateValue(value) {
  const text = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const legacy = text.match(/^(\d{1,2})\s+([A-Za-z]{3})$/);
  const month = legacy ? monthNames.findIndex((name) => name.toLowerCase() === legacy[2].toLowerCase()) : -1;
  if (!legacy || month < 0) return '';
  return `${new Date().getUTCFullYear()}-${String(month + 1).padStart(2, '0')}-${legacy[1].padStart(2, '0')}`;
}

function displayDate(value) {
  const iso = calendarDateValue(value);
  if (!iso) return String(value ?? '');
  const [, month, day] = iso.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${monthNames[month - 1]}`;
}

function to24Hour(value) {
  const match = String(value ?? '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function timeInputValues(value) {
  const text = String(value ?? '').trim();
  const stored = text.match(/^(\d{2}:\d{2})\|(\d{2}:\d{2})$/);
  if (stored) return [stored[1], stored[2]];
  const legacy = text.split(/\s+[–—-]\s+/);
  return legacy.length === 2 ? [to24Hour(legacy[0]), to24Hour(legacy[1])] : ['', ''];
}

function displayTime(value) {
  const [start, end] = timeInputValues(value);
  if (!start || !end) return String(value ?? '');
  const format = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  };
  return `${format(start)} – ${format(end)}`;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use('/admin', (_request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});
app.use('/admin/assets', express.static(publicDir));

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

function requireAdminPage(request, response, next) {
  if (!hasValidSession(request)) return response.redirect('/admin');
  next();
}

function verifyPassword(password) {
  const [salt, stored] = adminPasswordHash.split(':');
  if (!salt || !stored) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return stored.length === actual.length && crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(actual));
}

function parseGallery(value) {
  try {
    const gallery = JSON.parse(value || '[]');
    return Array.isArray(gallery) ? gallery : [];
  } catch {
    return [];
  }
}

const contentBlockTypes = new Set(['heading', 'text', 'image', 'video', 'quote', 'callout', 'list', 'divider']);

function parseContentBlocks(value) {
  try {
    const blocks = typeof value === 'string' ? JSON.parse(value || '[]') : value;
    return Array.isArray(blocks) ? blocks : [];
  } catch {
    return [];
  }
}

function cleanContentBlocks(value) {
  const blocks = parseContentBlocks(value);
  return blocks.slice(0, 80).flatMap((block, index) => {
    if (!block || !contentBlockTypes.has(block.type)) return [];
    const type = block.type;
    const cleaned = {
      id: String(block.id || `${type}-${index}`).slice(0, 80),
      type,
      level: block.level === 'h3' ? 'h3' : 'h2',
      title: String(block.title ?? '').trim().slice(0, 300),
      text: String(block.text ?? '').trim().slice(0, 12000),
      url: cleanMediaUrl(block.url ?? block.storedUrl, 'Section media'),
      caption: String(block.caption ?? '').trim().slice(0, 500),
      attribution: String(block.attribution ?? '').trim().slice(0, 300),
      items: Array.isArray(block.items) ? block.items.map((item) => String(item).trim().slice(0, 500)).filter(Boolean).slice(0, 30) : [],
    };
    return [cleaned];
  });
}

function eventPayload(row, request) {
  const [startTime, endTime] = timeInputValues(row.time_label);
  return {
    id: row.id,
    site: row.site,
    title: row.title,
    dateLabel: displayDate(row.date_label),
    eventDate: calendarDateValue(row.date_label),
    place: row.place,
    time: displayTime(row.time_label),
    startTime,
    endTime,
    description: row.description,
    slug: row.slug,
    fullDescription: row.full_description,
    registrationUrl: row.registration_url,
    upiId: row.upi_id,
    paymentAmount: row.payment_amount,
    imageUrl: row.image_url || '',
    qrImageUrl: row.qr_image_url || '',
    gallery: parseGallery(row.gallery_json),
    contentBlocks: parseContentBlocks(row.content_json),
    published: Boolean(row.published),
    sortOrder: row.sort_order,
  };
}

function cleanEventInput(body) {
  const site = ['lucknow', 'foreign', 'both'].includes(body.site) ? body.site : 'both';
  const title = String(body.title ?? '').trim();
  const dateLabel = String(body.eventDate ?? body.dateLabel ?? '').trim();
  const place = String(body.place ?? '').trim();
  const startTime = String(body.startTime ?? '').trim();
  const endTime = String(body.endTime ?? '').trim();
  const time = startTime && endTime ? `${startTime}|${endTime}` : String(body.time ?? '').trim();
  const description = String(body.description ?? '').trim();
  const slug = slugify(body.slug || title);
  const fullDescription = String(body.fullDescription ?? '').trim();
  const registrationUrl = String(body.registrationUrl ?? '').trim();
  const upiId = String(body.upiId ?? '').trim();
  const paymentAmount = String(body.paymentAmount ?? '').trim();
  const contentBlocks = cleanContentBlocks(body.contentJson);
  const published = body.published === 'true' || body.published === true || body.published === 'on' ? 1 : 0;
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  if (!title || !dateLabel || !place || !time) throw new Error('Title, date, place and time are required');
  if (!slug) throw new Error('A valid page slug is required');
  if (registrationUrl && !/^https?:\/\//i.test(registrationUrl)) throw new Error('Registration link must start with http:// or https://');
  return { site, title, dateLabel, place, time, description, slug, fullDescription, registrationUrl, upiId, paymentAmount, contentBlocks, published, sortOrder };
}

function eventDocument(input, imageUrl, qrImageUrl, gallery) {
  return {
    site: input.site, title: input.title, date_label: input.dateLabel,
    place: input.place, time_label: input.time, description: input.description,
    slug: input.slug, full_description: input.fullDescription,
    registration_url: input.registrationUrl, upi_id: input.upiId,
    payment_amount: input.paymentAmount, image_url: imageUrl, qr_image_url: qrImageUrl,
    gallery_json: JSON.stringify(gallery), content_json: JSON.stringify(input.contentBlocks),
    published: input.published, sort_order: input.sortOrder, updated_at: new Date().toISOString(),
  };
}

function cleanMediaUrl(value, label) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^\/images\/[A-Za-z0-9_./-]+$/.test(url) && !url.includes('..')) return url;
  try {
    const parsed = new URL(url);
    if (url.length <= 2000 && ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password) return parsed.href;
  } catch {}
  throw new Error(`${label} must be an http:// or https:// link`);
}

function eventMedia(body, current = {}) {
  const gallery = body.gallery === undefined ? parseGallery(current.gallery_json) : body.gallery;
  if (!Array.isArray(gallery) || gallery.length > 8) throw new Error('Use up to 8 gallery links');
  return {
    imageUrl: cleanMediaUrl(body.imageUrl ?? current.image_url, 'Cover image') || '/images/heritage-arch.webp',
    qrImageUrl: body.removeQr === true || body.removeQr === 'true' ? '' : cleanMediaUrl(body.qrImageUrl ?? current.qr_image_url, 'Payment QR'),
    gallery: gallery.map((url) => cleanMediaUrl(url, 'Gallery image')).filter(Boolean),
  };
}

app.get('/admin', (_request, response) => response.sendFile(path.join(publicDir, 'admin.html')));
app.get('/admin/create-event', requireAdminPage, (_request, response) => response.sendFile(path.join(publicDir, 'create-event.html')));
app.get('/admin/current-events', requireAdminPage, (_request, response) => response.sendFile(path.join(publicDir, 'current-events.html')));
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

app.get('/api/public/events', async (request, response) => {
  const site = request.query.site === 'foreign' ? 'foreign' : 'lucknow';
  const rows = await events.find({ published: 1, site: { $in: [site, 'both'] } }).sort({ sort_order: 1, created_at: 1, id: 1 }).toArray();
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Cache-Control', 'no-store');
  response.json(rows.map((row) => eventPayload(row, request)));
});

app.get('/api/public/events/:slug', async (request, response) => {
  const site = request.query.site === 'foreign' ? 'foreign' : 'lucknow';
  const row = await events.findOne({ slug: request.params.slug, published: 1, site: { $in: [site, 'both'] } });
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Cache-Control', 'no-store');
  if (!row) return response.status(404).json({ error: 'Event not found' });
  response.json(eventPayload(row, request));
});

app.get('/admin/api/events', requireAdmin, async (request, response) => {
  const rows = await events.find().sort({ sort_order: 1, created_at: 1, id: 1 }).toArray();
  response.json(rows.map((row) => eventPayload(row, request)));
});

app.post('/admin/api/events', requireAdmin, async (request, response) => {
  try {
    const input = cleanEventInput(request.body);
    const { imageUrl, qrImageUrl, gallery } = eventMedia(request.body);
    const row = { id: crypto.randomUUID(), ...eventDocument(input, imageUrl, qrImageUrl, gallery), created_at: new Date().toISOString() };
    await events.insertOne(row);
    response.status(201).json(eventPayload(row, request));
  } catch (error) {
    response.status(400).json({ error: error.code === 11000 ? 'This page slug is already in use' : error.message });
  }
});

app.put('/admin/api/events/:id', requireAdmin, async (request, response) => {
  const current = await events.findOne({ id: request.params.id });
  if (!current) return response.status(404).json({ error: 'Event not found' });
  try {
    const input = cleanEventInput(request.body);
    const { imageUrl, qrImageUrl, gallery } = eventMedia(request.body, current);
    await events.updateOne({ id: request.params.id }, { $set: eventDocument(input, imageUrl, qrImageUrl, gallery) });
    const row = await events.findOne({ id: request.params.id });
    response.json(eventPayload(row, request));
  } catch (error) {
    response.status(400).json({ error: error.code === 11000 ? 'This page slug is already in use' : error.message });
  }
});

app.delete('/admin/api/events/:id', requireAdmin, async (request, response) => {
  const current = await events.findOne({ id: request.params.id });
  if (!current) return response.status(404).json({ error: 'Event not found' });
  await events.deleteOne({ id: request.params.id });
  response.json({ ok: true });
});

app.use((error, _request, response, _next) => {
  response.status(500).json({ error: 'Something went wrong' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(port, '0.0.0.0', () => console.log(`Admin service listening on ${port}`));
}
