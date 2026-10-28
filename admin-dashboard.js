const ADMIN_EMAIL = 'designmenislamabad@gmail.com';
const CONTENT_ID = 'homepage';
const DEFAULT_CONTENT = {
  projects: [
    { id: '1', name: '60 MW Shalfalam HPP', category: 'Hydropower', status: 'Active', description: 'Hydropower development supporting reliable energy and long-term regional growth.', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=65', link_url: 'projects.html#hydel-power-projects' },
    { id: '2', name: 'Strategic Environmental Assessment AJK', category: 'Environment', status: 'Planning', description: 'Environmental assessment supporting informed planning and sustainable development across AJK.', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=65', link_url: 'projects.html#social-environment-projects' },
    { id: '3', name: 'Parliament Building, Islamabad', category: 'Buildings', status: 'Completed', description: 'Engineering and structural project work for a major national institutional landmark.', image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=65', link_url: 'projects.html#building-structural-engineering' }
  ],
  homeProjectIds: ['1', '2', '3'],
  news: [
    { id: 'news-1', title: 'Aghan Khan Schools Rehabilitation Project (AKES)', date: '2025-01-27', description: 'Schools in Muhammadanbad, Nasirabad and Chatorkhand are near their completion stage under the supervision of Designmen Consulting Engineers.', image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=640&q=65', link_url: 'news-events.html' },
    { id: 'news-2', title: 'Mr. Iqbal Hussain - Head of Composing and Reporting Section', date: '2025-01-20', description: 'Mr. Iqbal Hussain has been working with Designmen since 2002.', image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=640&q=65', link_url: 'news-events.html' },
    { id: 'news-3', title: 'Agreement Signing for Shifa Tameer-e-Millat Building', date: '2025-01-15', description: 'Design services for construction of National College for Business and Management Studies (NCBMS).', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=640&q=65', link_url: 'news-events.html' }
  ],
  homeNewsIds: ['news-1', 'news-2', 'news-3'],
  documents: [
    { id: 'company-profile', name: 'Designmen Profile', url: 'assets/Designmen%20Profile%20.pdf' },
    { id: 'company-newsletter', name: 'Designmen News Letter', url: 'assets/Designmen%20News%20Letter.pdf' }
  ],
  pageOverrides: {},
  heroSlides: [
    { id: 'hero-1', title: 'Engineering Excellence', subtitle: 'Designmen delivers dependable consulting and engineering services for resilient communities.', description: 'Professional infrastructure solutions built on trust and technical expertise.', image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=70', active: true },
    { id: 'hero-2', title: 'Trusted Advisory', subtitle: 'Strategic engineering for institutions, infrastructure, and future-ready communities.', description: 'We combine technical depth with practical project insight to support effective planning and long-term delivery.', image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=960&q=65', active: true },
    { id: 'hero-3', title: 'Built for Impact', subtitle: 'Delivering safe, efficient, and sustainable engineering outcomes across sectors.', description: 'From highways and water systems to institutions and development planning, our work is shaped around measurable value.', image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=960&q=65', active: true }
  ]
};
const MANAGED_PAGES = [
  ['about.html', 'About'], ['introduction.html', 'Introduction'], ['funders-message.html', "Funder's Message"],
  ['organization.html', 'Organization'], ['goals-missions.html', 'Goals & Missions'], ['teams.html', 'Teams'],
  ['staff.html', 'Staff'], ['social-responsibility.html', 'Social Responsibility'], ['quality-policy.html', 'Quality Policy'],
  ['our-culture.html', 'Our Culture'], ['services.html', 'Services'], ['divisions.html', 'Divisions'],
  ['projects.html', 'Projects page'], ['ongoing-projects.html', 'Ongoing Projects'], ['associates.html', 'Associates'],
  ['clients.html', 'Clients'], ['news-events.html', 'News & Events page'], ['gallery.html', 'Gallery'], ['contact.html', 'Contact Us']
];

const $ = (id) => document.getElementById(id);
const configured = window.supabase?.createClient &&
  window.DESIGNMEN_SUPABASE_URL?.startsWith('https://') &&
  window.DESIGNMEN_SUPABASE_ANON_KEY &&
  !window.DESIGNMEN_SUPABASE_ANON_KEY.includes('YOUR_');
const supabaseClient = configured
  ? window.supabase.createClient(window.DESIGNMEN_SUPABASE_URL, window.DESIGNMEN_SUPABASE_ANON_KEY)
  : null;
let content = structuredClone(DEFAULT_CONTENT);
let currentCollection = '';
let currentId = '';
let currentPagePath = '';

function showToast(message, isError = false) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function safeImageUrl(value) {
  const url = String(value || '').trim();
  return /^(https?:\/\/|assets\/|\.\/|\/)/i.test(url) ? url : '';
}

async function saveContent() {
  $('saveStatus').textContent = 'Saving...';
  const { error } = await supabaseClient.from('site_content').upsert({ id: CONTENT_ID, content, updated_at: new Date().toISOString() });
  $('saveStatus').textContent = error ? 'Save failed' : 'All changes saved';
  if (error) throw error;
}

function getCollectionConfig(collection) {
  if (collection === 'projects') return {
    title: 'project',
    fields: [
      ['name', 'Project name', 'text', true], ['category', 'Category', 'text', true],
      ['status', 'Status', 'select', true, ['Active', 'Planning', 'Completed']],
      ['description', 'Description', 'textarea', true], ['image_url', 'Image URL', 'url', false],
      ['link_url', 'Project page link', 'text', false]
    ]
  };
  if (collection === 'news') return {
    title: 'news item',
    fields: [
      ['title', 'Headline', 'text', true], ['date', 'Date', 'date', false],
      ['description', 'Description', 'textarea', true], ['image_url', 'Image URL', 'url', false],
      ['link_url', 'Learn more link', 'text', false]
    ]
  };
  return {
    title: 'hero slide',
    fields: [
      ['title', 'Heading', 'text', true], ['subtitle', 'Subheading', 'textarea', true],
      ['description', 'Supporting text', 'textarea', false], ['image_url', 'Background image URL', 'url', false],
      ['active', 'Show on homepage', 'checkbox', false]
    ]
  };
}

function renderCollection(collection, containerId, selectedKey) {
  const container = $(containerId);
  const records = content[collection] || [];
  const selectedIds = content[selectedKey] || [];
  const isHero = collection === 'heroSlides';
  container.innerHTML = records.map((item) => {
    const image = safeImageUrl(item.image_url);
    const selected = isHero ? item.active !== false : selectedIds.includes(String(item.id));
    const title = item.name || item.title || 'Untitled';
    const summary = item.description || item.subtitle || item.category || '';
    return `<article class="content-card" data-item-id="${escapeHtml(item.id)}">
      <div class="card-image"${image ? ` data-image="${escapeHtml(image)}"` : ''} aria-hidden="true"></div>
      <div class="card-body"><div class="card-title-row"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(summary)}</p></div><button class="icon-button" type="button" data-edit="${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(title)}">Edit</button></div>
      <div class="card-meta">${item.category ? `<span>${escapeHtml(item.category)}</span>` : ''}${item.date ? `<span>${escapeHtml(item.date)}</span>` : ''}</div>
      <div class="card-actions"><label class="selection-control"><input type="checkbox" data-select="${escapeHtml(item.id)}" ${selected ? 'checked' : ''} /><span>${isHero ? 'Show on homepage' : 'Feature on homepage'}</span></label><button class="text-button danger-text" type="button" data-delete="${escapeHtml(item.id)}">Delete</button></div></div>
    </article>`;
  }).join('') || '<p class="empty-state">Abhi koi content nahin. Naya item add karein.</p>';

  container.querySelectorAll('.card-image[data-image]').forEach((element) => {
    element.style.backgroundImage = `url(${JSON.stringify(safeImageUrl(element.dataset.image))})`;
  });

  container.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => openEditor(collection, button.dataset.edit)));
  container.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteItem(collection, button.dataset.delete)));
  container.querySelectorAll('[data-select]').forEach((checkbox) => checkbox.addEventListener('change', () => updateSelection(collection, checkbox.dataset.select, checkbox.checked, selectedKey)));
}

function renderAll() {
  renderCollection('projects', 'projectsList', 'homeProjectIds');
  renderCollection('news', 'newsList', 'homeNewsIds');
  renderCollection('heroSlides', 'heroList', '');
}

async function updateSelection(collection, id, checked, selectedKey) {
  if (collection === 'heroSlides') {
    const activeCount = content.heroSlides.filter((item) => item.active !== false).length;
    if (checked && activeCount >= 3) {
      showToast('Homepage par zyada se zyada 3 hero slides show ho sakti hain.', true);
      renderAll();
      return;
    }
    if (!checked && activeCount <= 1) {
      showToast('Homepage par kam az kam 1 hero slide rehni chahiye.', true);
      renderAll();
      return;
    }
    content.heroSlides = content.heroSlides.map((item) => item.id === id ? { ...item, active: checked } : item);
  } else {
    const selected = new Set(content[selectedKey] || []);
    if (checked && selected.size >= 3) {
      showToast('Homepage par zyada se zyada 3 items show ho sakte hain.', true);
      renderAll();
      return;
    }
    if (!checked && selected.size <= 1) {
      showToast('Homepage par kam az kam 1 item rehna chahiye.', true);
      renderAll();
      return;
    }
    if (checked) selected.add(id);
    else selected.delete(id);
    content[selectedKey] = [...selected];
  }
  renderAll();
  try { await saveContent(); showToast('Homepage selection update ho gayi.'); }
  catch (error) { showToast('Selection save nahin hui. Supabase policies check karein.', true); }
}

function makeField(field, value) {
  const [key, label, type, required, options] = field;
  const requiredAttr = required ? 'required' : '';
  if (type === 'checkbox') return `<label class="editor-checkbox"><input name="${key}" type="checkbox" ${value ? 'checked' : ''} /><span>${label}</span></label>`;
  if (type === 'select') return `<label class="field"><span>${label}</span><select name="${key}" ${requiredAttr}>${options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select></label>`;
  const control = type === 'textarea'
    ? `<textarea name="${key}" ${requiredAttr} maxlength="1000">${escapeHtml(value || '')}</textarea>`
    : `<input name="${key}" type="${type}" value="${escapeHtml(value || '')}" ${requiredAttr} />`;
  const upload = key === 'image_url' ? '<span class="upload-label">Or upload image <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></span>' : '';
  return `<label class="field"><span>${label}</span>${control}${upload}</label>`;
}

function openEditor(collection, id = '') {
  currentCollection = collection;
  currentId = id;
  const record = (content[collection] || []).find((item) => item.id === id) || {};
  const config = getCollectionConfig(collection);
  $('editorTitle').textContent = `${id ? 'Edit' : 'Add'} ${config.title}`;
  $('editorFields').innerHTML = config.fields.map((field) => makeField(field, record[field[0]])).join('');
  $('editorBackdrop').hidden = false;
  $('editorBackdrop').classList.add('open');
  $('editorFields').querySelector('input:not([type="checkbox"]), textarea, select')?.focus();
}

function closeEditor() {
  $('editorBackdrop').classList.remove('open');
  $('editorBackdrop').hidden = true;
  $('contentForm').reset();
}

async function uploadImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 25 * 1024 * 1024) {
    throw new Error('Image JPEG, PNG, WebP ya AVIF ho aur 25 MB se chhoti ho.');
  }
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabaseClient.storage.from('site-assets').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return supabaseClient.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
}

async function uploadMediaFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
  if (!allowedTypes.includes(file.type) || file.size > 25 * 1024 * 1024) {
    throw new Error('JPEG, PNG, WebP, AVIF ya PDF upload karein. File 25 MB se chhoti honi chahiye.');
  }
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabaseClient.storage.from('site-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
    metadata: { originalName: file.name }
  });
  if (error) throw error;
  return { path, url: supabaseClient.storage.from('site-assets').getPublicUrl(path).data.publicUrl };
}

function displayMediaName(file) {
  return file.metadata?.metadata?.originalName || file.name.replace(/^\d+-[0-9a-f-]{36}-/i, '');
}

function renderMediaLibrary(files) {
  const container = $('mediaLibraryList');
  container.innerHTML = files.map((file) => {
    const url = supabaseClient.storage.from('site-assets').getPublicUrl(file.name).data.publicUrl;
    const isPdf = file.metadata?.mimetype === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    return `<article class="media-card">
      ${isPdf ? '<div class="media-pdf-icon" aria-label="PDF file">PDF</div>' : `<div class="media-file-image" data-image-src="${escapeHtml(url)}" aria-label="${escapeHtml(displayMediaName(file))}"></div>`}
      <div class="media-card-body"><h3>${escapeHtml(displayMediaName(file))}</h3><p>${isPdf ? 'PDF document' : 'Image'} · Supabase Storage</p>
        <div class="media-card-actions"><button class="text-button" type="button" data-copy-url="${escapeHtml(url)}">Copy URL</button><button class="text-button danger-text" type="button" data-remove-file="${escapeHtml(file.name)}">Delete</button></div>
      </div>
    </article>`;
  }).join('') || '<p class="empty-state">Abhi Supabase Storage mein upload nahin hai.</p>';
  container.querySelectorAll('[data-image-src]').forEach((image) => {
    image.style.backgroundImage = `url(${JSON.stringify(image.dataset.imageSrc)})`;
  });
  container.querySelectorAll('[data-copy-url]').forEach((button) => button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copyUrl);
    showToast('File URL copy ho gaya.');
  }));
  container.querySelectorAll('[data-remove-file]').forEach((button) => button.addEventListener('click', () => removeMediaFile(button.dataset.removeFile)));
}

