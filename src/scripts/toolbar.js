/*****************************************************************************/
/* TOOLBAR ACTIONS                                                           */
/*****************************************************************************/

import {eventHandled} from './uiUtils.js';

/*****************************************************************************/


export function addToolbarEventListeners(addDropdownOpenedEventListeners) {
  const toolbarActions = getAllToolbarActions();
  const toolbarDropdowns = getAllToolbarDropdowns();
  const dropdownPinButtons = getAllDropdownPinButtons();
  const dropdownCloseButtons = getAllDropdownCloseButtons();

  toolbarActions.forEach(action => {
    addToolbarActionEventListener(action)
  })

  dropdownPinButtons.forEach(button => {
    addDropdownPinButtonEventListener(button);
  })

  dropdownCloseButtons.forEach(button => {
    addDropdownCloseButtonEventListener(button);
  })

  if (addDropdownOpenedEventListeners) {
    // implement event listener for dropdownOpened events in your application:
    // what happens when a dropdown is opened, is a specific element focused perhaps?
    addDropdownOpenedEventListeners(toolbarDropdowns);
  }

  addDismissDropdropwnEventListeners();
}


export function getAllToolbarActions() {
  return document.querySelectorAll('.toolbar-action');
}


export function getAllToolbarDropdowns() {
  return document.querySelectorAll('.toolbar-dropdown');
}


export function refreshToolbar() {
  hideUnpinnedDropdowns();
}


/*****************************************************************************/


function addToolbarActionEventListener(action) {
  const dropdown = getRelatedDropdown(action);

  action.addEventListener('click', event => {
    eventHandled(event);

    const dropdownOpenedEvent = new CustomEvent('dropdownOpened');

    isVisible(dropdown)
      ? (hideUnpinnedDropdowns(), hideToolbarDropdown(dropdown))
      : (hideUnpinnedDropdowns(), showToolbarDropdown(dropdown), dropdown.dispatchEvent(dropdownOpenedEvent));
  })

}

function addDropdownPinButtonEventListener(button) {

  button.addEventListener('click', event => {
    event.preventDefault();

    const dropdown = button.closest('.toolbar-dropdown');
    const action = getRelatedAction(dropdown);

    isPinned(action)
      ? (unpinAllToolbarDropdowns())
      : (hideAllToolbarDropdowns(), unpinAllToolbarDropdowns(), showToolbarDropdown(dropdown), pinToolbarDropdown(action, dropdown))
  });

}


function addDropdownCloseButtonEventListener(button) {

  button.addEventListener('click', event => {
    event.preventDefault();
    hideUnpinnedDropdowns();
  });

}


function addDismissDropdropwnEventListeners() {

  window.addEventListener('keydown', event => {
    const toolbarDropdowns = getAllToolbarDropdowns();

    toolbarDropdowns.forEach(dropdown => {
      if (isVisible(dropdown) && event.code === 'Escape') {
        eventHandled(event);
        hideUnpinnedDropdowns();
      }
    });
  });

  window.addEventListener('click', event => {
    const toolbar = document.querySelector('.toolbar');

    if (!toolbar.contains(event.target)) {
      hideUnpinnedDropdowns();
    }
  })
}



/*****************************************************************************/


function getRelatedDropdown(action) {
  const actionId = action.id;
  const dropdownId = actionId.replace('Action', 'Dropdown');

  return document.getElementById(dropdownId);
}


function getRelatedAction(dropdown) {
  const dropdownId = dropdown.id;
  const actionId = dropdownId.replace('Dropdown', 'Action');

  return document.getElementById(actionId);
}


function hideAllToolbarDropdowns() {
  const allToolbarDropdowns = getAllToolbarDropdowns();
  const allTooblbarActions = getAllToolbarActions();

  allTooblbarActions.forEach(action => {
    action.classList.remove('expanded');
  })

  allToolbarDropdowns.forEach(dropdown => {
    dropdown.classList.remove('show');
  });

}


function unpinAllToolbarDropdowns() {
  const allToolbarDropdowns = getAllToolbarDropdowns();
  const allTooblbarActions = getAllToolbarActions();

  allTooblbarActions.forEach(action => {
    action.classList.remove('pinned');
  })

  allToolbarDropdowns.forEach(dropdown => {
    dropdown.classList.remove('pin');
  });
}


function hideUnpinnedDropdowns() {
  const allTooblbarActions = getAllToolbarActions();

  allTooblbarActions.forEach(action => {
    const dropdown = getRelatedDropdown(action);

    if (isPinned(action)) {
      return;
    }

    hideToolbarDropdown(dropdown);

  })

}


function isPinned(action) {
  return action.classList.contains('pinned');
}


function isVisible(dropdown) {
  return dropdown.classList.contains('show');
}


function hideToolbarDropdown(dropdown) {
  const action = getRelatedAction(dropdown);

  if (isPinned(action)) {
    return;
  }

  dropdown.classList.remove('show');
  action.classList.remove('expanded');
}


function showToolbarDropdown(dropdown) {
  dropdown.classList.add('show');

  const action = getRelatedAction(dropdown);
  action.classList.add('expanded');
}


function pinToolbarDropdown(action, dropdown) {
  action.classList.add('pinned');
  dropdown.classList.add('pin');
}


function getAllDropdownCloseButtons() {
  return document.querySelectorAll('.dropdown-dismiss');
}


function getAllDropdownPinButtons() {
  return document.querySelectorAll('.dropdown-pin');
}
