import {MongoClient} from 'mongodb';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';
import sanitize from 'mongo-sanitize';
//import isDeepStrictEqual from 'util';
//import moment from 'moment';


/* Note item: https://jira.kansalliskirjasto.fi/browse/MUU-346
{
  message: "viesti",
  type: "info",
  componentStyle: "dialog",
  //context required for spesific use cases ?
  context: {
    enviroment: "dev",
    app: "muuntaja"
  },
  preventOperation: false,
  hidable: true,
  removeDate: new Date("2023-12-30T12:30:15.002")
}
*/

export default async function (MONGO_URI, dbName = 'melinda-ui') {
  const logger = createLogger();

  // Connect to mongo (MONGO)
  const client = await MongoClient.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db(dbName);
  const collection = 'notes';

  return {addNoteItem, removeNoteItem, removeNoteItemsByType, getNoteItem, getNoteItems};


  /**
   * Add note item to collection
   * @param {Object} noteItem contains note item data
   * @returns {void}
   */
  async function addNoteItem(noteItem) {
    logger.info(`Adding note item ${JSON.stringify(noteItem)}`);

    if (isNotObject(noteItem)) {
      logger.debug('NoteItem parameter is not object');
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
      logger.debug('NoteItem data did not pass validation');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'NoteItem data is not valid');
    }

    const result = await db.collection(collection).insertOne(newNoteItem);

    if (result.acknowledged) {
      return logger.info(`New ${noteItem.componentStyle} note item added with ${noteItem.type} message: ${noteItem.message}`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Note adding errored');


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


  /**
   * Remove note
   * @param {String} noteId object id
   * @returns Boolean
   */
  async function removeNoteItem({noteId}) {
    logger.info(`Removing form Mongo note item with id ${noteId}`);

    const cleanId = sanitize(noteId);
    const filter = {_id: cleanId};

    const result = await db.collection(collection).deleteOne(filter);

    if (result.deletedCount > 0) {
      return true;
    }

    throw new ApiError(httpStatus.NOT_FOUND, `Note with given noteId was not found`);
  }

  /**
 * Remove notes by type
 * @param {String} noteType
 * @returns Boolean
 */
  async function removeNoteItemsByType({type}) {
    logger.info(`Removing all notes with type ${type}`);

    const cleanType = sanitize(type);
    const filter = {type: cleanType};

    const result = await db.collection(collection).deleteMany(filter);

    if (result.deletedCount > 0) {
      return true;
    }

    throw new ApiError(httpStatus.NOT_FOUND, `Notes with given types were not found`);
  }


  /**
   * Get single note item with id
   * @param {String} noteId object id
   * @returns Boolean
   */
  async function getNoteItem({noteId}) {
    logger.info(`Getting single note item`);

    const cleanId = sanitize(noteId);
    const query = {_id: cleanId};

    const result = await db.collection(collection).findOne(query);

    return result;
  }

  /**
   * Get note items
   * @returns Array of note objects
   */
  async function getNoteItems() {
    logger.info(`Getting all note items`);

    const result = await db.collection(collection).find({}).toArray();

    return result;
  }
}