async function loadMediaLibrary() {
  $('mediaStatus').textContent = 'Supabase Storage se files load ho rahi hain...';
  const { data, error } = await supabaseClient.storage.from('site-assets').list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' }
  });
  if (error) {
    $('mediaStatus').textContent = 'Files load nahin huin. Storage RLS policies check karein.';
    return;
  }
  const files = (data || []).filter((file) => file.id);
  renderMediaLibrary(files);
  $('mediaStatus').textContent = `${files.length} file(s) Supabase Storage mein.`;
}

async function removeMediaFile(path) {
  if (!window.confirm('Kya aap is file ko Supabase Storage se delete karna chahte hain?')) return;
  const { error } = await supabaseClient.storage.from('site-assets').remove([path]);
  if (error) return showToast('File delete nahin hui. Storage RLS policies check karein.', true);
  const publicUrl = supabaseClient.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
  content.documents = (content.documents || []).filter((item) => item.storage_path !== path && item.url !== publicUrl);
  try { await saveContent(); }
  catch (saveError) { showToast('File delete hui lekin content record update nahin hua.', true); }
  await loadMediaLibrary();
  showToast('File Supabase se delete ho gayi.');
}

async function submitMediaUpload(event) {
  event.preventDefault();
  const file = $('mediaFile').files[0];
  if (!file) return;
  const button = $('mediaUploadButton');
  button.disabled = true;
  $('mediaStatus').textContent = 'File Supabase Storage par upload ho rahi hai...';
  try {
    const uploaded = await uploadMediaFile(file);
    if (file.type === 'application/pdf') {
      content.documents = [
        ...(content.documents || []).filter((item) => item.storage_path !== uploaded.path),
        { id: uploaded.path, name: file.name.replace(/\.pdf$/i, ''), url: uploaded.url, storage_path: uploaded.path }
      ];
      await saveContent();
    }
    $('mediaUploadForm').reset();
    await loadMediaLibrary();
    $('mediaStatus').textContent = 'Upload complete. PDF website Downloads mein show ho raha hai.';
    showToast('File Supabase mein save ho gayi.');
  } catch (error) {
    $('mediaStatus').textContent = error.message || 'Upload nahin hua. Supabase settings check karein.';
    showToast($('mediaStatus').textContent, true);
  } finally {
    button.disabled = false;
  }
}

