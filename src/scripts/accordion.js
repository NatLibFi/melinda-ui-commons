//---------------------------------------------------------------------------//
// Accordion                                                                 //
//---------------------------------------------------------------------------//

import {eventHandled} from './uiUtils.js';


export function toggleAccordion(event) {
  const accordionId = event.target.id;
  const accordion = document.getElementById(accordionId);

  accordion.classList.toggle('expanded');

  return eventHandled(event);
}

export function getAllAccordions(parentElement) {
  if (parentElement) {
    return parentElement.querySelectorAll('.accordion-heading');
  }

  document.querySelectorAll('.accordion-heading');
}

export function addToggleAccordionEventListeners(accordions) {
  accordions.forEach(accordion => {
    accordion.addEventListener('click', event => {
      toggleAccordion(event);
    });
  })
}