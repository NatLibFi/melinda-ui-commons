/* eslint-disable no-return-assign */

//****************************************************************************//
//                                                                            //
// Utilities for UI                                                           //
//                                                                            //
//****************************************************************************//


//-----------------------------------------------------------------------------
// Handling and ignoring event
//-----------------------------------------------------------------------------

export function eventHandled(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  return true;
}

export function ignore(event) {
  return eventHandled(event);
}


//-----------------------------------------------------------------------------
// Helper for HTML component: accordion
//-----------------------------------------------------------------------------

export function toggleAccordion(event) {
  const accordionId = event.target.id;
  const accordion = document.getElementById(accordionId);

  accordion.classList.toggle('expanded');

  return eventHandled(event);
}
