import {getNextEditableSibling, getPreviousEditableSibling, isDataFieldTag, isEditableDiv, resetFieldElem} from './editorUtils.js';

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


export function editorHandleFocus(event, settings) {
    const elem = event.currentTarget;
    //console.log(`editorHandleFocus: ${elem.textContent}`);
    window.activeFieldElement = elem;
    activateEditorButtons(settings);
}

function editorHandleInput(event, settings) {
    var elem = event.currentTarget;
    //console.log(`INPUT EVENT ${event.inputType} in '${elem.textContent}'`);

    const position = getCursorPosition(elem);

    let fieldAsString = elem.textContent;
    const overtypeLength = getOvertypeLength(event, event.data, fieldAsString, position);
    //console.log(`INPUT: '${event.data || 'N/A'}', OVERTYPE: ${overtypeLength}, POSITION: ${position}/${fieldAsString.length}`);
    if ( overtypeLength < 0) { // Backspace (cut?)
      if (position === fieldAsString.length) {
        // console.log(' Removing from end requires no action');
        // Do nothing
      }
      else if (position < 5)  { // Replace the letter that was deleted by a backspace with a space character.
        // NB! This presumes that overtype length is -1. Won't work for longer cuts!
        //console.log(` Replace removal with a space...\n  '${fieldAsString}`);
        fieldAsString = `${fieldAsString.substr(0, position)} ${fieldAsString.substr(position)}`;
        //console.log(`  '${fieldAsString}'`);
      }
      else {
        // NB! This currently does nothing on purpose
        const protectedAreaSize = getProtectedAreaSize(fieldAsString);
        if (position > 5 && position < protectedAreaSize) { // It's a datafield. We protect first subfields prefix
          fieldAsString = `${fieldAsString.substr(0, 5)}${settings.subfieldCodePrefix}${fieldAsString.substr(protectedAreaSize)}`;
        }
      }
    }
    else if (overtypeLength > 0) {
      fieldAsString = `${fieldAsString.substr(0, position)}${fieldAsString.substr(position+overtypeLength)}`;
    }

    // If field is reset/redone, the history is lost, thus reset it only when necessary!
    if (!fieldNeedsReseting()) {
      return;
    }
    resetFieldElem(elem, fieldAsString, settings);
    setCursorPosition(elem, position);

    function fieldNeedsReseting() {
      // optimize: don't reset field unless we (probably) have to do so.
      if (!event.data) {
        return true;
      }
      const jumpSize = event.data.length;
      const startPosition = position - jumpSize;
      //console.log(`RESET? START: ${startPosition}, SIZE: ${jumpSize}`);
      if (startPosition <= 7 || jumpSize > 1) {
        return true;
      }

      if (event.data.includes('\t') || event.data.includes('\n')) {
        return true;
      }

      if (settings.subfieldCodePrefix === '$$') {
        if (fieldAsString.substr(startPosition-2, 2+jumpSize).includes('$')) {
          return true;
        }
        return false;
      }
      if (settings.subfieldCodePrefix === '‡') {
        if (fieldAsString.substr(startPosition-2, 2+jumpSize).includes('‡')) {
          return true;
        }
        return false;
      }

      return true;
    }

}

function editorHandleKeyDown(event, settings) { // for field divs

    if ([38, 40].includes(event.keyCode)) {
      // console.log(`EVENT: KEY DOWN ${event.keyCode}`);
      // 38: key up, 40: key down
      event.preventDefault(); // Blocks input event
      const elem = event.currentTarget;
      const position = getCursorPosition(elem);
      if (!elem || !isEditableDiv(elem)) { // hope that only editables available are "my" field divs
        return;
      }
      let otherElem = undefined
      if (event.keyCode === 38) {
        otherElem = getPreviousEditableSibling(elem);
      }
      else if (event.keyCode === 40) {
        otherElem = getNextEditableSibling(elem);
      }
      if (otherElem) {
        //console.log("   HIT!");
        otherElem.focus();
        const newPosition = otherElem.textContent.length < position ? otherElem.textContent.length : position;
        setCursorPosition(otherElem, newPosition);
      }
    }
}


function editorHandlePaste(event) {
    // Default function for handling paste.
    // Can be overridden using using settings.pasteHandler.

    const elem = event.currentTarget;
    const position = getCursorPosition(elem);

    const protectedAreaSize = getProtectedAreaSize(elem.textContent);
    if (position < protectedAreaSize && elem.textContent.length > position) { // Can't paste here mate!
       console.log(`Can't paste in the protected area (tag, indicators, first subfield separator) area! (POS=${position}/${protectedAreaSize})`);
      event.preventDefault(); // Blocks input event
      return;
    }

    // Position >= protectedAreaSize: Paste will be done by browser and then handleInput() will be triggered as well...
}

// Inspired by https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
function getCursorPosition(element) {
    var doc = element.ownerDocument || element.document; // Though mere element.document should be enough for us
    var win = doc.defaultView;

    const sel = win.getSelection();

    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0); // win.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    return 0;
}


function getOvertypeLength(event, inputText, fieldAsString, position) { // position means position when text has been added or removed
    if (!inputText) {
      if (event.inputType === 'deleteContentBackward') {
        return -1;
      }

      return 0;
    }

    if (position === fieldAsString.length) {
      // If there's nothing on the right, there's no need for overtype :-)
      return 0;
    }
    const jumpSize = inputText.length;
    const startPosition = position - jumpSize;
    //const tailLength = fieldAsString.length.position;
    //const originalLength = startPosition + tailLength;
    let i=0;
    const protectedAreaSize = getProtectedAreaSize(fieldAsString);
    while (i < jumpSize && startPosition+i < protectedAreaSize) {
      i++;
    }
    // console.log(`START: ${startPosition}, LEN: ${jumpSize}, OVERTYPE: ${i} char(s)`);
    return i;
}

function getProtectedAreaSize(value) {
    // controlfields are fully protected (= prevent paste)
    if (!isDataFieldTag(value)) {
      return value.length;
    }
    /*
    if (isDataFieldTag(value)) {
      // Data field: tag(3) + indicators (2) + prefix.length ('$$'==2). Don't protect subfield code (1)
      return 5 + articleEditorSettings.subfieldCodePrefix.length;
    }
      */
    // Control field: tag (3) + empty (2)
    return 5;
}

// Inspired by https://stackoverflow.com/questions/36869503/set-caret-position-in-contenteditable-div-that-has-children
function setCursorPosition(elem, position) {
    let todoList = elem.childNodes;
    setCursorPosition2(todoList, position);
  
    function setCursorPosition2(todo, position) {
      //console.log(`Setting cursor to ${position}, with ${todo.length} element(s) to process`);
      const [currNode, ...remaining] = todo;
      if (!currNode) { // failure of some sort, abort
        return;
      }
      //console.log(` Curr node type: ${currNode.nodeType} (${typeof currNode.nodeType})`);
      if (currNode.nodeType == 3) { // text node
        //console.log(` Text node, length: ${currNode.length}`);
        if (currNode.length < position) { // Not yet there
          return setCursorPosition2(remaining, position - currNode.length);
        }
        // Success
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(currNode, position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      // Process currNode's children:
      return setCursorPosition2([...currNode.childNodes, ...remaining], position);
    }
}