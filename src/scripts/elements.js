//-----------------------------------------------------------------------------
// HTML element helper functions
//-----------------------------------------------------------------------------


// enables the html element given as parameter
export function enableElement(element) {
  element.removeAttribute('disabled');
}


// disables the html element given as parameter
export function disableElement(element) {
  element.disabled = true;
}


// returns true if element is not visible
export function isHidden(element) {
  return element.offsetParent === null;
}


// returns true if element is hidden
export function isVisible(element) {
  return element.offsetParent !== null;
}


// highligts a html element with a background color for a moment
// if no color is given as parameter, uses default color defined in the CSS
export function highlightElement(element, color) {
  element.classList.add('highlight');

  if (color) {
    element.style.setProperty(`--highlightcolor`, color);
  }

  setTimeout(() => {
    element.classList.remove('highlight');
  }, 5000);
}



// returns an array of all html element descendants of the parent element
export function getAllDescendants(parentElement) {
  const allDescendantElements = parentElement.getElementsByTagName('*');
  return [...allDescendantElements];
}


//-----------------------------------------------------------------------------
// HTML element create functions
//-----------------------------------------------------------------------------

// creates a new html element option and returns it
// text and value attributes of element are given as parameters
export function createElementOption(text, value) {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;

  return option;
}
