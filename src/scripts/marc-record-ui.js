/* eslint-disable max-params */
/* eslint-disable no-mixed-operators */
/* eslint-disable functional/no-let */
/* eslint-disable max-statements */


//****************************************************************************//
//                                                                            //
// MARC field editor                                                          //
//                                                                            //
//****************************************************************************//


window.showRecord = function (record, dest, decorator = {}, recordDivName = 'muuntaja', logRecord = true) {
  if (logRecord) {
    console.log('Show Record:', record); /* eslint-disable-line no-console */
  }

  // Get div to fill in the fields
  const recordDiv = document.querySelector(`#${recordDivName} .record-merge-panel #${dest} #Record`);
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
    addField(recordDiv, {tag: 'LDR', value: record.leader});
  }

  if (record.fields) {
    for (const field of record.fields) {
      const content = decorator?.getContent ? decorator.getContent(field) : field;
      addField(recordDiv, content, decorator);
    }
  }

  function getHumanReadableErrorMessage(errorMessage) {
    if (errorMessage.includes('Record is invalid')) {
      return 'Tietueen validointi ei onnistunut. Tarkistathan merkatut kentät.';
    }

    return 'Tapahtui virhe';
  }


  //-----------------------------------------------------------------------------
  function addField(div, field, decorator = null) {
    //console.log(field)
    const row = document.createElement('div');
    row.classList.add('row');
    if (decorator?.decorateField) {
      decorator.decorateField(row, field);
    }
    if (decorator?.onClick) {
      row.addEventListener('click', event => decorator.onClick(event, field));
    }

    addTag(row, field.tag);

    //empty indicator execption handling
    let indicator1 = field.ind1;
    let indicator2 = field.ind2;
    const emptyIndicator = '_';
    const eitherIsEmpty = indicator1 === ' ' || indicator2 === ' ';
    const bothAreEmpty = indicator1 === ' ' && indicator2 === ' ';

    if (!bothAreEmpty && eitherIsEmpty) {
      indicator1 = field.ind1 === ' ' ? emptyIndicator : field.ind1;
      indicator2 = field.ind2 === ' ' ? emptyIndicator : field.ind2;
    }

    addInd(row, indicator1, indicator2);

    if (field.value) {
      addValue(row, field.value);
    } else if (field.subfields) {
      for (const [index, subfield] of field.subfields.entries()) {
        addSubfield(row, subfield, index);
      }
    }

    div.appendChild(row);
    return row;

    //---------------------------------------------------------------------------

    function addTag(row, value) {
      row.appendChild(makeSpan('tag', value));
    }

    function addInd(row, ind1, ind2) {
      const span = makeSpan('inds');
      add(span, ind1, 'ind1');
      add(span, ind2, 'ind2');
      row.appendChild(span);

      function add(span, ind, className = 'ind') {
        const value = ind && ind.trim() || '&nbsp;';
        span.appendChild(makeSpan(className, null, value));
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
      return makeSpan('code', code, null, index);
    }

    function makeSubfieldData(value, index = 0) {
      return makeSpan('value', value, null, index);
    }
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

};
