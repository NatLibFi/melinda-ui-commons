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
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {createSessionToken, readSessionToken} from './session-crypt';
import {__RewireAPI__ as RewireAPI} from './session-crypt';

chai.use(sinonChai);
const expect = chai.expect;

const USERNAME = 'test_username';
const PASSWORD = 'password';

describe('Session crypt', () => {
  let loggerStub;

  beforeEach(() => {
    loggerStub = {log: sinon.stub()};
    RewireAPI.__Rewire__('logger', loggerStub);
  });
  afterEach(() => {
    RewireAPI.__ResetDependency__('logger');
  });

  describe('createSessionToken', () => {
    it('generates session token', () => {

      const generatedSessionToken = createSessionToken(USERNAME, PASSWORD);

      expect(generatedSessionToken).to.be.a('string');
      expect(generatedSessionToken.split(':')).to.have.lengthOf(4);

    });
  });

  describe('readSessionToken', () => {
    it('reads a generated session token and returns credentials', () => {

      const generatedSessionToken = createSessionToken(USERNAME, PASSWORD);

      const credentials = readSessionToken(generatedSessionToken);

      expect(credentials).to.eql({
        username: USERNAME,
        password: PASSWORD
      });

    });


    it('fails when the username is tampered with', () => {
      const generatedSessionToken = createSessionToken(USERNAME, PASSWORD);

      const tamperedSessionToken = generatedSessionToken.split(':')
        .map((val, i) => i == 0 ? 'changed_username' : val)
        .join(':');

      expect(() => {
        readSessionToken(tamperedSessionToken);
      }).to.throw('Unsupported state or unable to authenticate data');

    });

  });

});
