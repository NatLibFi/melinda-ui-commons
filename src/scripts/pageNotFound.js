//****************************************************************************//
//                                                                            //
// Functions for 404 page                                                     //
//                                                                            //
//****************************************************************************//

/* global eventHandled, showSnackbar */


window.addEventListener('load', (event) => {
  eventHandled(event);

  showSnackbar({style: 'alert', text: 'Sivua ei löytynyt, tarkista sivun osoite ja yritä uudelleen!'});
});

window.goBack = function (event) {
  eventHandled(event);

  window.history.back();
};

