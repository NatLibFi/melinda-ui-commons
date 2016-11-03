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

  describe('when record has cyrillic author in field 100', () => {
    let field100;
    let fields880;

    beforeEach(() => {
      return transliterate(copy(FAKE_RECORD_CYRILLIC_AUTHOR), {})
        .then(res => result = res)
        .catch(err => { throw err; })
        .then(() => {
          field100 = _.head(result.fields.filter(field => field.tag === '100'));
          fields880 = result.fields.filter(field => field.tag === '880');
        });
    });

    it('creates ISO-9 transliterated version and puts it into field 100 (author field)', () => {
      expect(subfield('a').of(field100)).to.equal('Čajkovskij');
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

  const parsed = getTransliterationTestStory()
    .split('\n\n')
    .map(s => s.trim())
    .filter(testDef => testDef.length > 0)
    .map(testDef => {
      return {
        heading: _.head(testDef.split(':\n')),
        input: _.tail(testDef.split(':\n')).join(':\n')
      };
    })
    .map(testDef => {
      return _.assign({}, testDef, {
        record: MarcRecord.fromString(testDef.input)
      });
    });

  const tests = _.chunk(parsed, 2);

  tests.forEach((test) => {

    const testName = `${test[0].heading}`;

    const testFn = () => {
      return transliterate(test[0].record).then(result => {
        expect(result.toString().split('\n')).to.eql(test[1].record.toString().split('\n'));
      });
    };


    if (test[0].heading.startsWith('!')) {
      it.only(testName, testFn);
    } else {
      it(testName, testFn);
    }

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

function getTransliterationTestStory() {
  return `
should do nothing if there is no cyrillic characters:
LDR    abcdefghijk
001    28474
100    ‡aTest Author

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡aTest Author


should create transliterated fields:
LDR    abcdefghijk
001    28474
100    ‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>


should move indicators:
LDR    abcdefghijk
001    28474
100  1 ‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100  1 ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880  1 ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880  1 ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>


should handle transliteration with multiple subfields:
LDR    abcdefghijk
001    28474
100    ‡aЧайковский‡bЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡bČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡bЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡bTšaikovski‡9SFS4900 <TRANS>


should handle transliteration with multiple fields:
LDR    abcdefghijk
001    28474
100    ‡aЧайковский
245    ‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
245    ‡6880-02‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>
880    ‡6245-02‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6245-02‡aTšaikovski‡9SFS4900 <TRANS>


is idempotent:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>


handles mixed transliterated content:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
245    ‡aЧайковский
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
245    ‡6880-02‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>
880    ‡6245-02‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6245-02‡aTšaikovski‡9SFS4900 <TRANS>


completes partial transliteration from SFS4900:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aTšaikovski
880    ‡6100-01‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>


completes multiple partial transliterations from SFS4900:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aTšaikovski
245    ‡6880-02‡aTšaikovski
880    ‡6100-01‡aЧайковский
880    ‡6245-02‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
245    ‡6880-02‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>
880    ‡6245-02‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6245-02‡aTšaikovski‡9SFS4900 <TRANS>


completes partial transliteration from ISO9:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij
880    ‡6100-01‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>


should not drop 9-subfields that have nothing to do with transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ALMA <KEEP>
880    ‡6100-01‡aЧайковский‡9ALMA <KEEP>

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ALMA <KEEP>‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9ALMA <KEEP>‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9ALMA <KEEP>‡9SFS4900 <TRANS>


does not change record with broken links:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij


does not handle cyrillic characters in leader or fixed fields:
LDR    abČdefghijk
001    28474
008    ČČČČČČČČČČČČČČČČ

after applying transliteration:
LDR    abČdefghijk
001    28474
008    ČČČČČČČČČČČČČČČČ


normalizes link fields by removing obsolete encoding info:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij
880    ‡6100-01/NC‡aЧайковский

after applying transliteration:
LDR    abcdefghijk
001    28474
100    ‡6880-01‡aČajkovskij‡9ISO9 <TRANS>
880    ‡6100-01‡aЧайковский‡9CYRILLIC <TRANS>
880    ‡6100-01‡aTšaikovski‡9SFS4900 <TRANS>
`;

}