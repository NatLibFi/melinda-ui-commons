//****************************************************************************//
//                                                                            //
// Functions for form elements                                                //
//                                                                            //
//****************************************************************************//

import {eventHandled} from './uiUtils.js';


export function addPasswordVisibilityEventListeners(passwordFormField) {
  const passwordVisibilityButton = passwordFormField.querySelector('.input-wrapper button');
  const passwordInput = passwordFormField.querySelector('.input-wrapper input');

  passwordVisibilityButton.addEventListener('click', event => {
    eventHandled(event);
    togglePasswordVisibility(passwordFormField);
  }, true);

  passwordFormField.addEventListener('focusout', event => {
    eventHandled(event);

    if (event.relatedTarget === passwordInput || event.relatedTarget === passwordVisibilityButton) {
      // user is editing password in the password form field, no need to hide password this time
      return;
    }

    hidePassword(passwordFormField);
  }, true);

}


export function togglePasswordVisibility(passwordFormField) {
  const passwordInput = passwordFormField.querySelector('.input-wrapper input');

  passwordInput.type === 'password'
    ? showPassword(passwordFormField)
    : hidePassword(passwordFormField)
}


export function showPassword(passwordFormField) {
  const passwordInput = passwordFormField.querySelector('.input-wrapper input');
  const passwordVisibilityButton = passwordFormField.querySelector('.input-wrapper button');

  passwordInput.type = 'text'; // njsscan-ignore: node_password
  passwordVisibilityButton.classList.add('visibility-on');
}


export function hidePassword(passwordFormField) {
  const passwordInput = passwordFormField.querySelector('.input-wrapper input');
  const passwordVisibilityButton = passwordFormField.querySelector('.input-wrapper button');

  passwordInput.type = 'password'; // njsscan-ignore: node_password
  passwordVisibilityButton.classList.remove('visibility-on');
}


export function resetForms(...elements) {
  for (const element of elements) {
    const forms = element.querySelectorAll('form');

    for (const form of forms) {
      form.reset();
    }

  }
}
