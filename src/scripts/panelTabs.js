//****************************************************************************//
//                                                                            //
// Melinda panel and tab helper functions                                     //
//                                                                            //
//****************************************************************************//

import {eventHandled} from './uiUtils.js';


export function addTabsEventListeners(activateTab, panel = null) {
  const panelTabs = getAllPanelTabs(panel);

  panelTabs.forEach(tab => {
    tab.addEventListener('click', event => {
      eventHandled(event)
      selectTab(tab, panel);
      activateTab(tab); //implement this function in your application
    })
  })

}


export function clearAllTabSelections(panel) {
  const tabs = getAllPanelTabs(panel);

  tabs.forEach(tab => {
    tab.classList.remove('current-tab');
  })

}


export function getAllPanelTabs(panelElement) {

  if (panelElement) {
    return panelElement.querySelectorAll('.panel-tab');
  }

  return document.querySelectorAll('.panel-tab');
}


export function getAllPanelContents() {
  return document.querySelectorAll('.panel-content');
}


export function hideAllPanelContents() {
  const panelContents = getAllPanelContents();

  panelContents.forEach(content => {
    content.style.display = 'none';
  })

}


export function inactivateAllTabs(inactivateTab) {
  const tabs = getAllPanelTabs();

  tabs.forEach(tab => {
    inactivateTab(tab); //implement this function in your application
  })
}


export function selectTab(tab, panel) {

  clearAllTabSelections(panel);
  tab.classList.add('current-tab');
}
