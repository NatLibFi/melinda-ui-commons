'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authProvider = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
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


var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _utils = require('./utils');

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseXMLStringToJSON = (0, _es6Promisify2.default)(_xml2js2.default.parseString);

var alephUrl = (0, _utils.readEnvironmentVariable)('ALEPH_URL');
var alephUserLibrary = (0, _utils.readEnvironmentVariable)('ALEPH_USER_LIBRARY');
var superUserLowTags = (0, _utils.readEnvironmentVariable)('SUPERUSER_LOWTAGS', '').split(',').map(function (s) {
  return s.toUpperCase();
});

var authProvider = exports.authProvider = {
  validateCredentials: function validateCredentials(username, password) {

    var requestUrl = alephUrl + '/X?op=user-auth&library=' + alephUserLibrary + '&staff_user=' + username + '&staff_pass=' + password;

    return new Promise(function (resolve, reject) {

      (0, _isomorphicFetch2.default)(requestUrl).then(function (response) {
        return response.text();
      }).then(parseXMLStringToJSON).then(function (json) {

        var credentialsValid = _lodash2.default.get(json, 'user-auth.reply[0]') === 'ok';
        if (credentialsValid) {
          var userinfo = credentialsValid ? parseUserInfo(json) : undefined;
          resolve({
            credentialsValid: credentialsValid,
            userinfo: _extends({}, userinfo, {
              lowtags: createAllowedLowTagList(userinfo)
            })
          });
        } else {
          resolve({ credentialsValid: credentialsValid });
        }
      }).catch(reject);
    });
  }
};

function parseUserInfo(json) {
  var userLibrary = _lodash2.default.get(json, 'user-auth.z66[0].z66-user-library[0]');
  var name = _lodash2.default.get(json, 'user-auth.z66[0].z66-name[0]');
  var department = _lodash2.default.get(json, 'user-auth.z66[0].z66-department[0]');
  var email = _lodash2.default.get(json, 'user-auth.z66[0].z66-email[0]');
  return { userLibrary: userLibrary, name: name, department: department, email: email };
}

function createAllowedLowTagList(userinfo) {
  var department = _lodash2.default.get(userinfo, 'department', '').toUpperCase();

  if (department === 'KVP') {
    return superUserLowTags;
  } else {
    return [department];
  }
}
//# sourceMappingURL=melinda-auth-provider.js.map