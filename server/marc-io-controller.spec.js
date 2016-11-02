import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import { __RewireAPI__ as MarcIOControllerRewireAPI } from './marc-io-controller';
import { marcIOController } from './marc-io-controller';
import { createSessionToken } from './session-crypt';

chai.use(sinonChai);

const sessionToken = createSessionToken('test-user', 'test-pass');

describe('MARC IO controller', () => {


});
