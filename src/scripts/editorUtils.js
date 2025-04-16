//-----------------------------------------------------------------------------
const defaultEditorRowHandlers = [
    { 'type': 'focus', 'func': editorHandleFocus },
    { 'type': 'input', 'func': editorHandleInput },
    { 'type': 'keydown', 'func': editorHandleKeyDown},
    { 'type': 'paste', 'func': editorHandlePaste }
];

export function addEditorRowListerers(fieldElement, settings = {}) {
    defaultEditorRowHandlers.forEach(handler => setHandler(handler));

    function setHandler(handler) {
        const activeHandler = settings[`${handler.type}Handler`] || handler.func;
        fieldElement.addEventListener(handler.type, function(event) {
            activeHandler(event, settings);
        });
    }
}

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