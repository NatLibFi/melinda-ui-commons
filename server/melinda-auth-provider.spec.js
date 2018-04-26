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
import {expect} from 'chai';
import { authProvider } from './melinda-auth-provider';
import { __RewireAPI__ as AuthProviderRewireAPI } from './melinda-auth-provider';
import sinon from 'sinon';

describe('melinda auth provider', () => {

  describe('validateCredentials', () => {
    let fetchStub;

    beforeEach(() => {
      fetchStub = sinon.stub();
      AuthProviderRewireAPI.__Rewire__('fetch', fetchStub);
    });
    afterEach(() => {
      AuthProviderRewireAPI.__ResetDependency__('fetch');
    });

    describe('with valid credentials', () => {
      let response;
      beforeEach(() => {
        fetchStub.resolves({
          text: sinon.stub().resolves(result_ok)
        });
        return authProvider.validateCredentials('master', 'master').then(res => {
          response = res;
        });
      });

      it('returns credentialsValid=true', function() {
        expect(response.credentialsValid).to.equal(true);
      });
      it('returns userinfo', function() {
        expect(response.userinfo.department).to.eql('testlab');
        expect(response.userinfo.email).to.eql('user.name@testlab');
        expect(response.userinfo.name).to.eql('user name');
        expect(response.userinfo.userLibrary).to.eql('LIBRA');
      });

    });

    describe('with invalid credentials', () => {
      let response;
      beforeEach(() => {
        fetchStub.resolves({
          text: sinon.stub().resolves(result_fail)
        });

        return authProvider.validateCredentials('master', 'master').then(res => {
          response = res;
        });
      });

      it('returns credentialsValid=false', function() {
        expect(response.credentialsValid).to.equal(false);
      });
      
      it('does not return userinfo', function() {
        expect(response.userinfo).to.be.undefined;
      });

    });

  });
});

const result_ok = `
<?xml version = "1.0" encoding = "UTF-8"?>
<user-auth>
<reply>ok</reply>
<z66>
<z66-user-library>LIBRA</z66-user-library>
<z66-name>user name</z66-name>
<z66-department>testlab</z66-department>
<z66-email>user.name@testlab</z66-email>
<z66-address></z66-address>
<z66-telephone></z66-telephone>
<z66-note-1></z66-note-1>
<z66-note-2></z66-note-2>
<z66-user-cat-level>30</z66-user-cat-level>
<z66-function-proxy></z66-function-proxy>
<z66-catalog-proxy></z66-catalog-proxy>
<z66-budget-proxy></z66-budget-proxy>
<z66-order-unit-proxy></z66-order-unit-proxy>
<z66-user-own-create></z66-user-own-create>
<z66-user-own-check></z66-user-own-check>
<z66-user-circ-level>00</z66-user-circ-level>
<z66-ill-unit></z66-ill-unit>
<z66-open-date></z66-open-date>
<z66-update-date></z66-update-date>
<z66-expiry-date></z66-expiry-date>
<z66-last-alert-date></z66-last-alert-date>
<z66-last-login-date></z66-last-login-date>
<z66-block>N</z66-block>
<z66-block-reason></z66-block-reason>
<z66-no-fail>0</z66-no-fail>
<z66-erm-user></z66-erm-user>
<z66-erm-password></z66-erm-password>
</z66>
<session-id></session-id>
</user-auth>`;

const result_fail = `
<?xml version = "1.0" encoding = "UTF-8"?>
<user-auth>
<error>No such staff member exist. Make sure both user and password are correct.</error>
<session-id></session-id>
</user-auth>`;