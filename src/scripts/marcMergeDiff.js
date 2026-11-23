//****************************************************************************//
//                                                                            //
// MARC MERGE DIFF                                                            //
//    - diffRecords / renderMarcPairDiff: the low-level MARC pair-diff engine //
//      (pure diff computation + imperative DOM rendering, embedded here so   //
//      the component is self-contained)                                      //
//    - renderMarcMergeDiff: presentational renderer for the "Toissijainen   //
//      tietue ⇆ Ensisijainen tietue" comparison card                        //
//                                                                            //
// The pair-diff engine: diffRecords is a pure computation of a MARC record   //
// pair diff; renderMarcPairDiff imperatively renders a computed diff.        //
// Alignment mirrors melinda-dedup-annotator's AlignedTable.jsx normalizers   //
// (ISBN, name, classification, publication, subject) layered on top of the   //
// PROTOTYPE-marc-diff.html matching ladder (semantic key -> exact identity   //
// -> subfield content key -> positional -> leftover rows).                   //
//                                                                            //
// The component is stateless and presentational: no fetch, no network, no    //
// persistent state. The card is rebuilt from scratch on every call           //
// (idempotent re-render, same as renderMarcPairDiff). All element selectors  //
// are classes scoped under the .marc-merge-diff root                        //
// (styles/marc-merge-diff.css, imported via main.css) so several instances   //
// may coexist on one page.                                                   //
//                                                                            //
// The diff body is rendered by the local renderMarcPairDiff() (the records   //
// are diffed with the local diffRecords()); it is shown only when BOTH       //
// records are present in state. All interaction is delegated to the option   //
// callbacks (onSwap / onFetchSource / onFetchBase) — the host owns the       //
// fetches, the state and the re-renders.                                    //
//                                                                            //
//****************************************************************************//

//****************************************************************************//
//                                                                            //
// NORMALIZERS (ported from AlignedTable.jsx; subs/val mapped to              //
// subfields/value)                                                           //
//                                                                            //
//****************************************************************************//

function is02x(tag) {
  const n = parseInt(tag, 10);
  return !isNaN(n) && n >= 20 && n <= 29;
}

function extractISBN(str) {
  const flat = String(str ?? '').replace(/[-\s]/g, '');
  if (/^\d{13}$/.test(flat)) {
    return {type: 13, digits: flat};
  }
  if (/^\d{9}[\dXx]$/.test(flat)) {
    return {type: 10, digits: flat.toUpperCase()};
  }
  const m13 = flat.match(/\d{13}/);
  if (m13) {
    return {type: 13, digits: m13[0]};
  }
  const m10 = flat.match(/\d{9}[\dXx]/i);
  if (m10) {
    return {type: 10, digits: m10[0].toUpperCase()};
  }
  return null;
}

