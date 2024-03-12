//****************************************************************************//
//                                                                            //
// Functions for 404 page                                                     //
//                                                                            //
//****************************************************************************//

import {eventHandled, toggleAccordion} from './uiUtils.js';
import {showSnackbar} from './snackbar.js';


window.addEventListener('load', (event) => {
  eventHandled(event);

  addPageNotFoundEventListeners();
  showSnackbar({style: 'alert', text: 'Sivua ei löytynyt, tarkista sivun osoite ja yritä uudelleen!'});

  function addPageNotFoundEventListeners() {
    const goBackButton = document.getElementById('goBack');
    const pageNotFoundHelpAccordion = document.getElementById('pageNotFoundHelpAccordion');
    const pageNotFoundContactAccordion = document.getElementById('pageNotFoundContactAccordion');

    goBackButton.addEventListener('click', event => {
      eventHandled(event);
      window.history.back();
    });


    pageNotFoundHelpAccordion.addEventListener('click', event => {
      toggleAccordion(event);
    });

    pageNotFoundContactAccordion.addEventListener('click', event => {
      toggleAccordion(event);
    });

  }

});
