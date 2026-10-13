const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginForm = document.querySelector('#login-form');
const eventForm = document.querySelector('#event-form');
const eventsList = document.querySelector('#events-list');
const loginMessage = document.querySelector('#login-message');
const formMessage = document.querySelector('#form-message');
const formTitle = document.querySelector('#form-title');
const saveButton = document.querySelector('#save-button');
const cancelEdit = document.querySelector('#cancel-edit');
const contentBlocksElement = document.querySelector('#content-blocks');
const contentJsonInput = document.querySelector('#content-json');
const coverPreview = document.querySelector('#cover-preview');
const qrPreview = document.querySelector('#qr-preview');
const galleryPreview = document.querySelector('#gallery-preview');
let events = [];
let contentBlocks = [];

async function request(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

function showLogin() { if (loginView) loginView.hidden = false; if (dashboardView) dashboardView.hidden = true; }
function showDashboard() { if (loginView) loginView.hidden = true; if (dashboardView) dashboardView.hidden = false; if (eventsList) loadEvents(); }

async function checkSession() {
  try {
    await request('/admin/api/session');
    showDashboard();
    if (eventForm) loadEventForEditing();
  } catch {
    if (loginView) showLogin();
    else window.location.replace('/admin');
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';
  const data = Object.fromEntries(new FormData(loginForm));
  try {
    await request('/admin/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    loginForm.reset();
    showDashboard();
  } catch (error) { loginMessage.textContent = error.message; }
});

document.querySelector('#logout-button')?.addEventListener('click', async () => {
  await request('/admin/api/logout', { method: 'POST' });
  window.location.replace('/admin');
});
document.querySelector('#refresh-button')?.addEventListener('click', loadEvents);

function render() {
  if (!eventsList) return;
  eventsList.innerHTML = '';
  if (!events.length) {
    eventsList.innerHTML = '<div class="empty">No events have been added yet.</div>';
    return;
  }
  events.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'event-row';
    row.innerHTML = `<img alt=""><div><span class="badge ${item.published ? '' : 'draft'}">${item.published ? item.site : 'Draft'}</span><h3></h3><p class="meta"></p><p></p></div><div class="row-actions"><button class="edit">Edit</button><button class="delete">Delete</button></div>`;
    row.querySelector('img').src = item.imageUrl;
    row.querySelector('h3').textContent = item.title;
    row.querySelector('.meta').textContent = `${item.dateLabel} · ${item.time}`;
    row.querySelector('div>p:last-child').textContent = item.place;
    row.querySelector('.edit').addEventListener('click', () => editEvent(item));
    row.querySelector('.delete').addEventListener('click', () => deleteEvent(item));
    eventsList.append(row);
  });
}

async function loadEvents() {
  if (!eventsList) return;
  try { events = await request('/admin/api/events'); render(); }
  catch (error) {
    if (error.message === 'Authentication required') showLogin();
    else eventsList.innerHTML = `<div class="empty">${error.message}</div>`;
  }
}

const blockLabels = { heading: 'Heading', text: 'Text', image: 'Image', video: 'Video', quote: 'Quote', callout: 'Callout', list: 'List', divider: 'Divider' };

function newBlock(type) {
  return { id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, level: 'h2', title: '', text: '', url: '', storedUrl: '', caption: '', attribution: '', items: [] };
}

function syncContentBlocks() {
  if (!contentJsonInput) return;
  contentJsonInput.value = JSON.stringify(contentBlocks.map((block) => ({ ...block, url: block.storedUrl || block.url })));
}

function controlLabel(text, control) {
  const label = document.createElement('label');
  label.append(text, control);
  return label;
}

function textInput(value, placeholder, onInput, type = 'text') {
  const input = document.createElement('input');
  input.type = type;
  input.value = value || '';
  input.placeholder = placeholder;
  input.addEventListener('input', () => onInput(input.value));
  return input;
}

function textArea(value, placeholder, onInput, rows = 4) {
  const area = document.createElement('textarea');
  area.value = value || '';
  area.placeholder = placeholder;
  area.rows = rows;
  area.addEventListener('input', () => onInput(area.value));
  return area;
}

