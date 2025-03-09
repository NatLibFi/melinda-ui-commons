/* eslint-disable max-params */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-statements */


//****************************************************************************//
//                                                                            //
// MARC field editor                                                          //
//                                                                            //
//****************************************************************************//

// NV's comments about Settings:
// - decorateField: function,no idea what this is used for, maybe someone uses this, predates me (=NV),
// - editableRecord: undefined/function(record), by default record is *NOT* editable.
// - editableField: undefined/function(field, boolean = false), by default field is *NOT* editable.
// - onClick: add eventListerer to a field. NOT used by me (NV) on editors. As my editor uses way more listeners, I'm currently keeping them on the app side.
// - pasteHandler: undefined/function
// - subfieldCodePrefix: undefined/string, default is nothing, editor needs a non-empty value. NV uses '$$' as Aleph converts '$$' to a subfield separator anyways.
// - uneditableFieldBackgroundColor: undefined/string-that-specifies-colour, undefined changes nothing

export function showRecord(record, dest, settings = {}, recordDivName = 'muuntaja', logRecord = true) {
  if (logRecord) {
    console.log('Show Record:', record); /* eslint-disable-line no-console */
  }
  console.log('showRecord() is deprecated. Use showRecordInDiv() instead!');

  // Get div to fill in the fields
  // NV: NB! mere '#Record' might not work. I've seen colleagues using same #Record ID twice.
  // Also `#${recordDivName} .record-merge-panel #${dest} #Record` is just terrible hard-coding.
  const recordDiv = document.querySelector(`#${recordDivName} .record-merge-panel #${dest} #Record`);
  // To alleviate the problem I (NV) have split the function into two parts (the latter half being more generic showRecordInDiv())
  return showRecordInDiv(record, recordDiv, settings);
}

export function showRecordInDiv(record, recordDiv, settings = {}) {
  if (!recordDiv) {
    return;
  }
  recordDiv.innerHTML = '';

  if (!record) {
    return;
  }

  if (!settings.editableRecord) {
    console.log("SHOW ONLY! NO editableRecord() FUNCTION!");
  }

  const recordIsEditable = settings?.editableRecord ? settings.editableRecord(record) : false;

  if (record.error) {
    const error = document.createElement('div');
    error.classList.add('error');
    error.textContent = getHumanReadableErrorMessage(record.error);
    console.error(record.error); /* eslint-disable-line no-console */
    recordDiv.appendChild(error);
  }

  if (record.notes) {
    const notes = document.createElement('div');
    notes.classList.add('notes');
    notes.textContent = record.notes;
    recordDiv.appendChild(notes);
  }

  if (record.leader) {
    const leaderAsField = {tag: 'LDR', value: record.leader};
    const leaderIsEditable = settings?.editableField ? settings.editableField(leaderAsField, recordIsEditable) : false;
    marcFieldToDiv(recordDiv, undefined, leaderAsField, settings, leaderIsEditable);
  }

  if (record.fields) {
    for (const field of record.fields) {
      const fieldIsEditable = settings?.editableField ? settings.editableField(field, recordIsEditable) : false;
      const content = settings?.getContent ? settings.getContent(field) : field;
      marcFieldToDiv(recordDiv, undefined,  content, settings, fieldIsEditable);
    }
  }

  function getHumanReadableErrorMessage(errorMessage) {
    if (errorMessage.includes('Record is invalid')) {
      return 'Tietueen validointi ei onnistunut. Tarkistathan merkatut kentät.';
    }

    return 'Tapahtui virhe';
  }

}

