'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
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


exports.createSessionToken = createSessionToken;
exports.readSessionToken = readSessionToken;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var algorithm = 'aes-256-gcm';

// Using random key means that every time the app restarts all sessions will invalidate
var key = (0, _utils.readEnvironmentVariable)('SECRET_ENCRYPTION_KEY', _crypto2.default.randomBytes(32).toString('base64'), { hideDefaultValue: true });

function readKey() {
  return new Buffer(key, 'base64');
}

function createSessionToken(username, password) {

  var iv = _crypto2.default.randomBytes(12);
  var key = readKey();

  var encryptionResult = encrypt(password, username, iv, key);

  return createToken(username, encryptionResult);
}

function readSessionToken(sessionToken) {
  var key = readKey();

  var _parseToken = parseToken(sessionToken),
      username = _parseToken.username,
      iv = _parseToken.iv,
      tag = _parseToken.tag,
      encrypted = _parseToken.encrypted;

  return {
    username: username,
    password: decrypt(encrypted, username, iv, tag, key)
  };
}

function createToken(username, encryptionResult) {
  var encrypted = encryptionResult.encrypted,
      iv = encryptionResult.iv,
      tag = encryptionResult.tag;

  return [username, iv.toString('hex'), tag.toString('hex'), encrypted].join(':');
}

function parseToken(token) {
  var _token$split = token.split(':'),
      _token$split2 = _slicedToArray(_token$split, 4),
      username = _token$split2[0],
      iv = _token$split2[1],
      tag = _token$split2[2],
      encrypted = _token$split2[3];

  return {
    username: username,
    encrypted: encrypted,
    iv: new Buffer(iv, 'hex'),
    tag: new Buffer(tag, 'hex')
  };
}

function encrypt(text, aad, iv, key) {
  var cipher = _crypto2.default.createCipheriv(algorithm, key, iv);
  cipher.setAAD(new Buffer(aad, 'utf8'));
  var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

  return {
    encrypted: encrypted,
    tag: cipher.getAuthTag(),
    iv: iv
  };
}

function decrypt(encrypted, aad, iv, tag, key) {
  var decipher = _crypto2.default.createDecipheriv(algorithm, key, iv);
  decipher.setAAD(new Buffer(aad, 'utf8'));
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
//# sourceMappingURL=session-crypt.js.map