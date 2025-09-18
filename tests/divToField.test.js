import assert from 'node:assert';
import {describe} from 'node:test';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

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
      assert.deepStrictEqual(outputJson, targetJson);
      return;
    }
    assert.deepStrictEqual(filterField(outputJson), targetJson);
  }

});
