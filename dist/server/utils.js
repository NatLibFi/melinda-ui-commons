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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMelindaLoadUserByLowtag = exports.corsOptions = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.readEnvironmentVariable = readEnvironmentVariable;
exports.requireBodyParams = requireBodyParams;
exports.userinfoMiddleware = userinfoMiddleware;
exports.createLoadUserIndexFn = createLoadUserIndexFn;
exports.exceptCoreErrors = exceptCoreErrors;
exports.isCoreError = isCoreError;
exports.createTimer = createTimer;

var _logger = require('./logger');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _melindaAuthProvider = require('./melinda-auth-provider');

var _sessionCrypt = require('./session-crypt');

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MELINDA_LOAD_USER_FILE = readEnvironmentVariable('MELINDA_LOAD_USER_FILE', null);

function readEnvironmentVariable(name, defaultValue, opts) {

  if (process.env[name] === undefined) {
    if (defaultValue === undefined) {
      var message = 'Mandatory environment variable missing: ' + name;
      _logger.logger.log('error', message);
      throw new Error(message);
    }
    var loggedDefaultValue = _lodash2.default.get(opts, 'hideDefaultValue') ? '[hidden]' : defaultValue;
    _logger.logger.log('info', 'No environment variable set for ' + name + ', using default value: ' + loggedDefaultValue);
  }

  return _lodash2.default.get(process.env, name, defaultValue);
}

var whitelist = JSON.parse(readEnvironmentVariable('CORS_WHITELIST', '["http://localhost:3000"]'));

var corsOptions = exports.corsOptions = {
  origin: function origin(_origin, callback) {
    if (_origin === undefined) {
      callback(null, true);
    } else {
      var originIsWhitelisted = whitelist.indexOf(_origin) !== -1;
      if (!originIsWhitelisted) {
        _logger.logger.log('info', 'Request from origin ' + _origin + ' is not whitelisted.');
      }
      callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    }
  },
  credentials: true
};

function requireBodyParams() {
  for (var _len = arguments.length, requiredParams = Array(_len), _key = 0; _key < _len; _key++) {
    requiredParams[_key] = arguments[_key];
  }

  return function _requireBodyParams(req, res, next) {
    var values = requiredParams.map(function (key) {
      return req.body[key];
    });
    if (_lodash2.default.every(values)) {
      return next();
    }
    var missingBodyParameters = _lodash2.default.difference(requiredParams, Object.keys(req.body));
    var error = 'The request is missing the following body parameters: ' + missingBodyParameters;

    _logger.logger.log('error', error);
    res.status(_httpStatusCodes2.default.BAD_REQUEST).send(error);
  };
}

function userinfoMiddleware(req, res, next) {
  var sessionToken = req.cookies.sessionToken;

  try {
    var _readSessionToken = (0, _sessionCrypt.readSessionToken)(sessionToken),
        username = _readSessionToken.username,
        password = _readSessionToken.password;

    _melindaAuthProvider.authProvider.validateCredentials(username, password).then(function (creds) {
      req.userinfo = creds.userinfo;
      next();
    }).catch(function (error) {
      _logger.logger.log('info', 'Error loading userinfo', error);
      res.sendStatus(_httpStatusCodes2.default.INTERNAL_SERVER_ERROR);
    });
  } catch (error) {
    res.sendStatus(_httpStatusCodes2.default.UNAUTHORIZED);
  }
}

var getMelindaLoadUserByLowtag = exports.getMelindaLoadUserByLowtag = createLoadUserIndexFn(MELINDA_LOAD_USER_FILE);

function createLoadUserIndexFn(relativeFilePath) {
  var usersByLowtag = void 0;

  return function (lowtag) {
    if (usersByLowtag === undefined) {
      var userList = readLoadUsersFile(relativeFilePath);
      usersByLowtag = userList.reduce(function (acc, val) {
        return _lodash2.default.set(acc, val.lowtag, val);
      }, {});
    }

    var user = _lodash2.default.get(usersByLowtag, lowtag.toUpperCase());
    if (user === undefined) {
      return undefined;
    }

    return _lodash2.default.assign({}, user, { sessionToken: (0, _sessionCrypt.createSessionToken)(user.username, user.password) });
  };
}

function readLoadUsersFile(relativeFilePath) {
  if (relativeFilePath === null) {
    _logger.logger.log('error', 'Melinda load users file is not available. LOAD-USERS are not usable.');
    return [];
  }

  var filePath = _path2.default.resolve(process.cwd(), relativeFilePath);
  try {
    return _fs2.default.readFileSync(filePath, 'utf8').split('\n').filter(function (line) {
      return line.trim().length > 0;
    }).map(function (line) {
      var _line$split = line.split('\t'),
          _line$split2 = _slicedToArray(_line$split, 3),
          lowtag = _line$split2[0],
          username = _line$split2[1],
          password = _line$split2[2];

      return {
        lowtag: lowtag.trim().toUpperCase(),
        username: username.trim(),
        password: password.trim()
      };
    });
  } catch (error) {
    _logger.logger.log('error', 'Melinda load users file is not available. LOAD-USERS are not usable.', { filePath: filePath }, error);
  }
  return [];
}

function exceptCoreErrors(fn) {

  return function (error) {
    if (isCoreError(error)) {
      throw error;
    } else {
      return fn(error);
    }
  };
}

function isCoreError(error) {
  return [EvalError, RangeError, URIError, TypeError, SyntaxError, ReferenceError].some(function (errorType) {
    return error instanceof errorType;
  });
}

function createTimer() {
  var start = process.hrtime();

  return { elapsed: elapsed };

  function elapsed() {
    var elapsedTime = process.hrtime(start);
    return Math.round(elapsedTime[0] * 1000 + elapsedTime[1] / 1000000);
  }
}
//# sourceMappingURL=utils.js.map