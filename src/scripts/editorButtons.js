//
// Functions for defaultbuttons
//

import {disableElement, enableElement} from './elements.js';
import {getNextEditableSibling, getPreviousEditableSibling} from './marcRecordUi.js';

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
  disableElementId('removeActiveRow');
  /*
  const removeRowElem = document.getElementById('removeActiveRow');
  if (removeRowElem) {
    // removeRowElem.removeEventListener('click', removeActiveRow); // is this necessary? probably not...
    disableElement(removeRowElem);
  }
    */
}

function addNewRowBelow(event, settings) {
  event.preventDefault();
  const elem = window.activeFieldElement;
  if (elem) {
    console.log(`Add row below ${elem.textContent.substr(3)}`);
    const newElem = getNewElement(settings);
    if (newElem) {
      elem.insertAdjacentElement('afterend', newElem);
      newElem.focus();
      return;
    }
  }
  displayErrors('No active row detected!');
  addRowFallback(settings, true);
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
