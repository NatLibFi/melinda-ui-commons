const validContext = ['all', 'artikkelit', 'muuntaja', 'viewer'];
const validComponentStyles = ['banner', 'dialog', 'banner_static'];
const validMessageStyles = ['alert', 'error', 'info', 'success'];
const timeNow = new Date();


//****************************************************************************//
//                                                                            //
// UTILS FOR MONGO SERVER NOTIFICATIONS                                       //
//                                                                            //
//****************************************************************************//


//-----------------------------------------------------------------------------
// VALIDATE AND CONSTRUCT NOTE ITEMS
//-----------------------------------------------------------------------------

/**
 * Checks if noteItem is Object
 * @param {object} noteItem
 * @returns {Boolean}
 */
export function isObject(noteItem) {
  return typeof noteItem === 'object' || Object.keys(noteItem).length > 0 || Object.getPrototypeOf(noteItem) === Object.prototype;
}


/**
 * Constructs a new noteItem
 * @param {Object} noteItem
 * @returns {Object} a constructed noteItem
 */
export function construct(noteItem) {
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
      ...Boolean(noteItem.url) && {url: isValidUrl(noteItem.url) ? noteItem.url : undefined}
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
      return messageText && messageText.length > 0 && (typeof messageText === 'string' || messageText instanceof String);
    }

    /**
     * See that urls are valid
     * Requires it to contain protocol
     * @param {String} url
     * @returns {boolean} did it validate
     */
    function isValidUrl(url) {

      return validateType(url) && validateFormat(url);

      /**
       *Check data basics, expected to be string
       * @param {String} url
       * @returns {boolean}
       */
      function validateType(url) {
        return url && url.length > 0 && (typeof url === 'string' || url instanceof String);
      }

      /**
       * Check if url format is valid via constructing it
       * This way expects protocol to be within string (http/https)
       *
       * @param {String} url
       * @returns {boolean} is url valid if it can be constructed
       */
      function validateFormat(url) {
        try {
          return Boolean(new URL(url));
        } catch (error) {
          return false;
        }
      }
    }
  }
}


/**
 * Checks if noteItem has a property that is undefined
 * @param {Object} noteItem
 * @returns {Boolean};
 */
export function hasUndefinedProperty(noteItem) {
  return Object.values(noteItem).some(property => property === undefined);
}