async function submitEditor(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const config = getCollectionConfig(currentCollection);
  const record = {};
  config.fields.forEach(([key, , type]) => {
    const value = formData.get(key);
    record[key] = type === 'checkbox' ? value === 'on' : String(value || '').trim();
  });
  try {
    const imageFile = formData.get('image_file');
    if (imageFile instanceof File && imageFile.size) record.image_url = await uploadImage(imageFile);
    record.id = currentId || `${currentCollection}-${crypto.randomUUID()}`;
    const list = content[currentCollection] || [];
    content[currentCollection] = currentId ? list.map((item) => item.id === currentId ? record : item) : [record, ...list];
    await saveContent();
    renderAll();
    closeEditor();
    showToast('Content Supabase mein save ho gaya.');
  } catch (error) {
    $('saveStatus').textContent = 'Save failed';
    showToast(error.message || 'Content save nahin ho saka. Supabase configuration check karein.', true);
  }
}

async function deleteItem(collection, id) {
  if (!window.confirm('Kya aap is item ko delete karna chahte hain?')) return;
  content[collection] = content[collection].filter((item) => item.id !== id);
  if (collection === 'projects') content.homeProjectIds = content.homeProjectIds.filter((itemId) => itemId !== id);
  if (collection === 'news') content.homeNewsIds = content.homeNewsIds.filter((itemId) => itemId !== id);
  try { await saveContent(); renderAll(); showToast('Item delete ho gaya.'); }
  catch (error) { showToast('Delete save nahin hua. Supabase policies check karein.', true); }
}

