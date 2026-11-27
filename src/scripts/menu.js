//****************************************************************************//
//                                                                            //
// Navigation menus (styles/menu.css)                                         //
//                                                                            //
//****************************************************************************//
//
// Opens and closes the dropdown, modal, mega and mobile menus of the header
// (style guide p.56-58). A toggle is a button with aria-expanded and
// aria-controls pointing to the menu it opens:
//
//    <button class="menu-link menu-link-dropdown" type="button"
//            aria-expanded="false" aria-controls="services-menu"
//            data-menu-toggle>...</button>
//    <ul class="menu-dropdown" id="services-menu" hidden>...</ul>
//
//    - a click (also Enter and Space on the button) opens the menu, a second
//      click closes it. Menus never open on mouse-over
//    - only one menu is open at a time: opening a menu closes the others
//    - Esc, a [data-menu-close] button inside the menu and a click outside
//      the menu and its toggle close it. Esc and the close button move the
//      focus back to the toggle
//    - several toggles may control the same menu (for example the desktop
//      "Search" link and the mobile search icon): all of them get the same
//      aria-expanded
//    - a modal menu (.menu-modal) moves the focus to its first field when it
//      opens
//    - data-expanded-icon / data-collapsed-icon swap the icon class of the
//      toggle icon that has one of them (fa-xmark and fa-bars), and
//      data-expanded-label / data-collapsed-label its aria-label
//
// Expand buttons of the mobile main menu open sub-menus independently of each
// other and of the menus above:
//
//    <button class="mobile-menu-expand" type="button" aria-expanded="false"
//            aria-controls="m-services" data-menu-expand
//            data-collapsed-icon="fa-plus" data-expanded-icon="fa-minus">
//      <i class="fa-light fa-plus" aria-hidden="true"></i>
//    </button>
//    <ul class="mobile-menu-submenu" id="m-services" hidden>...</ul>
//
// initializeMenus(root) adds the behaviour to every [data-menu-toggle] and
// [data-menu-expand] button under root (default: document). It can be called
// again after adding menus; each button is set up only once.
//
//----------------------------------------------------------------------------//


const openMenus = new Set();
let documentListenersAdded = false;


export function initializeMenus(root = document) {
  root.querySelectorAll('[data-menu-toggle]').forEach(setUpToggle);
  root.querySelectorAll('[data-menu-expand]').forEach(setUpExpandButton);

  if (!documentListenersAdded) {
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('click', closeOnClickOutside);
    documentListenersAdded = true;
  }
}


//----------------------------------------------------------------------------//
// Menu toggles

function setUpToggle(toggle) {
  if (toggle.dataset.menuInitialized) {
    return;
  }

  const menu = getControlledElement(toggle);

  if (!menu) {
    return;
  }

  toggle.dataset.menuInitialized = 'true';
  toggle.addEventListener('click', event => {
    event.preventDefault();
    const open = toggle.getAttribute('aria-expanded') !== 'true';

    if (open) {
      openMenu(menu);
      return;
    }

    closeMenu(menu);
  });

  menu.querySelectorAll('[data-menu-close]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      closeMenu(menu, {returnFocus: true});
    });
  });

  setMenuState(menu, !menu.hidden);
}

function openMenu(menu) {
  openMenus.forEach(other => {
    if (other !== menu) {
      closeMenu(other);
    }
  });

  setMenuState(menu, true);

  if (menu.classList.contains('menu-modal')) {
    const field = menu.querySelector('input, select, textarea');
    field?.focus();
  }
}

function closeMenu(menu, {returnFocus = false} = {}) {
  if (!openMenus.has(menu) && menu.hidden) {
    return;
  }

  const focusWasInside = menu.contains(document.activeElement);
  setMenuState(menu, false);

  if (returnFocus || focusWasInside) {
    const toggle = getVisibleToggle(menu);
    toggle?.focus();
  }
}

function setMenuState(menu, open) {
  menu.hidden = !open;

  if (open) {
    openMenus.add(menu);
  } else {
    openMenus.delete(menu);
  }

  getToggles(menu).forEach(toggle => {
    toggle.setAttribute('aria-expanded', String(open));
    swapIcon(toggle, open);
    swapLabel(toggle, open);
  });
}

function getToggles(menu) {
  return Array.from(document.querySelectorAll(`[data-menu-toggle][aria-controls="${CSS.escape(menu.id)}"]`));
}

// The toggle that the user can see: the desktop link or the mobile icon
function getVisibleToggle(menu) {
  const toggles = getToggles(menu);
  return toggles.find(toggle => toggle.getClientRects().length > 0) || toggles[0];
}


//----------------------------------------------------------------------------//
// Closing with Esc and with a click outside the menu

function closeOnEscape(event) {
  if (event.key !== 'Escape' || openMenus.size === 0) {
    return;
  }

  // Close the menu that has the focus, or the last opened menu
  const menus = Array.from(openMenus);
  const menu = menus.find(open => open.contains(document.activeElement)) || menus[menus.length - 1];
  event.preventDefault();
  closeMenu(menu, {returnFocus: true});
}

function closeOnClickOutside(event) {
  openMenus.forEach(menu => {
    const insideMenu = menu.contains(event.target);
    const onToggle = getToggles(menu).some(toggle => toggle.contains(event.target));

    if (!insideMenu && !onToggle) {
      closeMenu(menu);
    }
  });
}


//----------------------------------------------------------------------------//
// Mobile main menu expand buttons

function setUpExpandButton(button) {
  if (button.dataset.menuInitialized) {
    return;
  }

  const submenu = getControlledElement(button);

  if (!submenu) {
    return;
  }

  button.dataset.menuInitialized = 'true';
  button.addEventListener('click', event => {
    event.preventDefault();
    const open = button.getAttribute('aria-expanded') !== 'true';
    submenu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    swapIcon(button, open);
    swapLabel(button, open);
  });
}


//----------------------------------------------------------------------------//
// Helpers

function getControlledElement(button) {
  const id = button.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
}

function swapIcon(button, open) {
  const {expandedIcon, collapsedIcon} = button.dataset;

  if (!expandedIcon || !collapsedIcon) {
    return;
  }

  const icon = button.querySelector(`.${CSS.escape(expandedIcon)}, .${CSS.escape(collapsedIcon)}`);
  icon?.classList.replace(open ? collapsedIcon : expandedIcon, open ? expandedIcon : collapsedIcon);
}

function swapLabel(button, open) {
  const label = open ? button.dataset.expandedLabel : button.dataset.collapsedLabel;

  if (label) {
    button.setAttribute('aria-label', label);
  }
}
