'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionController = undefined;

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


exports.readSessionMiddleware = readSessionMiddleware;
exports.requireSession = requireSession;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _melindaAuthProvider = require('./melinda-auth-provider');

var _sessionCrypt = require('./session-crypt');

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _logger = require('./logger');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sessionController = exports.sessionController = (0, _express2.default)();

sessionController.use(_bodyParser2.default.json());

sessionController.options('/start', (0, _cors2.default)(_utils.corsOptions)); // enable pre-flight
sessionController.options('/validate', (0, _cors2.default)(_utils.corsOptions)); // enable pre-flight

sessionController.post('/start', (0, _cors2.default)(_utils.corsOptions), (0, _utils.requireBodyParams)('username', 'password'), function (req, res) {
  var _req$body = req.body,
      username = _req$body.username,
      password = _req$body.password;


  _logger.logger.log('info', 'Checking credentials for user ' + username);

  _melindaAuthProvider.authProvider.validateCredentials(username, password).then(function (authResponse) {
    if (authResponse.credentialsValid) {
      var sessionToken = (0, _sessionCrypt.createSessionToken)(username, password);
      res.send(_extends({}, authResponse, { sessionToken: sessionToken }));
      _logger.logger.log('info', 'Succesful signin from ' + username);
    } else {
      _logger.logger.log('info', 'Credentials not valid for user ' + username);
      res.status(401).send('Authentication failed');
    }
  }).catch(function (error) {

    _logger.logger.log('error', 'Error validating credentials', error);

    res.status(500).send('Internal server error');
  });
});

sessionController.post('/validate', (0, _cors2.default)(_utils.corsOptions), (0, _utils.requireBodyParams)('sessionToken'), function (req, res) {
  var sessionToken = req.body.sessionToken;

  try {
    var _readSessionToken = (0, _sessionCrypt.readSessionToken)(sessionToken),
        username = _readSessionToken.username,
        password = _readSessionToken.password;

    _melindaAuthProvider.authProvider.validateCredentials(username, password).then(function (authResponse) {
      if (authResponse.credentialsValid) {
        _logger.logger.log('info', 'Succesful session validation for ' + username);
        res.send(authResponse);
      } else {
        _logger.logger.log('info', 'Credentials not valid for user ' + username);
        res.status(401).send('Authentication failed');
      }
    }).catch(function (error) {

      _logger.logger.log('error', 'Error validating credentials', error);

      res.status(500).send('Internal server error');
    });
  } catch (error) {
    _logger.logger.log('error', 'Error validating credentials', error);
    res.status(401).send('Authentication failed');
  }
});

function readSessionMiddleware(req, res, next) {

  try {
    var _readSessionToken2 = (0, _sessionCrypt.readSessionToken)(req.cookies.sessionToken),
        username = _readSessionToken2.username,
        password = _readSessionToken2.password;

    req.session = _lodash2.default.assign({}, req.session, { username: username, password: password });
  } catch (e) {
    // invalid token
    _logger.logger.log('debug', 'Invalid session from token', req.cookies.sessionToken, e.message);
    req.session = {};
  }

  next();
}

function requireSession(req, res, next) {

  var username = _lodash2.default.get(req, 'session.username');
  var password = _lodash2.default.get(req, 'session.password');

  if (username && password) {
    return next();
  } else {
    res.sendStatus(_httpStatusCodes2.default.UNAUTHORIZED);
  }
}
//# sourceMappingURL=session-controller.js.map