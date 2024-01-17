/* eslint-disable max-statements */

import httpStatus from 'http-status';
import {MongoClient, ObjectId} from 'mongodb';
import sanitize from 'mongo-sanitize';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';

//****************************************************************************//
//                                                                            //
// MONGO SERVER NOTIFICATIONS FOR MELINDA UI APPLICATIONS                     //
//                                                                            //
//****************************************************************************//


export default async function (MONGO_URI, dbName = 'melinda-ui') {
  const logger = createLogger();

  // Connect to mongo (MONGO)
  const client = await MongoClient.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db(dbName);
  const collection = 'notes';

  const validContextApps = ['artikkelit', 'muuntaja', 'viewer'];
  const validComponentStyles = ['banner', 'dialog'];
  const validMessageStyles = ['alert', 'error', 'info', 'success'];
  const timeNow = new Date();

  // Default projection for a note item
  // The returned note item object:
  //  - has property '_id' removed
  //  - has property 'id' added
  //  - all other properties are returned without modifications
  const noteItemProjection = {
    projection: {
      _id: 0,
      id: {$toString: '$_id'},
      blocksInteraction: 1,
      componentStyle: 1,
      context: 1,
      endDate: 1,
      isDismissible: 1,
      messageStyle: 1,
      messageText: 1
    }
  };


  return {addNoteItem, getNoteItem, getNoteItems, getNoteItemsForApp, removeNoteItem, removeNoteItemsByMessageStyle};


  //-----------------------------------------------------------------------------
  // ADD SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  /**
   * Add note item to collection
   * @param {Object} noteItem contains note item data:
   * {
   *   blocksInteraction: false,
   *   componentStyle: "banner",
   *   context: ["artikkelit", "muuntaja"],
   *   endDate: new Date("2024-12-30T12:30:15.002"),
   *   isDismissible: true,
   *   messageStyle: "info",
   *   messageText: "Test server notification message",
   *  }
   * @returns {void}
   */
  async function addNoteItem(noteItem) {
    logger.info(`MongoNotes: Adding one note item ${JSON.stringify(noteItem)}`);

    if (isNotObject(noteItem)) {
      logger.debug('MongoNotes: NoteItem parameter is not object');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'NoteItem data is not valid');
    }

    const newNoteItem = {
      blocksInteraction: validate(noteItem.blocksInteraction, isBoolean),
      componentStyle: validate(noteItem.componentStyle, isValidComponentStyle),
      context: validate(noteItem.context, isValidContext),
      endDate: validate(noteItem.endDate, isValidEndDate),
      isDismissible: validate(noteItem.isDismissible, isBoolean),
      messageStyle: validate(noteItem.messageStyle, isValidMessageStyle),
      messageText: validate(noteItem.messageText, isValidMessageText)
    };

    if (hasUndefinedProperty(newNoteItem)) {
      logger.debug('MongoNotes: NoteItem data did not pass validation');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'NoteItem data is not valid');
    }

    // '_id' property is automatically generated and added to noteItem on insert to collection.
    // type of '_id' is ObjectId.
    const result = await db.collection(collection).insertOne(newNoteItem);

    if (result.acknowledged) {
      return logger.info(`New ${noteItem.componentStyle} note item added with ${noteItem.messageStyle} message: ${noteItem.messageText}`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `MongoNotes had error while adding a note ${noteItem}`);


    /**
     * Validate property with validator function
     * @param {*} property
     * @param {function} validator
     * @returns {(*|undefined)}
     */
    function validate(property, validator) {
      if (property === undefined) {
        return undefined;
      }
      return validator(property) ? property : undefined;
    }

    /**
     * Checks if noteItem is Object
     * @param {*} noteItem
     * @returns {Boolean}
     */
    function isNotObject(noteItem) {
      return typeof noteItem !== 'object' || Object.keys(noteItem).length === 0 || Object.getPrototypeOf(noteItem) !== Object.prototype;
    }

    /**
     * Validates if property is Boolean
     * @param {*} property
     * @returns {Boolean}
     */
    function isBoolean(property) {
      return typeof property === 'boolean';
    }

    /**
    * Validates if every app in list is valid context
    * @param {*} appsList
    * @returns {Boolean}
    */
    function isValidContext(appsList) {
      return appsList.every((app) => validContextApps.includes(app));
    }

    /**
     * Validates if message text is not empty and is String
     * @param {*} messageText
     * @returns {Boolean}
     */
    function isValidMessageText(messageText) {
      return messageText.length > 0 && (typeof messageText === 'string' || messageText instanceof String);
    }

    /**
     * Validates if end date is in Date format and is in the future
     * @param {*} endDate
     * @returns {Boolean}
     */
    function isValidEndDate(endDate) {
      const endTime = new Date(endDate);
      return endTime instanceof Date && !isNaN(endTime.valueOf()) && endTime.getTime() > timeNow.getTime();
    }

    /**
     * Validates if style is found in the styles list
     * @param {*} componentStyle
     * @returns {Boolean}
     */
    function isValidComponentStyle(componentStyle) {
      return validComponentStyles.some((value) => componentStyle === value);
    }

    /**
    * Validates if message style is found in the message styles list
    * @param {*} messageStyle
    * @returns {Boolean}
    */
    function isValidMessageStyle(messageStyle) {
      return validMessageStyles.some((value) => messageStyle === value);
    }

    /**
     * Checks if noteItem has a property that is undefined
     * @param {Object} noteItem
     * @returns {Boolean};
     */
    function hasUndefinedProperty(noteItem) {
      return Object.values(noteItem).some(property => property === undefined);
    }

  }


  //-----------------------------------------------------------------------------
  // GET SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  /**
 * Get note item with id
 * @param {String} noteId object's id
 * @returns Boolean
 */
  async function getNoteItem(noteId) {
    logger.info(`MongoNotes: Getting one note item`);

    const cleanId = sanitize(noteId);
    const query = {_id: new ObjectId(cleanId)};

    const result = await db.collection(collection).findOne(query, noteItemProjection);

    return result;
  }

  /**
   * Get note items with matching context.app
   * @param {String} app apps name
   * @returns Array of note objects
   */
  async function getNoteItemsForApp(app) {
    logger.info(`MongoNotes: Getting all note items for app`);

    const cleanAppName = sanitize(app);

    const query = {
      'context': {
        $in: [cleanAppName, 'all']
      }
    };

    const result = await db.collection(collection).find(query, noteItemProjection).toArray();

    return result;
  }

  /**
   * Get note items
   * @returns Array of note objects
   */
  async function getNoteItems() {
    logger.info(`MongoNotes: Getting all note items`);

    const query = {};
    const result = await db.collection(collection).find(query, noteItemProjection).toArray();

    return result;
  }


  //-----------------------------------------------------------------------------
  // REMOVE SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  /**
   * Remove note
   * @param {String} noteId object's id
   * @returns Boolean
   */
  async function removeNoteItem(noteId) {
    logger.info(`MongoNotes: Removing one note item with id ${noteId}`);

    const cleanId = sanitize(noteId);
    const filter = {_id: new ObjectId(cleanId)};

    const result = await db.collection(collection).deleteOne(filter);

    if (result.deletedCount > 0) {
      return true;
    }

    if (result.deletedCount === 0) {
      return false;
    }

    throw new ApiError(httpStatus.NOT_FOUND, `MongoNotes had error while removing note with id ${noteId}`);
  }

  /**
 * Remove notes by message style
 * @param {String} messageStyle
 * @returns Boolean
 */
  async function removeNoteItemsByMessageStyle(messageStyle) {
    logger.info(`MongoNotes: Removing all notes with message style ${messageStyle}`);

    const cleanMessageStyle = sanitize(messageStyle);
    const filter = {messageStyle: cleanMessageStyle};

    const result = await db.collection(collection).deleteMany(filter);

    if (result.deletedCount > 0) {
      return true;
    }

    if (result.deletedCount === 0) {
      return false;
    }

    throw new ApiError(httpStatus.NOT_FOUND, `MongoNotes had error while removing notes`);
  }


}
