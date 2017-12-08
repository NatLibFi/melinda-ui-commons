'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exceptCoreErrors = exceptCoreErrors;
exports.errorIfStatusNot = errorIfStatusNot;
exports.isFileApiSupported = isFileApiSupported;

var _errors = require('./errors');

function exceptCoreErrors(fn) {

  return function (error) {
    if ([TypeError, SyntaxError, ReferenceError].find(function (errorType) {
      return error instanceof errorType;
    })) {
      throw error;
    } else {
      return fn(error);
    }
  };
} /**
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
function errorIfStatusNot(statusCode) {
  return function (response) {
    if (response.status !== statusCode) {
      throw new _errors.FetchNotOkError(response);
    }
    return response;
  };
}

function isFileApiSupported() {
  return window.File && window.FileReader && window.FileList && window.Blob;
}
//# sourceMappingURL=utils.js.map