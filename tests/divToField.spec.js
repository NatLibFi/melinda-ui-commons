import {expect} from 'chai';

import {READERS} from '@natlibfi/fixura';
import fixugen from '@natlibfi/fixugen';
const {default: generateTests} = fixugen;


import {stringToMarcField} from '../src/scripts/editorUtils.js';
import {filterField} from '../src/scripts/marcRecordUi.js';

import {JSDOM} from 'jsdom';


describe('html div->json field ', () => {
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
    const targetJson = field; // JSON.parse(getFixture('field.json'));
    //console.log(JSON.stringify(inputField));
    const inputHtml = `<!DOCTYPE html><div id="editor">${getFixture('target.html')}</div>`.replace(/\n/gu, '');
    //console.log(inputHtml);
    //const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
    const dom = new JSDOM(inputHtml);
    const document = dom.window.document;

    const elem = document.getElementById('editor');
    const textContent = elem.textContent;
    //console.log(`FIELD CONTENT: ${textContent}`);
    const outputJson = stringToMarcField(elem.textContent, decorator.subfieldCodePrefix);
    if (outputJson.error) {
      expect(outputJson).to.eql(targetJson);
      return;
    }
    expect(filterField(outputJson)).to.eql(targetJson);
  }

});
