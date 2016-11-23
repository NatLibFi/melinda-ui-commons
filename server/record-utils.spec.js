import { expect } from 'chai';
import { isComponentRecord } from './record-utils';
import MarcRecord from 'marc-record-js';

const fakeComponentRecord = MarcRecord.fromString(`
LDR    00000faahijk
001    28474
100    ‡aTest Author‡9TEST <KEEP>‡9TEST-2 <KEEP>
245    ‡aSome content‡9TEST <DROP>
300    ‡aSub-A‡5TEST
301    ‡aSub-A‡5TEST‡5TEST-2
SID    ‡btest‡cFCC131
SID    ‡btest-2‡c11
`);

const fakeHostRecord = MarcRecord.fromString(`
LDR    00000fghijk
001    28474
100    ‡aTest Author‡9TEST <KEEP>‡9TEST-2 <KEEP>
245    ‡aSome content‡9TEST <DROP>
300    ‡aSub-A‡5TEST
301    ‡aSub-A‡5TEST‡5TEST-2
SID    ‡btest‡cFCC131
SID    ‡btest-2‡c11
`);

describe('record-utils', () => {  

  describe('isComponentRecord', () => {
    it('should return true if the record is a component record', () => {
      expect(isComponentRecord(fakeComponentRecord)).to.equal(true);
    });
    
    it('should return false if the is a host record', () => {
      expect(isComponentRecord(fakeHostRecord)).to.equal(false);
    });
  });

});
  