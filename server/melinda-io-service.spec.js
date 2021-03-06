/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
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
import {expect} from 'chai';
import {loadRecord, updateAndReloadRecord} from './melinda-io-service';
import {__RewireAPI__ as RewireAPI} from './melinda-io-service';
import sinon from 'sinon';
import HttpStatus from 'http-status';
import {MarcRecord} from '@natlibfi/marc-record';
import {FAKE_RECORD, FAKE_RECORD_2, melindaClientUnableParseResponse} from './test_helpers/fake-data';
import {Error as RecordIOError} from '@natlibfi/melinda-commons';

// Lisätty
MarcRecord.setValidationOptions({fields: false, subfields: false, subfieldValues: false});

describe('melinda io service', () => {

  before(() => {
    Promise.prototype.done = function () {};
  });
  after(() => {
    delete (Promise.prototype.done);
  });

  let loggerStub;
  let fakeOpts = {subrecords: 0};
  let fakeOpts2 = {subrecords: 1};
  const fakeId = '123';

  let resultSpy;
  let errorSpy;
  let clientStub;
  let subrecordPickerStub;

  beforeEach(() => {
    clientStub = {
      read: sinon.stub(),
      create: sinon.stub(),
      update: sinon.stub()
    };


    subrecordPickerStub = {
      readAllSubrecords: sinon.stub()
    };

    loggerStub = {log: sinon.stub()};

    RewireAPI.__Rewire__('subrecordPicker', subrecordPickerStub);
    RewireAPI.__Rewire__('logger', loggerStub);
  });
  afterEach(() => {
    RewireAPI.__ResetDependency__('subrecordPicker');
    RewireAPI.__ResetDependency__('logger');
  });

  describe('loadRecord', () => {
    describe('when result is empty', () => {
      beforeEach(() => {
        resultSpy = sinon.spy();
        errorSpy = sinon.spy();

        clientStub.read.rejects(new RecordIOError(HttpStatus.NOT_FOUND, 'Record not found'));

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

        clientStub.read.resolves({record: FAKE_RECORD});
        subrecordPickerStub.readAllSubrecords.resolves({records: []});

        return loadRecord(clientStub, fakeId, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('resolves with the record', () => {
        const [result] = resultSpy.getCall(0).args;
        const resultRecord = new MarcRecord(result.record, {subfieldValues: false});
        expect(MarcRecord.isEqual(resultRecord, FAKE_RECORD), true);
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

        clientStub.read.resolves({record: FAKE_RECORD});
        subrecordPickerStub.readAllSubrecords.resolves({records: [FAKE_RECORD_2]});

        return loadRecord(clientStub, fakeId, fakeOpts2)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('resolves with the record', () => {
        const [result] = resultSpy.getCall(0).args;
        const resultRecord = new MarcRecord(result.record);
        expect(MarcRecord.isEqual(resultRecord, FAKE_RECORD), true);
      });

      it('resolves with an array of subrecords', () => {
        const [result] = resultSpy.getCall(0).args;
        const resultRecord2 = new MarcRecord(result.subrecords[0]);
        expect([resultRecord2]).to.be.eql([FAKE_RECORD_2]);
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

        clientStub.read.resolves({record: FAKE_RECORD});
        subrecordPickerStub.readAllSubrecords.resolves({records: []});

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
        expect(error.payload).to.be.equal(`recordId from url must match field 001 in supplied record: ${fakeId} !== 28474`);
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

        clientStub.read.resolves({record: FAKE_RECORD});
        subrecordPickerStub.readAllSubrecords.resolves({records: []});
        clientStub.update.resolves({
          messages: []
        });

        return updateAndReloadRecord(clientStub, FAKE_RECORD_ID, FAKE_RECORD, fakeOpts)
          .then(resultSpy)
          .catch(errorSpy);
      });

      it('resolves with the record', () => {
        const [result] = resultSpy.getCall(0).args;
        const resultRecord = new MarcRecord(result.record, {subfieldValues: false});
        expect(MarcRecord.isEqual(resultRecord, FAKE_RECORD), true);
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

        clientStub.read.resolves({record: FAKE_RECORD});
        subrecordPickerStub.readAllSubrecords.resolves({records: []});
        clientStub.update.rejects(melindaClientUnableParseResponse);

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
        expect(error.payload).to.be.equal('Fake update failure reason');
      });
    });
  });
});

