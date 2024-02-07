//****************************************************************************//
//                                                                            //
// Melinda navigation bar custom element for apps                             //
//                                                                            //
//****************************************************************************//

import {eventHandled} from './ui-utils.js';


window.addEventListener('load', (event) => {
  eventHandled(event);
  setNavbar();
});

function setNavbar() {
  addNavbarEventListeners();

  // Add event listeners for navbar related functions
  function addNavbarEventListeners() {
    const dropdownMenuButtons = document.querySelectorAll('.navbar-dropdown-button');
    const dropdownCloseButtons = document.querySelectorAll('.dropdown-button-close');

    dropdownMenuButtons.forEach(button => {
      addDropdownMenuEventListener(button);
    });

    dropdownCloseButtons.forEach(button => {
      addDropdownCloseButtonEventListener(button);
    });

    addDismissNavbarEventListener();


    // Toggles showing or hiding dropdown menus in navbar
    // - shows the dropdown menu when it's button is clicked and it is not closed
    // - hides the dropdown menu if it's already open.
    // In addition, automatically close all other dropdown menus in navbar.
    function addDropdownMenuEventListener(button) {

      button.addEventListener('click', event => {
        event.preventDefault();

        const dropdownMenuId = `${button.id}Dropdown`;
        const dropdownMenu = document.getElementById(dropdownMenuId);
        const expandMoreIcon = document.querySelector(`#${button.id} .expand-more`);
        const expandLessIcon = document.querySelector(`#${button.id} .expand-less`);
        const showDropdownMenu = !dropdownMenu.classList.contains('show');

        closeAllDropdownMenus();

        if (showDropdownMenu) {
          dropdownMenu.classList.add('show');
          expandLessIcon.classList.add('show');
          expandMoreIcon.classList.remove('show');
        }

      });
    }

    // Clicking a close button in a dropdown menu
    // hides automatically all dropdown menus in navbar.
    function addDropdownCloseButtonEventListener(button) {

      button.addEventListener('click', event => {
        event.preventDefault();

        closeAllDropdownMenus();
      });
    }

    // Clicking outside of navbar in window or pressing Esc
    // hides automatically all dropdown menus in navbar
    function addDismissNavbarEventListener() {

      window.addEventListener('click', event => {
        const navbar = document.getElementById('navbar');

        if (!navbar.contains(event.target)) {
          closeAllDropdownMenus();
        }
      });

      window.addEventListener('keydown', event => {
        const dropdownMenus = document.querySelectorAll(`.navbar-dropdown-menu`);

        dropdownMenus.forEach(dropdown => {
          if (dropdown.classList.contains('show') && event.code === 'Escape') {
            eventHandled(event);
            closeAllDropdownMenus();
          }
        });
      });

    }

    // Closes all dropdown menus in navbar
    // and updates all the chevron icons
    function closeAllDropdownMenus() {
      const allDropdownMenus = document.querySelectorAll('.navbar-dropdown-menu');
      const allExpandMoreIcons = document.querySelectorAll('.expand-more');
      const allExpandLessIcons = document.querySelectorAll('.expand-less');

      allDropdownMenus.forEach(menu => {
        menu.classList.remove('show');
      });

      allExpandMoreIcons.forEach(icon => {
        icon.classList.add('show');
      });

      allExpandLessIcons.forEach(icon => {
        icon.classList.remove('show');
      });

    }
  }
}
