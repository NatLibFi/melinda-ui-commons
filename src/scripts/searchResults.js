//****************************************************************************//
//                                                                            //
// Search result listings (styles/searchResults.css)                          //
//                                                                            //
//****************************************************************************//
//
// Opens and closes the sub-items of a result group ("Show sub-collections")
// and the filters sidebar. The control is a button with aria-expanded and
// aria-controls pointing to the element it shows and hides:
//
//    <button class="link icon-link search-result-group-toggle" type="button"
//            aria-expanded="false" aria-controls="group-1-items"
//            data-search-results-toggle
//            data-show-text="Show sub-collections"
//            data-hide-text="Hide sub-collections"
//            data-collapsed-icon="fa-plus" data-expanded-icon="fa-minus">
//      <i class="fa-light fa-plus icon-link-icon" aria-hidden="true"></i>
//      <span class="icon-link-text">Show sub-collections</span>
//    </button>
//    <ul class="search-result-list" id="group-1-items" hidden>...</ul>
//
//    - pressing the button toggles aria-expanded and the hidden attribute
//      of the controlled element
//    - data-show-text / data-hide-text change the text of .icon-link-text
//      (or of .search-filters-toggle-text, or the whole button)
//    - data-collapsed-icon / data-expanded-icon swap the icon class of the
//      icon in the button that has one of them (for example fa-plus and
//      fa-minus, or fa-chevron-down and fa-chevron-up); other icons, such
//      as the filter icon, stay as they are
//
// initializeSearchResults(root) adds the behaviour to every
// [data-search-results-toggle] button and every [data-search-page] under
// root (default: document). It can be called again after adding results;
// each element is set up only once.
//
//----------------------------------------------------------------------------//
//
// Filtering, sorting and paging in the browser
//
// For short result lists that are all on the page. A [data-search-page]
// element holds the filters and the results:
//
//    <div data-search-page data-page-size="5">
//      <aside class="search-filters">
//        <fieldset class="search-filters-group">
//          <legend>Services for</legend>
//          <label><input type="checkbox" data-search-filter
//                        name="for" value="persons"> Private persons</label>
//        </fieldset>
//        <button type="button" data-search-results-clear>Clear all</button>
//      </aside>
//      <section class="search-results">
//        <h2 class="search-results-title">Collections</h2>
//        <p class="search-results-count" role="status"></p>
//        <select data-search-sort>
//          <option>Relevancy</option>
//          <option data-sort-key="name" data-sort-order="ascending">A - Ö
//          <option data-sort-key="date" data-sort-order="descending">Newest
//        </select>
//        <ul class="search-results-active-filters" aria-label="..."></ul>
//        <ul class="search-result-list">
//          <li data-filters="persons digitised" data-sort-date="2021">
//            <article class="search-result-item">...</article>
//          </li>
//        </ul>
//        <p class="search-results-empty" hidden>No results</p>
//        <nav class="pagination search-results-pagination"
//             aria-label="Search result pages"></nav>
//      </section>
//    </div>
//
//    - filters: checked [data-search-filter] checkboxes. Within one name
//      (one fieldset) a result needs any of the values, across names all
//      of them. data-filters on the <li> lists the values of the result
//    - filter tags: a remove button for every checked filter is drawn into
//      .search-results-active-filters; pressing it unchecks the filter.
//      [data-search-results-clear] unchecks all
//    - sorting: the selected <option> of [data-search-sort] gives the key
//      and order. Keys: name (data-sort-name or the heading text, natural
//      order of the page language) or any data-sort-<key> of the <li>
//      (numbers or ISO dates). No key: the original (relevancy) order
//    - paging: data-page-size results at a time; the pagination links are
//      drawn into .search-results-pagination. Without it, all are shown
//    - count: .search-results-count gets data-count-text of the page,
//      default "Showing search results {start} - {end} / {total}", and
//      data-empty-count-text when nothing matches; .search-results-empty
//      is shown then
//    - texts: data-remove-filter-text (", remove filter"), data-page-text
//      ("Page "), data-previous-text ("Previous"), data-next-text ("Next")
//
// Sort and filter on the server instead when the results do not all fit
// on one page load.
//
//****************************************************************************//


export function initializeSearchResults(root = document) {
  const toggles = root.querySelectorAll('[data-search-results-toggle]');

  toggles.forEach(toggle => {
    if (toggle.dataset.searchResultsToggleReady) {
      return;
    }

    toggle.dataset.searchResultsToggleReady = 'true';
    toggle.addEventListener('click', () => setExpanded(toggle, toggle.getAttribute('aria-expanded') !== 'true'));
  });

  root.querySelectorAll('[data-search-page]').forEach(page => {
    if (page.dataset.searchPageReady) {
      return;
    }

    page.dataset.searchPageReady = 'true';
    initializeSearchPage(page);
  });
}

