import {expect} from 'chai';
import fixugen from '@natlibfi/fixugen';

//import {MarcRecord} from '@natlibfi/marc-record';
//import createReducer from './postprocessor';
import {READERS} from '@natlibfi/fixura';
const {default: generateTests} = fixugen;

import {marcFieldToDiv} from '../src/scripts/editorUtils.js';

import {JSDOM} from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
const document = dom.window.document;

describe('json field -> html div', () => {
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

  function callback({getFixture, field, decorator = {}}) {
    const inputField = field;
    //console.log(JSON.stringify(inputField));

    const targetHtml = getFixture('target.html');
    //console.log(targetHtml);

    const elem = document.getElementById('editor');
    elem.innerHTML = '';

    const outputHtml = marcFieldToDiv(undefined, elem, inputField, decorator, true, document).innerHTML;

    expect(localPrettyPrint(outputHtml)).to.equal(localPrettyPrint(targetHtml));

    function localPrettyPrint(html) {
      // marcFieldToDiv() return html in a single line, which is hard to read and does not work well with expect.
      // Convert htmls to multiline format to improve readibility and debugability.
      return html.replace(/></g, '>\n<');
    }
  }

});
