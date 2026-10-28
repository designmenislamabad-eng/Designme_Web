const footerProjects = [
  { id: '1', name: '60 MW Shalfalam HPP', category: 'Hydropower', description: 'Hydropower feasibility, design, and project management.' },
  { id: '2', name: 'Parliament Building, Islamabad', category: 'Buildings', description: 'Structural and architectural design services for a national landmark.' },
  { id: '3', name: 'Strategic Environmental Assessment AJK', category: 'Environment', description: 'Environmental planning and impact assessment for regional projects.' }
];

const navigationSubmenus = {
  'about.html': [
    ['Introduction', 'about.html#introduction'],
    ["Funder's Message", 'about.html#funders-message'],
    ['Organization', 'about.html#organization'],
    ['Goals & Missions', 'about.html#goals-missions'],
    ['Board of Directors', 'about.html#teams'],
    ['Our Staff', 'about.html#staff'],
    ['Social Responsibility', 'about.html#social-responsibility'],
    ['Quality Policy', 'about.html#quality-policy'],
    ['Our Culture & Skill', 'about.html#our-culture']
  ],
  'services.html': [
    ['Conceptual Phase', 'services.html#conceptual-phase'],
    ['Planning Phase', 'services.html#planning-phase'],
    ['Feasibility Study Phase', 'services.html#feasibility-study-phase'],
    ['Pre-Construction Phase', 'services.html#pre-construction-phase'],
    ['Construction Phase', 'services.html#construction-phase'],
    ['Commissioning Phase', 'services.html#commissioning-phase']
  ],
  'divisions.html': [
    ['Architecture & Town Planning', 'divisions.html#architecture-town-planning'],
    ['Building Information Modeling', 'divisions.html#building-information-modeling'],
    ['Business Development', 'divisions.html#business-development'],
    ['Contract Management', 'divisions.html#contract-management'],
    ['Electrical Engineering', 'divisions.html#electrical-engineering'],
    ['Finance & Accounting', 'divisions.html#finance-accounting'],
    ['Fire & Life Safety Design', 'divisions.html#fire-life-safety'],
    ['GIS & Environment Impact Assessment', 'divisions.html#gis-environment'],
    ['Hydropower Development', 'divisions.html#hydropower-development'],
    ['Infrastructure Development', 'divisions.html#infrastructure-development'],
    ['Quantity Surveying', 'divisions.html#quantity-surveying'],
    ['Water Resources', 'divisions.html#water-resources']
  ],
  'projects.html': [
    ['Assessment & Rehabilitation', 'projects.html#assessment-rehabilitation'],
    ['Building & Structural Engineering', 'projects.html#building-structural-engineering'],
    ['Steel Structures', 'projects.html#steel-structures'],
    ['Contract and Construction Management', 'projects.html#contract-construction-management'],
    ['Social and Environment Sector Projects', 'projects.html#social-environment-projects'],
    ['Urban Planning and Infrastructure Design', 'projects.html#urban-planning'],
    ['Energy Projects', 'projects.html#energy-projects'],
    ['Geology and Topography', 'projects.html#geology-topography'],
    ['Highway & Bridge Engineering', 'projects.html#highway-bridge-engineering'],
    ['Hydel Power Projects', 'projects.html#hydel-power-projects'],
    ['Interior Design & Layout Planning', 'projects.html#interior-design'],
    ['Repair, Maintenance & Retrofitting', 'projects.html#repair-maintenance'],
    ['Water Resources', 'projects.html#water-resources'],
    ['Solid Waste Management', 'projects.html#solid-waste-management'],
    ['GIS and Remote Sensing', 'projects.html#gis-remote-sensing']
  ],
  'media.html': [
    ['News and Events', 'news-events.html'],
    ['Gallery', 'gallery.html']
  ]
};
const navigationSubmenuPaths = {
  about: 'about.html',
  services: 'services.html',
  divisions: 'divisions.html',
  projects: 'projects.html',
  media: 'media.html'
};

