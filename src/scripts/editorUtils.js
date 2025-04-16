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

