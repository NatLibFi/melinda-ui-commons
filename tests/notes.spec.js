/* eslint-disable max-statements */
/* eslint-disable functional/no-let */

import {expect} from 'chai';
import {ObjectId} from 'mongodb';
import generateTests from '@natlibfi/fixugen';
import {READERS} from '@natlibfi/fixura';
import mongoFixturesFactory from '@natlibfi/fixura-mongo';
import createMongoNotesOperator from '../src/scripts/notes.js';


//****************************************************************************//
//                                                                            //
// TEST SPECIFICATION FOR SERVER NOTIFICATIONS                                //
//    - testing with Mongo test fixtures                                      //
//                                                                            //
//****************************************************************************//


let mongoFixtures;

generateTests({
  callback,
  path: [__dirname, '.', 'test-fixtures', 'notes'],
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
    rootPath: [__dirname, '.', 'test-fixtures', 'notes'],
    useObjectId: true,
    format: {
      endDate: v => new Date(v)
    }
  });
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

  //----------------------------------------------------------------------//
  // Test helper for testing scenarios where error is the expected result
  const expectError = async (noteFunction, errorMessage, errorStatus) => {
    let errorWasThrown;

    await noteFunction()
      .then(() => {
        // the note function in test was executed without errors
        // this should not happen if we test for errors
        // test fails
        errorWasThrown = false;
      })
      .catch((error) => {
        // note function in test resulted in error as expected
        errorWasThrown = true;

        expect(error).to.be.an('Error');

        if (errorMessage) {
          expect(error.payload).to.equal(errorMessage);
        }

        if (errorStatus) {
          expect(error.status).to.equal(errorStatus);
        }

        mongoFixtures.dump()
          .then((dump) => {
            expect(dump).to.eql(expectedResult);
          });

      });

    // we are expecting error in the test
    // that is why errorWasCatched should be true
    expect(errorWasThrown).to.eql(true);

  };


  //-----------------------------------------------------------------------------
  // TEST FUNCTIONS FOR ADDING SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  //----------------------------------------------//
  // Test fixtures 01-02 for adding one note
  if (functionName === 'addNoteItem') {
    await mongoNotesOperator.addNoteItem(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixtures 01-02 for adding one note and checking returned result
  // Two checks are done
  //  - we check that the added note item properties match the result note item (id field omitted)
  //  - we chek that the result id is valid string version of BSON (by testing convertion to ObjectID)
  if (functionName === 'addNoteItemReturnsNoteItem') {
    const result = await mongoNotesOperator.addNoteItem(params);
    const {id, ...rest} = result;
    return expect(rest).to.eql(expectedResult) && expect(new ObjectId(id).toString()).to.eql(id);
  }

  //----------------------------------------------//
  // Test fixtures 04-07 for adding one note that results in error
  if (functionName === 'addNoteItemReturnsError') {
    return expectError(() => mongoNotesOperator.addNoteItem(params), 'NoteItem data is not valid', 500);
  }


  //-----------------------------------------------------------------------------
  // TEST FUNCTIONS FOR GETTING SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  //----------------------------------------------//
  // Test fixtures 08 for getting one note with id
  if (functionName === 'getNoteItem') {
    const result = await mongoNotesOperator.getNoteItem(params);
    return expect(result).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 09 for getting all notes
  if (functionName === 'getNoteItems') {
    const result = await mongoNotesOperator.getNoteItems();
    return expect(result).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 10 for getting notes with context
  if (functionName === 'getNoteItemsForApp') {
    const result = await mongoNotesOperator.getNoteItemsForApp(params);
    return expect(result).to.eql(expectedResult);
  }


  //-----------------------------------------------------------------------------
  // TEST FUNCTIONS FOR REMOVING SERVER NOTIFICATIONS
  //-----------------------------------------------------------------------------

  //----------------------------------------------//
  // Test fixture 11 for removing one note with id
  if (functionName === 'removeNoteItem') {
    await mongoNotesOperator.removeNoteItem(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 12 for removing multiple items based on message style
  if (functionName === 'removeNoteItemsByMessageStyle') {
    await mongoNotesOperator.removeNoteItemsByMessageStyle(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }


  throw new Error(`Unknown functionName: ${functionName}`);
}