function showSection(name) {
  document.querySelectorAll('[data-content-section]').forEach((section) => {
    const active = section.dataset.contentSection === name;
    section.hidden = !active;
    section.classList.toggle('active', active);
  });
  document.querySelectorAll('[data-section]').forEach((button) => button.classList.toggle('active', button.dataset.section === name));
  $('sectionTitle').textContent = { projects: 'Projects', news: 'News & Events', hero: 'Hero section', media: 'Media Library', settings: 'Settings', pages: 'Website pages' }[name];
  if (name === 'media') loadMediaLibrary();
}

function renderPageNavigation() {
  $('pageNavigation').innerHTML = MANAGED_PAGES.map(([path, label]) =>
    `<button class="page-nav-link" type="button" data-page-path="${path}">${escapeHtml(label)}</button>`
  ).join('');
  $('pageNavigation').querySelectorAll('[data-page-path]').forEach((button) => {
    button.addEventListener('click', () => openPageEditor(button.dataset.pagePath));
  });
}

function getEditablePageNodes() {
  const document = $('pagePreview').contentDocument;
  const textNodes = Array.from(document.querySelectorAll('main h1, main h2, main h3, main p, main blockquote'))
    .filter((element) => !element.querySelector('a, button, svg, strong, em, b, input, select, textarea'));
  const imageNodes = Array.from(document.querySelectorAll('main img, main [data-bg]'));
  return { document, textNodes, imageNodes };
}

