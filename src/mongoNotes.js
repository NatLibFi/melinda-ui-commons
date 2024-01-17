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
//
// Note item: https://jira.kansalliskirjasto.fi/browse/MUU-346
//
// NOTE!
// context.enviroment for now is not required but MIGHT be used later
// context.app array could have spesific app names or "all")
//
//****************************************************************************//


export default async function (MONGO_URI, dbName = 'melinda-ui') {
  const logger = createLogger();

  // Connect to mongo (MONGO)
  const client = await MongoClient.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db(dbName);
  const collection = 'notes';

  // Default projection for a note item
  // The returned note item object:
  //  - has property '_id' removed
  //  - has property 'id' added
  //  - all other properties are returned without modifications
  const noteItemProjection = {
    projection: {
      _id: 0,
      id: {$toString: '$_id'},
      message: 1,
      type: 1,
      componentStyle: 1,
      context: 1,
      preventOperation: 1,
      hidable: 1,
      removeDate: 1
    }
  };

  return {addNoteItem, getNoteItem, getNoteItems, getNoteItemsForApp, removeNoteItem, removeNoteItemsByType};


  //-----------------------------------------------------------------------------
  // ADD SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  /**
   * Add note item to collection
   * @param {Object} noteItem contains note item data:
   * {
   *   message: "viesti",
   *   type: "info",
   *   componentStyle: "dialog",
   *     context: {
   *       enviroment: "dev",
   *       apps: ["muuntaja"]
   *     },
   *   preventOperation: false,
   *   hidable: true,
   *   removeDate: new Date("2023-12-30T12:30:15.002")
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
      hidable: validate(noteItem.hidable, isBoolean),
      message: validate(noteItem.message, isValidMessage),
      preventOperation: validate(noteItem.preventOperation, isBoolean),
      removeDate: validate(noteItem.removeDate, isValidDate),
      componentStyle: validate(noteItem.componentStyle, isValidStyle),
      type: validate(noteItem.type, isValidType)
    };

    if (hasUndefinedProperty(newNoteItem)) {
      logger.debug('MongoNotes: NoteItem data did not pass validation');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'NoteItem data is not valid');
    }

    // '_id' property is automatically generated and added to noteItem on insert to collection.
    // type of '_id' is ObjectId.
    const result = await db.collection(collection).insertOne(newNoteItem);

    if (result.acknowledged) {
      return logger.info(`New ${noteItem.componentStyle} note item added with ${noteItem.type} message: ${noteItem.message}`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `MongoNotes had error while adding a note ${noteItem}`);


    /**
     * Validate property with validator function
     * @param {*} property
     * @param {function} validator
     * @returns {(*|undefined)}
     */
    function validate(property, validator) {
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
     * Validates if message is not empty and is String
     * @param {*} message
     * @returns {Boolean}
     */
    function isValidMessage(message) {
      return message.length > 0 && (typeof message === 'string' || message instanceof String);
    }

    /**
     * Validates if date is in Date format and is in the future
     * @param {*} date
     * @returns {Boolean}
     */
    function isValidDate(date) {
      const removeTime = new Date(date);
      const now = new Date();
      return removeTime instanceof Date && !isNaN(removeTime.valueOf()) && removeTime.getTime() > now.getTime();
    }

    /**
     * Validates if style is found in the styles list
     * @param {*} style
     * @returns {Boolean}
     */
    function isValidStyle(style) {
      // Update when you know available styles for note items
      const styleValues = ['banner', 'dialog'];
      return styleValues.some((value) => style === value);
    }

    /**
    * Validates if type is found in the types list
    * @param {*} type
    * @returns {Boolean}
    */
    function isValidType(type) {
      const typeValues = ['alert', 'error', 'info', 'success'];
      return typeValues.some((value) => type === value);
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
      'context.app': {
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

    const result = await db.collection(collection).find({}, noteItemProjection).toArray();

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
 * Remove notes by type
 * @param {String} type
 * @returns Boolean
 */
  async function removeNoteItemsByType(type) {
    logger.info(`MongoNotes: Removing all notes with type ${type}`);

    const cleanType = sanitize(type);
    const filter = {type: cleanType};

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
