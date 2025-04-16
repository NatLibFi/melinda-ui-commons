/* eslint-disable max-params */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-statements */

import {activateEditorButtons} from './editorButtons.js';
import {getNextEditableSibling, getPreviousEditableSibling, isDataFieldTag, isEditableDiv, resetFieldElem} from './editorUtils.js';

//****************************************************************************//
//                                                                            //
// MARC record editor                                                         //
//                                                                            //
//****************************************************************************//

// NV's comments about Settings:
// - decorateField: function,no idea what this is used for, maybe someone uses this, predates me (=NV),
// - editableRecord: undefined/function(record), by default record is *NOT* editable.
// - editableField: undefined/function(field, boolean = false), by default field is *NOT* editable.
// - focusHandler
// - inputHandler
// - keyDownHandler
// - onClick: add eventListerer to a field. NOT used by me (NV) on editors. As my editor uses way more listeners, I'm currently keeping them on the app side.
// - pasteHandler: undefined/function
// - subfieldCodePrefix: undefined/string, default is nothing, editor needs a non-empty value. NV uses '$$' as Aleph converts '$$' to a subfield separator anyways.
// - uneditableFieldBackgroundColor: undefined/string-that-specifies-colour, undefined changes nothing

// window.activeFieldElement = undefined; // Global variable for determining the row/field that last had focus. DO this is app, breaks tests...


export function showRecord(record, dest, settings = {}, recordDivName = 'muuntaja', logRecord = true) {
  // Check modern muuntaja. If not needed, then remove this function.
  if (logRecord) {
    console.log('Show Record:', record); // eslint-disable-line no-console
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

  /*
  if (!settings.editableRecord) {
    console.log("SHOW ONLY! NO editableRecord() FUNCTION!");
  }
  */

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


// Read field divs and convert them to marc fields (leader is converted into a LDR field)
export function getEditorFields(editorElementId = 'Record', subfieldCodePrefix = '$$') {
  const parentElem = document.getElementById(editorElementId);
  if (!parentElem) {
    console.log(`WARNING: getEditorFields(): no element '${editorElementId}' found!`);
    return [];
  }
  return [...parentElem.children].map(div => stringToMarcField(div.textContent, subfieldCodePrefix)); // [].map() converts children into an editable array
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

export function convertFieldsToRecord(fields, settings = {}) { // this should go to melinda-ui-commons...
  if (fields == undefined) {
    fields = getEditorFields(settings.editorDivId, settings.subfieldCodePrefix); // Get default fields
  }
  const [leader, ...otherFields] = fields
  //const validationErrors = extractErrorsFromFields(fields); // Validate?
  if (otherFields.length < 1) {
    return {error: 'no fields'};
  }

  const filteredFields = otherFields.map(f => filterField(f));  // Drop errors and other extra data

  if (leader.tag !== 'LDR') {
    return {error: 'first field should be leader'};
  }

  return {
    leader: leader.value,
    fields: filteredFields
  }

}


export function extractErrors(settings) {
  // 2025-03-20: we are now only returning errors for fields that are editable, and thus fixable. (Should we parameterize this?)
  const fields = getEditorFields(settings.editorDivId, settings.subfieldCodePrefix).filter(settings.editableField);
  return fields.filter(f => f.error).map(f => f.error);
}