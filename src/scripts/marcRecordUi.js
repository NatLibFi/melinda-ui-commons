/* eslint-disable max-params */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-statements */


//****************************************************************************//
//                                                                            //
// MARC field editor                                                          //
//                                                                            //
//****************************************************************************//

// Settings:
// - decorateField: no idea, maybe someone uses this, predates me (=NV),
// - editableRecord: undefined/function(record), by default record is *NOT* editable.
// - editableField: undefined/function(field, boolean = false), by default field is *NOT* editable.
// - onClick: add eventListerer to a field. NOT used by me (NV) on editors. As there are way more listeners, I'm currently keeping them on the app side.
// - subfieldPrefix: undefined/string, default is nothing, editor needs a non-empty value. NV uses '$$' as Aleph converts '$$' to a subfield separator anyways.
// - uneditableFieldBackgroundColor: undefined/colour-string, undefined changes nothing
// - whitespace - not mine

export function showRecord(record, dest, settings = {}, recordDivName = 'muuntaja', logRecord = true) {
  if (logRecord) {
    console.log('Show Record:', record); /* eslint-disable-line no-console */
  }
  console.log('showRecord() is deprecated. Use showRecordInDiv() instead!');

  // Get div to fill in the fields
  // NB! As seen by iffy #Record usage we have used the same id more than once...
  // To alleviate the problem I (NV) have split the function into two parts.
  const recordDiv = document.querySelector(`#${recordDivName} .record-merge-panel #${dest} #Record`);
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
    marcFieldToDiv(recordDiv, leaderAsField, settings, leaderIsEditable);
  }

  if (record.fields) {
    for (const field of record.fields) {
      const fieldIsEditable = settings?.editableField ? settings.editableField(field, recordIsEditable) : false;
      const content = settings?.getContent ? settings.getContent(field) : field;
      marcFieldToDiv(recordDiv, content, settings, fieldIsEditable);
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
export function marcFieldToDiv(recordDiv, field, settings = null, fieldIsEditable = false) {
  //console.log(field)
  const row = document.createElement('div');
  row.classList.add('row');

  if (settings?.whiteSpace) {
    row.style.whiteSpace = settings.whiteSpace;
  }

  if (field.uuid) {
    row.id = field.uuid;
  }

  if (settings?.decorateField) {
    settings.decorateField(row, field);
  }
  if (settings?.onClick) { // add keydown or input event?
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

  // NB! Note that the current implementation will add a non-breaking space for indicatorless fields.
  addInd(row);

  if (field.value) {
    addValue(row, field.value);
  } else if (field.subfields) {
    for (const [index, subfield] of field.subfields.entries()) {
      addSubfield(row, subfield, index);
    }
  }

  recordDiv.appendChild(row);
  return row;

  //---------------------------------------------------------------------------

  function addTag(row, value) {
    row.appendChild(makeSpan('tag', value));
  }

  function addInd(row) {
    const span = makeSpan('inds');
    add(span, field.ind1, 'ind1');
    add(span, field.ind2, 'ind2');
    row.appendChild(span);

    function add(span, ind, className = 'ind') {
      // Rather hackily a <span class="${className}">&nbsp;</span> is created for non-indicator fields...
      const value = mapIndicatorToValue(ind);
      span.appendChild(makeSpan(className, null, value));
    }

    function mapIndicatorToValue(ind) { // field -> web page
      if ( ind ) {
        // '#' is the standard way to represent an empty indicator.
        if ( ind === ' ') {
          return '#';
        }
        return ind;
      }
      // For indicatorless fields (such as LDR and 00X) return a non-breaking space
      return '&nbsp;';
    }
  }

  function addValue(row, value) {
    row.appendChild(makeSpan('value', value));
  }

  function addSubfield(row, subfield, index = 0) {
    const span = makeSpan('subfield');
    span.appendChild(makeSubfieldCode(subfield.code, index));
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
    const span = document.createElement('span');
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
  const len = str.length;
  if (len < 3) {
    return true; // Everything is a datafield by default
  }
  const tag = str.substring(0, 3);

  if (['FMT', 'LDR', '000', '001', '002', '003', '004', '005', '006', '007', '008', '009'].includes(tag)) {
    return false;
  }
  return true;
  //const result = tag.match(/^(?:0[1-9][0-9]|[1-9][0-9][0-9])$/u) !== null ? true : false;
  //console.log(`isDataFieldTag(${tag}): ${result}`);
  //return result;
}

function normalizeIndicator(ind, tag) { // convert data from web page to marc
  //console.log(`Process indicator '${ind}'`);
  if (!isDataFieldTag(tag)) { // tag.match(/^(?:00[1-9]|FMT|LDR)$/) ) {
      return '&nbsp;';
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

function stringToMarcField(str, subfieldCodePrefix = '$$') { // subfieldCodePrefix should come from settings
  //console.log(`String2field: '${str}'`);
  const len = str.length;
  if (len <= 3) {
    return {tag: str, error: `Incomplete field ${str}`};
  }

  const tag = str.substring(0, 3);

  const ind1 = normalizeIndicator(str.substring(3, 4), tag);
  if ( len === 4) {
    return {tag, ind1, error: `incomplete field ${tag}`}; //, ind2: ' '};
  }

  const ind2 = normalizeIndicator(str.substring(4, 5), tag);
  if ( len === 5) {
    return {tag, ind1, ind2, error: `incomplete field ${tag}`};
  }

  const rest = str.substring(5);
  if (!isDataFieldTag(tag)) {
    return {tag, ind1, ind2, value: rest.replace('#', ' '), error: rest.length <= 5 ? `incomplete field ${tag}` : false};
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
    return{subfields: [], error: `Subfield #${emptySubfieldIndex+1} (${artikkeliEditorSettings.subfieldCodePrefix}${subfields[emptySubfieldIndex].substring(0, 1)}) does not contain any data`};
  }

  return { subfields: subfields.map(sf => stringToSubfield(sf)), error: undefined};

  function stringToSubfield(str) {
    return {'code': str.substring(0, 1), 'value': str.substring(1)};
  }
}

export function resetFieldElem(elem, newValueAsString) {
  const marcField = stringToMarcField(newValueAsString.replace(/\n/gu, ' ')); // No idea why /\s/ did not work,,,

  const fieldAsHtml = marcFieldToHtml(elem, marcField); // add (...settings, true)...

  elem.innerHTML = fieldAsHtml;
}



function marcFieldToHtml(elem, field) {
  // aped from melinda-ui-commons marcFieldToDiv (a text only alternative)...
  // see if this can be removed...
  const tag = `<span class="tag">${field.tag.replace(/#/g, ' ') || ''}</span>`;
  const indicators = indicatorsToHtml(field);
  const data = dataToHtml(field);
  return `${tag}${indicators}${data}`


  function indicatorToHtml(indicator) {
    if (!isDataFieldTag(field.tag)) {
      return '&nbsp;'; // ' ' or &nbsp;?
    }
    if ( indicator === ' ') {
      return '#';
    }
    return indicator;
  }

  function indicatorsToHtml() {
    const ind1 = indicatorToHtml(field.ind1);
    const ind2 = indicatorToHtml(field.ind2);

    //console.log(`IND1: '${field.ind1}', IND2: '${field.ind2}'`);

    if (!field.ind1) {
      return '<span class="inds"></span>';
    }
    if (!field.ind2) {
      return `<span class="inds"><span class="ind1">${ind1}</span></span>`;
    }
    return `<span class="inds"><span class="ind1">${ind1}</span><span class="ind2">${ind2}</span></span>`;
  }

  function dataToHtml() {
    if (!field.subfields) {
      if (!field.value) {
        return '<span class="value"></span>';
      }
      if (!isDataFieldTag(field.value)) {
        return `<span class="value">${field.value.replace(/ /gu, '#')}</span>`;
      }
      return `<span class="value">${field.value}</span>`;
    }
    const subfieldsToHtml = field.subfields.map(sf => `<span class="subfield"><span class="code">$$${sf.code}</span><span class="value">${sf.value}</span></span>`).join('');
    return `<span>${subfieldsToHtml}</span>`;
  }
}
