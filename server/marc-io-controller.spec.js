import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import { __RewireAPI__ as RewireAPI } from './marc-io-controller';
import { marcIOController } from './marc-io-controller';
//import { createSessionToken } from './session-crypt';

chai.use(sinonChai);

//const sessionToken = createSessionToken('test-user', 'test-pass');

describe('MARC IO controller', () => {
  let loadChildRecordsStub;  
  let loggerStub;
  
  beforeEach(() => {

    loadChildRecordsStub = sinon.stub();

    const MelindaClientStub = sinon.stub().returns({
      loadChildRecords: loadChildRecordsStub
    });
    RewireAPI.__Rewire__('MelindaClient', MelindaClientStub);

    Promise.prototype.done = function() {};

    loggerStub = { log: sinon.stub() };
    RewireAPI.__Rewire__('logger', loggerStub);

  });
  afterEach(() => {
    delete(Promise.prototype.done);
    RewireAPI.__ResetDependency__('MelindaClient');
    RewireAPI.__ResetDependency__('logger');
  });
  

  it('responds in json', (done) => {

    loadChildRecordsStub.resolves([{fields: [{tag:'001',value:'123'}]}]);

    request(marcIOController)
      .get('/123')
      .expect('Content-Type', /json/)
      .expect(HttpStatus.OK, done);
  });

});
