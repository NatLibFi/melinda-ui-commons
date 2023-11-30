//-----------------------------------------------------------------------------
// HTML element helper functions
//-----------------------------------------------------------------------------

// enables the html element given as parameter
window.enableElement = function (element) {
  element.removeAttribute('disabled');
};

// disables the html element given as parameter
window.disableElement = function (element) {
  element.disabled = true;
};

// returns true if element is not visible
window.isHidden = function (element) {
  return element.offsetParent === null;
};

// returns true if element is hidden
window.isVisible = function (element) {
  return element.offsetParent !== null;
};


// highligts a html element with a background color for a moment
// if no color is given as parameter, uses default color defined in the CSS
window.highlightElement = function (element, color) {
  element.classList.add('highlight');

  if (color) {
    element.style.setProperty(`--highlightcolor`, color);
  }

  setTimeout(() => {
    element.classList.remove('highlight');
  }, 5000);
};


window.resetForms = function (...elements) {
  for (const element of elements) {
    const forms = element.querySelectorAll('form');

    for (const form of forms) {
      form.reset();
    }

  }
};


// returns an array of all html element descendants of the parent element
window.getAllDescendants = function (parentElement) {
  const allDescendantElements = parentElement.getElementsByTagName('*');
  return [...allDescendantElements];
};


//-----------------------------------------------------------------------------
// HTML element create functions
//-----------------------------------------------------------------------------

// creates a new html element option and returns it
// text and value attributes of element are given as parameters
window.createElementOption = function (text, value) {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;

  return option;
};


