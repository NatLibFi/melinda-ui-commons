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
