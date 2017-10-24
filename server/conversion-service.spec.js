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
* melinda-ui-commons is distributed in the hope that it will be useful,
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
import sinon from 'sinon';
import { expect } from 'chai';
import { __RewireAPI__ as RewireAPI } from './conversion-service';
import { convertRecord } from './conversion-service';
import _ from 'lodash';
import { FAKE_CYRILLIC_RECORD } from './test_helpers/fake-data';

// These tests require usemarcon conversion file and usermarcon binary.
if (process.env.NODE_ENV === 'dev') {

  describe('Conversion service', () => {
    let loggerStub;
    
    beforeEach(() => {
      loggerStub = { log: sinon.stub() };
      RewireAPI.__Rewire__('logger', loggerStub);
    });

    afterEach(() => {
      RewireAPI.__ResetDependency__('logger');
    });
    
    describe('convertRecord', () => {

      describe('when called with missing conversion definition', () => {
        let resultHandler;
        let errorHandler;
        
        beforeEach(() => {
          resultHandler = sinon.spy();
          errorHandler = sinon.spy();

          return convertRecord(FAKE_CYRILLIC_RECORD, 'missing-def')
            .then(resultHandler)
            .catch(errorHandler);

        });

        it('rejects the conversion', () => {
          expect(errorHandler.callCount).to.equal(1);
        });

        it('rejects with descriptive error', () => {
          const callArgs = extractCallArgs(errorHandler);
          const callNumber = 0;
          const callArg = 0;
          const error = callArgs[callNumber][callArg];

          expect(error.message).to.equal('Conversion definition \'missing-def\' not found.');
        });

      });
      
      describe('when called with proper conversion definition', () => {
        let resultHandler;
        let errorHandler;
        
        beforeEach(() => {
          resultHandler = sinon.spy();
          errorHandler = sinon.spy();

          return convertRecord(FAKE_CYRILLIC_RECORD, 'kyril2880ma21')
            .then(resultHandler)
            .catch(errorHandler);

        });

        it('converts the record', () => {

          const result = extractCallArgs(resultHandler)[0][0];
          expect(result.record).to.be.an('object');
      
        });

      });
    });
  });

}

function extractCallArgs(spy) {
  return _.range(0,spy.callCount).map(i => spy.getCall(i).args);
}

