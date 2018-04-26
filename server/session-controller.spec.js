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
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { sessionController } from './session-controller';
import { authProvider } from './melinda-auth-provider';
import request from 'supertest';
import { __RewireAPI__ as RewireAPI } from './session-controller';

chai.use(sinonChai);
const expect = chai.expect;

describe('Session controller', () => {
  let loggerStub;
  
  beforeEach(() => {
    loggerStub = { log: sinon.stub() };

    RewireAPI.__Rewire__('logger', loggerStub);
  });
  afterEach(() => {
    RewireAPI.__ResetDependency__('logger');
  });


  describe('start', () => {

    let validateCredentialsStub;

    beforeEach(() => {
      validateCredentialsStub = sinon.stub(authProvider, 'validateCredentials');
    });

    afterEach(() => {
      authProvider.validateCredentials.restore();
    });

    it('returns 200 if credentials are ok', (done) => {

      validateCredentialsStub.resolves({
        credentialsValid: true
      });

      request(sessionController)
        .post('/start')
        .send({'username': 'test', 'password': 'test'})
        .expect(200, done);

    });

    it('returns 400 if credentials are missing', (done) => {

      request(sessionController)
        .post('/start')
        .expect(400, done);
        
    });

    it('returns 401 if credentials are not ok', (done) => {

      validateCredentialsStub.resolves({
        credentialsValid: false
      });

      request(sessionController)
        .post('/start')
        .send({'username': 'test', 'password': 'test'})
        .expect(401, done);
        
    });

    it('returns encrypted session token if credentials are ok', (done) => {
      const requestBody = {'username': 'test', 'password': 'test'};

      const expectedSessionTokenFragment = 'test';

      validateCredentialsStub.resolves({
        credentialsValid: true
      });

      request(sessionController)
        .post('/start')
        .send(requestBody)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { sessionToken } = res.body;
          
          expect(sessionToken.substr(0,4)).to.equal(expectedSessionTokenFragment);
          
          done();
        });
     
    });
  });

});