function initializeSiteNavigation() {
  const navs = Array.from(document.querySelectorAll('.header-nav, .site-nav'));
  navs.forEach((nav) => {
    const alreadyAdded = nav.querySelector('.admin-login-link');
    if (alreadyAdded) return;
    const contactLink = Array.from(nav.querySelectorAll(':scope > a, :scope > .nav-dropdown > a'))
      .find((link) => new URL(link.href, window.location.href).pathname.split('/').pop().toLowerCase() === 'contact.html');
    if (!contactLink) return;
    const loginLink = document.createElement('a');
    loginLink.className = 'admin-login-link';
    loginLink.href = 'admin-login.html';
    loginLink.textContent = 'Admin Login';
    contactLink.insertAdjacentElement('afterend', loginLink);
  });
  const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
  const homePages = new Set(['index.html', 'designmen-homepage.html']);
  const pageNavigationTargets = {
    'funders-message.html': 'about.html',
    'organization.html': 'about.html',
    'goals-missions.html': 'about.html',
    'teams.html': 'about.html',
    'staff.html': 'about.html',
    'social-responsibility.html': 'about.html',
    'quality-policy.html': 'about.html',
    'introduction.html': 'about.html',
    'our-culture.html': 'about.html',
    'gallery.html': 'media.html',
    'news-events.html': 'media.html',
    'ongoing-projects.html': 'projects.html'
  };
  const activePage = pageNavigationTargets[currentPage] || currentPage;

  if (!homePages.has(currentPage)) {
    navs.forEach((nav) => {
      nav.querySelectorAll('a.active, a[aria-current="page"]').forEach((link) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });

      const currentLink = Array.from(nav.querySelectorAll(':scope > a, :scope > .nav-dropdown > a'))
        .find((link) => {
          const linkUrl = new URL(link.href, window.location.href);
          const matchesPage = linkUrl.pathname.split('/').pop().toLowerCase() === activePage;
          const matchesLabel = activePage === 'media.html' && link.textContent.trim().toLowerCase() === 'media';
          return matchesPage || matchesLabel;
        });

      if (currentLink) {
        currentLink.classList.add('active');
        const linkUrl = new URL(currentLink.href, window.location.href);
        const isCurrentPage = linkUrl.pathname.split('/').pop().toLowerCase() === currentPage &&
          linkUrl.hash === window.location.hash;
        currentLink.setAttribute('aria-current', isCurrentPage ? 'page' : 'location');
      }

      const currentRouteLink = Array.from(nav.querySelectorAll('a')).find((link) => {
        const linkUrl = new URL(link.href, window.location.href);
        return linkUrl.pathname.split('/').pop().toLowerCase() === currentPage &&
          linkUrl.hash === window.location.hash;
      });

      if (currentRouteLink) {
        currentRouteLink.classList.add('active');
        currentRouteLink.setAttribute('aria-current', 'page');
      }
    });
  }

  navs.forEach((nav, navIndex) => {
    if (!nav.id) nav.id = `main-navigation-${navIndex + 1}`;

    nav.querySelectorAll(':scope > a').forEach((link) => {
      const path = new URL(link.href, window.location.href).pathname.split('/').pop();
      const label = link.textContent.trim().toLowerCase();
      const submenuPath = navigationSubmenus[path] ? path : navigationSubmenuPaths[label];
      const submenuItems = navigationSubmenus[submenuPath];
      if (!submenuItems) return;

      const dropdown = document.createElement('div');
      dropdown.className = 'nav-dropdown';
      link.parentNode.insertBefore(dropdown, link);
      dropdown.appendChild(link);

      const submenu = document.createElement('ul');
      submenu.className = 'dropdown-menu';
      submenuItems.forEach(([label, href]) => {
        const item = document.createElement('li');
        const submenuLink = document.createElement('a');
        submenuLink.href = href;
        submenuLink.textContent = label;
        item.appendChild(submenuLink);
        submenu.appendChild(item);
      });
      dropdown.appendChild(submenu);
      link.setAttribute('aria-haspopup', 'true');
    });
  });

  navs.forEach((nav, navIndex) => {
    const header = nav.closest('.header-inner, .header-main');
    if (!header) return;

    let toggle = header.querySelector('.nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.type = 'button';
      toggle.innerHTML = '<span></span><span></span><span></span>';
      header.insertBefore(toggle, nav);
    }

    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', nav.id);

    const submenuToggles = [];
    nav.querySelectorAll('.nav-dropdown').forEach((dropdown, dropdownIndex) => {
      const link = dropdown.querySelector(':scope > a');
      const submenu = dropdown.querySelector(':scope > .dropdown-menu');
      if (!link || !submenu) return;

      if (!submenu.id) submenu.id = `mobile-submenu-${navIndex + 1}-${dropdownIndex + 1}`;

      const submenuToggle = document.createElement('button');
      submenuToggle.className = 'nav-submenu-toggle';
      submenuToggle.type = 'button';
      submenuToggle.setAttribute('aria-label', `Show ${link.textContent.trim()} submenu`);
      submenuToggle.setAttribute('aria-expanded', 'false');
      submenuToggle.setAttribute('aria-controls', submenu.id);
      dropdown.insertBefore(submenuToggle, submenu);
      submenuToggles.push({ button: submenuToggle, dropdown, label: link.textContent.trim() });
    });

    const setOpen = (isOpen) => {
      nav.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');

      if (!isOpen) {
        submenuToggles.forEach(({ button, dropdown, label }) => {
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-label', `Show ${label} submenu`);
          dropdown.classList.remove('is-open');
        });
      }
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    submenuToggles.forEach(({ button, dropdown, label }) => {
      button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') !== 'true';

        submenuToggles.forEach((other) => {
          if (other.button === button) return;
          other.button.setAttribute('aria-expanded', 'false');
          other.button.setAttribute('aria-label', `Show ${other.label} submenu`);
          other.dropdown.classList.remove('is-open');
        });

        button.setAttribute('aria-expanded', String(isOpen));
        button.setAttribute('aria-label', `${isOpen ? 'Hide' : 'Show'} ${label} submenu`);
        dropdown.classList.toggle('is-open', isOpen);
      });
    });

    nav.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 761px)').matches) setOpen(false);
    });
  });
}

