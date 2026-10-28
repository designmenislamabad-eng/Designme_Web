const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
const footerProjectStorageKey = 'designmenFooterProjectIds';
const defaultFooterProjects = [
  { id: '1', name: '60 MW Shalfalam HPP', category: 'Hydropower', description: 'Hydropower feasibility, design, and project management.' },
  { id: '2', name: 'Parliament Building, Islamabad', category: 'Buildings', description: 'Structural and architectural design services for a national landmark.' },
  { id: '3', name: 'Strategic Environmental Assessment AJK', category: 'Environment', description: 'Environmental planning and impact assessment for regional projects.' }
];

function addMediaDropdown() {
  const mediaLink = document.querySelector('.site-nav a[href="media.html"]');
  if (!mediaLink || mediaLink.parentElement.classList.contains('nav-dropdown')) return;

  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown';
  mediaLink.parentElement.insertBefore(dropdown, mediaLink);
  dropdown.appendChild(mediaLink);
  dropdown.insertAdjacentHTML('beforeend', '<ul class="dropdown-menu"><li><a href="news-events.html">News and Events</a></li><li><a href="gallery.html">Gallery</a></li></ul>');
}

addMediaDropdown();

function getHomeProjects() {
  try {
    const stored = JSON.parse(localStorage.getItem('designmenProjects') || '[]');
    return Array.isArray(stored) && stored.length ? stored : defaultFooterProjects;
  } catch (error) {
    return defaultFooterProjects;
  }
}

function getSelectedFooterProjects() {
  const allProjects = getHomeProjects();
  const selectedIds = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem(footerProjectStorageKey) || '[]');
      return Array.isArray(stored) ? stored.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  })();

  if (selectedIds.length) {
    const selected = selectedIds
      .map((id) => allProjects.find((project) => String(project.id) === String(id)))
      .filter(Boolean)
      .slice(0, 3);

    if (selected.length) return selected;
  }

  return allProjects.slice(0, 3);
}

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

function renderFooterProjects() {
  const container = document.getElementById('footerOngoingProjects');
  const learnMoreLink = document.getElementById('footerLearnMore');
  if (!container) return;

  const projects = getSelectedFooterProjects();

  container.innerHTML = projects.map((project) => {
    const href = `ongoing-projects.html?project=${encodeURIComponent(slugify(project.name))}`;
    const description = project.description || project.category || 'Ongoing development project';

    return `
      <li>
        <div>
          <p><a href="${href}">${project.name}</a></p>
          <small>${project.category || 'Ongoing project'}</small>
          <small>${description}</small>
        </div>
      </li>
    `;
  }).join('');

  if (learnMoreLink) {
    learnMoreLink.href = 'ongoing-projects.html';
  }
}

function loadBackgroundImage(element) {
  if (!element.dataset.bg) return;
  element.style.backgroundImage = `url("${element.dataset.bg}")`;
  delete element.dataset.bg;
}

let slideIndex = 0;
let sliderTimer = null;
let slideTransitionTimer = null;

function showSlide(index, animate = true) {
  const nextIndex = (index + slides.length) % slides.length;
  if (nextIndex === slideIndex && slides[slideIndex]?.classList.contains('active')) return;

  const currentSlide = slides[slideIndex];
  const nextSlide = slides[nextIndex];
  clearTimeout(slideTransitionTimer);

  slides.forEach((slide) => {
    slide.classList.remove('active', 'leaving', 'entering', 'text-sequence');
  });

  if (animate && currentSlide && currentSlide !== nextSlide) {
    currentSlide.classList.add('leaving');
  }

  slideIndex = nextIndex;
  loadBackgroundImage(nextSlide);
  nextSlide.classList.add('active');

  if (animate && currentSlide && currentSlide !== nextSlide) {
    nextSlide.classList.add('entering', 'text-sequence');
    slideTransitionTimer = setTimeout(() => {
      currentSlide.classList.remove('leaving');
      nextSlide.classList.remove('entering');
    }, 1000);
  }

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === slideIndex);
  });
}

