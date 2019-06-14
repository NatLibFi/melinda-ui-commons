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
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
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