//-----------------------------------------------------------------------------
export function marcFieldToDiv(recordDiv, originalRow = undefined, field, settings = null, fieldIsEditable = false, altDocument = undefined) {
  // This function should not be used imported (expect for testing)!

  // altDocument is a jsdom document. We need it for testing.
  const myDocument = altDocument || document;

  // NB! Typically recordDiv (parent of row div) or originalRow div is empty, as only one of them is needed.
  const row = originalRow || myDocument.createElement('div');
  row.classList.add('row');

  if (field.uuid) {
    row.id = field.uuid;
  }

  if (settings?.decorateField) {
    settings.decorateField(row, field);
  }
  if (settings?.onClick) { // add similar keydown or input event?
    row.addEventListener('click', event => settings.onClick(event, field));
  }

  if (fieldIsEditable) {
    row.setAttribute('contentEditable', true);
  }
  else {
    if (settings?.uneditableFieldBackgroundColor) {
      row.style.backgroundColor = settings.uneditableFieldBackgroundColor;
    }
  }

  addTag(row, field.tag);

  // NB! Note that the current implementation will add two non-breaking spaces for indicatorless fields.
  addIndicators(row);

  if (field.subfields) {
    for (const [index, subfield] of field.subfields.entries()) {
      addSubfield(row, subfield, index);
    }
  } else {
    addValue(row, field.value);
  }

  if (recordDiv && !originalRow) {
    recordDiv.appendChild(row);
  }
  return row;

  //---------------------------------------------------------------------------

  function addTag(row, value) {
    row.appendChild(makeSpan('tag', value));
  }

  function addIndicators(row) {
    const span = makeSpan('inds');
    if (field.ind1 || field.value) { // Field in editor might be incomplete and lack indicators
      addIndicator(span, field.ind1, 'ind1');
      if (field.ind2 || field.value) {
        addIndicator(span, field.ind2, 'ind2');
      }
    }
    row.appendChild(span);

    function addIndicator(span, ind, className = 'ind') {
      // Rather hackily a <span class="${className}">&nbsp;</span> is created for non-indicator fields...
      const value = mapIndicatorToValue(ind);
      span.appendChild(makeSpan(className, null, value));
    }

    function mapIndicatorToValue(ind) { // field -> web page
      if (!isDataFieldTag(field.tag)) {
        return '&nbsp;'; // ' ' or &nbsp;?
      }
      if ( ind === ' ') {
        return '#'; // '#' is the standard way to represent an empty indicator.
      }
      return ind;
    }
  }

  function addValue(row, value) {
    const normalizedValue  = normalizeValue();
    row.appendChild(makeSpan('value', normalizedValue));

    function normalizeValue() {
      if (!value) {
        return '';
      }
      if (!isDataFieldTag(field.tag)) {
        return field.value.replace(/ /gu, '#');
      }
      return value;
    }
  }

  function addSubfield(row, subfield, index = 0) {
    const span = makeSpan('subfield');
    span.appendChild(makeSubfieldCode(`${subfield.code}`, index));
    span.appendChild(makeSubfieldData(subfield.value, index));
    row.appendChild(span);
  }

  function makeSubfieldCode(code, index = 0) {
    if (settings?.subfieldCodePrefix) {
      return makeSpan('code', `${settings.subfieldCodePrefix}${code}`, null, index);
    }
    return makeSpan('code', code, null, index);
  }

  function makeSubfieldData(value, index = 0) {
    return makeSpan('value', value, null, index);
  }

  //-----------------------------------------------------------------------------
  function makeSpan(className, text, html, index = 0) {
    const span = myDocument.createElement('span');
    span.setAttribute('class', className);
    span.setAttribute('index', index);
    if (text) {
      span.textContent = text;
    } else if (html) {
      span.innerHTML = html;
    }
    return span;
  }
}

export function isDataFieldTag(str = '') {
  const tag = str.substring(0, 3); // This can be called with the whole "500##$$aLorum Ipsum." style strings as well.

  // Everything except a control field is a data field...
  return !['FMT', 'LDR', '000', '001', '002', '003', '004', '005', '006', '007', '008', '009'].includes(tag);
}

function normalizeIndicator(ind, tag) { // convert data from web page to marc
  //console.log(`Process indicator '${ind}'`);
  if (!isDataFieldTag(tag)) {
      // Even control fields contain slots/fake indicators for indicators, so that records looks good in the browser.
      // Fake indicators are removed when fields are converted into a real record.
      return ' ';
  }
  if ( ind.match(/^[0-9]$/u) ) {
      return ind;
  }
  // Note: this converts illegal indicator values to default value '#'. Needed by editor
  return ' ';
}


