import {showRecordInDiv} from './marcRecordUi.js';

//****************************************************************************//
//                                                                            //
// Record cards (styles/recordCard.css, views/partials/recordCard.hbs)        //
//                                                                            //
//****************************************************************************//
//
//    <div class="record-card" id="record1">
//      <div class="record-card-header">
//        <h3 class="record-card-title">Incoming record</h3>
//        <button class="record-card-toggle" type="button" hidden>
//          <i class="fa-light fa-chevron-down" aria-hidden="true"></i>
//        </button>
//      </div>
//      <div class="record-card-note" hidden></div>
//      <div class="record-card-content"><div class="marc-record"></div></div>
//    </div>
//
// setRecordCard(card, {title, note, record, settings}) fills a card. Only the
// given keys are changed:
//
//    - title: text of the header
//    - note: record info shown under the header, an HTML string (trusted
//      HTML, built by the app) or a Node. false, null or '' removes the note
//      and hides the toggle button. A new note is shown open
//    - record: a MARC record ({leader, fields}), shown with showRecordInDiv()
//      of marcRecordUi.js. An empty record ({}) shows the "No record" text.
//      record.error and record.notes are shown above the fields
//    - settings: settings for showRecordInDiv()
//
// The toggle button shows and hides the note. It has aria-expanded and
// aria-controls, its label comes from data attributes on the .record-card:
// data-show-label (default "Show record info"), data-hide-label ("Hide
// record info"). data-empty-label ("No record") is the text of an empty card.
//
// initializeRecordCards(root) prepares every .record-card under root (toggle
// listener, ids, labels). setRecordCard() prepares the card it fills, so
// calling initializeRecordCards() is needed only for cards with a note in
// the HTML.


const DEFAULT_LABELS = {
  show: 'Show record info',
  hide: 'Hide record info',
  empty: 'No record'
};

let noteCount = 0;


export function initializeRecordCards(root = document) {
  const cards = root.matches?.('.record-card') ? [root] : root.querySelectorAll('.record-card');
  cards.forEach(initializeRecordCard);
}

export function setRecordCard(card, {title, note, record, settings = {}} = {}) {
  if (!card) {
    return;
  }

  initializeRecordCard(card);

  if (title !== undefined) {
    setRecordCardTitle(card, title);
  }

  if (note !== undefined) {
    setRecordCardNote(card, note);
  }

  if (record !== undefined) {
    setRecordCardRecord(card, record, settings);
  }
}

export function setRecordCardTitle(card, title) {
  const titleElement = card.querySelector('.record-card-title');

  if (titleElement) {
    titleElement.textContent = title;
  }
}

export function setRecordCardNote(card, note, {open = true} = {}) {
  const noteElement = card.querySelector('.record-card-note');
  const toggle = card.querySelector('.record-card-toggle');

  if (!noteElement) {
    return;
  }

  noteElement.replaceChildren();

  if (note === false || note === null || note === undefined || note === '') {
    noteElement.hidden = true;
    setHidden(toggle, true);
    updateToggle(card);
    return;
  }

  if (note instanceof Node) {
    noteElement.append(note);
  } else {
    noteElement.innerHTML = note;
  }

  noteElement.hidden = !open;
  setHidden(toggle, false);
  updateToggle(card);
}

export function setRecordCardRecord(card, record, settings = {}) {
  const content = card.querySelector('.record-card-content');
  const recordDiv = content?.querySelector('.marc-record');

  if (!recordDiv) {
    return;
  }

  content.querySelector('.record-card-empty')?.remove();
  showRecordInDiv(record, recordDiv, settings);

  if (!recordDiv.hasChildNodes()) {
    const empty = document.createElement('p');
    empty.classList.add('record-card-empty');
    empty.textContent = card.dataset.emptyLabel || DEFAULT_LABELS.empty;
    content.append(empty);
  }
}

// open: true shows the note, false hides it, undefined toggles it
export function toggleRecordCardNote(card, open) {
  const noteElement = card.querySelector('.record-card-note');

  if (!noteElement || !noteElement.hasChildNodes()) {
    return;
  }

  noteElement.hidden = !(open ?? noteElement.hidden);
  updateToggle(card);
}


//****************************************************************************//

function initializeRecordCard(card) {
  if (card.dataset.recordCardInitialized) {
    return;
  }

  card.dataset.recordCardInitialized = 'true';

  const noteElement = card.querySelector('.record-card-note');
  const toggle = card.querySelector('.record-card-toggle');

  if (!noteElement || !toggle) {
    return;
  }

  if (!noteElement.id) {
    noteCount += 1;
    noteElement.id = card.id ? `${card.id}-note` : `record-card-note-${noteCount}`;
  }

  toggle.setAttribute('aria-controls', noteElement.id);
  toggle.addEventListener('click', () => toggleRecordCardNote(card));
  setHidden(toggle, !noteElement.hasChildNodes());
  updateToggle(card);
}

function updateToggle(card) {
  const noteElement = card.querySelector('.record-card-note');
  const toggle = card.querySelector('.record-card-toggle');

  if (!noteElement || !toggle) {
    return;
  }

  const open = !noteElement.hidden;
  const label = open
    ? card.dataset.hideLabel || DEFAULT_LABELS.hide
    : card.dataset.showLabel || DEFAULT_LABELS.show;

  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
}

function setHidden(element, hidden) {
  if (element) {
    element.hidden = hidden;
  }
}
