import {highlightElement} from './elements.js';

//-----------------------------------------------------------------------------


export function displayErrors(errors, displayElementId = 'editorNotes') {
    if (typeof errors === 'string') {
      errors = [errors];
    }
    const displayElement = document.getElementById(displayElementId);

    if (!displayElement) {
      console.log(`WARNING: displayErrors(): element '${displayElementId}' not found!`)
      return;
    }

    displayElement.innerHTML = '';
    if (errors.length == 0) { return; }
    const errorMessages = errors.join('<br>\n');
    displayElement.innerHTML = errorMessages;
    displayElement.classList.add('record-error');
    displayElement.classList.remove('record-success', 'record-valid');

    highlightElement(displayElement);
}

export function displayNotes(notes, displayElementId = 'editorNotes') {
    if (typeof notes === 'string') {
      notes = [notes];
    }
    const displayElement = document.getElementById(displayElementId);

    if (!displayElement) { return; }

    displayElement.innerHTML = '';
    if (notes.length == 0) { return; }
    const messages = notes.join('<br>\n');
    displayElement.innerHTML = messages;
    displayElement.classList.add('record-valid');
    displayElement.classList.remove('record-error', 'record-success');
    highlightElement(displayElement);
}



export function getNextEditableSibling(elem) { // melinda-ui-commons?
    const nextElem = elem.nextSibling;
    if (!nextElem) {
      return nextElem;
    }
    if (isEditableDiv(nextElem)) {
      //console.log(`  IT'S ME: ${nextElem.textContent}`);
      return nextElem;
    }
    return getNextEditableSibling(nextElem);
}

export function getPreviousEditableSibling(elem) { // melinda-ui-commons?
    const prevElem = elem.previousSibling;
    if (!prevElem) {
      return prevElem;
    }
    if (isEditableDiv(prevElem)) {
      //console.log(elem.textContent);
      //console.log(prevElem.textContent);
      return prevElem;
    }
    return getPreviousEditableSibling(prevElem);
}


export function isDataFieldTag(str = '') {
    const tag = str.substring(0, 3); // This can be called with the whole "500##$$aLorum Ipsum." style strings as well.

    // Everything except a control field is a data field...
    return !['FMT', 'LDR', '000', '001', '002', '003', '004', '005', '006', '007', '008', '009'].includes(tag);
}


export function isEditableDiv(elem) {
    // As per hearsay: we might have a function for this somewhere...
    const tmp = elem.getAttribute('contenteditable');
    if (tmp === undefined || tmp === false || tmp === null || tmp === 'false') {
      return false;
    }
    return true;
}

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
    //console.log(`Set all ${fieldDivs.length} fields uneditable`);
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


export function resetFieldElem(elem, newValueAsString, settings = {}, editable = true) {
    const marcField = stringToMarcField(newValueAsString.replace(/\n/gu, ' '), settings.subfieldCodePrefix); // No idea why /\s/ did not work... 
    elem.innerHTML = '';
    marcFieldToDiv(null, elem, marcField, settings, editable);

    //// ye olde version (kept for reference for a while):
    //const fieldAsHtml = marcFieldToHtml(elem, marcField); // add (...settings, true)...
    //elem.innerHTML = fieldAsHtml;
}

export function undoMarkAllFieldsUneditable(settings) {
    // After a save, the modified record is reloaded and displayed modified record! (not done by this functions, though)
    // However, we should have failure handling functions (if save fails, for example, due to validation issues). Thus this function!
    // I really don't like this function, but it is better than nothing. However, avoid calling this, if you can do without.
    // UNTESTED!
    if (!settings.editorDivId) {
      return;
    }

    const parentElem = document.getElementById(settings.editorDivId);
    if (!parentElem) {
      return;
    }
    const fieldDivs = [...parentElem.children]; // converts children into an (editable) array
    //console.log(`Set all ${fieldDivs.length} fields editable`);
    fieldDivs.forEach(fieldDiv => markFieldEditability(fieldDiv));

    function markFieldEditability(fieldDiv) {
      const marcField = stringToMarcField(fieldDiv.textContent, settings.subfieldCodePrefix);
      const fieldIsEditable = settings?.editableField ? settings.editableField(marcField, true) : false; // here we assume that this function is only called by editable records!

      marcFieldToDiv(undefined, fieldDiv, marcField, settings, fieldIsEditable, undefined);
    }
}

export function stringToMarcField(str, subfieldCodePrefix = '$$') { // export since used in tests. settings.subfieldCodePrefix
    // console.log(`String2field: '${str}', '${subfieldCodePrefix}'`);
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

    const {subfields, error} = convertDataToSubfields(tag, rest, subfieldCodePrefix);
    //if (subfields.length === 0) {
    if (error) {
      //console.log(`Failed to parse '${str}': ${error}`);
      return {tag, ind1, ind2, value: rest, error: `${tag}: ${error}`}; // This is erronous state, as subfields failed to parse
    }

    return {tag, ind1, ind2, subfields, error: false};

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
}

function convertDataToSubfields(tag, data, separator = '$$') {
    if (separator.length < 1) {
      return {subfields: [], error: 'Missing subfield separator string'};
    }
    if ( data.length < 4 ) {
      return {subfields: [], error: 'Not enough data yet'};
    }
    if ( data.substring(0, separator.length) !== separator ) {
      return {subfields: [], error: `Data segment should begin with '${separator}'`};
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

    if (tag !== 'CAT') { // CAT's empty $b is so common, that there's no point to complain about it, esp. as it is oft uneditable.
      const emptySubfieldIndex = subfields.findIndex((sf, i) => sf.length < 2); // 1st char is code and the rest is data
      if (emptySubfieldIndex > -1) {
        return{subfields: [], error: `Subfield #${emptySubfieldIndex+1} (${separator}${subfields[emptySubfieldIndex].substring(0, 1)}) does not contain any data`};
      }
    }

    return { subfields: subfields.map(sf => stringToSubfield(sf)), error: undefined};

    function stringToSubfield(str) {
      return {'code': str.substring(0, 1), 'value': str.substring(1)};
    }
}
