//---------------------------------------------------------------------------//
// Combobox                                                                  //
// - creates a combobox element and the functionalities                      // 
//---------------------------------------------------------------------------//

import {getAllDescendants} from './elements.js';
import {eventHandled} from './uiUtils.js';


export function createCombobox({comboboxId, comboboxOptions = [], comboboxSelectedValue = undefined}) {

  if (!comboboxId) {
    console.log(`Function 'createCombobox' is missing an obligatory parameter: comboboxId`);
    return;
  }

  const combobox = document.getElementById(comboboxId);
  const input = document.querySelector(`#${comboboxId} input`);
  const select = document.querySelector(`#${comboboxId} select`);
  const inputWrapper = document.querySelector(`#${comboboxId} .input-wrapper`);
  const customWrapper = document.querySelector(`#${comboboxId} .custom-wrapper`);
  const allComboboxes = document.querySelectorAll('.combobox');

  createComboboxElements();
  addComboboxListeners();


  //-----------------------------------------------------------------------------------
  // Main functions for creating combobox

  function createComboboxElements() {
    updateComboboxOptions();
    createHiddenOptions();
    createVisibleOptions();
    setInitialSelectedOption();
  }

  function addComboboxListeners() {
    addInputWrapperListeners();
    addCustomWrapperListeners();
    addWindowListeners();
  }


  //--------------------------------------------------------
  // Helper functions for functions createComboboxElements and addComboboxListeners

  function updateComboboxOptions() {
    [...select.options].forEach(selectOption => {

      if (isDuplicate(selectOption.value)) {
        return;
      }

      const newComboboxOption = {header: selectOption.innerText, value: selectOption.value};
      comboboxOptions.push(newComboboxOption)

    })

    select.replaceChildren();

    function isDuplicate(value) {
      return comboboxOptions.some(comboboxOption => comboboxOption.value === value)
    }


  }

  function createHiddenOptions() {

    comboboxOptions.forEach(option => {
      select.add(createNewHiddenOption(option));

      function createNewHiddenOption(option) {
        const newOption = document.createElement('option');
        newOption.text = option.header
        newOption.value = option.value;
        return newOption;
      }
    });

  }

  function createVisibleOptions() {
    const divCustomSelect = createElementWithClassAndInnerHtml('div', 'custom-select');

    comboboxOptions.forEach(option => {
      divCustomSelect.append(createNewVisibleOption(option));
    })

    addNoResultsOption();

    customWrapper.append(divCustomSelect);


    function addNoResultsOption() {
      const noResultsOption = createNewVisibleOption({header: 'Ei hakutuloksia'});

      if (divCustomSelect.hasChildNodes()) {
        noResultsOption.classList.add('hidden');
      }

      divCustomSelect.append(noResultsOption);
    }

  }

  function setInitialSelectedOption() {
    select.selectedIndex = -1;

    if (comboboxSelectedValue) {
      setAsSelected(comboboxSelectedValue);
    }
  }

  function addInputWrapperListeners() {

    inputWrapper.addEventListener('click', event => {
      handleInputWrapperClick(event);
    })

    inputWrapper.addEventListener('keydown', event => {
      handleInputWrapperKeydown(event);
    })

    input.addEventListener('input', event => {
      handleInputChange(event);
    })

    input.addEventListener('keydown', event => {
      handleInputKeydown(event);
    })

  }

  function addCustomWrapperListeners() {

    const visibleOptions = getAllDescendants(customWrapper).filter(descendant => (descendant.classList.contains('custom-option')))

    visibleOptions.forEach(option => {

      option.addEventListener('click', event => {
        handleOptionClick(event);
      })

      option.addEventListener('keydown', event => {
        handleOptionKeydown(event);
      })

    });

  }

  function addWindowListeners() {

    window.addEventListener('click', event => {
      handleWindowClick(event);
    });

    window.addEventListener('keydown', event => {
      allComboboxes.forEach(combobox => {
        handleWindowKeydown(combobox, event);
      });
    });

  }


  //--------------------------------------------------------
  // Functions for handling events listened

  function handleInputWrapperClick(event) {
    eventHandled(event);

    if (buttonIsTarget(event.target)) {
      handleButtonClick();
      return;
    }

    if (inputIsTarget(event.target)) {
      handleInputClick();
      return;
    }

    handleWrapperClick();


    function handleButtonClick() {

      if (input.value && isExpanded()) {
        clearInput();
        unselectOptions();
        hideOptionsList();
      }

      toggleOptionsList();
    }

    function handleInputClick() {
      showOptionsList();
    }

    function handleWrapperClick() {
      toggleOptionsList();
    }

    function buttonIsTarget(targetElement) {
      return targetElement.nodeName === 'BUTTON' || targetElement.nodeName === 'SPAN';
    }

    function inputIsTarget(targetElement) {
      return targetElement.nodeName === 'INPUT';
    }

  }

  function handleInputWrapperKeydown(event) {
    if (combobox.classList.contains('expanded') && event.code === 'ArrowDown') {
      getAllCustomOptions()[0].focus();
    }
  }

  function handleInputChange(event) {
    eventHandled(event);

    const filter = event.target.value.toLowerCase();
    const filteredOptions = filterOptions(filter);

    refreshOptions();
    refreshSelectedOption();
    hideAllOptions();
    showMatchedOptions();
    showOptionsList();

    if (filteredOptions.length === 0) {
      showNoResultsOption();
    }

    function filterOptions(filter) {
      return comboboxOptions.filter(option => option.header?.toLowerCase().includes(filter) || option.content?.toLowerCase().includes(filter));
    }

    function showMatchedOptions() {
      filteredOptions.forEach(option => {
        const customOption = getCustomOption(option.value);
        underlineMatches(customOption);
        customOption.classList.remove('hidden');

        function underlineMatches() {
          const header = customOption.querySelector('.custom-option-header');
          const content = customOption.querySelector('.custom-option-content');

          header.innerHTML = decorateMatch(header.innerHTML, filter);
          content.innerHTML = decorateMatch(content.innerHTML, filter);
        }

      })

    }

  }

  function handleInputKeydown(event) {
    if (combobox.classList.contains('expanded') && event.code === 'ArrowDown') {
      getAllCustomOptions()[0].focus();
    }
  }

  function handleOptionClick(event) {
    eventHandled(event);
    selectOption(event.target);
  }

  function handleOptionKeydown(event) {

    if (!combobox.classList.contains('expanded')) {
      return;
    }

    if (event.code === 'ArrowDown') {
      eventHandled(event);

      const nextOption = event.target.nextSibling;

      if (nextOption.dataset.value === 'undefined') {
        return;
      }

      nextOption.focus();
    }

    if (event.code === 'ArrowUp') {
      eventHandled(event);

      const previousOption = event.target.previousSibling;

      if (!previousOption) {
        input.focus();
        return;
      }

      previousOption.focus();
    }

    if ((event.code === 'Enter' || event.code === 'NumpadEnter')) {
      eventHandled(event);

      selectOption(event.target);
    }

  }

  function handleWindowClick(event) {
    if (!combobox.contains(event.target)) {

      if (combobox.classList.contains('expanded')) {
        refreshOptions();
        restoreSelectedOption();
      }

      closeAllComboboxes();
    }
  }

  function handleWindowKeydown(combobox, event) {
    if (combobox.classList.contains('expanded') && event.code === 'Escape') {
      eventHandled(event);
      refreshOptions();
      restoreSelectedOption();
      closeAllComboboxes();
    }

  }


  //--------------------------------------------------------
  // General combobox helper functions

  function clearInput() {
    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('input'));
  }

  function closeAllComboboxes() {
    allComboboxes.forEach(combobox => {
      combobox.classList.remove('expanded');
    });
  }

  function createNewVisibleOption(optionObject) {
    const customOptionDiv = createElementWithClassAndInnerHtml('div', 'custom-option');
    customOptionDiv.dataset.value = optionObject.value;

    const customOptionHeader = createElementWithClassAndInnerHtml('div', 'custom-option-header', optionObject.header);
    const customOptionContent = createElementWithClassAndInnerHtml('div', 'custom-option-content', optionObject.content);

    customOptionDiv.tabIndex = 0;
    customOptionHeader.tabIndex = -1;
    customOptionContent.tabIndex = -1;

    customOptionDiv.append(customOptionHeader, customOptionContent);

    return customOptionDiv;
  }

  function createElementWithClassAndInnerHtml(element, elementClass, elementInnerHtml) {
    const newElement = document.createElement(element);
    newElement.innerHTML = elementInnerHtml || '';
    newElement.classList.add(elementClass);

    return newElement;
  }

  function decorateMatch(string, substring) {
    const underlinedSubstring = `<span class="underlined">$&</span>`;
    const regExp = new RegExp(`${substring}`, 'gi');
    return string.replace(regExp, underlinedSubstring);
  }

  function getAllCustomOptions() {
    return document.querySelectorAll(`#${comboboxId} .custom-option`);
  }

  function getCustomOption(value) {
    const allCustomOptions = getAllCustomOptions();
    return [...allCustomOptions].filter(option => option.dataset.value === value)[0];
  }

  function getSelectedOption() {
    return select.options[select.options.selectedIndex];
  }

  function hideAllOptions() {
    const allCustomOptions = getAllCustomOptions();

    allCustomOptions.forEach(option => {
      option.classList.add('hidden');
    })
  }

  function hideOptionsList() {
    combobox.classList.remove('expanded');
  }

  function isExpanded() {
    return combobox.classList.contains('expanded');
  }

  function refreshOptions() {
    customWrapper.replaceChildren();
    createVisibleOptions();
    addCustomWrapperListeners();
  }

  function refreshSelectedOption() {
    const selectedOption = getSelectedOption();

    if (!selectedOption) {
      return;
    }

    const selectedCustomOption = getCustomOption(selectedOption.value);
    selectedCustomOption.dataset.selected = "true";
  }

  function restoreSelectedOption() {
    input.value = '';

    if (select.selectedIndex > 0) {
      const selectedOption = getSelectedOption();

      input.value = selectedOption.text;
      refreshSelectedOption();
    }
  }

  function selectOption(targetElement) {
    const selectedOption = getCustomOptionElement(targetElement);
    const selectedOptionValue = selectedOption.dataset.value;

    refreshOptions();
    setAsSelected(selectedOptionValue);
    hideOptionsList();

    function getCustomOptionElement(selectedElement) {

      if (selectedElement.classList.contains('custom-option')) {
        return selectedElement;
      }

      return selectedElement.parentNode;
    }

  }

  function setAsSelected(value) {
    const selectedCustomOption = getCustomOption(value);
    const selectedCustomOptionHeader = selectedCustomOption.querySelector('.custom-option-header').innerText;

    unselectOptions();

    selectedCustomOption.dataset.selected = "true";

    select.value = value;
    input.value = selectedCustomOptionHeader;
  }

  function showNoResultsOption() {
    const noResultsOption = customWrapper.querySelector(`.custom-option[data-value='undefined']`);
    noResultsOption.classList.remove('hidden');
  }

  function showOptionsList() {
    closeAllComboboxes();
    combobox.classList.add('expanded');
  }

  function toggleOptionsList() {
    isExpanded()
      ? (closeAllComboboxes(), hideOptionsList())
      : (closeAllComboboxes(), showOptionsList())
  }

  function unselectOptions() {
    const allCustomOptions = getAllCustomOptions();

    allCustomOptions.forEach(customOption => {
      customOption.dataset.selected = "false";
    });

    select.value = '';
    input.value = '';
  }

}
