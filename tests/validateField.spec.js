import {expect} from 'chai';

import {READERS} from '@natlibfi/fixura';
import fixugen from '@natlibfi/fixugen';
const {default: generateTests} = fixugen;


import {stringToMarcField} from '../src/scripts/editorUtils.js';

import {JSDOM} from 'jsdom';


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

  function callback({getFixture, field, error, input, decorator = {}}) {
    const targetJson = field; // JSON.parse(getFixture('field.json'));
    //console.log(JSON.stringify(inputField));
    const inputHtml = `<!DOCTYPE html><div id="editor">${getFixture('target.html')}</div>`.replace(/\n/gu, '');
    //console.log(inputHtml);
    //const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
    const dom = new JSDOM(inputHtml);
    const document = dom.window.document;

    const elem = document.getElementById('editor');
    //const textContent = elem.textContent;
    const outputJson = stringToMarcField(input, decorator.subfieldCodePrefix);
    const realError = outputJson.error;
    //console.log(realError);
    expect(realError).to.eql(error);

  }

});
