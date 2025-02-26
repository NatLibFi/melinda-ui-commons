import {expect} from 'chai';
import fixugen from '@natlibfi/fixugen';

//import {MarcRecord} from '@natlibfi/marc-record';
//import createReducer from './postprocessor';
import {READERS} from '@natlibfi/fixura';
const {default: generateTests} = fixugen;

import {marcFieldToDiv} from '../src/scripts/marcRecordUi.js';

import {JSDOM} from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
const document = dom.window.document;

describe('json -> html ', () => {
  generateTests({
    callback,
    path: [import.meta.dirname, 'testFixtures', 'field'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      failWhenNotFound: false,
      reader: READERS.TEXT
    }
  });

  function callback({getFixture, decorator = {}}) {
    const inputField = JSON.parse(getFixture('field.json'));
    //console.log(JSON.stringify(inputField));
    const targetHtml = getFixture('target.html');
    //console.log(targetHtml);

    const elem = document.getElementById('editor');
    elem.innerHTML = '';

    const outputHtml = marcFieldToDiv(undefined, elem, inputField, decorator, true, document).innerHTML.replace(/></g, '>\n<');

    expect(outputHtml).to.equal(targetHtml);
  }

});
