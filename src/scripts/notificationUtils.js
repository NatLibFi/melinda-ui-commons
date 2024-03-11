
//****************************************************************************//
//                                                                            //
// UTILS FOR MONGO SERVER NOTIFICATIONS                                       //
//                                                                            //
//****************************************************************************//


//-----------------------------------------------------------------------------
// CHECKING PARAMETER TYPE
//-----------------------------------------------------------------------------

/**
 * Checks if noteItem is Object
 * @param {object} noteItem
 * @returns {Boolean}
 */
export function isObject(noteItem) {
  return typeof noteItem === 'object' || Object.keys(noteItem).length > 0 || Object.getPrototypeOf(noteItem) === Object.prototype;
}


//-----------------------------------------------------------------------------
// CONSTRUCTING NOTE ITEM AND VALIDATING THE PROPERTIES
//-----------------------------------------------------------------------------

/**
 * Constructs a new noteItem
 * @param {Object} noteItem
 * @returns {Object} a constructed noteItem
 */
export function construct(noteItem) {

  const validContext = ['all', 'artikkelit', 'muuntaja', 'viewer'];
  const validComponentStyles = ['banner', 'dialog', 'banner_static'];
  const validMessageStyles = ['alert', 'error', 'info', 'success'];
  const timeNow = new Date();

  //note: if default values for noteItem are needed, apply them here
  return validate(noteItem);

  /**
   * Validates the noteItem's properties
   * If a property does not pass validation, it is set as undefined
   * @param {Object} noteItem
   * @returns {Object} a validated noteItem
   */
  function validate(noteItem) {

    return {
      blocksInteraction: isBoolean(noteItem.blocksInteraction) ? noteItem.blocksInteraction : undefined,
      componentStyle: isValidComponentStyle(noteItem.componentStyle) ? noteItem.componentStyle : undefined,
      context: isValidContext(noteItem.context) ? noteItem.context : undefined,
      endDate: isValidEndDate(noteItem.endDate) ? noteItem.endDate : undefined,
      isDismissible: isBoolean(noteItem.isDismissible) ? noteItem.isDismissible : undefined,
      messageStyle: isValidMessageStyle(noteItem.messageStyle) ? noteItem.messageStyle : undefined,
      messageText: isValidMessageText(noteItem.messageText) ? noteItem.messageText : undefined,
      ...noteItem.url ? {url: isValidUrl(noteItem.url) ? noteItem.url : undefined} : {}
    };


    /**
     * Validates if property is Boolean
     * @param {Boolean} property
     * @returns {Boolean}
     */
    function isBoolean(property) {
      return typeof property === 'boolean';
    }

    /**
   * Validates if property is String
   * @param {String} property
   * @returns {Boolean}
   */
    function isString(property) {
      return typeof property === 'string' || property instanceof String;
    }

    /**
   * Validates if style is found in the styles list
   * @param {String} componentStyle
   * @returns {Boolean}
   */
    function isValidComponentStyle(componentStyle) {
      return validComponentStyles.some((value) => componentStyle === value);
    }

    /**
    * Validates if every app in list is valid context
    * @param {[String]} appsList
    * @returns {Boolean}
    */
    function isValidContext(appsList) {
      return appsList && appsList.every((app) => validContext.includes(app));
    }

    /**
    * Validates if end date is in Date format and is in the future
    * @param {Date} endDate
    * @returns {Boolean}
    */
    function isValidEndDate(endDate) {
      const endTime = new Date(endDate);
      return endTime && endTime instanceof Date && !isNaN(endTime.valueOf()) && endTime.getTime() > timeNow.getTime();
    }

    /**
    * Validates if message style is found in the message styles list
    * @param {String} messageStyle
    * @returns {Boolean}
    */
    function isValidMessageStyle(messageStyle) {
      return validMessageStyles.some((value) => messageStyle === value);
    }

    /**
     * Validates if message text is not empty and is String
     * @param {String} messageText
     * @returns {Boolean}
   */
    function isValidMessageText(messageText) {
      return messageText && messageText.length > 0 && isString(messageText);
    }

    /**
     * Validates if url is not empty and is parsable valid url
     * @param {String} url
     * @returns {Boolean}
     */
    function isValidUrl(url) {
      return url && url.length > 0 && isString(url) && URL.canParse(url);
    }

  }
}


//-----------------------------------------------------------------------------
// VALIDATING CONSTRUCTED NOTE ITEM OBJECT
//-----------------------------------------------------------------------------

/**
 * Checks if noteItem has a property that is undefined
 * @param {Object} noteItem
 * @returns {Boolean};
 */
export function hasUndefinedProperty(noteItem) {
  return Object.values(noteItem).some(property => property === undefined);
}
