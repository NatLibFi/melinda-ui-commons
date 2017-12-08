'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startSession = undefined;
exports.createSessionStart = createSessionStart;
exports.createSessionError = createSessionError;
exports.createSessionSuccess = createSessionSuccess;
exports.validateSession = validateSession;
exports.validateSessionStart = validateSessionStart;
exports.removeSession = removeSession;

var _jsCookie = require('js-cookie');

var Cookies = _interopRequireWildcard(_jsCookie);

var _utils = require('../utils');

var _errors = require('../errors');

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _actionTypeConstants = require('../constants/action-type-constants');

var _uiActions = require('./ui-actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
function createSessionStart() {
  return { 'type': _actionTypeConstants.CREATE_SESSION_START };
}

function createSessionError(error) {
  return { 'type': _actionTypeConstants.CREATE_SESSION_ERROR, error: error };
}

function createSessionSuccess(userinfo) {
  return { 'type': _actionTypeConstants.CREATE_SESSION_SUCCESS, userinfo: userinfo };
}

function validateSession(sessionToken) {
  var sessionBasePath = __DEV__ ? 'http://localhost:3001/session' : '/session';

  return function (dispatch) {

    if (sessionToken === undefined) {
      return;
    }

    dispatch(validateSessionStart());

    var fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ sessionToken: sessionToken }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    };

    return fetch(sessionBasePath + '/validate', fetchOptions).then((0, _utils.errorIfStatusNot)(_httpStatusCodes2.default.OK)).then(function (response) {
      return response.json();
    }).then(function (json) {

      dispatch(createSessionSuccess(json.userinfo));
    }).catch(function () {
      Cookies.remove('sessionToken');
    });
  };
}

function validateSessionStart() {
  return { 'type': _actionTypeConstants.VALIDATE_SESSION_START };
}

function removeSession() {
  return function (dispatch) {
    Cookies.remove('sessionToken');
    dispatch((0, _uiActions.resetState)());
  };
}

var startSession = exports.startSession = function () {
  var sessionBasePath = __DEV__ ? 'http://localhost:3001/session' : '/session';

  return function (username, password) {

    return function (dispatch) {

      dispatch(createSessionStart());

      var fetchOptions = {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password }),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      };

      return fetch(sessionBasePath + '/start', fetchOptions).then((0, _utils.errorIfStatusNot)(_httpStatusCodes2.default.OK)).then(function (response) {
        return response.json();
      }).then(function (json) {

        var sessionToken = json.sessionToken;
        Cookies.set('sessionToken', sessionToken);
        dispatch(createSessionSuccess(json.userinfo));
      }).catch((0, _utils.exceptCoreErrors)(function (error) {

        if (error instanceof _errors.FetchNotOkError) {
          switch (error.response.status) {
            case _httpStatusCodes2.default.BAD_REQUEST:
              return dispatch(createSessionError('Syötä käyttäjätunnus ja salasana'));
            case _httpStatusCodes2.default.UNAUTHORIZED:
              return dispatch(createSessionError('Käyttäjätunnus ja salasana eivät täsmää'));
            case _httpStatusCodes2.default.INTERNAL_SERVER_ERROR:
              return dispatch(createSessionError('Käyttäjätunnuksen tarkastuksessa tapahtui virhe. Yritä hetken päästä uudestaan.'));
          }
        }

        dispatch(createSessionError('There has been a problem with operation: ' + error.message));
      }));
    };
  };
}();
//# sourceMappingURL=session-actions.js.map