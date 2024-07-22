//****************************************************************************//
//                                                                            //
// Melinda panel and tab helper functions                                     //
//                                                                            //
//****************************************************************************//

import {eventHandled} from './uiUtils.js';


export function addTabsEventListeners() {
  const panelTabs = getAllPanelTabs();

  panelTabs.forEach(tab => {
    tab.addEventListener('click', event => {
      eventHandled(event)
      selectTab(tab);
      activateTab(tab); //implement this function in your application
    })
  })

}

export function clearAllTabSelections() {
  const tabs = getAllPanelTabs();

  tabs.forEach(tab => {
    tab.classList.remove('current-tab');
  })

}

export function getAllPanelTabs() {
  return document.querySelectorAll('.panel-tab');
}

export function selectTab(tab) {
  clearAllTabSelections();
  tab.classList.add('current-tab');
}
