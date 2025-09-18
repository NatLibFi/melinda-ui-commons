/* eslint-disable max-statements */
/* eslint-disable functional/no-let */

//****************************************************************************//
//                                                                            //
// TEST SPECIFICATION FOR SERVER NOTIFICATIONS                                //
//    - testing with Mongo test fixtures                                      //
//                                                                            //
//****************************************************************************//


import assert from 'node:assert';
import {ObjectId} from 'mongodb';
import generateTests from '@natlibfi/fixugen';
import {READERS} from '@natlibfi/fixura';
import createMongoFixtures from '@natlibfi/fixura-mongo';
import createMongoNotesOperator from '../src/scripts/notes.js';


let mongoFixtures;

const testsFixturesPath = [import.meta.dirname, '.', 'testFixtures', 'notes'];

const fixuraParameters = {
  failWhenNotFound: true,
  reader: READERS.JSON
};

const hooksParameters = {
  before: async () => {
    await initMongofixtures();
  },
  beforeEach: () => mongoFixtures.clear(),
  afterEach: () => mongoFixtures.clear(),
  after: async () => {
    await mongoFixtures.close();
  }
};

const mongoFixturesParameters = {
  rootPath: testsFixturesPath,
  useObjectId: true,
  format: {
    endDate: v => new Date(v)
  }
};

const testsParameters = {
  callback,
  path: testsFixturesPath,
  recurse: false,
  useMetadataFile: true,
  fixura: fixuraParameters,
  hooks: hooksParameters
};

generateTests(testsParameters);

async function initMongofixtures() {
  mongoFixtures = await createMongoFixtures(mongoFixturesParameters);
}

async function callback({
  getFixture,
  functionName,
  params,
  preFillDb = false
}) {
  const mongoUri = await mongoFixtures.getUri();
  const mongoNotesOperator = await createMongoNotesOperator(mongoUri, '');
  const expectedResult = await getFixture('expectedResult.json');

  if (preFillDb) {
    await mongoFixtures.populate(getFixture('dbContents.json'));
  }

  //-----------------------------------------------------------------------------
  // TEST FUNCTIONS FOR ADDING SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  //----------------------------------------------//
  // Test fixtures 01-02 for adding one note
  if (functionName === 'addNoteItem') {
    await mongoNotesOperator.addNoteItem(params);
    const dump = await mongoFixtures.dump();
    assert.deepStrictEqual(dump, expectedResult);
    return;
  }

  //----------------------------------------------//
  // Test fixture 03 for adding one note and checking returned result
  // Two checks are done
  //  - we check that the added note item properties match the result note item (id field omitted)
  //  - we chek that the result id is valid string version of BSON (by testing convertion to ObjectID)
  if (functionName === 'addNoteItemReturnsNoteItem') {
    const result = await mongoNotesOperator.addNoteItem(params);
    const {id, ...rest} = result;
    assert.deepStrictEqual(rest, expectedResult) && assert.equal(new ObjectId(id).toString(), id);
    return;
  }

  //----------------------------------------------//
  // Test fixtures 04-08 for adding one note that results in error
  if (functionName === 'addNoteItemReturnsError') {
    try {
      await mongoNotesOperator.addNoteItem(params);
    } catch (error) {
      assert(error instanceof Error);
      assert.equal(error.payload, 'NoteItem data is not valid');
      assert.equal(error.status, '500');

      const dump = await mongoFixtures.dump();
      assert.deepStrictEqual(dump, expectedResult);

      return;
    };
    throw new Error('This should throw!');
  }


  //-----------------------------------------------------------------------------
  // TEST FUNCTIONS FOR GETTING SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  //----------------------------------------------//
  // Test fixtures 09 for getting one note with id
  if (functionName === 'getNoteItem') {
    const result = await mongoNotesOperator.getNoteItem(params);
    assert.deepStrictEqual(result, expectedResult);
    return;
  }

  //----------------------------------------------//
  // Test fixture 10 for getting all notes
  if (functionName === 'getNoteItems') {
    const result = await mongoNotesOperator.getNoteItems();
    assert.deepStrictEqual(result, expectedResult);
    return;
  }

  //----------------------------------------------//
  // Test fixture 11 for getting notes with context
  if (functionName === 'getNoteItemsForApp') {
    const result = await mongoNotesOperator.getNoteItemsForApp(params);
    assert.deepStrictEqual(result, expectedResult);
    return;
  }


  //-----------------------------------------------------------------------------
  // TEST FUNCTIONS FOR REMOVING SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  //----------------------------------------------//
  // Test fixture 12 for removing one note with id
  if (functionName === 'removeNoteItem') {
    await mongoNotesOperator.removeNoteItem(params);
    const dump = await mongoFixtures.dump();
    assert.deepStrictEqual(dump, expectedResult);
    return;
  }

  //----------------------------------------------//
  // Test fixture 13 for removing multiple items based on message style
  if (functionName === 'removeNoteItemsByMessageStyle') {
    await mongoNotesOperator.removeNoteItemsByMessageStyle(params);
    const dump = await mongoFixtures.dump();
    assert.deepStrictEqual(dump, expectedResult);
    return;
  }


  throw new Error(`Unknown functionName: ${functionName}`);
}