function openPageEditor(path) {
  currentPagePath = path;
  showSection('pages');
  $('pageEditorTitle').textContent = MANAGED_PAGES.find(([pagePath]) => pagePath === path)?.[1] || path;
  $('pageEditorLoading').hidden = false;
  $('pageTextFields').replaceChildren();
  $('pageImageFields').replaceChildren();
  $('pagePreview').onload = renderPageFields;
  $('pagePreview').src = path;
  $('pageNavigation').querySelectorAll('[data-page-path]').forEach((button) => button.classList.toggle('active', button.dataset.pagePath === path));
}

function renderPageFields() {
  if (!$('pagePreview').contentDocument?.querySelector('main')) return;
  const { textNodes, imageNodes } = getEditablePageNodes();
  const overrides = content.pageOverrides?.[currentPagePath] || { texts: {}, images: {} };
  $('pageTextFields').innerHTML = '<h3>Text content</h3>' + (textNodes.map((element, index) => {
    const text = overrides.texts?.[index] ?? element.textContent.trim();
    return `<label class="field page-edit-field"><span>${escapeHtml(text.slice(0, 72) || `Text ${index + 1}`)}</span><textarea name="text_${index}" maxlength="2000">${escapeHtml(text)}</textarea></label>`;
  }).join('') || '<p>No editable text found.</p>');
  $('pageImageFields').innerHTML = '<h3>Images</h3>' + (imageNodes.map((element, index) => {
    const original = element.tagName === 'IMG' ? element.getAttribute('src') : element.dataset.bg || element.style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '');
    const imageUrl = overrides.images?.[index] ?? original;
    return `<label class="field page-edit-field"><span>Image ${index + 1}: ${escapeHtml(element.getAttribute('alt') || element.className || element.tagName)}</span><input name="image_${index}" type="url" value="${escapeHtml(imageUrl)}" /><span class="upload-label">Upload replacement <input name="image_file_${index}" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></span></label>`;
  }).join('') || '<p>No images found.</p>');
  $('pageEditorLoading').hidden = true;
}

