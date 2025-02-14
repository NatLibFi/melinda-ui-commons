/* eslint-disable max-params */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-statements */


//****************************************************************************//
//                                                                            //
// MARC field editor                                                          //
//                                                                            //
//****************************************************************************//


export function showRecord(record, dest, settings = {}, recordDivName = 'muuntaja', logRecord = true) {
  if (logRecord) {
    console.log('Show Record:', record); /* eslint-disable-line no-console */
  }

  // Get div to fill in the fields
  // NB! As seen by iffy #Record usage we have used the same id more than once...
  // To alleviate the problem I (NV) have split the function into two parts
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
    marcFieldToDiv(recordDiv, {tag: 'LDR', value: record.leader});
  }

  if (record.fields) {
    for (const field of record.fields) {
      const content = settings?.getContent ? settings.getContent(field) : field;
      marcFieldToDiv(recordDiv, content, settings);
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
export function marcFieldToDiv(recordDiv, field, settings = null) {
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

    function mapIndicatorToValue(ind) {
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

