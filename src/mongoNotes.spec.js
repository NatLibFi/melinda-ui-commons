import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';
import mongoFixturesFactory from '@natlibfi/fixura-mongo';
import {expect} from 'chai';
import createMongoNotesOperator from './mongoNotes';
//import {Error as ApiError} from '@natlibfi/melinda-commons';


let mongoFixtures; // eslint-disable-line functional/no-let

generateTests({
  callback,
  path: [__dirname, '..', 'test-fixtures', 'mongoNotes'],
  recurse: false,
  useMetadataFile: true,
  fixura: {
    failWhenNotFound: true,
    reader: READERS.JSON
  },
  mocha: {
    before: async () => {
      await initMongofixtures();
    },
    beforeEach: () => mongoFixtures.clear(),
    afterEach: () => mongoFixtures.clear(),
    after: async () => {
      await mongoFixtures.close();
    }
  }
});

async function initMongofixtures() {
  mongoFixtures = await mongoFixturesFactory({
    rootPath: [__dirname, '..', 'test-fixtures', 'mongoNotes'],
    useObjectId: true,
    format: {
      removeDate: v => new Date(v)
    }
  });
}

// eslint-disable-next-line max-statements
async function callback({
  getFixture,
  functionName,
  params,
  preFillDb = false
}) {
  const mongoUri = await mongoFixtures.getUri();
  const mongoNotesOperator = await createMongoNotesOperator(mongoUri, '');
  const expectedResult = await getFixture('expectedResult.json');
  // console.log(typeof mongoUri); // eslint-disable-line

  if (preFillDb) { // eslint-disable-line functional/no-conditional-statements
    await mongoFixtures.populate(getFixture('dbContents.json'));
  }

  const expectError = async (noteFunction, errorMessage, errorStatus) => {
    try {
      await noteFunction();
    } catch (error) {
      expect(error).to.be.an('Error');

      if (errorMessage) {
        expect(error.payload).to.equal(errorMessage);
      }

      if (errorStatus) {
        expect(error.status).to.equal(errorStatus);
      }

      const dump = await mongoFixtures.dump();
      expect(dump).to.eql(expectedResult);
    }

  };


  //----------------------------------------------//
  // Test fixtures 01-06 for adding one note
  if (functionName === 'addNoteItem') {
    await mongoNotesOperator.addNoteItem(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixtures 03-06 for adding one note that results in error
  if (functionName === 'addNoteItemReturnsError') {
    return expectError(() => mongoNotesOperator.addNoteItem(params), 'NoteItem data is not valid', 500);
  }


  //----------------------------------------------//
  // Test fixture 07 for removing one note with id
  if (functionName === 'removeNoteItem') {
    await mongoNotesOperator.removeNoteItem(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 08 for removing multiple items based on type
  if (functionName === 'removeNoteItemsByType') {
    await mongoNotesOperator.removeNoteItemsByType(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixtures 09 for getting one note with id
  if (functionName === 'getNoteItem') {
    const result = await mongoNotesOperator.getNoteItem(params);
    return expect(objectIdsToStrings(result, ['_id'])).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 10 for getting all notes
  if (functionName === 'getNoteItems') {
    const result = await mongoNotesOperator.getNoteItems();
    return expect(objectIdsToStrings(result, ['_id'])).to.eql(expectedResult);
  }

  /**
   * Purpose of this function is to change comparable documents objectId:s to string equivelants since
   * testing does not seem to be able to compare between, eventho mongo does understand them and you cant specify objectId into *.json file.
   * So if tests fail and point to "_id" or similar this just might help you out.
   * @param {*} docObj document or array of documents
   * @param {[string]} fieldsToChange what field keys need to be updated to string
   * @returns {*} returns original content with specified field:s objectId:s as strings
   */
  function objectIdsToStrings(docObj, fieldsToChange) {
    //fail fast, if no documents just leave
    if ((!docObj) || (docObj && docObj === Array && docObj.legth === 0)) {// eslint-disable-line
      return docObj;
    }

    //update array of documents
    if (docObj.constructor === Array) {
      for (const [index, document] of docObj.entries()) {
        docObj[index] = getUpdatedDocument(document, fieldsToChange);
      }
      return docObj;
    }
    //update single document
    return getUpdatedDocument(docObj, fieldsToChange);

    /**
     * Update given fields, if they exist to their string version
     * @param {*} document
     * @param {[string]} fieldsToChange
     * @returns {*} same content with specified fields changed
     */
    function getUpdatedDocument(document, fieldsToChange) {
      for (const field of fieldsToChange) {
        updateFieldToString(document, field);
      }
      return document;

      function updateFieldToString(document, field) {
        if (document[field]) {
          document[field] = document[field].toString();
        }
      }
    }
  }


  throw new Error(`Unknown functionName: ${functionName}`);
}

