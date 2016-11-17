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

