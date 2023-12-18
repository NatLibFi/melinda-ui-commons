// import {expect} from 'chai';
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
      removeDate: v => new Date(v)
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
  // console.log(typeof mongoUri); // eslint-disable-line

  if (preFillDb) { // eslint-disable-line functional/no-conditional-statements
    await mongoFixtures.populate(getFixture('dbContents.json'));
  }

  if (functionName === 'addNoteItem') {
    await mongoNotesOperator.addNoteItem(params);
    const dump = await mongoFixtures.dump();

    return expect(dump.notes).to.eql(expectedResult);
  }

  if (functionName === 'removeNoteItem') {
    await mongoNotesOperator.removeNoteItem(params);

    const dump = await mongoFixtures.dump();

    return expect(dump.notes).to.eql(expectedResult);
  }

  if (functionName === 'getNoteItems') {
    const result = await mongoNotesOperator.getNoteItems();

    return expect(result).to.eql(expectedResult);
  }

  throw new Error(`Unknown functionName: ${functionName}`);
}

