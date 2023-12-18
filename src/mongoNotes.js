import {MongoClient, ObjectId} from 'mongodb';
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
  style: "dialog",
  preventOperation: "false",
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

  return {addNoteItem, removeNoteItem, getNoteItems};


  /**
   * Add note item to collection
   * @param {Object} noteItem contains note item data
   * @returns void
   */
  async function addNoteItem(noteItem) {
    logger.info(`Adding note item ${JSON.stringify(noteItem)}`);

    const result = await db.collection(collection).insertOne(noteItem);

    if (result.acknowledged) {
      logger.info('New note has been made');
      return;
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Note saving failed');
  }


  /**
   * Remove note
   * @param {String} noteId object id
   * @returns Boolean
   */
  async function removeNoteItem({noteId}) {
    logger.info(`Removing form Mongo note item with id ${noteId}`);

    const cleanId = sanitize(noteId);
    const filter = {_id: new ObjectId(cleanId)};

    const result = await db.collection(collection).deleteOne(filter);

    if (result.deletedCount > 0) {
      return true;
    }

    throw new ApiError(httpStatus.NOT_FOUND, `Note with given noteId was not found`);
  }


  /**
   * Get note items
   * @returns Array of note objects
   */
  async function getNoteItems() {
    logger.info(`Getting all note items`);

    const result = await db.collection(collection).find({}, {projection: {_id: 0}}).toArray();

    return result;
  }
}
