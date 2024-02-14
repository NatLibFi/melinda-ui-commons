//****************************************************************************//
//                                                                            //
// Functions for homepage                                                     //
//                                                                            //
//****************************************************************************//

import {eventHandled, toggleAccordion} from './ui-utils.js';


window.addEventListener('load', (event) => {
  eventHandled(event);

  addHomepageEventListeners();

  function addHomepageEventListeners() {
    const homepageHelpAccordion = document.getElementById('homepageHelpAccordion');
    const homepageContactAccordion = document.getElementById('homepageContactAccordion');

    homepageHelpAccordion.addEventListener('click', event => {
      toggleAccordion(event);
    });

    homepageContactAccordion.addEventListener('click', event => {
      toggleAccordion(event);
    });

  }

});
