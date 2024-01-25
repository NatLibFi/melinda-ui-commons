/* eslint-disable no-return-assign */

//****************************************************************************//
//                                                                            //
// Utilities for UI                                                           //
//                                                                            //
//****************************************************************************//


/* global eventHandled */


//-----------------------------------------------------------------------------
// Handling and ignoring event
//-----------------------------------------------------------------------------

window.eventHandled = function (event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  return true;
};

window.ignore = function (event) {
  return eventHandled(event);
};


//-----------------------------------------------------------------------------
// Helper for HTML component: accordion
//-----------------------------------------------------------------------------

window.toggleAccordion = function (event) {
  const accordionId = event.target.id;
  const accordion = document.getElementById(accordionId);

  accordion.classList.toggle('expanded');

  return eventHandled(event);
};