export function setExpanded(toggle, expanded) {
  const target = document.getElementById(toggle.getAttribute('aria-controls'));

  toggle.setAttribute('aria-expanded', String(expanded));

  if (target) {
    target.hidden = !expanded;
  }

  const text = expanded ? toggle.dataset.hideText : toggle.dataset.showText;

  if (text) {
    const textElement = toggle.querySelector('.icon-link-text, .search-filters-toggle-text') || toggle;
    textElement.textContent = text;
  }

  const {collapsedIcon, expandedIcon} = toggle.dataset;

  if (!collapsedIcon || !expandedIcon) {
    return;
  }

  const icon = toggle.querySelector(`.${collapsedIcon}, .${expandedIcon}`);

  if (icon) {
    icon.classList.remove(expanded ? collapsedIcon : expandedIcon);
    icon.classList.add(expanded ? expandedIcon : collapsedIcon);
  }
}


//----------------------------------------------------------------------------//
// Filtering, sorting and paging


function initializeSearchPage(page) {
  const list = page.querySelector('.search-result-list');

  if (!list) {
    return;
  }

  const items = [...list.children];
  items.forEach((item, index) => {
    item.dataset.searchOrder = String(index);
  });

  const state = {page, list, items, currentPage: 1};

  page.querySelectorAll('[data-search-filter]').forEach(input => {
    input.addEventListener('change', () => {
      state.currentPage = 1;
      updateSearchPage(state);
    });
  });

  page.querySelector('[data-search-sort]')?.addEventListener('change', () => {
    state.currentPage = 1;
    updateSearchPage(state);
  });

  page.querySelectorAll('[data-search-results-clear]').forEach(button => {
    button.addEventListener('click', () => {
      page.querySelectorAll('[data-search-filter]').forEach(input => {
        input.checked = false;
      });
      state.currentPage = 1;
      updateSearchPage(state);
    });
  });

  updateSearchPage(state);
}

function updateSearchPage(state) {
  const {page, list, items} = state;
  const checkedFilters = [...page.querySelectorAll('[data-search-filter]:checked')];
  const matching = sortItems(items.filter(item => matchesFilters(item, checkedFilters)), page.querySelector('[data-search-sort]'));

  const pageSize = Number(page.dataset.pageSize) || matching.length || 1;
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  state.currentPage = Math.min(state.currentPage, pageCount);
  const start = (state.currentPage - 1) * pageSize;
  const shown = new Set(matching.slice(start, start + pageSize));

  matching.forEach(item => list.append(item));
  items.forEach(item => {
    item.hidden = !shown.has(item);
  });

  updateCount(page, matching.length, start, shown.size);
  updateFilterTags(state, checkedFilters);
  updatePagination(state, pageCount);

  const empty = page.querySelector('.search-results-empty');

  list.hidden = matching.length === 0;

  if (empty) {
    empty.hidden = matching.length > 0;
  }
}

function matchesFilters(item, checkedFilters) {
  const values = (item.dataset.filters || '').split(/\s+/u);
  const groups = new Map();

  checkedFilters.forEach(input => {
    const group = groups.get(input.name) || [];
    group.push(input.value);
    groups.set(input.name, group);
  });

  return [...groups.values()].every(group => group.some(value => values.includes(value)));
}

function sortItems(items, select) {
  const option = select?.selectedOptions[0];
  const key = option?.dataset.sortKey;
  const direction = option?.dataset.sortOrder === 'descending' ? -1 : 1;
  const originalOrder = (a, b) => Number(a.dataset.searchOrder) - Number(b.dataset.searchOrder);

  if (!key) {
    return [...items].sort(originalOrder);
  }

  const collator = new Intl.Collator(document.documentElement.lang || undefined, {numeric: true, sensitivity: 'base'});

  return [...items].sort((a, b) => {
    const result = key === 'name'
      ? collator.compare(sortName(a), sortName(b))
      : compareValues(a.dataset[sortDataKey(key)], b.dataset[sortDataKey(key)], collator);

    return result * direction || originalOrder(a, b);
  });
}

function sortName(item) {
  return item.dataset.sortName || item.querySelector('.search-result-heading')?.textContent.trim() || '';
}

