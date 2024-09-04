//****************************************************************************//
//                                                                            //
// Functions for loginpage UI elements                                        //
//                                                                            //
//****************************************************************************//

import {addToggleAccordionEventListeners, getAllAccordions, toggleAccordion} from './accordion.js';
import {addPasswordVisibilityEventListeners} from './form.js';
import {
  addTabsEventListeners, clearAllTabSelections, hideAllPanelContents,
  inactivateAllTabs, selectTab
} from './panelTabs.js';
import {eventHandled} from './uiUtils.js';


window.addEventListener('load', (event) => {
  eventHandled(event);

  initializeLoginpage();
});


function initializeLoginpage() {
  const fillFormTab = document.getElementById('panelTabFillForm');
  const loginForm = document.getElementById('loginForm');
  const formContent = document.getElementById('panelContentForm');
  const instructionsContent = document.getElementById('panelContentInstructions');
  const passwordFormField = document.getElementById('passwordFormField');

  addPasswordVisibilityEventListeners(passwordFormField);
  addToggleInstructionAccordionEventListeners();

  addTabsEventListeners(activateTab);
  clearAllTabSelections();

  selectTab(fillFormTab);
  activateTab(fillFormTab)

  function activateTab(tab) {
    inactivateAllTabs(inactivateTab);

    if (tab.id === 'panelTabFillForm') {
      formContent.style.display = 'flex'
    }

    if (tab.id === 'panelTabReadInstructions') {
      instructionsContent.style.display = 'flex';
      loginForm.reset();
    }

  }

  function inactivateTab(tab) {
    // no tab specific functions, just hide all panel contents
    if (tab.id === 'panelTabFillForm' || tab.id === 'panelTabReadInstructions') {
      hideAllPanelContents();
    }

  }

  function addToggleInstructionAccordionEventListeners() {
    const instructionsAccordions = getAllAccordions(instructionsContent);
    addToggleAccordionEventListeners(instructionsAccordions);
  }

}

