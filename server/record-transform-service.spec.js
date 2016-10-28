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