// Read field divs and convert them to marc fields (leader is converted into a LDR field)
export function getEditorFields(editorElementId = 'Record') {
  const parentElem = document.getElementById(editorElementId);
  return [...parentElem.children].map(div => stringToMarcField(div.textContent)); // converts children into an editable array
}

export function stringToMarcField(str, subfieldCodePrefix = '$$') { // settings.subfieldCodePrefix
  //console.log(`String2field: '${str}'`);
  const len = str.length;
  if (len <= 3) {
    return {tag: str, error: `Incomplete field ${str}`};
  }

  const tag = str.substring(0, 3);

  const ind1 = normalizeIndicator(str.substring(3, 4), tag);
  if ( len === 4) {
    return {tag, ind1, error: `Incomplete field ${tag}`}; //, ind2: ' '};
  }

  const ind2 = normalizeIndicator(str.substring(4, 5), tag);
  if ( len === 5) {
    return {tag, ind1, ind2, error: `Incomplete field ${tag}`};
  }

  const rest = str.substring(5);
  if (!isDataFieldTag(tag)) {
    return {tag, ind1, ind2, value: rest.replace(/#/gu, ' '), error: rest.length <= 5 ? `Incomplete field ${tag}` : false};
  }

  const {subfields, error} = convertDataToSubfields(rest, subfieldCodePrefix);
  //if (subfields.length === 0) {
  if (error) {
    //console.log(`Failed to parse '${str}': ${error}`);
    return {tag, ind1, ind2, value: rest, error: `${tag}: ${error}`}; // This is erronous state, as subfields failed to parse
  }

  return {tag, ind1, ind2, subfields, error: false};
}

function convertDataToSubfields(data, separator = '$$') {
  if (separator.length < 1) {
    return {subfields: [], error: 'Missing subfield separator string'};
  }
  if ( data.length < 4 ) {
    return {subfields: [], error: 'Not enough data yet'};
  }
  if ( data.substring(0, separator.length) !== separator ) {
    return {subfields: [], error: 'Data segment should begin with \'${separator}\''};
  }
  const data2 = data.substring(separator.length);
  const subfields = data2.split(separator);

  const noSubfieldCodeIndex = subfields.findIndex((sf, i) => sf.length < 1); // 1st char is code and the rest is data
  if (noSubfieldCodeIndex > -1) {
    return{subfields: [], error: `Subfield #${noSubfieldCodeIndex+1} does not contain a subfield code (nor data)`};
  }

  const illegalSubfieldCodeIndex = subfields.findIndex((sf, i) => sf.match(/^[^a-z0-9]/u));
  if (illegalSubfieldCodeIndex > -1) {
    return {subfields: [], error: `Subfield #${illegalSubfieldCodeIndex+1} has unexpected subfield code '${subfields[illegalSubfieldCodeIndex].substring(0, 1)}'`};
  }

  const emptySubfieldIndex = subfields.findIndex((sf, i) => sf.length < 2); // 1st char is code and the rest is data
  if (emptySubfieldIndex > -1) {
    return{subfields: [], error: `Subfield #${emptySubfieldIndex+1} (${separator}${subfields[emptySubfieldIndex].substring(0, 1)}) does not contain any data`};
  }

  return { subfields: subfields.map(sf => stringToSubfield(sf)), error: undefined};

  function stringToSubfield(str) {
    return {'code': str.substring(0, 1), 'value': str.substring(1)};
  }
}

export function resetFieldElem(elem, newValueAsString, settings = {}, editable = true) {
  const marcField = stringToMarcField(newValueAsString.replace(/\n/gu, ' ')); // No idea why /\s/ did not work... 
  elem.innerHTML = '';
  marcFieldToDiv(null, elem, marcField, settings, editable);

  //// ye olde version (kept for reference for a while):
  //const fieldAsHtml = marcFieldToHtml(elem, marcField); // add (...settings, true)...
  //elem.innerHTML = fieldAsHtml;
}


export function filterField(field) {
  // Field contains field.error (for debugging and error messages) and control fields have fake indicators.
  // Copy and return relevant fields when a) converting the whole record, or b) testing.
  if (isDataFieldTag(field.tag)) {
    return {tag: field.tag, ind1: field.ind1, ind2: field.ind2, subfields: field.subfields.map(sf => filterSubfields(sf))};
  }
  return {tag: field.tag, value: field.value};

  function filterSubfields(subfield) {
    return {code: subfield.code, value: subfield.value};
  }
}

export function getPreviousEditableSibling(elem) { // melinda-ui-commons?
  const prevElem = elem.previousSibling;
  if (!prevElem) {
    //console.log("  NO PREV");
    return prevElem;
  }
  if (isEditableDiv(prevElem)) {
    //console.log("  IT'S ME");
    //console.log(elem.textContent);
    //console.log(prevElem.textContent);
    return prevElem;
  }
  //console.log("  TRY NEXT");
  return getPreviousEditableSibling(prevElem);
}

export function getNextEditableSibling(elem) { // melinda-ui-commons?
  const nextElem = elem.nextSibling;
  if (!nextElem) {
    //console.log("  NO NEXT");
    return nextElem;
  }
  if (isEditableDiv(nextElem)) {
    //console.log(`  IT'S ME: ${nextElem.textContent}`);
    return nextElem;
  }
  //console.log("  TRY NEXT");
  return getNextEditableSibling(nextElem);
}

// Inspired by https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
function getCursorPosition(element) {
  var doc = element.ownerDocument || element.document; // Though mere element.document should be enough for us
  var win = doc.defaultView;

  const sel = win.getSelection();

  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0); // win.getSelection().getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }
  return 0;
}

// Inspired by https://stackoverflow.com/questions/36869503/set-caret-position-in-contenteditable-div-that-has-children
function setCursorPosition(elem, position) {
  let todoList = elem.childNodes;
  setCursorPosition2(todoList, position);

  function setCursorPosition2(todo, position) {
    console.log(`Setting cursor to ${position}, with ${todo.length} element(s) to process`);
    const [currNode, ...remaining] = todo;
    if (!currNode) { // failure of some sort, abort
      console.log('Cursor positioning failed')
      return;
    }
    console.log(` Curr node type: ${currNode.nodeType} (${typeof currNode.nodeType})`);
    if (currNode.nodeType == 3) { // text node
      console.log(` Text node, length: ${currNode.length}`);
      if (currNode.length < position) { // Not yet there
        return setCursorPosition2(remaining, position - currNode.length);
      }
      // Success
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(currNode, position);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    // Process currNode's children:
    return setCursorPosition2([...currNode.childNodes, ...remaining], position);
  }
}

export function isEditableDiv(elem) {
  // As per hearsay: we might have a function for this somewhere...
  const tmp = elem.getAttribute('contenteditable');
  if (tmp === undefined || tmp === false || tmp === null || tmp === 'false') {
    return false;
  }
  //console.log(`DIV VAL: ${tmp} for ${elem.textContent}`);
  return true;
}


function editorHandlePaste(event) {
  // Default function for handling paste.
  // Can be overridden using using settings.pasteHandler.

  const elem = event.currentTarget;
  const position = getCursorPosition(elem);

  const protectedAreaSize = getProtectedAreaSize(elem.textContent);
  if (position < protectedAreaSize && elem.textContent.length > position) { // Can't paste here mate!
     console.log(`Can't paste in the protected area (tag, indicators, first subfield separator) area! (POS=${position}/${protectedAreaSize})`);
    event.preventDefault(); // Blocks input event
    return;
  }

  // Position >= protectedAreaSize: Paste will be done by browser and then handleInput() will be triggered as well...
}

function editorHandleKeyDown(event, settings) { // for field divs

  if ([38, 40].includes(event.keyCode)) {
    // console.log(`EVENT: KEY DOWN ${event.keyCode}`);
    // 38: key up, 40: key down
    event.preventDefault(); // Blocks input event
    const elem = event.currentTarget;
    const position = getCursorPosition(elem);
    if (!elem || !isEditableDiv(elem)) { // hope that only editables available are "my" field divs
      return;
    }
    let otherElem = undefined
    if (event.keyCode === 38) {
      //console.log(` TRY TO LOCATE PREV FOR DIV thats contains ${elem.textContent}`);
      otherElem = getPreviousEditableSibling(elem);
    }
    else if (event.keyCode === 40) {
      //console.log(` TRY TO LOCATE NEXT FOR DIV thats contains ${elem.textContent}`);
      otherElem = getNextEditableSibling(elem);
    }
    if (otherElem) {
      //console.log("   HIT!");
      otherElem.focus();
      const newPosition = otherElem.textContent.length < position ? otherElem.textContent.length : position;
      setCursorPosition(otherElem, newPosition);
    }
  }
}



function getProtectedAreaSize(value) {
  // controlfields are fully protected (= prevent paste)
  if (!isDataFieldTag(value)) {
    return value.length;
  }
  /*
  if (isDataFieldTag(value)) {
    // Data field: tag(3) + indicators (2) + prefix.length ('$$'==2). Don't protect subfield code (1)
    return 5 + articleEditorSettings.subfieldCodePrefix.length;
  }
    */
  // Control field: tag (3) + empty (2)
  return 5;
}

function getOvertypeLength(event, inputText, fieldAsString, position) { // position means position when text has been added or removed
  if (!inputText) {
    if (event.inputType === 'deleteContentBackward') {
      return -1;
    }

    return 0;
  }

  if (position === fieldAsString.length) {
    // If there's nothing on the right, there's no need for overtype :-)
    return 0;
  }
  const jumpSize = inputText.length;
  const startPosition = position - jumpSize;
  //const tailLength = fieldAsString.length.position;
  //const originalLength = startPosition + tailLength;
  let i=0;
  const protectedAreaSize = getProtectedAreaSize(fieldAsString);
  while (i < jumpSize && startPosition+i < protectedAreaSize) {
    i++;
  }
  // console.log(`START: ${startPosition}, LEN: ${jumpSize}, OVERTYPE: ${i} char(s)`);
  return i;
}

function editorHandleInput(event, settings) {
  var elem = event.currentTarget;
  console.log(`INPUT EVENT ${event.inputType} in '${elem.textContent}'`);

  const position = getCursorPosition(elem);

  let fieldAsString = elem.textContent;
  const overtypeLength = getOvertypeLength(event, event.data, fieldAsString, position);
  console.log(`INPUT: '${event.data || 'N/A'}', OVERTYPE: ${overtypeLength}, POSITION: ${position}/${fieldAsString.length}`);
  if ( overtypeLength < 0) { // Backspace (cut?)
    if (position === fieldAsString.length) {
      console.log(' Removing from end requires no action');
      // Do nothing
    }
    else if (position < 5)  { // Replace the letter that was deleted by a backspace with a space character.
      // NB! This presumes that overtype length is -1. Won't work for longer cuts!
      console.log(` Replace removal with a space...\n  '${fieldAsString}`);
      fieldAsString = `${fieldAsString.substr(0, position)} ${fieldAsString.substr(position)}`;
      console.log(`  '${fieldAsString}'`);
    }
    else {
      // NB! This currently does nothing on purpose
      const protectedAreaSize = getProtectedAreaSize(fieldAsString);
      if (position > 5 && position < protectedAreaSize) { // It's a datafield. We protect first subfields prefix
        fieldAsString = `${fieldAsString.substr(0, 5)}${settings.subfieldCodePrefix}${fieldAsString.substr(protectedAreaSize)}`;
      }
    }
  }
  else if (overtypeLength > 0) {
    fieldAsString = `${fieldAsString.substr(0, position)}${fieldAsString.substr(position+overtypeLength)}`;
  }


  // If field is reset/redone, the history is lost, thus reset it only when necessary!
  if (!fieldNeedsReseting()) {
    return;
  }

  resetFieldElem(elem, fieldAsString, settings);
  setCursorPosition(elem, position);


  function fieldNeedsReseting() {
    // optimize: don't reset field unless we (probably) have to do so.
    if (!event.data) {
      return true;
    }
    const jumpSize = event.data.length;
    const startPosition = position - jumpSize;
    //console.log(`RESET? START: ${startPosition}, SIZE: ${jumpSize}`);
    if (startPosition <= 7 || jumpSize > 1) {
      return true;
    }

    if (event.data.includes('\t') || event.data.includes('\n')) {
      return true;
    }

    if (settings.subfieldCodePrefix === '$$') {
      if (fieldAsString.substr(startPosition-2, 2+jumpSize).includes('$')) {
        return true;
      }
      return false;
    }
    if (settings.subfieldCodePrefix === '‡') {
      if (fieldAsString.substr(startPosition-2, 2+jumpSize).includes('‡')) {
        return true;
      }
      return false;
    }

    return true;
  }

}

export function addEditorRowListerers(df, settings = {}) {
  // TODO: check settings whether default functions should be used
  const pasteHandler = settings.pasteHandler || editorHandlePaste;
  df.addEventListener('paste', function(event) {
    pasteHandler(event, settings);
  });

  const inputHandler = settings.inputHandler || editorHandleInput;
  df.addEventListener('input', function(event) {
    inputHandler(event, settings);
  });

  const keyDownHandler = settings.keyDownHandler || editorHandleKeyDown;
  df.addEventListener('keydown', function(event) {
    keyDownHandler(event, settings);
  });
}

export function markAllFieldsUneditable(settings) {
  // I call this typically after clicking save button.
  // After save, reload the record and display modified record!
  // However, we should have failure handling functions which normalizes fields
  if (!settings.editorDivId) {
    return;
  }

  const parentElem = document.getElementById(settings.editorDivId);
  if (!parentElem) {
    return;
  }
  const fieldDivs = [...parentElem.children]; // converts children into an (editable) array
  console.log(`Set all ${fieldDivs.length} fields uneditable`);
  //fieldDivs.forEach(fieldDiv => fieldDiv.setAttribute('contenteditable', false));
  fieldDivs.forEach(fieldDiv => markFieldUneditable(fieldDiv));

  function markFieldUneditable(fieldDiv) {
    // Does not remove listeners (on purpose, for now at least)
    fieldDiv.removeAttribute('contenteditable', false);
    if(settings.uneditableFieldBackgroundColor) {
      fieldDiv.style.backgroundColor = settings.uneditableFieldBackgroundColor;
    }
  }
}

export function undoMarkAllFieldsUneditable(settings) {
  // After save, reload the record and display modified record! (not by this functions)
  // However, we should have failure handling functions (if save fails, for example, due to validation issues). Thus this function!
  // I really don't like this function, but it is better than nothing. Howeve, avoid calling this, if you can do without.
  // UNTESTED!
  if (!settings.editorDivId) {
    return;
  }

  const parentElem = document.getElementById(settings.editorDivId);
  if (!parentElem) {
    return;
  }
  const fieldDivs = [...parentElem.children]; // converts children into an (editable) array
  console.log(`Set all ${fieldDivs.length} fields uneditable`);
  //fieldDivs.forEach(fieldDiv => fieldDiv.setAttribute('contenteditable', false));
  fieldDivs.forEach(fieldDiv => markFieldEditability(fieldDiv));

  function markFieldEditability(fieldDiv) {
    const marcField = stringToMarcField(fieldDiv.textContent);
    const fieldIsEditable = settings?.editableField ? settings.editableField(marcField, true) : false; // here we assume that this function is only called by editable records!

    marcFieldToDiv(undefined, fieldDiv, marcField, settings, fieldIsEditable, undefined);
  }
}