function renderContentBlocks() {
  if (!contentBlocksElement) return;
  contentBlocksElement.innerHTML = '';
  if (!contentBlocks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-blocks';
    empty.textContent = 'No page sections yet. Add a heading, text, image or another section.';
    contentBlocksElement.append(empty);
  }

  contentBlocks.forEach((block, index) => {
    const card = document.createElement('article');
    card.className = 'content-block';
    const bar = document.createElement('div');
    bar.className = 'content-block__bar';
    const label = document.createElement('strong');
    label.textContent = blockLabels[block.type];
    bar.append(label);
    [['↑', -1], ['↓', 1]].forEach(([symbol, movement]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = symbol;
      button.disabled = index + movement < 0 || index + movement >= contentBlocks.length;
      button.setAttribute('aria-label', movement < 0 ? 'Move section up' : 'Move section down');
      button.addEventListener('click', () => {
        const target = index + movement;
        [contentBlocks[index], contentBlocks[target]] = [contentBlocks[target], contentBlocks[index]];
        renderContentBlocks();
      });
      bar.append(button);
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-block';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => { contentBlocks.splice(index, 1); renderContentBlocks(); });
    bar.append(remove);

    const body = document.createElement('div');
    body.className = 'content-block__body';
    const update = (field, value) => { block[field] = value; syncContentBlocks(); };

    if (block.type === 'heading') {
      const fields = document.createElement('div');
      fields.className = 'inline-fields';
      const level = document.createElement('select');
      level.innerHTML = '<option value="h2">H2</option><option value="h3">H3</option>';
      level.value = block.level || 'h2';
      level.addEventListener('change', () => update('level', level.value));
      fields.append(controlLabel('Level', level), controlLabel('Heading', textInput(block.text, 'Section heading…', (value) => update('text', value))));
      body.append(fields);
    } else if (block.type === 'text') {
      body.append(controlLabel('Text', textArea(block.text, 'Write the section content…', (value) => update('text', value), 6)));
    } else if (block.type === 'image') {
      const currentUrl = block.storedUrl || block.url;
      if (currentUrl) {
        const preview = document.createElement('img');
        preview.className = 'content-block__preview';
        preview.src = block.url || currentUrl;
        preview.alt = '';
        body.append(preview);
      }
      body.append(controlLabel('Image URL', textInput(currentUrl, 'https://example.com/image.jpg', (value) => {
        block.storedUrl = '';
        update('url', value);
        const preview = body.querySelector('img');
        if (preview) preview.src = value;
      })), controlLabel('Caption', textInput(block.caption, 'Optional image caption', (value) => update('caption', value))));
    } else if (block.type === 'video') {
      body.append(controlLabel('Video URL', textInput(block.url, 'YouTube, Vimeo or direct video link', (value) => update('url', value), 'url')));
    } else if (block.type === 'quote') {
      body.append(controlLabel('Quote', textArea(block.text, 'Quote text…', (value) => update('text', value), 4)), controlLabel('Attribution', textInput(block.attribution, 'Name or source', (value) => update('attribution', value))));
    } else if (block.type === 'callout') {
      body.append(controlLabel('Callout heading', textInput(block.title, 'Important information', (value) => update('title', value))), controlLabel('Callout text', textArea(block.text, 'Details…', (value) => update('text', value), 4)));
    } else if (block.type === 'list') {
      body.append(controlLabel('List items', textArea((block.items || []).join('\n'), 'One item per line', (value) => update('items', value.split('\n').map((item) => item.trim()).filter(Boolean)), 5)));
    } else {
      const note = document.createElement('p');
      note.className = 'upload-status';
      note.textContent = 'A visual divider will appear here.';
      body.append(note);
    }

    card.append(bar, body);
    contentBlocksElement.append(card);
  });
  syncContentBlocks();
}

document.querySelectorAll('[data-add-block]').forEach((button) => {
  button.addEventListener('click', () => {
    contentBlocks.push(newBlock(button.dataset.addBlock));
    renderContentBlocks();
  });
});

function renderAssetPreview(container, urls, label) {
  if (!container) return;
  container.replaceChildren();
  const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  container.hidden = list.length === 0;
  list.forEach((url, index) => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');
    image.src = url;
    image.alt = `${label} ${index + 1}`;
    caption.textContent = list.length > 1 ? `${label} ${index + 1}` : label;
    figure.append(image, caption);
    container.append(figure);
  });
}

function renderEventMedia(item) {
  renderAssetPreview(coverPreview, item?.imageUrl, item ? 'Current cover' : '');
  renderAssetPreview(qrPreview, item?.qrImageUrl, item ? 'Current payment QR' : '');
  renderAssetPreview(galleryPreview, item?.gallery || [], item ? 'Current gallery image' : '');
}

function bindLinkPreview(name, container, multiple = false) {
  const input = eventForm?.elements[name];
  input?.addEventListener('input', () => {
    renderAssetPreview(container, multiple ? input.value.split('\n').map((url) => url.trim()) : input.value, 'Preview');
  });
}

bindLinkPreview('imageUrl', coverPreview);
bindLinkPreview('qrImageUrl', qrPreview);
bindLinkPreview('gallery', galleryPreview, true);

function editEvent(item) {
  if (!eventForm) {
    window.location.href = `/admin/create-event?id=${encodeURIComponent(item.id)}`;
    return;
  }
  const form = eventForm.elements;
  form.id.value = item.id;
  form.site.value = item.site;
  form.sortOrder.value = item.sortOrder;
  form.title.value = item.title;
  form.eventDate.value = item.eventDate || '';
  form.startTime.value = item.startTime || '';
  form.endTime.value = item.endTime || '';
  form.place.value = item.place;
  form.description.value = item.description;
  form.fullDescription.value = item.fullDescription || '';
  form.registrationUrl.value = item.registrationUrl || '';
  form.upiId.value = item.upiId || '';
  form.paymentAmount.value = item.paymentAmount || '';
  form.slug.value = item.slug || '';
  form.imageUrl.value = item.imageUrl || '';
  form.qrImageUrl.value = item.qrImageUrl || '';
  form.gallery.value = (item.gallery || []).join('\n');
  form.removeQr.checked = false;
  form.published.checked = item.published;
  renderEventMedia(item);
  contentBlocks = structuredClone(item.contentBlocks || []);
  renderContentBlocks();
  formTitle.textContent = 'Edit event';
  saveButton.firstChild.textContent = 'Save changes ';
  cancelEdit.hidden = false;
  eventForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  if (!eventForm) return;
  eventForm.reset();
  eventForm.elements.id.value = '';
  eventForm.elements.site.value = 'both';
  eventForm.elements.sortOrder.value = '0';
  eventForm.elements.removeQr.checked = false;
  eventForm.elements.published.checked = true;
  renderEventMedia(null);
  contentBlocks = [];
  renderContentBlocks();
  formTitle.textContent = 'Add an event';
  saveButton.firstChild.textContent = 'Publish event ';
  cancelEdit.hidden = true;
  formMessage.textContent = '';
}

async function loadEventForEditing() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;
  try {
    const items = await request('/admin/api/events');
    const item = items.find((entry) => String(entry.id) === id);
    if (!item) throw new Error('Event not found');
    editEvent(item);
  } catch (error) { formMessage.textContent = error.message; }
}

eventForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Saving…';
  syncContentBlocks();
  const data = Object.fromEntries(new FormData(eventForm));
  data.published = eventForm.elements.published.checked;
  data.removeQr = eventForm.elements.removeQr.checked;
  data.gallery = data.gallery.split('\n').map((url) => url.trim()).filter(Boolean);
  const id = data.id;
  try {
    await request(id ? `/admin/api/events/${id}` : '/admin/api/events', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    window.location.href = '/admin/current-events';
  } catch (error) { formMessage.textContent = error.message; }
});

async function deleteEvent(item) {
  if (!confirm(`Delete “${item.title}”?`)) return;
  try { await request(`/admin/api/events/${item.id}`, { method: 'DELETE' }); await loadEvents(); }
  catch (error) { alert(error.message); }
}

if (contentBlocksElement) renderContentBlocks();
checkSession();