function startSlider(delay = 4000) {
  sliderTimer = setTimeout(() => {
    showSlide(slideIndex + 1);
    startSlider();
  }, delay);
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    clearTimeout(sliderTimer);
    startSlider();
  });
});

if (slides.length > 0) {
  showSlide(0, false);
  startSlider(4000);
}

document.addEventListener('designmen:homepage-content', (event) => {
  const activeSlides = (event.detail.heroSlides || []).slice(0, slides.length);
  if (!activeSlides.length) return;
  clearTimeout(sliderTimer);
  slides.forEach((slide, index) => {
    const item = activeSlides[index];
    slide.hidden = !item;
    if (!item) return;
    const heading = slide.querySelector('h1');
    const subheading = slide.querySelector('h2');
    const description = slide.querySelector('.hero-content > p');
    if (heading) {
      heading.replaceChildren(...String(item.title || '').split(/\s+/).filter(Boolean).map((word) => {
        const span = document.createElement('span');
        span.className = 'highlight-word';
        span.textContent = word;
        return span;
      }));
    }
    if (subheading) subheading.textContent = item.subtitle || '';
    if (description) description.textContent = item.description || '';
    const imageUrl = String(item.image_url || '').trim();
    if (/^(https?:\/\/|assets\/|\.\/|\/)/i.test(imageUrl)) {
      slide.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
      delete slide.dataset.bg;
    }
  });
  dots.forEach((dot, index) => { dot.hidden = index >= activeSlides.length; });
  slides.splice(0, slides.length, ...slides.filter((slide) => !slide.hidden));
  dots.splice(0, dots.length, ...dots.filter((dot) => !dot.hidden));
  slideIndex = -1;
  showSlide(0, false);
  startSlider(4000);
});

const counters = document.querySelectorAll('.count');
const counterAnimationFrames = new WeakMap();

const getCounterValue = (target) => {
  return target === 100 ? `${target}%` : `${target}+`;
};

const animateCounter = (element) => {
  const existingFrame = counterAnimationFrames.get(element);
  if (existingFrame) cancelAnimationFrame(existingFrame);

  const target = Number(element.dataset.target || 0);
  const duration = 1400;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = value + (target === 100 ? '%' : '+');

    if (progress < 1) {
      counterAnimationFrames.set(element, requestAnimationFrame(tick));
    } else {
      element.textContent = getCounterValue(target);
      counterAnimationFrames.delete(element);
    }
  };

  element.textContent = target === 100 ? '0%' : '0+';
  counterAnimationFrames.set(element, requestAnimationFrame(tick));
};

const checkCounters = () => {
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      }
    });
  });

  counters.forEach((counter) => observer.observe(counter));
};

const newsCards = document.querySelectorAll('.news-card');

const setNewsCardExpanded = (card, expanded) => {
  const button = card.querySelector('.news-button');
  if (!button) return;

  card.classList.toggle('expanded', expanded);
  const label = button.querySelector('span');
  if (label) {
    label.textContent = expanded ? 'Show less' : 'Learn more';
  } else {
    button.textContent = expanded ? 'Show less' : 'Learn more';
  }
  button.setAttribute('aria-expanded', String(expanded));
};

const updateNewsCardState = () => {
  newsCards.forEach((card) => {
    const text = card.querySelector('.news-text');
    const button = card.querySelector('.news-button');

    if (!text || !button) return;

    const hasOverflow = text.scrollHeight > text.clientHeight + 1;
    card.classList.toggle('has-more', hasOverflow);

    if (!hasOverflow && card.classList.contains('expanded')) setNewsCardExpanded(card, false);
    button.setAttribute('aria-expanded', String(card.classList.contains('expanded')));
  });
};

newsCards.forEach((card) => {
  const button = card.querySelector('.news-button');
  if (!button) return;

  button.addEventListener('click', (event) => {
    event.preventDefault();
    setNewsCardExpanded(card, !card.classList.contains('expanded'));
  });
});

document.addEventListener('click', (event) => {
  const clickedCard = event.target instanceof Element ? event.target.closest('.news-card') : null;
  newsCards.forEach((card) => {
    if (card !== clickedCard && card.classList.contains('expanded')) setNewsCardExpanded(card, false);
  });
});

