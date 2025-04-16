/* eslint-disable max-params */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-statements */

import {isDataFieldTag, marcFieldToDiv, stringToMarcField} from './editorUtils.js';

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