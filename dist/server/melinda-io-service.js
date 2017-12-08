'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadRecord = loadRecord;
exports.updateAndReloadRecord = updateAndReloadRecord;
exports.createAndReloadRecord = createAndReloadRecord;
exports.RecordIOError = RecordIOError;

var _logger = require('./logger');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_LOAD_OPTIONS = {
  include_parent: 1
}; /**
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
function loadRecord(client, recordId, opts) {

  return new Promise(function (resolve, reject) {

    var loadOptions = _lodash2.default.assign({}, DEFAULT_LOAD_OPTIONS, opts);

    client.loadChildRecords(recordId, loadOptions).then(function (records) {
      var record = _lodash2.default.head(records);
      var subrecords = _lodash2.default.tail(records);

      if (record === undefined || record.fields.length === 0) {
        return reject(new RecordIOError('Record ' + recordId + ' appears to be empty record.', _httpStatusCodes2.default.NOT_FOUND));
      }

      resolve({ record: record, subrecords: subrecords });
    }).catch(function (error) {
      reject(error);
    }).done();
  });
}

function updateRecord(client, record) {
  return new Promise(function (resolve, reject) {
    return client.updateRecord(record).then(function (updateResponse) {
      resolve(updateResponse);
    }).catch(function (error) {
      reject(error);
    }).done();
  });
}

function createRecord(client, record) {
  return new Promise(function (resolve, reject) {
    return client.createRecord(record).then(function (createResponse) {
      resolve(createResponse);
    }).catch(function (error) {
      reject(error);
    }).done();
  });
}

function updateAndReloadRecord(client, recordId, record) {

  var recordIdFromBody = _lodash2.default.get(_lodash2.default.head(record.get('001')), 'value');

  if (parseInt(recordIdFromBody) !== parseInt(recordId)) {
    var errorMessage = 'recordId from url must match field 001 in supplied record: ' + recordId + ' !== ' + recordIdFromBody;
    return Promise.reject(new RecordIOError(errorMessage, _httpStatusCodes2.default.BAD_REQUEST));
  }

  return updateRecord(client, record).then(function (updateResponse) {
    _logger.logger.log('info', 'Record updated ok for ' + recordId, updateResponse.messages);

    var recordIdFromUpdate = updateResponse.recordId;

    return loadRecord(client, recordIdFromUpdate, { include_parent: 1 }).then(function (record) {
      return record;
    }).catch(function (error) {
      _logger.logger.log('info', 'Error loading record ' + recordId, error);
      throw error;
    });
  }).catch(function (error) {
    _logger.logger.log('info', 'Record update failed for ' + recordId, error);
    if (looksLikeMelindaClientParseError(error)) {

      var reason = _lodash2.default.get(error, 'errors[0].message').substr('melinda-api-client unable to parse: '.length);

      throw new RecordIOError(reason, _httpStatusCodes2.default.BAD_REQUEST);
    }
    throw error;
  });
}

function createAndReloadRecord(client, record) {

  return createRecord(client, record).then(function (updateResponse) {
    var recordId = updateResponse.recordId;

    _logger.logger.log('info', 'Record created, id: ' + recordId, updateResponse.messages);

    return loadRecord(client, recordId, { include_parent: 1 }).then(function (result) {
      return _lodash2.default.assign({}, result, { recordId: recordId });
    }).catch(function (error) {
      _logger.logger.log('info', 'Error loading record ' + recordId, error);
      throw error;
    });
  }).catch(function (error) {
    _logger.logger.log('info', 'Record creation failed', error);
    if (looksLikeMelindaClientParseError(error)) {

      var reason = _lodash2.default.get(error, 'errors[0].message').substr('melinda-api-client unable to parse: '.length);

      throw new RecordIOError(reason, _httpStatusCodes2.default.BAD_REQUEST);
    }
    throw error;
  });
}

function looksLikeMelindaClientParseError(error) {
  return _lodash2.default.get(error, 'errors[0].code') === -1 && _lodash2.default.get(error, 'errors[0].message', '').startsWith('melinda-api-client unable to parse: ');
}

function RecordIOError(message, statusCode) {
  var temp = Error.apply(this, [message]);
  temp.name = this.name = 'RecordIOError';
  this.stack = temp.stack;
  this.message = temp.message;
  this.status = statusCode;
}

RecordIOError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: RecordIOError,
    writable: true,
    configurable: true
  }
});
//# sourceMappingURL=melinda-io-service.js.map