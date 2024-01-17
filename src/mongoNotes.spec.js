/* eslint-disable functional/no-let */
import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';
import mongoFixturesFactory from '@natlibfi/fixura-mongo';
import {expect} from 'chai';
import createMongoNotesOperator from './mongoNotes';


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
      endDate: v => new Date(v)
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

  if (preFillDb) { // eslint-disable-line functional/no-conditional-statements
    await mongoFixtures.populate(getFixture('dbContents.json'));
  }

  const expectError = async (noteFunction, errorMessage, errorStatus) => {
    let errorWasCatched;

    await noteFunction()
      .then(() => {
        // the note function in test was executed without errors
        // this should not happen if we test for errors
        errorWasCatched = false;
      })
      .catch((error) => {
        // note function in test throwed an error as expected
        errorWasCatched = true;

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
    expect(errorWasCatched).to.eql(true);

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
  // Test fixture 08 for removing multiple items based on message style
  if (functionName === 'removeNoteItemsByMessageStyle') {
    await mongoNotesOperator.removeNoteItemsByMessageStyle(params);
    const dump = await mongoFixtures.dump();
    return expect(dump).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixtures 09 for getting one note with id
  if (functionName === 'getNoteItem') {
    const result = await mongoNotesOperator.getNoteItem(params);
    return expect(result).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 10 for getting all notes
  if (functionName === 'getNoteItems') {
    const result = await mongoNotesOperator.getNoteItems();
    return expect(result).to.eql(expectedResult);
  }

  //----------------------------------------------//
  // Test fixture 11 for getting notes with context.app
  if (functionName === 'getNoteItemsForApp') {
    const result = await mongoNotesOperator.getNoteItemsForApp(params);
    return expect(result).to.eql(expectedResult);
  }

  throw new Error(`Unknown functionName: ${functionName}`);
}

