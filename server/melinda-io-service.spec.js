import {expect} from 'chai';
import { RecordIOError, loadRecord, updateAndReloadRecord } from './melinda-io-service';
import { __RewireAPI__ as RewireAPI } from './melinda-io-service';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import HttpStatus from 'http-status-codes';
import { FAKE_RECORD, FAKE_RECORD_2, melindaClientUnableParseResponse } from './test_helpers/fake-data';

describe('melinda io service', () => {

  before(() => {
    Promise.prototype.done = function() {};
  });
  after(() => {
    delete(Promise.prototype.done);
  });

  let loggerStub;
  let fakeOpts = {};
  const fakeId = '123';
  
  let resultSpy;
  let errorSpy;
  let clientStub;
  
  beforeEach(() => {
    clientStub = {
      loadChildRecords: sinon.stub(),
      updateRecord: sinon.stub()
    };
  
    loggerStub = { log: sinon.stub() };

    RewireAPI.__Rewire__('logger', loggerStub);
  });
  afterEach(() => {
    RewireAPI.__ResetDependency__('logger');
  });

  describe('loadRecord', () => {

    describe('when result is empty', () => {
    
      beforeEach(() => {
        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.loadChildRecords.resolves();

        return loadRecord(clientStub, fakeId, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('rejects with RecordIOError', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error).to.be.instanceof(RecordIOError);
      });

      it('rejects with NOT_FOUND', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error.status).to.be.equal(HttpStatus.NOT_FOUND);
      });

      it('does not call result handler', () => {
        expect(resultSpy.callCount).to.be.equal(0);
      });

    });


    describe('when result contains single record', () => {
      beforeEach(() => {
        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.loadChildRecords.resolves([FAKE_RECORD]);

        return loadRecord(clientStub, fakeId, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('resolves with the record', () => {
        const [result] = resultSpy.getCall(0).args;
        expect(result.record).to.be.equal(FAKE_RECORD);
      });

      it('resolves with an empty array for subrecords', () => {
        const [result] = resultSpy.getCall(0).args;
        expect(result.subrecords).to.be.eql([]);
      });

      it('does not call error handler', () => {
        expect(errorSpy.callCount).to.be.equal(0);
      });

    });

    describe('when result contains multiple records', () => {
      beforeEach(() => {
        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.loadChildRecords.resolves([FAKE_RECORD, FAKE_RECORD_2]);

        return loadRecord(clientStub, fakeId, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('resolves with the record', () => {
        const [result] = resultSpy.getCall(0).args;
        expect(result.record).to.be.equal(FAKE_RECORD);
      });

      it('resolves with an array of subrecords', () => {
        const [result] = resultSpy.getCall(0).args;
        expect(result.subrecords).to.be.eql([FAKE_RECORD_2]);
      });

      it('does not call error handler', () => {
        expect(errorSpy.callCount).to.be.equal(0);
      });

    });

  });


  describe('updateAndReloadRecord', () => {

    describe('when given recordId and recordId in actual record differ', () => {
    
      beforeEach(() => {
        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.loadChildRecords.resolves();

        return updateAndReloadRecord(clientStub, fakeId, FAKE_RECORD, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('rejects with RecordIOError', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error).to.be.instanceof(RecordIOError);
      });

      it('rejects with BAD_REQUEST', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error.status).to.be.equal(HttpStatus.BAD_REQUEST);
      });

      it('rejects with explanation', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error.message).to.be.equal(`recordId from url must match field 001 in supplied record: ${fakeId} !== 28474`);
      });

      it('does not call result handler', () => {
        expect(resultSpy.callCount).to.be.equal(0);
      });

    });

    describe('when record is updated succesfully', () => {
    
      beforeEach(() => {
        const FAKE_RECORD_ID = '28474';

        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.loadChildRecords.resolves([FAKE_RECORD]);
        clientStub.updateRecord.resolves({
          messages: [],
          recordId: FAKE_RECORD_ID
        });

        return updateAndReloadRecord(clientStub, FAKE_RECORD_ID, FAKE_RECORD, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

 
      it('resolves with the record', () => {
        const [result] = resultSpy.getCall(0).args;
        expect(result.record).to.be.equal(FAKE_RECORD);
      });

      it('resolves with an empty array for subrecords', () => {
        const [result] = resultSpy.getCall(0).args;
        expect(result.subrecords).to.be.eql([]);
      });

      it('does not call error handler', () => {
        expect(errorSpy.callCount).to.be.equal(0);
      });

    });

    describe('when record update fails', () => {
    
      beforeEach(() => {
        const FAKE_RECORD_ID = '28474';

        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.loadChildRecords.resolves([FAKE_RECORD]);
        clientStub.updateRecord.rejects(melindaClientUnableParseResponse);

        return updateAndReloadRecord(clientStub, FAKE_RECORD_ID, FAKE_RECORD, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('does not call result handler', () => {
        expect(resultSpy.callCount).to.be.equal(0);
      });

      it('rejects with RecordIOError', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error).to.be.instanceof(RecordIOError);
      });

      it('rejects with BAD_REQUEST', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error.status).to.be.equal(HttpStatus.BAD_REQUEST);
      });

      it('rejects with explanation', () => {
        const [error] = errorSpy.getCall(0).args;
        expect(error.message).to.be.equal('Fake update failure reason');
      });

    });

  });

});

