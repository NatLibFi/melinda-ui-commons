const validContext = ['all', 'artikkelit', 'muuntaja', 'viewer'];
const validComponentStyles = ['banner', 'dialog', 'banner_static'];
const validMessageStyles = ['alert', 'error', 'info', 'success'];
const timeNow = new Date();

/**
 * Validate property with validator function
 * @param {*} property
 * @param {function} validator
 * @returns {(*|undefined)}
 */
export function validate(property, validator) {
  if (property === undefined) {
    return undefined;
  }
  return validator(property) ? property : undefined;
}

/**
 * Checks if noteItem is Object
 * @param {object} noteItem
 * @returns {Boolean}
 */
export function isNotObject(noteItem) {
  return typeof noteItem !== 'object' || Object.keys(noteItem).length === 0 || Object.getPrototypeOf(noteItem) !== Object.prototype;
}

/**
 * Validates if property is Boolean
 * @param {boolean} property
 * @returns {Boolean}
 */
export function isBoolean(property) {
  return typeof property === 'boolean';
}

/**
* Validates if every app in list is valid context
* @param {[String]} appsList
* @returns {Boolean}
*/
export function isValidContext(appsList) {
  return appsList.every((app) => validContext.includes(app));
}

/**
 * Validates if message text is not empty and is String
 * @param {String} messageText
 * @returns {Boolean}
 */
export function isValidMessageText(messageText) {
  return messageText.length > 0 && (typeof messageText === 'string' || messageText instanceof String);
}

/**
 * Validates if end date is in Date format and is in the future
 * @param {*} endDate
 * @returns {Boolean}
 */
export function isValidEndDate(endDate) {
  const endTime = new Date(endDate);
  return endTime instanceof Date && !isNaN(endTime.valueOf()) && endTime.getTime() > timeNow.getTime();
}

/**
 * Validates if style is found in the styles list
 * @param {*} componentStyle
 * @returns {Boolean}
 */
export function isValidComponentStyle(componentStyle) {
  return validComponentStyles.some((value) => componentStyle === value);
}

/**
* Validates if message style is found in the message styles list
* @param {*} messageStyle
* @returns {Boolean}
*/
export function isValidMessageStyle(messageStyle) {
  return validMessageStyles.some((value) => messageStyle === value);
}

/**
 * Checks if noteItem has a property that is undefined
 * @param {object} noteItem
 * @returns {Boolean};
 */
export function hasUndefinedProperty(noteItem) {
  return Object.values(noteItem).some(property => property === undefined);
}
