//
// Functions for default buttons
//
import {displayErrors, getNextEditableSibling, getPreviousEditableSibling, isEditableDiv, resetFieldElem} from './editorUtils.js';
import {disableElement, enableElement} from './elements.js';
import {addEditorRowListerers} from './editorEvents.js';

const editorButtonIds = ['addNewRowAbove', 'addNewRowBelow', 'cancelEditButton', 'removeActiveRow', 'saveEditButton', 'validateEditButton'];

export function initEditorButtonsHandlers(settings = {}) {
    const addAboveElem = document.getElementById('addNewRowAbove');
    if (addAboveElem) {
      addAboveElem.onclick = function(event) { addNewRowAbove(event, settings) }; // There can/should be only one (Somehow event listerers get multiplier despite being the same)
      //addAboveElem.removeAttribute('disabled');
    }

    const addBelowElem = document.getElementById('addNewRowBelow');
    if (addBelowElem) {
      addBelowElem.onclick = function(event) { addNewRowBelow(event, settings)};
      //addBelowElem.removeAttribute('disabled');
    }

    const removeActiveRowElem= document.getElementById('removeActiveRow');
    if (removeActiveRowElem) {
        removeActiveRowElem.onclick = function(event) { removeActiveRow(event); }
    }

    // This one is not a handler... maybe I should rename the function...
    if (settings.hideCancelEditButton) {
        const elem = document.getElementById('cancelEditButton');
        if (elem) {
            elem.style.display = 'none';
        }
    }
}

export function deactivateEditorButtons() {
  editorButtonIds.forEach(id => disableElementById(id));
}

export function activateEditorButtons() {
  editorButtonIds.forEach(id => enableElementById(id));
}

function enableElementById(id) {
  const elem = document.getElementById(id);
  if (!elem) {
    console.log(`enableElementById(): can't locate element (id=${id})`);
    return;
  }
  if (id === 'removeActiveRow' && !window.activeFieldElement) {
    return;
  }
  enableElement(elem);
}


function disableElementById(id) {
  const elem = document.getElementById(id);
  if (!elem) {
    console.log(`disableElementById(): can't locate element (id=${id})`);
    return;
  }
  disableElement(elem);
}

export function deactivateRemoveActiveRowButton() {
  disableElementById('removeActiveRow');
}


function removeActiveRow(event) {
    //console.log('remove row 1')
    event.preventDefault();
    const elem = window.activeFieldElement;
    if (elem) {
      //console.log("Remove row");
      const elem2 = getNextEditableSibling(elem) || getPreviousEditableSibling(elem);
      elem.remove();
      window.activeFieldElement = elem2;
      if (elem2) { // put focus on next element
        elem2.focus();
      }
      else {
        deactivateRemoveActiveRowButton();
      }
      return;
    }
    displayErrors('No active row detected!');
    //console.log("No editor row selected (for deletion)")
}


function addNewRowAbove(event, settings) {
    event.preventDefault();
    const elem = window.activeFieldElement;
    if (elem) {
        console.log(`Add row above ${elem.textContent.substr(3)}`);
        const newElem = getNewElement(settings);
        elem.insertAdjacentElement('beforebegin', newElem);
        newElem.focus();
        return;
    }
    //displayErrors('No active row detected!');

     // The next command adds row to the end, should we add it to the start?
     // But where it should be added? After LDR, after control fields (00X), or...
    addRowFallback(settings, false);
}

function addNewRowBelow(event, settings) {
  event.preventDefault();
  const elem = window.activeFieldElement;
  if (elem) {
    console.log(`Add row below ${elem.textContent.substr(3)}`);
    const newElem = getNewElement(settings);
    elem.insertAdjacentElement('afterend', newElem);
    newElem.focus();
    return;
  }
  //displayErrors('No active row detected!');
  addRowFallback(settings, true);
}


function addRowFallback(settings, beforeEnd = true) {
  const parentElem = document.getElementById(settings.editorDivId);
  if (parentElem) {
    const newElem = getNewElement(settings);
    console.log(`Fallback: Add row ${beforeEnd ? 'END' : 'BEGIN'}`);
    const sisterElem = getSisterElem(parentElem);
    if (sisterElem) {
      const position = beforeEnd ? 'afterend' : 'beforebegin';
      sisterElem.insertAdjacentElement(position, newElem);
    }
    else {
      const position = beforeEnd ? 'beforeend' : 'afterbegin';
      parentElem.insertAdjacentElement(position, newElem)
    }
    newElem.focus();
    return;
  }
  console.log("Failed to add row.");


  function getSisterElem(parentElem) {
    const goalPostSister = beforeEnd ? parentElem.lastChild : parentElem.firstChild;
    if (isEditableDiv(goalPostSister)) {
      return goalPostSister;
    }
    if (beforeEnd) {
      return getPreviousEditableSibling(goalPostSister);
    }
    return getNextEditableSibling(goalPostSister);
  }
}

function getNewElement(settings) {
    const newElem = document.createElement('div');
    const subfieldCodePrefix = settings?.subfieldCodePrefix || '';

    resetFieldElem(newElem, settings.newFieldValue || `TAG##${subfieldCodePrefix}aLorum ipsum.`, settings);
    newElem.setAttribute('contentEditable', true);
    newElem.style.minHeight = '24px'; // We should add this to class 'row' in melinda-ui-commons (reason: row height behaves badly if there's no content)
    addEditorRowListerers(newElem, settings);

    return newElem;
}