const testimonialSlides = Array.from(document.querySelectorAll('.testimonial-slide'));
const testimonialDots = Array.from(document.querySelectorAll('.testimonial-dot'));
const testimonialArrowLeft = document.querySelector('.testimonial-arrow.left');
const testimonialArrowRight = document.querySelector('.testimonial-arrow.right');

let testimonialIndex = 0;
let testimonialTimer = null;

function showTestimonial(index) {
  testimonialIndex = (index + testimonialSlides.length) % testimonialSlides.length;

  testimonialSlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === testimonialIndex);
  });

  testimonialDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === testimonialIndex);
  });
}

function startTestimonialSlider() {
  testimonialTimer = setInterval(() => {
    showTestimonial(testimonialIndex + 1);
  }, 5000);
}

testimonialDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showTestimonial(index);
    clearInterval(testimonialTimer);
    startTestimonialSlider();
  });
});

if (testimonialArrowLeft) {
  testimonialArrowLeft.addEventListener('click', () => {
    showTestimonial(testimonialIndex - 1);
    clearInterval(testimonialTimer);
    startTestimonialSlider();
  });
}

if (testimonialArrowRight) {
  testimonialArrowRight.addEventListener('click', () => {
    showTestimonial(testimonialIndex + 1);
    clearInterval(testimonialTimer);
    startTestimonialSlider();
  });
}

if (testimonialSlides.length > 0) {
  showTestimonial(0);
  startTestimonialSlider();
}

const serviceSlides = Array.from(document.querySelectorAll('.service-slide'));
const serviceDots = Array.from(document.querySelectorAll('.service-dot'));
const serviceArrowLeft = document.querySelector('.services-arrow.left');
const serviceArrowRight = document.querySelector('.services-arrow.right');

let serviceIndex = 0;
let serviceSliderTimer = null;
let serviceTransitionTimer = null;
let serviceTransitioning = false;
const serviceContentRevealDuration = 1250;
const serviceContentDisplayDuration = 3000;
const serviceHeadingExitDuration = 350;
const serviceImageExitDuration = 650;

function preloadServiceImage(index) {
  const image = serviceSlides[index]?.querySelector('.service-image');
  const source = image?.dataset.bg;
  if (!source || image.dataset.preloading === 'true') return;

  image.dataset.preloading = 'true';
  const preload = new Image();
  preload.src = source;
}

function activateService(index) {
  const nextSlide = serviceSlides[index];
  loadBackgroundImage(nextSlide.querySelector('.service-image'));
  serviceSlides.forEach((slide) => {
    slide.classList.remove(
      'active',
      'entering',
      'image-exiting',
      'content-sequence',
      'service-heading-exiting',
      'service-heading-hidden',
      'service-paragraph-exiting',
      'service-paragraph-hidden',
      'service-copy-exited'
    );
    slide.querySelectorAll('.service-copy, .service-copy h3, .service-copy p')
      .forEach((element) => element.style.removeProperty('visibility'));
  });

  serviceIndex = index;
  nextSlide.classList.add('active', 'entering', 'content-sequence');
  serviceTransitioning = true;
  preloadServiceImage((serviceIndex + 1) % serviceSlides.length);

  serviceTransitionTimer = setTimeout(() => {
    nextSlide.classList.remove('entering');
    serviceTransitioning = false;
  }, 650);

  serviceDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === serviceIndex);
  });

  startServiceSlider(serviceContentRevealDuration + serviceContentDisplayDuration);
}

