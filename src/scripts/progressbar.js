//****************************************************************************//
//                                                                            //
// Functions for progress indicator bar                                       //
//                                                                            //
//****************************************************************************//

window.startProcess = function () {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = 'progress-bar';
};

window.stopProcess = function () {
  const progressbar = document.querySelector(`#progressbar`);
  progressbar.className = 'progress-bar-inactive';
};
