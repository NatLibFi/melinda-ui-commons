
//****************************************************************************//
//                                                                            //
// Snackbar generator                                                         //
//                                                                            //
//****************************************************************************//
// Function for showing messages for user
//
// Use:
// - import showSnackbar to your app js from uiUtils
// - add empty div element to your app html with id 'snackbars' and class "snackbars"
// - call function with a string to create default snackbar or with a object parameter to create custom snackbar
//
// A: Default snackbar
//    * notification banner that is shown on top of the page to the user
//    * contains just your message as string with default style 'info' and button for closing snackbar.
//    * if your message text is long, you can use <br> to create line breaks.
//    => showSnackbar(string)
//    => example: showSnackbar('This is my message')
//
// B: Custom snackbar
//    * notification banner that is shown on top of the page to the user
//    * currently the options for custom snackbar are
//       - style (as string) => the style of messagge, one of the following: info, success, alert, error
//       - text (as string) => the message for user
//       - linkButton (as <button> element) => if the user can do some extra action
//    => showSnackbar({style: string, text: string, linkButton: <button>})
//    => example: showSnackbar({style: 'alert', text: 'This is my warning message', linkButton: myLinkButton})
//        - note for linkButton:
//            1. create a button element in app
//                  => example: const myLinkButton = document.createElement('button')
//            2. add button text as innerHtml
//                  => example: myLinkButton.innerHtml = 'open link or do some action'
//            3. add listener for 'click' events to include the chosen action for snacbar
//                  => example: myLinkButton.addEventListener('click', function (event) {eventHandled(event); ...my action code here... });
//****************************************************************************//


import {eventHandled} from './uiUtils.js';

// template for one snackbar -->
const snackbarTemplate = `
  <div id="snackbar" class="snackbar-container">
    <div class="snackbar-icon">
      <span class="material-icons">error_outline</span>
    </div>
    <div class="snackbar-text"></div>
    <div class="snackbar-link"></div>
    <div class="snackbar-close">
      <div class="snackbar-close-text">
        Sulje
      </div>
      <span class="material-icons snackbar-close-icon">close</span>
    </div>
  </div>
`;

export function showSnackbar(snackbarContent) {

  if (arguments.length === 0 || snackbarContent === null) {
    console.log('Snackbar needs arguments'); /* eslint-disable-line no-console */
    return;
  }

  createSnackbar(snackbarContent, snackbarTemplate);
}


// ************************************************************************************** //
// ************************************************************************************** //
// Creates new snackbar with given properties and add it to app's html.
//
// First clones snackbar template content to create a new snackbar element,
// then modifies snackbar element according to arguments given in parameter snackbarContent.
// After that, queries the calling app's html for div element with id 'snackbars',
// and adds the snackbar element to the element as first element.
// Also, clears the snackbars div from all snackbar elements after the (last) snackbar has displayed.


let timeoutId = null;

function createSnackbar(snackbarContent, snackbarTemplate) {
  const snackbarElement = getNewSnackbar(snackbarTemplate);
  const snackbarType = checkSnackbarType(snackbarContent);

  switch (true) {
  case snackbarType === 'string':
    createDefaultSnackbar(snackbarContent);
    break;
  case snackbarType === 'object':
    createCustomSnackbar(snackbarContent);
    break;
  default:
    console.log('Snackbar argument type should be string or object'); /* eslint-disable-line no-console */
    return;
  }

  const text = snackbarElement.querySelector(`.snackbar-text`).innerHTML;
  if (text === 'undefined' || text === '') {
    console.log('Snackbar is missing text and is not displayed!'); /* eslint-disable-line no-console */
    return;
  }

  addSnackbar();
  displaySnackbar();
  clearSnackbars();


  //************************************************************************************** */
  // Helper functions for createSnackbar:

  function getNewSnackbar(snackbarTemplate) {
    const template = document.createElement('template');
    template.innerHTML = snackbarTemplate;
    const snackbarElement = template.content.children;
    return snackbarElement[0];
  }

  function checkSnackbarType() {

    if (typeof snackbarContent === 'string' || snackbarContent instanceof String) {
      return 'string';
    }

    if (typeof snackbarContent === 'object' && Object.keys(snackbarContent).length !== 0 && Object.getPrototypeOf(snackbarContent) === Object.prototype) {
      return 'object';
    }
  }

  function createDefaultSnackbar(snackbarString) {
    createCustomSnackbar({text: snackbarString});
  }

  function createCustomSnackbar(snackbarObject) {
    const {style, text, linkButton} = snackbarObject;

    setSnackbarStyle();
    addTextToSnackbar(text);
    addLinkButton();
    addCloseButton();

    function setSnackbarStyle() {

      // style 'info' is the default status message
      // snackbar has blue background with info icon
      let backgroundColor = 'var(--color-blue-60)';
      let iconColor = 'var(--color-blue-100)';
      let icon = 'error_outline';


      if (style === 'success') {
        backgroundColor = 'var(--color-green-80)';
        iconColor = 'var(--color-green-100)';
        icon = 'check_circle_outline';
      }

      if (style === 'alert') {
        backgroundColor = 'var(--color-yellow-80)';
        iconColor = 'var(--color-blue-100)';
        icon = 'warning_amber';
      }

      if (style === 'error') {
        backgroundColor = 'var(--color-red-80)';
        iconColor = 'var(--color-red-100)';
        icon = 'report_gmailerrorred';
      }

      snackbarElement.style.setProperty(`--style-background-color`, backgroundColor);
      snackbarElement.style.setProperty(`--style-icon-color`, iconColor);
      snackbarElement.querySelector(`.snackbar-icon .material-icons`).innerHTML = icon;

    }

    function addLinkButton() {
      if (linkButton !== undefined && linkButton.nodeName === 'BUTTON') {
        snackbarElement.querySelector(`.snackbar-link`).style.display = 'flex';
        snackbarElement.querySelector(`.snackbar-link`).append(linkButton);
      }
    }

  }

  function addTextToSnackbar(text) {
    snackbarElement.querySelector(`.snackbar-text`).innerHTML = text;
  }

  function addCloseButton() {
    snackbarElement.querySelector(`.snackbar-close`).addEventListener('click', (event) => {
      eventHandled(event);
      snackbarElement.style.visibility = 'hidden';
    });
  }

  function addSnackbar() {
    const snackbarsContainer = document.getElementById('snackbars');
    snackbarsContainer.prepend(snackbarElement);
  }

  function displaySnackbar() {
    const snackbar = document.querySelector('#snackbar');

    listenToSnackbarAnimationStart();
    listenToSnackbarAnimationEnd();

    snackbar.classList.add('show-and-hide');

    function listenToSnackbarAnimationStart() {
      snackbar.onanimationstart = (event) => {
        if (event.animationName === 'fadein') {
          //console.log('Now showing snackbar to user!');
        }
      };
    }

    function listenToSnackbarAnimationEnd() {
      snackbar.onanimationend = (event) => {
        if (event.animationName === 'fadeout') {
          snackbar.style.visibility = 'hidden';
        }
      };
    }

  }

  function clearSnackbars() {
    clearTimeout(timeoutId);

    // This should be accurate enough for most use cases
    timeoutId = setTimeout(() => {
      removeAllSnackbarElements();
    }, 7000);

    function removeAllSnackbarElements() {
      const snackbarsContainer = document.getElementById('snackbars');
      snackbarsContainer.replaceChildren();
    }

  }

}