function sortDataKey(key) {
  return `sort${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function compareValues(a = '', b = '', collator) {
  const numberA = Number(a);
  const numberB = Number(b);

  if (a !== '' && b !== '' && !Number.isNaN(numberA) && !Number.isNaN(numberB)) {
    return numberA - numberB;
  }

  return collator.compare(a, b);
}

function updateCount(page, total, start, shownCount) {
  const count = page.querySelector('.search-results-count');

  if (!count) {
    return;
  }

  if (total === 0) {
    count.textContent = page.dataset.emptyCountText || 'No search results';
    return;
  }

  const template = page.dataset.countText || 'Showing search results {start} - {end} / {total}';
  count.textContent = template
    .replace('{start}', String(start + 1))
    .replace('{end}', String(start + shownCount))
    .replace('{total}', String(total));
}

function updateFilterTags(state, checkedFilters) {
  const {page} = state;
  const tags = page.querySelector('.search-results-active-filters');

  if (!tags) {
    return;
  }

  const removeText = page.dataset.removeFilterText || ', remove filter';

  tags.replaceChildren(...checkedFilters.map(input => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const icon = document.createElement('span');
    const hiddenText = document.createElement('span');

    button.type = 'button';
    button.className = 'tag-wrapper filter';
    button.dataset.filterId = filterId(input);
    icon.className = 'material-icons icon-close';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'close';
    hiddenText.className = 'visually-hidden';
    hiddenText.textContent = removeText;
    button.append(filterLabel(input), icon, hiddenText);

    button.addEventListener('click', () => {
      const next = item.nextElementSibling?.querySelector('button') || item.previousElementSibling?.querySelector('button');
      const nextId = next?.dataset.filterId;

      input.checked = false;
      state.currentPage = 1;
      updateSearchPage(state);

      // Keep the keyboard focus in the tags, or move it to the results title
      const focusTarget = nextId ? tags.querySelector(`[data-filter-id="${nextId}"]`) : null;
      focusElement(focusTarget || page.querySelector('.search-results-title'));
    });

    item.append(button);
    return item;
  }));

  tags.hidden = checkedFilters.length === 0;
}

function filterId(input) {
  return `${input.name}:${input.value}`.replace(/"/gu, '');
}

function filterLabel(input) {
  if (input.dataset.filterLabel) {
    return input.dataset.filterLabel;
  }

  const label = input.closest('label') || (input.id && input.ownerDocument.querySelector(`label[for="${input.id}"]`));
  return label ? label.textContent.trim() : input.value;
}

function updatePagination(state, pageCount) {
  const {page} = state;
  const nav = page.querySelector('.search-results-pagination');

  if (!nav) {
    return;
  }

  nav.hidden = pageCount <= 1;

  if (pageCount <= 1) {
    nav.replaceChildren();
    return;
  }

  const current = state.currentPage;
  const steps = document.createElement('div');
  steps.className = 'pagination-steps';

  if (current > 1) {
    steps.append(pageStep(state, current - 1, 'prev', page.dataset.previousText || 'Previous'));
  }

  if (current > 1 && current < pageCount) {
    const separator = document.createElement('span');
    separator.className = 'pagination-step-separator';
    separator.setAttribute('aria-hidden', 'true');
    steps.append(separator);
  }

  if (current < pageCount) {
    steps.append(pageStep(state, current + 1, 'next', page.dataset.nextText || 'Next'));
  }

  const pages = document.createElement('ol');
  pages.className = 'pagination-pages';

  for (let number = 1; number <= pageCount; number++) {
    const item = document.createElement('li');
    const link = pageLink(state, number, 'pagination-page');
    const hiddenText = document.createElement('span');

    hiddenText.className = 'visually-hidden';
    hiddenText.textContent = page.dataset.pageText || 'Page ';
    link.append(hiddenText, String(number));

    if (number === current) {
      link.setAttribute('aria-current', 'page');
    }

    item.append(link);
    pages.append(item);
  }

  nav.replaceChildren(steps, pages);
}

function pageStep(state, number, rel, text) {
  const link = pageLink(state, number, 'pagination-step');
  const icon = document.createElement('i');
  const label = document.createElement('span');

  link.rel = rel;
  icon.className = `fa-light ${rel === 'prev' ? 'fa-chevron-left' : 'fa-chevron-right'} pagination-step-icon`;
  icon.setAttribute('aria-hidden', 'true');
  label.className = 'pagination-step-text';
  label.textContent = text;

  if (rel === 'prev') {
    link.append(icon, label);
  } else {
    link.append(label, icon);
  }

  return link;
}

function pageLink(state, number, className) {
  const link = document.createElement('a');

  link.className = className;
  link.href = `#page-${number}`;
  link.addEventListener('click', event => {
    event.preventDefault();
    state.currentPage = number;
    updateSearchPage(state);

    // Start reading the new page from the results title
    focusElement(state.page.querySelector('.search-results-title'));
  });

  return link;
}

function focusElement(element) {
  if (!element) {
    return;
  }

  if (!element.matches('a, button, input, select, textarea, [tabindex]')) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus();
}