function showService(index) {
  if (!serviceSlides.length) return;
  if (serviceTransitioning) return;

  const nextIndex = (index + serviceSlides.length) % serviceSlides.length;
  const currentSlide = serviceSlides[serviceIndex];
  clearTimeout(serviceSliderTimer);
  clearTimeout(serviceTransitionTimer);

  if (nextIndex === serviceIndex && currentSlide?.classList.contains('active')) {
    startServiceSlider(serviceContentRevealDuration + serviceContentDisplayDuration);
    return;
  }

  if (currentSlide?.classList.contains('active')) {
    serviceTransitioning = true;
    currentSlide.classList.remove('content-sequence');
    currentSlide.classList.add('service-heading-exiting');
    serviceTransitionTimer = setTimeout(() => {
      currentSlide.classList.remove('service-heading-exiting');
      currentSlide.classList.add('service-heading-hidden', 'service-paragraph-exiting');
      serviceTransitionTimer = setTimeout(() => {
        currentSlide.classList.remove('service-paragraph-exiting');
        currentSlide.classList.add('service-paragraph-hidden', 'service-copy-exited', 'image-exiting');
        serviceTransitionTimer = setTimeout(() => {
          activateService(nextIndex);
        }, serviceImageExitDuration);
      }, serviceHeadingExitDuration);
    }, serviceHeadingExitDuration);
    return;
  }

  activateService(nextIndex);
}

function startServiceSlider(delay = serviceContentRevealDuration + serviceContentDisplayDuration) {
  clearTimeout(serviceSliderTimer);
  serviceSliderTimer = setTimeout(() => {
    showService(serviceIndex + 1);
  }, delay);
}

serviceDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showService(index);
  });
});

if (serviceArrowLeft) {
  serviceArrowLeft.addEventListener('click', () => {
    showService(serviceIndex - 1);
  });
}

if (serviceArrowRight) {
  serviceArrowRight.addEventListener('click', () => {
    showService(serviceIndex + 1);
  });
}

if (serviceSlides.length > 0) {
  showService(0);
}

const introSlides = Array.from(document.querySelectorAll('.intro-slide'));
const introDots = Array.from(document.querySelectorAll('.intro-dot'));
const introProgressFill = document.querySelector('.intro-progress-fill');

let introIndex = 0;
let introSliderTimer = null;

function updateIntroProgress() {
  if (!introProgressFill || !introSlides.length) return;
  const progress = ((introIndex + 1) / introSlides.length) * 100;
  introProgressFill.style.width = `${progress}%`;
}

function showIntro(index) {
  if (!introSlides.length) return;

  introIndex = (index + introSlides.length) % introSlides.length;

  introSlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === introIndex);
  });

  introDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === introIndex);
  });

  updateIntroProgress();
}

function startIntroSlider() {
  introSliderTimer = setInterval(() => {
    showIntro(introIndex + 1);
  }, 3000);
}

introDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showIntro(index);
    clearInterval(introSliderTimer);
    startIntroSlider();
  });
});

if (introSlides.length > 0) {
  showIntro(0);
  startIntroSlider();
}

const projectSlides = Array.from(document.querySelectorAll('.project-card'));
const projectDots = Array.from(document.querySelectorAll('.project-dot'));
const projectArrowLeft = document.querySelector('.project-arrow.left');
const projectArrowRight = document.querySelector('.project-arrow.right');

let projectIndex = 0;
let projectSliderTimer = null;
let projectTransitionTimer = null;
let projectTransitioning = false;
const projectContentRevealDuration = 1250;
const projectContentDisplayDuration = 3000;
const projectHeadingExitDuration = 350;
const projectImageExitDuration = 650;

function activateProject(index) {
  const nextSlide = projectSlides[index];
  loadBackgroundImage(nextSlide.querySelector('.project-image'));
  projectSlides.forEach((slide) => {
    slide.classList.remove(
      'active',
      'entering',
      'image-exiting',
      'content-sequence',
      'project-heading-exiting',
      'project-heading-hidden',
      'project-paragraph-exiting',
      'project-paragraph-hidden',
      'project-copy-exited'
    );
    slide.querySelectorAll('.project-copy, .project-copy h3, .project-copy p')
      .forEach((element) => element.style.removeProperty('visibility'));
  });

  projectIndex = index;
  nextSlide.classList.add('active', 'entering', 'content-sequence');
  projectTransitioning = true;
  preloadProjectImage((projectIndex + 1) % projectSlides.length);

  projectTransitionTimer = setTimeout(() => {
    nextSlide.classList.remove('entering');
    projectTransitioning = false;
  }, 650);

  projectDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === projectIndex);
  });

  startProjectSlider(projectContentRevealDuration + projectContentDisplayDuration);
}

