const homepageConfigIsSet = window.supabase?.createClient &&
  window.DESIGNMEN_SUPABASE_URL?.startsWith('https://') &&
  window.DESIGNMEN_SUPABASE_ANON_KEY &&
  !window.DESIGNMEN_SUPABASE_ANON_KEY.includes('YOUR_');

function safeHomepageImageUrl(value) {
  const imageUrl = String(value || '').trim();
  if (!/^(https?:\/\/|assets\/|\.\/|\/)/i.test(imageUrl)) return '';
  return imageUrl;
}

function setBackgroundImage(element, value) {
  const imageUrl = safeHomepageImageUrl(value);
  if (!element || !imageUrl) return;
  element.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
  delete element.dataset.bg;
}

function setHeroHeading(heading, value) {
  if (!heading) return;
  heading.replaceChildren(...String(value || '').split(/\s+/).filter(Boolean).map((word) => {
    const span = document.createElement('span');
    span.className = 'highlight-word';
    span.textContent = word;
    return span;
  }));
}

function applyHomepageProjects(projects) {
  const cards = Array.from(document.querySelectorAll('.project-track .project-card'));
  const featured = (projects || []).slice(0, cards.length);
  cards.forEach((card, index) => {
    const project = featured[index];
    card.hidden = !project;
    if (!project) return;
    card.href = project.link_url || 'projects.html';
    const image = card.querySelector('.project-image');
    setBackgroundImage(image, project.image_url);
    const title = card.querySelector('.project-copy h3');
    const description = card.querySelector('.project-copy p');
    if (title) title.textContent = project.name || '';
    if (description) description.textContent = project.description || project.category || '';
  });
  const slides = window.designmenRefreshProjectSlides?.();
  if (slides) {
    const allDots = Array.from(document.querySelectorAll('.project-dot'));
    allDots.forEach((dot, index) => { dot.hidden = index >= featured.length; });
    const visibleDots = allDots.slice(0, featured.length);
    window.designmenRefreshProjectSlides(visibleDots);
  }
}

function applyHomepageNews(news) {
  const cards = Array.from(document.querySelectorAll('.news-grid .news-card'));
  const featured = (news || []).slice(0, cards.length);
  cards.forEach((card, index) => {
    const item = featured[index];
    card.hidden = !item;
    if (!item) return;
    const image = card.querySelector('.news-image');
    setBackgroundImage(image, item.image_url);
    let date = image.querySelector('.news-date');
    if (item.date && !date) {
      date = document.createElement('span');
      date.className = 'news-date';
      image.appendChild(date);
    }
    if (date) {
      date.hidden = !item.date;
      date.textContent = item.date || '';
    }
    const title = card.querySelector('.news-content h3');
    const description = card.querySelector('.news-text p');
    if (title) title.textContent = item.title || '';
    if (description) description.textContent = item.description || '';
  });
}

async function loadHomepageContent() {
  if (!homepageConfigIsSet) return;
  const client = window.supabase.createClient(window.DESIGNMEN_SUPABASE_URL, window.DESIGNMEN_SUPABASE_ANON_KEY);
  const { data, error } = await client.from('site_content').select('content').eq('id', 'homepage').maybeSingle();
  if (error || !data?.content) return;

  const content = data.content;
  const selectedProjectIds = new Set(content.homeProjectIds || []);
  const selectedNewsIds = new Set(content.homeNewsIds || []);
  const projects = (content.projects || []).filter((item) => selectedProjectIds.has(String(item.id)));
  const news = (content.news || []).filter((item) => selectedNewsIds.has(String(item.id)));
  const heroSlides = (content.heroSlides || []).filter((item) => item.active !== false);

  document.dispatchEvent(new CustomEvent('designmen:homepage-content', { detail: { heroSlides } }));
  applyHomepageProjects(projects);
  applyHomepageNews(news);
}

loadHomepageContent().catch(() => {});