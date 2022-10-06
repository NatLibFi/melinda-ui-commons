//*****************************************************************************
//
// Utilities for UI
//
//*****************************************************************************

import {setNavBar, startProcess, stopProcess} from './navbar';

export {setNavBar, startProcess, stopProcess};

//-----------------------------------------------------------------------------

window.eventHandled = function (e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  return true;
};

window.ignore = function (e) {
  console.log('Ignore'); // eslint-disable-line no-console
  return eventHandled(e); // eslint-disable-line no-undef
};

//-----------------------------------------------------------------------------

export function formToJson(formSubmitEvent) {
  const formData = new FormData(formSubmitEvent.target);
  const formJson = {};
  formData.forEach((value, key) => {
    if (key.indexOf('-array') > -1) {
      if (formJson[key] === undefined) {
        formJson[key] = [value];
        return;
      }

      formJson[key].push(value);
      return;
    }

    formJson[key] = value;
    return;
  });

  return formJson;
}

export function createP(value, before = '', after = '', classList = []) {
  const p = document.createElement('p');
  p.innerHTML = `${before}${value}${after}`;
  classList.forEach(htmlClass => p.classList.add(htmlClass));
  return p;
}

export function createHiddenInput(value, name) {
  const input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('value', value);
  input.setAttribute('name', name);
  return input;
}

export function createIconButton(icon, classList = [], onclickAttribute = false, tooltip = false) {
  const button = document.createElement('button');
  button.innerHTML = icon;
  button.classList.add('material-icons');
  button.classList.add('icon');

  classList.forEach(htmlClass => button.classList.add(htmlClass));
  if (onclickAttribute) {
    button.setAttribute('onclick', onclickAttribute);
  }

  if (tooltip) {
    button.classList.add('tooltip');
    button.setAttribute('tooltip-text', tooltip);
  }

  return button;
}

export function setOptions(element, jsonArray, disabled = false) {
  element.innerHTML = '';
  jsonArray.forEach((obj, index) => {
    const opt = document.createElement('option');
    opt.value = obj.value;
    opt.innerHTML = obj.text;
    opt.selected = disabled;
    opt.disabled = disabled;
    element.append(opt);
    if (element.nodeName === 'select' && index === 0) {
      element.selectedIndex = 0;
    }
  });

  element.dispatchEvent(new Event('change'));
}

export function showTab(...tabs) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (tabs.includes(child.getAttribute('id'))) {
      child.hidden = false;
      child.style.display = null;
    } else {
      child.hidden = true;
      child.style.display = 'none';
    }
  }
}

export function resetForms(...elems) {
  for (const elem of elems) {
    const forms = elem.querySelectorAll('form');
    for (const form of forms) {
      form.reset();
    }
  }
}

export function reload() {
  // Programmatically reload page and reset forms
  location.reload();
}

//-----------------------------------------------------------------------------

export function createMenuItem(name, className) {
  const item = document.createElement('div');
  item.classList.add(className);
  item.innerHTML = name;
  return item;
}

export function createMenuSelection(group, value, desc, className) {
  const id = `${group}-${value}`;
  const item = createMenuItem('', className);
  const radiobtn = document.createElement('input');
  radiobtn.setAttribute('type', 'radio');
  radiobtn.setAttribute('id', id);
  radiobtn.setAttribute('name', group);
  radiobtn.setAttribute('value', value);
  radiobtn.setAttribute('value', value);

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.innerHTML = desc;

  item.appendChild(radiobtn);
  item.appendChild(label);
  return item;
}

export function createMenuBreak() {
  const item = document.createElement('hr');
  return item;
}