function showProject(index) {
  if (!projectSlides.length || projectTransitioning) return;

  const nextIndex = (index + projectSlides.length) % projectSlides.length;
  const currentSlide = projectSlides[projectIndex];
  clearTimeout(projectSliderTimer);
  clearTimeout(projectTransitionTimer);

  if (nextIndex === projectIndex && currentSlide?.classList.contains('active')) {
    startProjectSlider(projectContentRevealDuration + projectContentDisplayDuration);
    return;
  }

  if (currentSlide?.classList.contains('active')) {
    projectTransitioning = true;
    currentSlide.classList.remove('content-sequence');
    currentSlide.classList.add('project-heading-exiting');
    projectTransitionTimer = setTimeout(() => {
      currentSlide.classList.remove('project-heading-exiting');
      currentSlide.classList.add('project-heading-hidden', 'project-paragraph-exiting');
      projectTransitionTimer = setTimeout(() => {
        currentSlide.classList.remove('project-paragraph-exiting');
        currentSlide.classList.add('project-paragraph-hidden', 'project-copy-exited', 'image-exiting');
        projectTransitionTimer = setTimeout(() => {
          activateProject(nextIndex);
        }, projectImageExitDuration);
      }, projectHeadingExitDuration);
    }, projectHeadingExitDuration);
    return;
  }

  activateProject(nextIndex);
}

function preloadProjectImage(index) {
  const image = projectSlides[index]?.querySelector('.project-image');
  const source = image?.dataset.bg;
  if (!source || image.dataset.preloading === 'true') return;

  image.dataset.preloading = 'true';
  const preload = new Image();
  preload.src = source;
}

function startProjectSlider(delay = projectContentRevealDuration + projectContentDisplayDuration) {
  clearTimeout(projectSliderTimer);
  projectSliderTimer = setTimeout(() => {
    showProject(projectIndex + 1);
  }, delay);
}

projectDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showProject(index);
    clearInterval(projectSliderTimer);
    startProjectSlider();
  });
});

if (projectArrowLeft) {
  projectArrowLeft.addEventListener('click', () => {
    showProject(projectIndex - 1);
    clearInterval(projectSliderTimer);
    startProjectSlider();
  });
}

if (projectArrowRight) {
  projectArrowRight.addEventListener('click', () => {
    showProject(projectIndex + 1);
    clearInterval(projectSliderTimer);
    startProjectSlider();
  });
}

if (projectSlides.length > 0) {
  activateProject(0);
}

window.designmenRefreshProjectSlides = (visibleDots) => {
  if (visibleDots) {
    clearTimeout(projectSliderTimer);
    clearTimeout(projectTransitionTimer);
    projectTransitioning = false;
    projectSlides.splice(0, projectSlides.length, ...Array.from(document.querySelectorAll('.project-track .project-card')).filter((slide) => !slide.hidden));
    projectDots.splice(0, projectDots.length, ...visibleDots);
    projectDots.forEach((dot, index) => {
      dot.hidden = index >= projectSlides.length;
    });
    projectIndex = 0;
    if (projectSlides.length) activateProject(0);
  }
  return projectSlides;
};

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll('.stats-item, .company-intro-slider, .client-logo, .testimonial-slide, .news-card');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -40px 0px'
  });

  revealItems.forEach((item) => {
    if (item.dataset.revealSetup === 'true') return;
    item.classList.add('reveal');
    item.dataset.revealSetup = 'true';
    observer.observe(item);
  });
}

function setupLazyBackgrounds() {
  const backgrounds = document.querySelectorAll('[data-bg]:not(.hero-slide)');
  if (!('IntersectionObserver' in window)) {
    backgrounds.forEach(loadBackgroundImage);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadBackgroundImage(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '300px 0px' });

  backgrounds.forEach((element) => observer.observe(element));
}

window.addEventListener('resize', () => {
  updateNewsCardState();
});
checkCounters();
updateNewsCardState();
renderFooterProjects();
setupRevealAnimations();
setupLazyBackgrounds();
