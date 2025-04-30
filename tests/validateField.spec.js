import {expect} from 'chai';

import {READERS} from '@natlibfi/fixura';
import fixugen from '@natlibfi/fixugen';
const {default: generateTests} = fixugen;

import {stringToMarcField} from '../src/scripts/editorUtils.js';
import {extractErrors} from '../src/scripts/marcRecordUi.js';


describe('html div->json field ', () => {
  generateTests({
    callback,
    path: [import.meta.dirname, 'testFixtures', 'validate'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      failWhenNotFound: false,
      reader: READERS.TEXT
    }
  });

  function callback({errors, input, decorator = {}}) {
    const fields = input.map(str => stringToMarcField(str, decorator.subfieldCodePrefix));
    const actualErrors = extractErrors({}, fields);
    expect(actualErrors).to.have.same.deep.members(errors);
  }

});
