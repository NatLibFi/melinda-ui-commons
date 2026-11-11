import assert from 'node:assert';
import {describe} from 'node:test';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

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
    assert.deepEqual(actualErrors, errors);
  }

});
