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
import {expect} from 'chai';
import { transformRecord } from './record-transform-service';
import { FAKE_RECORD } from './test_helpers/fake-data';

describe('Record transform service', () => {

  describe('transformRecord', () => {
   
    it('returns a thenable', () => {
      const returnValue = transformRecord('REMOVE-LOCAL-REFERENCE', FAKE_RECORD, {libraryTag: 'test'});
      expect(returnValue.then).to.be.a('function');
      expect(returnValue.catch).to.be.a('function');
    });

    it('throws when called with invalid record', () => {
      const invalidRecord = {};
      expect(transformRecord.bind(null, 'REMOVE-LOCAL-REFERENCE', invalidRecord, {})).to.throw(Error, 'Invalid record');
    });

    it('throws when called with invalid action', () => {
      const invalidAction = 'ACTION-DOESNT-EXIST';
      expect(transformRecord.bind(null, invalidAction, FAKE_RECORD, {})).to.throw(Error, `Unknown action ${invalidAction}`);
    });

  });
});