async function savePageContent(event) {
  event.preventDefault();
  const { textNodes, imageNodes } = getEditablePageNodes();
  const formData = new FormData(event.currentTarget);
  const overrides = { texts: {}, images: {} };
  textNodes.forEach((element, index) => {
    const value = String(formData.get(`text_${index}`) ?? '').trim();
    if (value !== element.textContent.trim()) overrides.texts[index] = value;
  });
  try {
    for (let index = 0; index < imageNodes.length; index += 1) {
      const element = imageNodes[index];
      const original = element.tagName === 'IMG' ? element.getAttribute('src') : element.dataset.bg || '';
      const value = String(formData.get(`image_${index}`) || '').trim();
      const file = formData.get(`image_file_${index}`);
      if (file instanceof File && file.size) overrides.images[index] = await uploadImage(file);
      else if (value && value !== original) overrides.images[index] = value;
    }
    content.pageOverrides = { ...(content.pageOverrides || {}), [currentPagePath]: overrides };
    await saveContent();
    applyPageOverridesToPreview(overrides, textNodes, imageNodes);
    showToast('Page content Supabase mein publish ho gaya.');
  } catch (error) {
    showToast(error.message || 'Page save nahin hua. Supabase setup check karein.', true);
  }
}

function applyPageOverridesToPreview(overrides, textNodes, imageNodes) {
  Object.entries(overrides.texts).forEach(([index, value]) => { if (textNodes[index]) textNodes[index].textContent = value; });
  Object.entries(overrides.images).forEach(([index, value]) => {
    const element = imageNodes[index];
    if (!element) return;
    if (element.tagName === 'IMG') element.src = value;
    else { element.style.backgroundImage = `url(${JSON.stringify(value)})`; delete element.dataset.bg; }
  });
}

async function startDashboard() {
  if (window.matchMedia('(max-width: 760px)').matches) {
    window.location.replace('index.html');
    return;
  }
  if (!supabaseClient) {
    $('loadingState').textContent = 'Supabase setup mukammal nahin. SUPABASE_SETUP.md follow karein.';
    return;
  }
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    await supabaseClient.auth.signOut();
    window.location.replace('admin-login.html');
    return;
  }
  const { data: mfaStatus, error: mfaError } = await supabaseClient.functions.invoke('admin-email-mfa', {
    body: { action: 'status' }
  });
  if (mfaError || !mfaStatus?.verified) {
    await supabaseClient.auth.signOut();
    window.location.replace('admin-login.html');
    return;
  }
  $('adminEmail').textContent = session.user.email;
  try {
    const { data, error } = await supabaseClient.from('site_content').select('content').eq('id', CONTENT_ID).maybeSingle();
    if (error) throw error;
    if (data?.content) content = { ...structuredClone(DEFAULT_CONTENT), ...data.content };
  } catch (error) {
    $('loadingState').textContent = 'Content load nahin hua. supabase-setup.sql aur RLS policies check karein.';
    return;
  }
  $('loadingState').hidden = true;
  $('appShell').hidden = false;
  renderAll();
  loadMediaLibrary();
}

document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => showSection(button.dataset.section)));
renderPageNavigation();
if (MANAGED_PAGES.length) openPageEditor(MANAGED_PAGES[0][0]);
document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => openEditor(button.dataset.add)));
$('contentForm').addEventListener('submit', submitEditor);
$('closeEditor').addEventListener('click', closeEditor);
$('cancelEditor').addEventListener('click', closeEditor);
$('editorBackdrop').addEventListener('click', (event) => { if (event.target === $('editorBackdrop')) closeEditor(); });
$('pageContentForm').addEventListener('submit', savePageContent);
$('mediaUploadForm').addEventListener('submit', submitMediaUpload);
$('logoutButton').addEventListener('click', async () => {
  await supabaseClient?.functions.invoke('admin-email-mfa', { body: { action: 'revoke' } }).catch(() => null);
  await supabaseClient?.auth.signOut();
  window.location.replace('admin-login.html');
});
$('passwordForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = $('newPassword').value;
  if (password !== $('confirmPassword').value) return showToast('Dono passwords match nahin karte.', true);
  const { error } = await supabaseClient.auth.updateUser({ password });
  if (error) showToast('Password update nahin hua. Dobara sign in kar ke try karein.', true);
  else { event.currentTarget.reset(); showToast('Password update ho gaya.'); }
});

startDashboard();