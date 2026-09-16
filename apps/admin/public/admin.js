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
let events = [];
let contentBlocks = [];

async function request(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

function showLogin() { loginView.hidden = false; dashboardView.hidden = true; }
function showDashboard() { loginView.hidden = true; dashboardView.hidden = false; loadEvents(); }

async function checkSession() {
  try { await request('/admin/api/session'); showDashboard(); } catch { showLogin(); }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';
  const data = Object.fromEntries(new FormData(loginForm));
  try {
    await request('/admin/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    loginForm.reset();
    showDashboard();
  } catch (error) { loginMessage.textContent = error.message; }
});

document.querySelector('#logout-button').addEventListener('click', async () => {
  await request('/admin/api/logout', { method: 'POST' });
  showLogin();
});
document.querySelector('#refresh-button').addEventListener('click', loadEvents);

function render() {
  eventsList.innerHTML = '';
  if (!events.length) {
    eventsList.innerHTML = '<div class="empty">No events have been added yet.</div>';
    return;
  }
  events.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'event-row';
    row.innerHTML = `<img src="${item.imageUrl}" alt=""><div><span class="badge ${item.published ? '' : 'draft'}">${item.published ? item.site : 'Draft'}</span><h3></h3><p class="meta"></p><p></p></div><div class="row-actions"><button class="edit">Edit</button><button class="delete">Delete</button></div>`;
    row.querySelector('h3').textContent = item.title;
    row.querySelector('.meta').textContent = `${item.dateLabel} · ${item.time}`;
    row.querySelector('div>p:last-child').textContent = item.place;
    row.querySelector('.edit').addEventListener('click', () => editEvent(item));
    row.querySelector('.delete').addEventListener('click', () => deleteEvent(item));
    eventsList.append(row);
  });
}

async function loadEvents() {
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

async function uploadBlockImage(block, file, status) {
  status.textContent = 'Uploading…';
  const data = new FormData();
  data.append('file', file);
  try {
    const result = await request('/admin/api/media', { method: 'POST', body: data });
    block.url = result.url;
    block.storedUrl = result.url;
    renderContentBlocks();
  } catch (error) { status.textContent = error.message; }
}

function renderContentBlocks() {
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
      const uploadRow = document.createElement('div');
      uploadRow.className = 'content-block__upload';
      const file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/jpeg,image/png,image/webp,image/gif';
      const status = document.createElement('span');
      status.className = 'upload-status';
      status.textContent = currentUrl ? 'Image uploaded' : 'Choose an image';
      file.addEventListener('change', () => file.files?.[0] && uploadBlockImage(block, file.files[0], status));
      uploadRow.append(file, status);
      body.append(uploadRow, controlLabel('Caption', textInput(block.caption, 'Optional image caption', (value) => update('caption', value))));
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

function editEvent(item) {
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
  form.removeQr.checked = false;
  form.published.checked = item.published;
  contentBlocks = structuredClone(item.contentBlocks || []);
  renderContentBlocks();
  formTitle.textContent = 'Edit event';
  saveButton.firstChild.textContent = 'Save changes ';
  cancelEdit.hidden = false;
  eventForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  eventForm.reset();
  eventForm.elements.id.value = '';
  eventForm.elements.site.value = 'both';
  eventForm.elements.sortOrder.value = '0';
  eventForm.elements.removeQr.checked = false;
  eventForm.elements.published.checked = true;
  contentBlocks = [];
  renderContentBlocks();
  formTitle.textContent = 'Add an event';
  saveButton.firstChild.textContent = 'Publish event ';
  cancelEdit.hidden = true;
  formMessage.textContent = '';
}
cancelEdit.addEventListener('click', resetForm);

eventForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Saving…';
  syncContentBlocks();
  const data = new FormData(eventForm);
  data.set('published', String(eventForm.elements.published.checked));
  const id = data.get('id');
  try {
    await request(id ? `/admin/api/events/${id}` : '/admin/api/events', { method: id ? 'PUT' : 'POST', body: data });
    resetForm();
    await loadEvents();
  } catch (error) { formMessage.textContent = error.message; }
});

async function deleteEvent(item) {
  if (!confirm(`Delete “${item.title}”?`)) return;
  try { await request(`/admin/api/events/${item.id}`, { method: 'DELETE' }); await loadEvents(); }
  catch (error) { alert(error.message); }
}

renderContentBlocks();
checkSession();
