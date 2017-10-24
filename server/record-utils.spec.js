/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-ui-commons
*
* melinda-ui-commons program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
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
  