const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  document.body.classList.add('is-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const heroCarousel = document.getElementById('homeHeroCarousel');
if (heroCarousel) {
  const slides = heroCarousel.querySelectorAll('.carousel-item');
  const indicators = heroCarousel.querySelector('[data-carousel-indicators]');

  slides.forEach((slide, index) => {
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.dataset.bsTarget = '#homeHeroCarousel';
    indicator.dataset.bsSlideTo = String(index);
    indicator.setAttribute('aria-label', `Slide ${index + 1}`);

    if (slide.classList.contains('active')) {
      indicator.classList.add('active');
      indicator.setAttribute('aria-current', 'true');
    }

    indicators.append(indicator);
  });
}