function isbn10to13(s) {
  const core = `978${s.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(core[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  return core + (10 - (sum % 10)) % 10;
}

/**
 * Canonical ISBN-13 digit string for an ISBN value in any digit count or
 * with dashes/spaces; null when no ISBN can be extracted.
 */
export function normalizeISBN(str) {
  const r = extractISBN(str);
  if (!r) {
    return null;
  }
  return r.type === 13 ? r.digits : isbn10to13(r.digits);
}

const NAME_TAGS = new Set(['100', '110', '111', '130', '700', '710', '711', '730']);
const CLASSIFICATION_TAGS = new Set(['080', '082', '083', '084', '085', '086']);
const SUBJECT_TAGS = new Set(['600', '610', '611', '630', '648', '650', '651', '655']);
const PUBLICATION_TAGS = new Set(['260', '264']);
const PROVENANCE_SUBFIELDS = new Set(['0', '1', '2', '6', '8']);
const SUBJECT_CONTENT_SUBFIELDS = ['a', 'v', 'x', 'y', 'z'];

/**
 * Name key: diacritics stripped, trailing punctuation removed, whitespace
 * collapsed, lowercased. "Hyvönen, Petri." === "Hyvonen, Petri".
 */
export function normalizeName(val) {
  return String(val ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:/]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Classification number key: whitespace removed, lowercased. Dotted decimals
 * keep their digits (trailing-zero semantics differ between schemes).
 */
export function normalizeClassification(val) {
  return String(val ?? '').replace(/\s+/g, '').toLowerCase();
}

/**
 * Publication 260/264 subfield key. $c (date) matches on the 4-digit year
 * when one is present ("p2001.", "[2001]", "©2001" all key to "2001");
 * other subfields drop bracketed supplied values and ISBD trailing
 * punctuation.
 */
export function normalizePubSubfield(code, val) {
  const s = String(val ?? '').trim();
  if (code === 'c') {
    const year = s.match(/\d{4}/);
    if (year) {
      return year[0];
    }
  }
  return s
    .replace(/[\[\]]/g, '')
    .replace(/\s*[.,;:/]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * The function a publication statement performs. 260 has no role indicator
 * and always means publication, which is 264 _1.
 */
function publicationRole(field) {
  if (field.tag === '260') {
    return '1';
  }
  const ind2 = field.ind2;
  return !ind2 || ind2 === ' ' ? '1' : ind2;
}

/**
 * Whole-field publication key: role plus normalised $a/$b/$c parts.
 */
export function publicationKey(field) {
  const parts = (field.subfields ?? [])
    .filter(sf => ['a', 'b', 'c'].includes(sf.code))
    .map(sf => `${sf.code}=${normalizePubSubfield(sf.code, sf.value)}`);
  return `${publicationRole(field)}|${parts.join('|')}`;
}

/**
 * Subject subfield key: trailing ISBD punctuation removed, whitespace
 * collapsed, lowercased. Diacritics are PRESERVED (unlike names): subject
 * terms come from controlled vocabularies where they are meaningful.
 */
export function normalizeSubject(val) {
  return String(val ?? '')
    .replace(/\s*[.,;:]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Whole-field subject key: term and subdivisions $a/$v/$x/$y/$z in order.
 * Provenance subfields ($0/$1/$2/$6/$8) and 600 $d dates are excluded so a
 * heading matches the same heading under a different thesaurus or with
 * extra dates on one side.
 */
export function subjectKey(field) {
  return (field.subfields ?? [])
    .filter(sf => SUBJECT_CONTENT_SUBFIELDS.includes(sf.code))
    .map(sf => `${sf.code}=${normalizeSubject(sf.value)}`)
    .join('|');
}

//****************************************************************************//
//                                                                            //
// RECORD NORMALIZATION                                                       //
//                                                                            //
//****************************************************************************//

/**
 * Wire format -> internal field. Control fields carry a plain string
 * `value`; variable fields get defaulted indicators (" ") and a `subfields`
 * array of {code, value}. Already-normalized fields (with `kind`) pass
 * through untouched.
 */
export function normalizeField(f) {
  if (!f) {
    return null;
  }
  if (f.kind) {
    return f;
  }
  const tnum = parseInt(f.tag, 10);
  if (f.value !== undefined || (!isNaN(tnum) && tnum < 10)) {
    return {tag: f.tag, kind: 'ctrl', value: String(f.value ?? '')};
  }
  return {
    tag: f.tag,
    kind: 'var',
    ind1: f.ind1 ?? ' ',
    ind2: f.ind2 ?? ' ',
    subfields: (f.subfields ?? []).map(sf => ({code: sf.code ?? '', value: String(sf.value ?? '')})),
  };
}

/**
 * Wire format -> internal record {leader, fields}.
 */
export function normalizeRecord(rec) {
  return {leader: rec?.leader ?? '', fields: (rec?.fields ?? []).map(normalizeField)};
}

//****************************************************************************//
//                                                                            //
// ALIGNMENT                                                                  //
//                                                                            //
//****************************************************************************//

const TAG_GROUPS = {publication: {tags: PUBLICATION_TAGS, sortAs: 260}};

/**
 * The row group a tag belongs to, or the tag itself when it stands alone.
 */
function groupKeyFor(tag) {
  for (const [key, g] of Object.entries(TAG_GROUPS)) {
    if (g.tags.has(tag)) {
      return key;
    }
  }
  return tag;
}

/**
 * Sort position for a group key: numeric tags in value order, non-numeric
 * tags after all numeric ones.
 */
function groupSortValue(key) {
  if (TAG_GROUPS[key]) {
    return TAG_GROUPS[key].sortAs;
  }
  const n = parseInt(key, 10);
  return isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

/**
 * Alignment config for a group key: which subfield carries the identity of
 * the entry and which normalizer turns its value into a comparison key, or
 * a whole-field key function. Null = not alignable (keep keyOf fallback).
 */
function getAlignConfig(groupKey) {
  if (is02x(groupKey)) {
    return {
      matchSubfield: 'a',
      normalize: val => {
        if (groupKey === '020') {
          const isbn = normalizeISBN(val);
          if (isbn) {
            return isbn;
          }
        }
        return String(val ?? '').replace(/[-\s]/g, '').toLowerCase();
      },
    };
  }
  if (NAME_TAGS.has(groupKey)) {
    return {matchSubfield: 'a', normalize: normalizeName};
  }
  if (CLASSIFICATION_TAGS.has(groupKey)) {
    return {matchSubfield: 'a', normalize: normalizeClassification};
  }
  if (SUBJECT_TAGS.has(groupKey)) {
    return {wholeField: true, key: subjectKey};
  }
  if (groupKey === 'publication') {
    return {wholeField: true, key: publicationKey};
  }
  return null;
}

/**
 * Semantic comparison key for one field. Fields without the match
 * subfield key to U+FFFF so they sort to the end.
 */
function getFieldKey(field, config) {
  if (config.wholeField) {
    return config.key(field);
  }
  const sub = (field.subfields ?? []).find(sf => sf.code === config.matchSubfield);
  if (!sub) {
    return '\uffff';
  }
  return config.normalize(sub.value);
}

/**
 * Exact field identity (prototype norm): tag, indicators, subfield
 * code/trimmed-value list, control value. Diacritics are NOT stripped here:
 * two fields differing only by diacritics pair up (via a semantic key) but
 * still count as a differing row.
 */
function norm(f) {
  return JSON.stringify({
    t: f.tag,
    i: f.ind1 + f.ind2,
    s: (f.subfields ?? []).map(x => [x.code, String(x.value).trim()]).sort(),
    v: f.value ?? null,
  });
}

/**
 * Content key (prototype keyOf): sorted "code+value" list, or the control
 * value. Ignores tag and indicators.
 */
function keyOf(f) {
  return (f.subfields ?? []).map(s => s.code + s.value).sort().join('/') || (f.value ?? '');
}

/**
 * Align one row group and compute the diff rows.
 *
 * Pairing precedence (each A field takes the first unused B field):
 *   1. semantic key equality (alignable groups only)
 *   2. exact identity (norm)
 *   3. content key equality (keyOf)
 *   4. positional pairing of the leftovers
 *   5. leftover A fields -> onlyA rows, leftover B fields -> onlyB rows
 *
 * @returns {{displayTag: string, rows: Array}} rows carry {state, a, b,
 * subfieldDiffs}; displayTag is the sorted union of the tags present in the
 * group (e.g. "260/264").
 */
export function diffGroup(groupKey, fieldsA, fieldsB) {
  const a = (fieldsA ?? []).map(normalizeField).filter(Boolean);
  const b = (fieldsB ?? []).map(normalizeField).filter(Boolean);
  const config = getAlignConfig(groupKey);

  const keyOfA = f => (config ? getFieldKey(f, config) : keyOf(f));
  const sortedA = [...a].sort((x, y) => keyOfA(x).localeCompare(keyOfA(y)));
  const sortedB = [...b].sort((x, y) => keyOfA(x).localeCompare(keyOfA(y)));

  const rows = sortedA.map(f => [f, null]);
  const usedB = new Array(sortedB.length).fill(false);

  const findB = (predicate) => {
    const j = sortedB.findIndex((f, i) => !usedB[i] && predicate(f));
    if (j < 0) {
      return -1;
    }
    usedB[j] = true;
    return j;
  };

  // 1. semantic key match (most specific semantic signal)
  if (config) {
    for (const r of rows) {
      if (r[1]) {
        continue;
      }
      const key = keyOfA(r[0]);
      const j = findB(f => keyOfA(f) === key);
      if (j >= 0) {
        r[1] = sortedB[j];
      }
    }
  }
  // 2. exact identity
  for (const r of rows) {
    if (r[1]) {
      continue;
    }
    const n = norm(r[0]);
    const j = findB(f => norm(f) === n);
    if (j >= 0) {
      r[1] = sortedB[j];
    }
  }
  // 3. content key (same subfield content, different tag/inds)
  for (const r of rows) {
    if (r[1]) {
      continue;
    }
    const k = keyOf(r[0]);
    const j = findB(f => keyOf(f) === k);
    if (j >= 0) {
      r[1] = sortedB[j];
    }
  }
  // 4. positional pairing of the leftovers
  const restB = [];
  for (let i = 0; i < sortedB.length; i++) {
    if (!usedB[i]) {
      restB.push(sortedB[i]);
    }
  }
  for (const r of rows) {
    if (!r[1] && restB.length) {
      r[1] = restB.shift();
    }
  }
  // 5. leftover B fields -> onlyB rows
  restB.forEach(f => rows.push([null, f]));

  const tags = new Set([...a, ...b].map(f => f.tag));
  const displayTag = [...tags].sort().join('/') || groupKey;

  const out = rows.map(([fa, fb]) => {
    const state = !fa ? 'onlyB' : !fb ? 'onlyA' : norm(fa) === norm(fb) ? 'identical' : 'differs';
    return {
      state,
      a: fa,
      b: fb,
      subfieldDiffs: state === 'differs' && fa.kind === 'var' && fb.kind === 'var'
        ? subfieldDiffs(fa, fb)
        : [],
    };
  });

  return {displayTag, rows: out};
}

/**
 * Subfield-level diff for one differing pair of variable fields: the
 * symmetric difference of "code|trimmedValue" items across the two sides.
 * Each listed item is present on exactly one side ({side: 'a'} or
 * {side: 'b'}); items present on both sides are equal and omitted. A code
 * with a different value on each side therefore yields two entries, one per
 * side. Repeated identical items are de-duplicated.
 */
function subfieldDiffs(fa, fb) {
  const itemsA = new Set((fa.subfields ?? []).map(sf => `${sf.code}|${String(sf.value).trim()}`));
  const itemsB = new Set((fb.subfields ?? []).map(sf => `${sf.code}|${String(sf.value).trim()}`));
  const out = [];
  for (const side of ['a', 'b']) {
    const own = side === 'a' ? itemsA : itemsB;
    const other = side === 'a' ? itemsB : itemsA;
    for (const k of own) {
      if (!other.has(k)) {
        const pipe = k.indexOf('|');
        out.push({code: k.slice(0, pipe), value: k.slice(pipe + 1), side});
      }
    }
  }
  return out;
}

//****************************************************************************//
//                                                                            //
// TOP-LEVEL DIFF                                                             //
//                                                                            //
//****************************************************************************//

/**
 * Compute the diff of two MARC records (NatLibFi marc-record wire format:
 * {leader, fields}). Pure: no DOM, JSON-serializable result.
 *
 * @param {{leader?: string, fields?: Array}} recordA
 * @param {{leader?: string, fields?: Array}} recordB
 * @returns {{leader: {a, b, state}, groups: Array, counts: {identical, onlyA, onlyB, differs}}}
 * The leader counts as a differing row (counts.differs) when it differs.
 */
export function diffRecords(recordA, recordB) {
  const A = normalizeRecord(recordA);
  const B = normalizeRecord(recordB);

  const groupKeys = [...new Set([
    ...A.fields.map(f => groupKeyFor(f.tag)),
    ...B.fields.map(f => groupKeyFor(f.tag)),
  ])].sort((x, y) => groupSortValue(x) - groupSortValue(y) || String(x).localeCompare(String(y)));

  const groups = groupKeys.map(key => ({
    key,
    ...diffGroup(key,
      A.fields.filter(f => groupKeyFor(f.tag) === key),
      B.fields.filter(f => groupKeyFor(f.tag) === key)),
  }));

  const counts = {identical: 0, onlyA: 0, onlyB: 0, differs: 0};
  for (const {rows} of groups) {
    for (const row of rows) {
      counts[row.state]++;
    }
  }

  const leaderDiffers = A.leader !== B.leader;
  if (leaderDiffers) {
    counts.differs++;
  }

  return {
    leader: {a: A.leader, b: B.leader, state: leaderDiffers ? 'differs' : 'identical'},
    groups,
    counts,
  };
}

//****************************************************************************//
//                                                                            //
// DOM RENDERING (pair diff)                                                  //
//                                                                            //
//****************************************************************************//

const emptyTd = () => document.createElement('td');

function thCell(className, text) {
  const th = document.createElement('th');
  th.className = className;
  th.textContent = text;
  return th;
}

function fieldCell(field, diffSet) {
  const td = document.createElement('td');
  if (!field) {
    td.className = 'empty-slot';
    td.textContent = '—';
    return td;
  }
  if (field.kind === 'ctrl' || !(field.subfields ?? []).length) {
    td.textContent = String(field.value ?? '');
    return td;
  }
  for (const sf of field.subfields) {
    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = `$${sf.code}`;
    td.append(code);
    const value = String(sf.value).trim();
    if (diffSet.has(`${sf.code}|${value}`)) {
      const span = document.createElement('span');
      span.className = 'sf-diff';
      span.textContent = sf.value;
      td.append(span);
    } else {
      td.append(document.createTextNode(sf.value));
    }
    td.append(document.createTextNode(' '));
  }
  return td;
}

function createFieldRow(row, displayTag) {
  const tr = document.createElement('tr');
  const cls = [];
  if (row.state === 'onlyA') {
    cls.push('only-a');
  }
  if (row.state === 'onlyB') {
    cls.push('only-b');
  }
  if (row.state === 'differs') {
    cls.push('differs');
  }
  if (cls.length) {
    tr.className = cls.join(' ');
  }

  const diffA = new Set();
  const diffB = new Set();
  for (const d of row.subfieldDiffs) {
    if (d.side === 'a') {
      diffA.add(`${d.code}|${d.value}`);
    } else {
      diffB.add(`${d.code}|${d.value}`);
    }
  }

  tr.append(fieldCell(row.a, diffA));

  const indsA = document.createElement('td');
  indsA.className = 'td-inds';
  indsA.textContent = row.a ? `${row.a.ind1 ?? ' '}${row.a.ind2 ?? ' '}` : '';
  tr.append(indsA);

  const tagCell = document.createElement('td');
  tagCell.className = 'td-tag';
  tagCell.textContent = displayTag;
  tr.append(tagCell);

  const indsB = document.createElement('td');
  indsB.className = 'td-inds';
  indsB.textContent = row.b ? `${row.b.ind1 ?? ' '}${row.b.ind2 ?? ' '}` : '';
  tr.append(indsB);

  tr.append(fieldCell(row.b, diffB));
  return tr;
}

/**
 * Render a computed diff (from diffRecords) into a DOM container.
 *
 * Creates a scoped root <div class="marc-pair-diff"> containing the legend,
 * the two-column comparison table and (by default) the summary. Appends the
 * root to container. Styles come from styles/marc-merge-diff.css (imported
 * via main.css).
 *
 * @param {Element} container
 * @param {{leader, groups, counts}} diff
 * @param {{labelA?: string, labelB?: string, showSummary?: boolean}} [options]
 * @returns {{table: HTMLTableElement, summary: HTMLDivElement|null}}
 */
export function renderMarcPairDiff(container, diff, options = {}) {
  const {labelA = 'Record A', labelB = 'Record B', showSummary = true} = options;

  const root = document.createElement('div');
  root.className = 'marc-pair-diff';

  const legend = document.createElement('div');
  legend.className = 'marc-pair-diff-legend';
  for (const cls of ['only-a', 'only-b', 'differs', 'sf-diff']) {
    const span = document.createElement('span');
    const swatch = document.createElement('i');
    swatch.className = `swatch ${cls}`;
    const text = document.createElement('span');
    text.textContent = {
      'only-a': 'only in A',
      'only-b': 'only in B',
      'differs': 'both, values differ',
      'sf-diff': 'subfield that differs',
    }[cls];
    span.append(swatch, text);
    legend.append(span);
  }
  root.append(legend);

  const table = document.createElement('table');
  table.className = 'marc-pair-diff-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.append(
    thCell('hdr-a', labelA),
    thCell('hdr-a', ' '),
    thCell('hdr-tag', 'tag'),
    thCell('hdr-b', ' '),
    thCell('hdr-b', labelB),
  );
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement('tbody');

  const ldr = document.createElement('tr');
  ldr.className = `mdd-ldr${diff.leader.state === 'differs' ? ' differs' : ''}`;
  const ldrA = document.createElement('td');
  ldrA.className = 'td-data-a';
  ldrA.textContent = diff.leader.a;
  const ldrTag = document.createElement('td');
  ldrTag.className = 'td-tag';
  ldrTag.textContent = 'LDR';
  const ldrB = document.createElement('td');
  ldrB.className = 'td-data-b';
  ldrB.textContent = diff.leader.b;
  ldr.append(ldrA, emptyTd(), ldrTag, emptyTd(), ldrB);
  tbody.append(ldr);

  for (const {displayTag, rows} of diff.groups) {
    for (const row of rows) {
      tbody.append(createFieldRow(row, displayTag));
    }
  }
  table.append(tbody);
  root.append(table);

  let summary = null;
  if (showSummary) {
    summary = document.createElement('div');
    summary.className = 'marc-pair-diff-summary';
    const c = diff.counts;
    const parts = [
      `<b>Diff summary:</b> ${c.identical} identical rows`,
      `<b class="sum-only-a">${c.onlyA} only in A</b>`,
      `<b class="sum-only-b">${c.onlyB} only in B</b>`,
      `<b class="sum-differs">${c.differs} differ</b>`,
    ];
    summary.innerHTML = parts.join(' · ');
    root.append(summary);
  }

  container.append(root);
  return {table, summary, counts: diff.counts};
}

//****************************************************************************//
//                                                                            //
// MERGE-DIFF CARD                                                            //
//                                                                            //
//****************************************************************************//

/**
 * Render the "secondary ⇆ primary" record comparison card into a DOM
 * container: a header row (side labels + swap button), an inputs row
 * (per-side record-ID input + fetch button, TAG label centered between)
 * and a body region holding the pair-diff table.
 *
 * Clears container's existing children and builds the card fresh on every
 * call, so repeated calls re-render idempotently. Creates a scoped root
 * <div class="marc-merge-diff BoxShadow"> and appends it to container.
 * Styles come from styles/marc-merge-diff.css (imported via main.css).
 *
 * The body is filled with renderMarcPairDiff(diffRecords(source, base))
 * only when BOTH state.source and state.base are present; otherwise the
 * body stays empty (the host shows the diff once both records are loaded).
 *
 * @param {Element} container
 * @param {{sourceId: string, baseId: string, source: (object|null|undefined), base: (object|null|undefined),
 *          swapDisabled?: boolean}} state
 *        sourceId/baseId are the record-ID texts shown in the inputs;
 *        source/base are the loaded MARC records (null/undefined = not
 *        yet loaded); swapDisabled (optional) disables the swap button.
 * @param {{labelSource?: string, labelBase?: string, showSummary?: boolean,
 *          onSwap?: () => void,
 *          onFetchSource?: (id: string) => void,
 *          onFetchBase?: (id: string) => void}} [options]
 *        onSwap is called on the swap button's click; onFetchSource /
 *        onFetchBase are called with the matching input's current value
 *        on its fetch button's click. labelSource / labelBase become the
 *        header side labels AND the pair-diff's labelA / labelB.
 * @returns {{root: HTMLDivElement,
 *            inputs: {source: HTMLInputElement, base: HTMLInputElement},
 *            fetchButtons: {source: HTMLButtonElement, base: HTMLButtonElement},
 *            swapButton: HTMLButtonElement,
 *            body: HTMLDivElement}}
 */
export function renderMarcMergeDiff(container, state, options = {}) {
  const {
    labelSource = 'Toissijainen tietue',
    labelBase = 'Ensisijainen tietue',
    showSummary = true,
    onSwap,
    onFetchSource,
    onFetchBase,
  } = options;

  container.replaceChildren();

  const root = document.createElement('div');
  root.className = 'marc-merge-diff BoxShadow';

  // Header row: label (col 1) | swap button (col 3) | label (col 5)
  const head = document.createElement('div');
  head.className = 'marc-merge-diff-head marc-merge-diff-grid-row';

  const labelA = document.createElement('span');
  labelA.className = 'marc-merge-diff-side-label';
  labelA.textContent = labelSource;

  const swapButton = document.createElement('button');
  swapButton.className = 'marc-merge-diff-swap material-icons tooltip icon-only';
  swapButton.type = 'button';
  swapButton.setAttribute('tooltip-text', 'Vaihda');
  swapButton.textContent = 'swap_horiz';
  if (state.swapDisabled) {
    swapButton.disabled = true;
  }

  const labelB = document.createElement('span');
  labelB.className = 'marc-merge-diff-side-label';
  labelB.textContent = labelBase;

  head.append(labelA, swapButton, labelB);
  root.append(head);

  // Inputs row: [input + fetch] (col 1) | TAG (col 3) | [input + fetch]
  // (col 5)
  const inputsRow = document.createElement('div');
  inputsRow.className = 'marc-merge-diff-inputs marc-merge-diff-grid-row';

  const sideA = document.createElement('div');
  sideA.className = 'marc-merge-diff-side';
  const inputSource = document.createElement('input');
  inputSource.type = 'text';
  inputSource.name = 'sourceId';
  inputSource.className = 'marc-merge-diff-input marc-merge-diff-input-source';
  inputSource.value = state.sourceId ?? '';
  inputSource.placeholder = 'tietue-ID';
  inputSource.autocomplete = 'off';
  const fetchSource = document.createElement('button');
  fetchSource.type = 'button';
  fetchSource.className = 'material-icons tooltip icon-only';
  fetchSource.setAttribute('tooltip-text', 'Hae');
  fetchSource.textContent = 'search';
  sideA.append(inputSource, fetchSource);

  const tag = document.createElement('span');
  tag.className = 'marc-merge-diff-tag';
  tag.textContent = 'TAG';

  const sideB = document.createElement('div');
  sideB.className = 'marc-merge-diff-side';
  const inputBase = document.createElement('input');
  inputBase.type = 'text';
  inputBase.name = 'baseId';
  inputBase.className = 'marc-merge-diff-input marc-merge-diff-input-base';
  inputBase.value = state.baseId ?? '';
  inputBase.placeholder = 'tietue-ID';
  inputBase.autocomplete = 'off';
  const fetchBase = document.createElement('button');
  fetchBase.type = 'button';
  fetchBase.className = 'material-icons tooltip icon-only';
  fetchBase.setAttribute('tooltip-text', 'Hae');
  fetchBase.textContent = 'search';
  sideB.append(inputBase, fetchBase);

  inputsRow.append(sideA, tag, sideB);
  root.append(inputsRow);

  // Diff body: the pair diff (rendered only when both records are
  // present — the host shows it once both sides are loaded).
  const body = document.createElement('div');
  body.className = 'marc-merge-diff-body';
  if (state.source && state.base) {
    renderMarcPairDiff(body, diffRecords(state.source, state.base), {
      labelA: labelSource,
      labelB: labelBase,
      showSummary,
    });
  }
  root.append(body);

  // Interaction: delegated to the option callbacks (the host re-renders
  // with the updated state; the component itself keeps no state).
  if (onSwap) {
    swapButton.addEventListener('click', onSwap);
  }
  if (onFetchSource) {
    fetchSource.addEventListener('click', () => onFetchSource(inputSource.value));
  }
  if (onFetchBase) {
    fetchBase.addEventListener('click', () => onFetchBase(inputBase.value));
  }

  container.append(root);

  return {
    root,
    inputs: {source: inputSource, base: inputBase},
    fetchButtons: {source: fetchSource, base: fetchBase},
    swapButton,
    body,
  };
}
