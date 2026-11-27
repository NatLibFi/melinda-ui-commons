//****************************************************************************//
//                                                                            //
// Sortable tables (styles/table.css)                                         //
//                                                                            //
//****************************************************************************//
//
// A column of a .table can be sorted when its header cell holds a
// .table-sort button:
//
//    <th scope="col">
//      <button class="table-sort" type="button" data-sort-type="number">
//        2025 <i class="fa-light fa-arrow-up-arrow-down table-sort-icon"
//                aria-hidden="true"></i>
//      </button>
//    </th>
//
// Pressing the button sorts the rows of the <tbody> by that column: first
// ascending, then descending, then ascending again. The <thead> and <tfoot>
// rows stay where they are. Rows with equal values keep their order.
//
//    - aria-sort="ascending" / "descending" is set on the sorted header cell
//      and removed from the others, so screen readers tell the sort order
//    - the icon of the sorted column changes to fa-arrow-up (ascending) or
//      fa-arrow-down (descending), the others back to fa-arrow-up-arrow-down
//    - an element with .table-sort-status inside the .table-wrapper (or right
//      after the table) gets a short text, for example "Sorted by 2025,
//      ascending". Make it a live region (aria-live="polite") to announce it.
//      The text comes from data-sort-status on the table, "{column}" and
//      "{order}" are replaced; the order words from data-sort-ascending and
//      data-sort-descending. Defaults: "Sorted by {column}, {order}",
//      "ascending", "descending"
//
// Sort types (data-sort-type on the button):
//    text     (default) natural order of the page language: "a2" before "a10"
//    number   "1 234,5" and "1234.5" are numbers; empty and non-number cells
//             go last
//    date     ISO dates (2025-12-01) and Finnish dates (1.12.2025)
//
// A cell can give its own sort value with data-sort-value, for example
//    <td data-sort-value="2025-12-01">Monday 1 December</td>
//
// To start with a sorted table, set aria-sort on the header cell in the HTML;
// the rows must then already be in that order.
//
// Call initializeTables() once after the page has loaded, and again with the
// new element as root after adding sortable tables to the page.

const initializedButtons = new WeakSet();

const icons = {
  none: 'fa-arrow-up-arrow-down',
  ascending: 'fa-arrow-up',
  descending: 'fa-arrow-down'
};


export function initializeTables(root = document) {
  root.querySelectorAll('.table .table-sort').forEach(button => {
    if (initializedButtons.has(button)) {
      return;
    }

    initializedButtons.add(button);
    button.addEventListener('click', () => sortByButton(button));

    const headerCell = button.closest('th');
    updateIcon(button, headerCell.getAttribute('aria-sort') || 'none');
  });
}


export function sortTable(table, columnIndex, order = 'ascending') {
  const headerCell = getHeaderCell(table, columnIndex);
  const button = headerCell?.querySelector('.table-sort');

  if (!headerCell || !button) {
    return;
  }

  const body = table.tBodies[0];
  const type = button.dataset.sortType || 'text';
  const compare = getComparer(type);
  const direction = order === 'descending' ? -1 : 1;

  const rows = Array.from(body.rows).map((row, index) => ({
    row,
    index,
    value: parseValue(getSortText(row.cells[columnIndex]), type)
  }));

  rows.sort((a, b) => {
    // Empty values go last in both orders
    if (a.value === null || b.value === null) {
      return (a.value === null) - (b.value === null) || a.index - b.index;
    }

    return (compare(a.value, b.value) * direction) || a.index - b.index;
  });

  body.append(...rows.map(({row}) => row));

  table.querySelectorAll('thead th').forEach(cell => {
    const cellButton = cell.querySelector('.table-sort');

    if (cell === headerCell) {
      cell.setAttribute('aria-sort', order);
      updateIcon(cellButton, order);
      return;
    }

    cell.removeAttribute('aria-sort');

    if (cellButton) {
      updateIcon(cellButton, 'none');
    }
  });

  updateStatus(table, button, order);
}


function sortByButton(button) {
  const headerCell = button.closest('th');
  const table = button.closest('table');
  const current = headerCell.getAttribute('aria-sort');
  const order = current === 'ascending' ? 'descending' : 'ascending';

  sortTable(table, getColumnIndex(headerCell), order);
}


function getHeaderCell(table, columnIndex) {
  const headerRow = table.tHead?.rows[table.tHead.rows.length - 1];
  return headerRow?.cells[columnIndex];
}

function getColumnIndex(headerCell) {
  return Array.from(headerCell.parentElement.cells).indexOf(headerCell);
}

function getSortText(cell) {
  if (!cell) {
    return '';
  }

  return (cell.dataset.sortValue ?? cell.textContent).trim();
}


function parseValue(text, type) {
  if (text === '') {
    return null;
  }

  if (type === 'number') {
    const number = Number(text.replace(/[\s  ]/gu, '').replace(',', '.').replace(/^[−–]/u, '-'));
    return Number.isNaN(number) ? null : number;
  }

  if (type === 'date') {
    return parseDate(text);
  }

  return text;
}

function parseDate(text) {
  const finnish = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/u);

  if (finnish) {
    const [, day, month, year] = finnish;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const time = Date.parse(text);
  return Number.isNaN(time) ? null : time;
}

function getComparer(type) {
  if (type === 'number' || type === 'date') {
    return (a, b) => a - b;
  }

  const language = document.documentElement.lang || undefined;
  const collator = new Intl.Collator(language, {numeric: true, sensitivity: 'base'});
  return (a, b) => collator.compare(a, b);
}


function updateIcon(button, order) {
  const icon = button.querySelector('.table-sort-icon');

  if (!icon) {
    return;
  }

  icon.classList.remove(...Object.values(icons));
  icon.classList.add(icons[order] || icons.none);
}

function updateStatus(table, button, order) {
  const wrapper = table.closest('.table-wrapper');
  const status = wrapper?.querySelector('.table-sort-status')
    ?? (table.nextElementSibling?.matches('.table-sort-status') ? table.nextElementSibling : null);

  if (!status) {
    return;
  }

  const template = table.dataset.sortStatus || 'Sorted by {column}, {order}';
  const orderText = order === 'descending'
    ? table.dataset.sortDescending || 'descending'
    : table.dataset.sortAscending || 'ascending';

  status.textContent = template
    .replace('{column}', button.textContent.trim())
    .replace('{order}', orderText);
}
