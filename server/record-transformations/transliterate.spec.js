import MarcRecord from 'marc-record-js';
import { expect } from 'chai';
import { transliterate } from './transliterate';
import _ from 'lodash';

export const FAKE_RECORD = MarcRecord.fromString(
`LDR    abcdefghijk
001    28474
100    ‡aTest Author`);

export const FAKE_RECORD_CYRILLIC_AUTHOR = MarcRecord.fromString(
`LDR    abcdefghijk
001    28474
100    ‡aЧайковский`);


describe.only('transliterate', () => {
  let result;
  let error;

  describe('when record does not contain any cyrillic characters', () => {
    beforeEach(() => {
      return transliterate(copy(FAKE_RECORD), {})
        .then(res => result = res)
        .catch(err => error = err);
    });

    it('keeps the record intact', () => {
      expect(result.fields).to.eql(FAKE_RECORD.fields);
    });
  });

  describe('when record has cyrillic author in field 100', () => {
    let field100;
    let fields880;

    beforeEach(() => {
      return transliterate(copy(FAKE_RECORD_CYRILLIC_AUTHOR), {})
        .then(res => result = res)
        .catch(err => error = err)
        .then(() => {
          field100 = _.head(result.fields.filter(field => field.tag === '100'));
          fields880 = result.fields.filter(field => field.tag === '880');
        });
    });

    it('creates ISO-9 transliterated version and puts it into field 100 (author field)', () => {
      expect(subfield('a').of(field100)).to.equal('Tchaikovsky');
    });

    it('creates link subfield $6 to field 100 for linking to originial text', () => {
      expect(subfield('6').of(field100)).to.equal('880-01');
    });

    it('creates info subfield $9 to field 100 for information about the used transliteration', () => {
      expect(subfield('9').of(field100)).to.equal('ISO9 <TRANS>');
    });

    it('creates SFS4900 transliterated version and puts it into field 880', () => {
      expect(subfield('a').of(fields880[1])).to.equal('Tšaikovski');
    });

    it('creates link subfield $6 to field 100 for linking to the transliterated text', () => {
      expect(subfield('6').of(fields880[1])).to.equal('100-01');
    });

    it('creates info subfield $9 to field 100 for information about the SFS4900 transliteration', () => {
      expect(subfield('9').of(fields880[1])).to.equal('SFS4900 <TRANS>');
    });

    it('moves original field into field 880', () => {
      expect(subfield('a').of(fields880[0])).to.equal('Чайковский');
    });

    it('creates link subfield $6 to field 100 for linking to the transliterated text', () => {
      expect(subfield('6').of(fields880[0])).to.equal('100-01');
    });

    it('creates info subfield $9 to field 100 for information about the original text', () => {
      expect(subfield('9').of(fields880[0])).to.equal('CYRILLIC <TRANS>');
    });

  });
  

});

function copy(record) {
  return new MarcRecord(record);
}

function subfield(code) {
  return {
    of: (fieldOrFields) => {
      if (fieldOrFields == undefined) { 
        return undefined; 
      }
      
      if (fieldOrFields.constructor === Array) {
        return fieldOrFields.map(field => getFirstSubfieldValue(field, code));
      }
      
      return getFirstSubfieldValue(fieldOrFields, code);
    }
  };

  function getFirstSubfieldValue(field, code) {
    return _.head(field.subfields.filter(sub => sub.code === code).map(sub => sub.value));
  }
}
