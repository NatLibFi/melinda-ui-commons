import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';
import {JSDOM} from 'jsdom';

import {renderMarcMergeDiff} from '../src/scripts/marcMergeDiff.js';

/**
 * Build a MARC record from a wire-format field list. A field with a `value`
 * key is a control field; otherwise it is a variable field.
 */
const rec = (leader, fields) => ({leader, fields});

const varField = (tag, ind1, ind2, subfields) => ({tag, ind1, ind2, subfields});

describe('marcMergeDiff — rendering (jsdom)', () => {
  let dom;
  let originalDocument;

  before(() => {
    dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
    originalDocument = globalThis.document;
    globalThis.document = dom.window.document;
  });

  after(() => {
    if (originalDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = originalDocument;
    }
  });

  it('renders the card root, both side inputs with the state ids and the pair diff when both records are present', () => {
    const container = dom.window.document.getElementById('app');
    const a = rec('ldr', [varField('245', '1', '0', [{code: 'a', value: 'Secondary title'}])]);
    const b = rec('ldr', [varField('245', '1', '0', [{code: 'a', value: 'Primary title'}])]);
    const handle = renderMarcMergeDiff(container, {
      sourceId: '004694505',
      baseId: '009308153',
      source: a,
      base: b,
    });

    // root appended to the container, classes per the component contract
    assert.ok(handle.root.classList.contains('marc-merge-diff'));
    assert.ok(handle.root.classList.contains('BoxShadow'));
    assert.equal(container.querySelector('.marc-merge-diff'), handle.root);
    // header row: side labels (defaults) + the swap button with the ⇆ glyph
    const labels = handle.root.querySelectorAll('.marc-merge-diff-side-label');
    assert.equal(labels.length, 2);
    assert.equal(labels[0].textContent, 'Toissijainen tietue');
    assert.equal(labels[1].textContent, 'Ensisijainen tietue');
    assert.ok(handle.swapButton.classList.contains('marc-merge-diff-swap'));
    assert.equal(handle.swapButton.textContent, '\u21c6'); // ⇆
    // inputs row: the state ids, per-side classes, TAG label
    assert.ok(handle.inputs.source.classList.contains('marc-merge-diff-input-source'));
    assert.ok(handle.inputs.base.classList.contains('marc-merge-diff-input-base'));
    assert.equal(handle.inputs.source.value, '004694505');
    assert.equal(handle.inputs.base.value, '009308153');
    assert.equal(handle.root.querySelector('.marc-merge-diff-tag').textContent, 'TAG');
    // diff body: the commons pair-diff table with both labels (thead)
    assert.ok(handle.body.classList.contains('marc-merge-diff-body'));
    const table = handle.body.querySelector('.marc-pair-diff-table');
    assert.ok(table);
    const headers = table.querySelectorAll('thead th');
    assert.equal(headers[0].textContent, 'Toissijainen tietue');
    assert.equal(headers[4].textContent, 'Ensisijainen tietue');
    // summary rendered by default
    assert.ok(handle.body.querySelector('.marc-pair-diff-summary'));
  });

  it('leaves the body empty when either record is missing and re-renders idempotently', () => {
    const container = dom.window.document.getElementById('app');
    container.innerHTML = ''; // drop the previous test's card
    const a = rec('ldr', []);

    renderMarcMergeDiff(container, {sourceId: '1', baseId: '2', source: a, base: null});
    assert.equal(container.querySelector('.marc-pair-diff'), null);

    // second call: the container is cleared first — exactly one card root
    renderMarcMergeDiff(container, {sourceId: '1', baseId: '2', source: null, base: a});
    assert.equal(container.querySelectorAll('.marc-merge-diff').length, 1);
    assert.equal(container.querySelector('.marc-pair-diff'), null);
  });

  it('calls onSwap / onFetchSource / onFetchBase; fetch callbacks get the live input value', () => {
    const container = dom.window.document.getElementById('app');
    container.innerHTML = ''; // drop the previous test's card
    let swapped = 0;
    const fetched = [];
    const handle = renderMarcMergeDiff(container, {
      sourceId: '001',
      baseId: '002',
      source: null,
      base: null,
    }, {
      onSwap: () => { swapped++; },
      onFetchSource: (id) => fetched.push(['source', id]),
      onFetchBase: (id) => fetched.push(['base', id]),
    });

    handle.swapButton.click();
    assert.equal(swapped, 1);

    // the fetch buttons read the matching input's current value at click time
    handle.inputs.source.value = '999';
    handle.fetchButtons.source.click();
    handle.fetchButtons.base.click();
    assert.deepStrictEqual(fetched, [
      ['source', '999'],
      ['base', '002'],
    ]);
  });

  it('honours labelSource/labelBase and showSummary: false', () => {
    const container = dom.window.document.getElementById('app');
    container.innerHTML = ''; // drop the previous test's card
    const a = rec('ldr', []);
    const b = rec('ldr', []);
    renderMarcMergeDiff(container, {sourceId: '1', baseId: '2', source: a, base: b}, {
      labelSource: 'Päätelmä',
      labelBase: 'Ehdotus',
      showSummary: false,
    });
    const labels = container.querySelectorAll('.marc-merge-diff-side-label');
    assert.equal(labels[0].textContent, 'Päätelmä');
    assert.equal(labels[1].textContent, 'Ehdotus');
    const headers = container.querySelectorAll('.marc-pair-diff-table thead th');
    assert.equal(headers[0].textContent, 'Päätelmä');
    assert.equal(headers[4].textContent, 'Ehdotus');
    assert.equal(container.querySelectorAll('.marc-pair-diff-summary').length, 0);
  });
});