initializeSiteNavigation();

function loadScriptOnce(source) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${source}"]`);
    if (existing?.dataset.loaded === 'true') return resolve();
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = source;
    script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function applyPublishedPageContent() {
  const pagePath = window.location.pathname.split('/').pop().toLowerCase();

  try {
    if (!window.DESIGNMEN_SUPABASE_URL) await loadScriptOnce('supabase-config.js');
    if (!window.supabase?.createClient) await loadScriptOnce('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const configuredProjectUrl = window.DESIGNMEN_SUPABASE_URL;
    const configuredAnonKey = window.DESIGNMEN_SUPABASE_ANON_KEY;
    if (!configuredProjectUrl?.startsWith('https://') || !configuredAnonKey || configuredAnonKey.includes('YOUR_')) return;
    const client = window.supabase.createClient(configuredProjectUrl, configuredAnonKey);
    const { data, error } = await client.from('site_content').select('content').eq('id', 'homepage').maybeSingle();
    if (error) return;
    const content = data?.content || {};
    const downloads = document.getElementById('footerDownloads');
    if (downloads && Array.isArray(content.documents) && content.documents.length) {
      downloads.replaceChildren();
      content.documents.forEach((item) => {
        const url = String(item.url || '').trim();
        if (!/^(https?:\/\/|assets\/|\.\/|\/)/i.test(url)) return;
        const listItem = document.createElement('li');
        const marker = document.createElement('span');
        marker.textContent = '✓';
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.name || 'Download file';
        listItem.append(marker, link);
        downloads.appendChild(listItem);
      });
    }
    const overrides = content.pageOverrides?.[pagePath];
    if (pagePath === 'index.html' || !overrides) return;
    const textNodes = Array.from(document.querySelectorAll('main h1, main h2, main h3, main p, main blockquote'))
      .filter((element) => !element.querySelector('a, button, svg, strong, em, b, input, select, textarea'));
    Object.entries(overrides.texts || {}).forEach(([index, value]) => {
      if (textNodes[index]) textNodes[index].textContent = value;
    });
    const imageNodes = Array.from(document.querySelectorAll('main img, main [data-bg]'));
    Object.entries(overrides.images || {}).forEach(([index, value]) => {
      const imageUrl = String(value || '').trim();
      if (!/^(https?:\/\/|assets\/|\.\/|\/)/i.test(imageUrl) || !imageNodes[index]) return;
      const element = imageNodes[index];
      if (element.tagName === 'IMG') element.src = imageUrl;
      else { element.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`; delete element.dataset.bg; }
    });
  } catch (error) {
  }
}

applyPublishedPageContent();

function footerEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function footerSlugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

function getFooterProjects() {
  let projects = footerProjects;
  try {
    const storedProjects = JSON.parse(localStorage.getItem('designmenProjects') || 'null');
    if (Array.isArray(storedProjects) && storedProjects.length) projects = storedProjects;
    const selectedIds = JSON.parse(localStorage.getItem('designmenFooterProjectIds') || '[]');
    if (Array.isArray(selectedIds) && selectedIds.length) {
      const selected = selectedIds.map((id) => projects.find((project) => String(project.id) === String(id))).filter(Boolean).slice(0, 3);
      if (selected.length) projects = selected;
    }
  } catch (error) {
  }
  return projects.slice(0, 3);
}

const footerMarkup = `
  <div class="footer-grid">
    <div class="footer-column">
      <h3>Downloads</h3>
      <ul id="footerDownloads">
        <li><span>✓</span><a href="assets/Designmen%20Profile%20.pdf" target="_blank" rel="noopener noreferrer">Designmen Profile</a></li>
        <li><span>✓</span><a href="assets/Designmen%20News%20Letter.pdf" target="_blank" rel="noopener noreferrer">Designmen News Letter</a></li>
      </ul>
    </div>
    <div class="footer-column">
      <h3>Ongoing Projects</h3>
      <ul id="footerOngoingProjects"></ul>
      <div class="learn-more"><a href="ongoing-projects.html">Learn More</a></div>
    </div>
    <div class="footer-column">
      <h3>Address</h3>
      <ul class="address-list">
        <li><span class="mini-icon">◉</span><div><p>1st Floor, Block 9-West, Rizwan Plaza, Jinnah Avenue F-6, Islamabad - Pakistan</p></div></li>
        <li><span class="mini-icon">✉</span><div><a href="mailto:info@designmen.com.pk">info@designmen.com.pk</a></div></li>
        <li><span class="mini-icon">✉</span><div><a href="mailto:designmenislamabad@gmail.com">designmenislamabad@gmail.com</a></div></li>
        <li><span class="mini-icon">☎</span><div><a href="tel:+92512829002">+92-51-2829002</a></div></li>
        <li><span class="mini-icon">☎</span><div><a href="tel:+92512828577">+92-51-2828577</a></div></li>
      </ul>
    </div>
    <div class="footer-column">
      <h3>Media Links</h3>
      <ul class="social-links">
        <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><span class="social-mark social-facebook" aria-hidden="true">f</span>Facebook</a></li>
        <li><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"><span class="social-mark social-linkedin" aria-hidden="true">in</span>LinkedIn</a></li>
        <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer"><span class="social-mark social-x" aria-hidden="true">X</span>X</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom"><p><strong>© 2026 DESIGNMEN Consulting Engineers (Pvt) Ltd. All rights reserved.</strong></p></div>`;

function addMediaDropdown() {
  const mediaLink = document.querySelector('.header-nav a[href="media.html"], .site-nav a[href="media.html"]');
  if (!mediaLink || mediaLink.parentElement.classList.contains('nav-dropdown')) return;

  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown';
  mediaLink.parentElement.insertBefore(dropdown, mediaLink);
  dropdown.appendChild(mediaLink);
  dropdown.insertAdjacentHTML('beforeend', '<ul class="dropdown-menu"><li><a href="news-events.html">News and Events</a></li><li><a href="gallery.html">Gallery</a></li></ul>');
}

addMediaDropdown();

function keepAboutAsDropdownTrigger() {
  document.querySelectorAll('.nav-dropdown > a[href="#about-menu"], .nav-dropdown > a[href="about.html"]').forEach((trigger) => {
    trigger.setAttribute('href', 'about.html');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.addEventListener('click', () => {
      window.location.href = 'about.html';
    });
  });
}

keepAboutAsDropdownTrigger();

function keepMediaAsDropdownTrigger() {
  document.querySelectorAll('.nav-dropdown > a[href="#media-menu"], .nav-dropdown > a[href="media.html"]').forEach((trigger) => {
    trigger.setAttribute('href', '#media-menu');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.addEventListener('click', (event) => {
      if (window.matchMedia('(max-width: 760px)').matches) return;
      event.preventDefault();
      trigger.closest('.nav-dropdown')?.classList.add('is-open');
    });
  });
}

keepMediaAsDropdownTrigger();

function wireDropdownMenuBehavior() {
  document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector(':scope > a');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;

    const openMenu = () => {
      if (window.matchMedia('(max-width: 760px)').matches) return;
      const focusedDropdown = document.activeElement.closest('.nav-dropdown');
      if (focusedDropdown && focusedDropdown !== dropdown) {
        document.activeElement.blur();
      }
      document.querySelectorAll('.nav-dropdown.is-open').forEach((item) => {
        if (item !== dropdown) item.classList.remove('is-open');
      });
      dropdown.classList.add('is-open');
    };

    const closeMenu = () => {
      dropdown.classList.remove('is-open');
    };

    trigger.addEventListener('mouseenter', openMenu);
    trigger.addEventListener('focus', openMenu);
    dropdown.addEventListener('mouseleave', closeMenu);
    dropdown.addEventListener('focusout', (event) => {
      if (!dropdown.contains(event.relatedTarget)) closeMenu();
    });
  });
}

wireDropdownMenuBehavior();

const mediaSectionPages = {
  'news-events': 'news-events.html',
  gallery: 'gallery.html'
};

document.querySelectorAll('.nav-dropdown .dropdown-menu a[href^="media.html#"]').forEach((link) => {
  const section = link.getAttribute('href').split('#')[1];
  if (mediaSectionPages[section]) link.setAttribute('href', mediaSectionPages[section]);
});

document.querySelectorAll('.back-link[href="index.html"]').forEach((link) => link.remove());

const aboutSectionPages = {
  introduction: 'introduction.html',
  'funders-message': 'funders-message.html',
  organization: 'organization.html',
  'goals-missions': 'goals-missions.html',
  teams: 'teams.html',
  staff: 'staff.html',
  'social-responsibility': 'social-responsibility.html',
  'quality-policy': 'quality-policy.html',
  'our-culture': 'our-culture.html'
};

document.querySelectorAll('.nav-dropdown .dropdown-menu a[href="about.html#our-skills"], .nav-dropdown .dropdown-menu a[href="our-skills.html"]').forEach((link) => {
  link.closest('li')?.remove();
});

document.querySelectorAll('.nav-dropdown .dropdown-menu a[href^="about.html#"]').forEach((link) => {
  const section = link.getAttribute('href').split('#')[1];
  if (aboutSectionPages[section]) link.setAttribute('href', aboutSectionPages[section]);
});

const aboutSectionLabels = new Map([
  ['teams.html', 'Board of Directors'],
  ['staff.html', 'Our Staff'],
  ['our-culture.html', 'Our Culture & Skill']
]);

document.querySelectorAll('.nav-dropdown .dropdown-menu a').forEach((link) => {
  const label = aboutSectionLabels.get(link.getAttribute('href'));
  if (label) link.textContent = label;
});

const allowedAboutDropdownItems = new Set([
  'funders-message.html',
  'organization.html',
  'teams.html',
  'staff.html'
]);

const standardDropdownTemplates = {
  'services.html': [
    ['services.html#conceptual-phase', 'Conceptual Phase'],
    ['services.html#planning-phase', 'Planning Phase'],
    ['services.html#feasibility-study-phase', 'Feasibility Study Phase'],
    ['services.html#pre-construction-phase', 'Pre-Construction Phase'],
    ['services.html#construction-phase', 'Construction Phase'],
    ['services.html#commissioning-phase', 'Commissioning Phase']
  ],
  'divisions.html': [
    ['divisions.html#architecture-town-planning', 'Architecture &amp; Town Planning'],
    ['divisions.html#building-information-modeling', 'Building Information Modeling'],
    ['divisions.html#business-development', 'Business Development'],
    ['divisions.html#contract-management', 'Contract Management'],
    ['divisions.html#electrical-engineering', 'Electrical Engineering'],
    ['divisions.html#finance-accounting', 'Finance &amp; Accounting'],
    ['divisions.html#fire-life-safety', 'Fire &amp; Life Safety Design'],
    ['divisions.html#gis-environment', 'GIS &amp; Environment Impact Assessment'],
    ['divisions.html#hydropower-development', 'Hydropower Development'],
    ['divisions.html#infrastructure-development', 'Infrastructure Development'],
    ['divisions.html#quantity-surveying', 'Quantity Surveying'],
    ['divisions.html#water-resources', 'Water Resources']
  ],
  'projects.html': [
    ['projects.html#assessment-rehabilitation', 'Assessment &amp; Rehabilitation'],
    ['projects.html#building-structural-engineering', 'Building &amp; Structural Engineering'],
    ['projects.html#steel-structures', 'Steel Structures'],
    ['projects.html#contract-construction-management', 'Contract and Construction Management'],
    ['projects.html#social-environment-projects', 'Social and Environment Sector Projects'],
    ['projects.html#urban-planning', 'Urban Planning and Infrastructure Design'],
    ['projects.html#energy-projects', 'Energy Projects'],
    ['projects.html#geology-topography', 'Geology and Topography'],
    ['projects.html#highway-bridge-engineering', 'Highway &amp; Bridge Engineering'],
    ['projects.html#hydel-power-projects', 'Hydel Power Projects'],
    ['projects.html#interior-design', 'Interior Design &amp; Layout Planning'],
    ['projects.html#repair-maintenance', 'Repair, Maintenance &amp; Retrofitting'],
    ['projects.html#water-resources', 'Water Resources'],
    ['projects.html#solid-waste-management', 'Solid Waste Management'],
    ['projects.html#gis-remote-sensing', 'GIS and Remote Sensing']
  ],
  'news-events.html': [
    ['news-events.html', 'News and Events'],
    ['gallery.html', 'Gallery']
  ]
};

function restoreDropdownOptions() {
  document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector(':scope > a');
    const href = trigger?.getAttribute('href') || '';
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!menu) return;

    if (href.includes('about.html')) {
      const items = Array.from(menu.querySelectorAll('a'));
      items.forEach((link) => {
        const linkHref = link.getAttribute('href') || '';
        let normalized = linkHref.split('#')[0].split('?')[0];
        if (!normalized) normalized = linkHref;
        const section = linkHref.includes('#') ? linkHref.split('#')[1] : '';
        const isAllowedAboutLink = allowedAboutDropdownItems.has(normalized) ||
          (normalized === 'about.html' && ['funders-message', 'organization', 'teams', 'staff'].includes(section));

        if (!isAllowedAboutLink) {
          link.closest('li')?.remove();
        }
      });
      return;
    }

    const template = standardDropdownTemplates[href] || standardDropdownTemplates[href.replace(/\?.*$/, '')];
    if (template && menu.children.length === 0) {
      menu.innerHTML = template.map(([url, label]) => `<li><a href="${url}">${label}</a></li>`).join('');
    }
  });
}

restoreDropdownOptions();

let footer = document.querySelector('.site-footer');
if (!footer) {
  footer = document.createElement('footer');
  footer.className = 'site-footer';
  document.body.appendChild(footer);
}
footer.innerHTML = footerMarkup;

const footerProjectList = document.getElementById('footerOngoingProjects');
if (footerProjectList) {
  footerProjectList.innerHTML = getFooterProjects().map((project) => `
    <li><div>
      <p><a href="ongoing-projects.html?project=${encodeURIComponent(footerSlugify(project.name))}">${footerEscape(project.name)}</a></p>
      <small>${footerEscape(project.category || 'Ongoing project')}</small>
      <small>${footerEscape(project.description || 'Ongoing development project')}</small>
    </div></li>
  `).join('');
}
