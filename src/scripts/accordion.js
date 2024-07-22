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
