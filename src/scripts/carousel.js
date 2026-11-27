//****************************************************************************//
//                                                                            //
// Carousels (styles/carousel.css)                                            //
//                                                                            //
//****************************************************************************//
//
// For each .carousel:
//    - the previous and next buttons (.carousel-previous, .carousel-next)
//      scroll the track by one page: as many liftups as fit in the view
//    - the buttons are disabled at the start and at the end of the track
//    - .carousel-indicators gets one button per page. The current page has
//      aria-current="true". The page buttons are rebuilt when the carousel
//      width changes, because the number of pages depends on it
//
// The liftups are links in a scrolling list, so keyboard users can also tab
// through them: the browser scrolls the focused liftup into view, and the
// buttons and indicators follow the scroll position.
//
// Screen reader text of a page button comes from data-carousel-page-label on
// .carousel-indicators, "{page}" and "{pages}" are replaced:
//    data-carousel-page-label="Sivu {page} / {pages}"
// Default: "Page {page} of {pages}".
//
// Call initializeCarousels() once after the page has loaded, and again with
// the new element as root after adding carousels to the page.

const initializedCarousels = new WeakSet();


export function initializeCarousels(root = document) {
  root.querySelectorAll('.carousel').forEach(carousel => {
    if (!initializedCarousels.has(carousel)) {
      initializeCarousel(carousel);
      initializedCarousels.add(carousel);
    }
  });
}


function initializeCarousel(carousel) {
  const track = carousel.querySelector('.carousel-track');

  if (!track) {
    return;
  }

  const previousButton = carousel.querySelector('.carousel-previous');
  const nextButton = carousel.querySelector('.carousel-next');
  const indicators = carousel.querySelector('.carousel-indicators');

  let pageCount = 0;

  previousButton?.addEventListener('click', () => scrollByPage(-1));
  nextButton?.addEventListener('click', () => scrollByPage(1));
  track.addEventListener('scroll', update, {passive: true});
  new ResizeObserver(() => {
    buildIndicators();
    update();
  }).observe(track);


  function getItems() {
    return Array.from(track.querySelectorAll('.carousel-item'));
  }

  // Distance from the start of one liftup to the next, and liftups per page
  function getLayout() {
    const items = getItems();

    if (items.length === 0) {
      return {items, step: 0, perPage: 1};
    }

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = items[0].getBoundingClientRect().width + gap;
    const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const visibleWidth = track.clientWidth - (2 * padding) + gap;
    const perPage = Math.max(1, Math.floor((visibleWidth + 1) / step));

    return {items, step, perPage};
  }

  function getCurrentPage() {
    const {step, perPage} = getLayout();

    if (isAtEnd()) {
      return pageCount - 1;
    }

    return step ? Math.round(track.scrollLeft / (step * perPage)) : 0;
  }

  function isAtStart() {
    return track.scrollLeft <= 1;
  }

  function isAtEnd() {
    return track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  }

  function scrollToPage(page) {
    // All liftups in a carousel are as wide, so page n starts n * perPage steps in
    const {items, step, perPage} = getLayout();
    const index = Math.min(Math.max(page, 0) * perPage, Math.max(items.length - 1, 0));

    track.scrollTo({left: index * step});
  }

  function scrollByPage(direction) {
    scrollToPage(getCurrentPage() + direction);
  }

  function buildIndicators() {
    const {items, perPage} = getLayout();
    const fitsInView = track.scrollWidth <= track.clientWidth + 1;
    const newPageCount = fitsInView ? 1 : Math.ceil(items.length / perPage);

    if (newPageCount === pageCount) {
      return;
    }

    pageCount = newPageCount;

    if (!indicators) {
      return;
    }

    const label = indicators.dataset.carouselPageLabel || 'Page {page} of {pages}';
    indicators.replaceChildren();

    if (pageCount < 2) {
      return;
    }

    for (let page = 0; page < pageCount; page++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'carousel-indicator';
      button.setAttribute('aria-label', label.replace('{page}', page + 1).replace('{pages}', pageCount));
      button.addEventListener('click', () => scrollToPage(page));
      indicators.appendChild(button);
    }
  }

  function update() {
    if (previousButton) {
      previousButton.disabled = isAtStart();
    }

    if (nextButton) {
      nextButton.disabled = isAtEnd();
    }

    if (!indicators) {
      return;
    }

    const currentPage = getCurrentPage();

    Array.from(indicators.children).forEach((button, page) => {
      if (page === currentPage) {
        button.setAttribute('aria-current', 'true');
        return;
      }

      button.removeAttribute('aria-current');
    });
  }
}
