//*****************************************************************************
//
// MARC field editor
//
//*****************************************************************************

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

export function showRecord(record, dest, decorator = {}, recordDivName = 'muuntaja') {
  console.log('Show Record:', record); // eslint-disable-line no-console

  // Get div to fill in the fields
  const recordDiv = document.querySelector(`#${recordDivName} .record-merge-panel #${dest} #Record`);
  recordDiv.innerHTML = '';

  if (!record) {
    return;
  }

  if (record.error) {
    const error = document.createElement('div');
    error.classList.add('error');
    error.innerHTML = record.error;
    recordDiv.appendChild(error);
  }

  if (record.notes) {
    const notes = document.createElement('div');
    notes.classList.add('notes');
    notes.innerHTML = record.notes;
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
}

//-----------------------------------------------------------------------------
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
  addInd(row, field.ind1, field.ind2);

  if (field.value) {
    addValue(row, field.value);
  } else if (field.subfields) {
    for (const subfield of field.subfields) {
      addSubfield(row, subfield);
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
    add(span, ind1);
    add(span, ind2);
    row.appendChild(span);

    function add(span, ind) {
      const value = `${ind?.trim().lenght > 0 ? ind.trim() : '&nbsp;'}`;
      span.appendChild(makeSpan('ind', value));
    }
  }

  function text2HTML(value) {
    return value
      .replace('<', '&lt;')
      .replace('>', '&gt;');
  }

  function addValue(row, value) {
    row.appendChild(makeSpan('value', text2HTML(value)));
  }

  function addSubfield(row, subfield) {
    const span = makeSpan('subfield');
    span.appendChild(makeSubfieldCode(subfield.code));
    span.appendChild(makeSubfieldData(subfield.value));
    row.appendChild(span);
  }

  function makeSubfieldCode(code) {
    return makeSpan('code', `‡${code}`);
  }

  function makeSubfieldData(value) {
    return makeSpan('value', value);
  }
}

/*
function makeDiv(className, value) {
  const div = document.createElement('div');
  div.setAttribute('class', className);
  if (value) {
    div.innerHTML = value;
  }
  return div;
}
/**/

function makeSpan(className, value) {
  const span = document.createElement('span');
  span.setAttribute('class', className);
  if (value) {
    span.innerHTML = value;
  }
  return span;
}

//-----------------------------------------------------------------------------
// Field edit
//-----------------------------------------------------------------------------

let editing = null; // eslint-disable-line functional/no-let

export function editField(field, original = null) {
  // Edit-ohje: https://marc21.kansalliskirjasto.fi/bib/05X-08X.htm#050

  editing = field;
  //editing = transformed.transformed.record.fields.find(f => f.id == field.id);
  //console.log("Edit:", editing);

  // Find field from edited fields, if found, fill in data from there

  const dlg = document.querySelector('#fieldEditDlg');
  //console.log(dlg)
  dlg.style.display = 'flex';

  if (original) {
    const div = document.querySelector('#fieldEditDlg #original');
    div.hidden = false;
    const content = document.querySelector('#fieldEditDlg #field');
    content.innerHTML = '';
    addField(content, original);
  } else {
    const div = document.querySelector('#fieldEditDlg #original');
    div.hidden = true;
  }

  const tag = document.querySelector('#fieldEditDlg #tag');
  tag.innerHTML = '';
  tag.appendChild(createInput('tag', 'tag', field.tag));

  const ind1 = document.querySelector('#fieldEditDlg #ind1');
  ind1.innerHTML = '';
  ind1.appendChild(createInput('ind1', 'inds', field.ind1));

  const ind2 = document.querySelector('#fieldEditDlg #ind2');
  ind2.innerHTML = '';
  ind2.appendChild(createInput('ind2', 'inds', field.ind2));

  const subfields = document.querySelector('#fieldEditDlg #fieldlist');
  subfields.innerHTML = '';

  for (const subfield of field.subfields) {
    createSubfield(subfields, subfield);
  }

  //*
  Sortable.create(subfields, { // eslint-disable-line no-undef
    ghostClass: 'ghost-row',
    animation: 50
  });

  /**/
}

function createSubfield(parent, subfield) {
  const row = document.createElement('div');
  row.classList.add('subfield');
  row.appendChild(removeButton());
  row.appendChild(createInput('code', 'code', subfield.code));
  row.appendChild(createInput('value', 'value', subfield.value));
  parent.appendChild(row);
  return row;

  function removeButton() {
    const btn = document.createElement('button');
    btn.classList.add('material-icons');
    btn.innerHTML = 'close';
    btn.addEventListener('click', () => {
      const state = row.getAttribute('disabled');
      if (state) {
        row.removeAttribute('disabled');
      } else {
        row.setAttribute('disabled', true);
      }
      return true;
    });
    return btn;
  }
}

function createInput(name, className, value, editable = true) {
  const input = document.createElement('span');
  input.setAttribute('id', name);
  input.classList.add(className);
  if (editable) {
    input.classList.add('editable');
  }
  input.innerHTML = value;
  input.contentEditable = editable;
  return input;
}

window.onAddField = function (event) {
  const subfields = document.querySelector('#fieldEditDlg #fieldlist');
  createSubfield(subfields, {code: '?', value: '?'});
  return eventHandled(event); // eslint-disable-line no-undef
};

window.editDlgOK = function (event) {
  const query = (p) => document.querySelector(p);

  const field = {
    id: editing.id,
    tag: query('#fieldEditDlg #tag #tag').textContent,
    ind1: query('#fieldEditDlg #ind1 #ind1').textContent,
    ind2: query('#fieldEditDlg #ind2 #ind2').textContent,
    subfields: Array.from(query('#fieldEditDlg #fieldlist').childNodes)
      .filter(e => e.classList.contains('subfield'))
      .filter(e => !e.getAttribute('disabled'))
      .map(elem => ({
        code: elem.getElementsByClassName('code')[0].textContent,
        value: elem.getElementsByClassName('value')[0].textContent
      }))
  };

  editSaveField(field); // eslint-disable-line no-undef
  return editDlgClose(event); // eslint-disable-line no-undef
};

window.editDlgUseOriginal = function (event) {
  console.log('Using original.'); // eslint-disable-line no-console
  editUseOriginal(editing); // eslint-disable-line no-undef
  return editDlgClose(event); // eslint-disable-line no-undef
};

window.editDlgClose = function (event) {
  const dlg = document.querySelector('#fieldEditDlg');
  //console.log("Close:", dlg)
  dlg.style.display = 'none';
  return eventHandled(event); // eslint-disable-line no-undef
};
