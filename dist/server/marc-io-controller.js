'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.marcIOController = undefined;

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


var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _utils = require('./utils');

var _logger = require('./logger');

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _sessionController = require('./session-controller');

var _marcRecordJs = require('marc-record-js');

var _marcRecordJs2 = _interopRequireDefault(_marcRecordJs);

var _melindaIoService = require('./melinda-io-service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MelindaClient = require('@natlibfi/melinda-api-client');
var alephUrl = (0, _utils.readEnvironmentVariable)('ALEPH_URL');
var apiVersion = (0, _utils.readEnvironmentVariable)('MELINDA_API_VERSION', null);
var apiPath = apiVersion !== null ? '/' + apiVersion : '';

var defaultConfig = {
  endpoint: alephUrl + '/API' + apiPath,
  user: '',
  password: ''
};

_logger.logger.log('info', 'marc-io-controller endpoint: ' + defaultConfig.endpoint);

var marcIOController = exports.marcIOController = (0, _express2.default)();

marcIOController.use((0, _cookieParser2.default)());
marcIOController.use(_bodyParser2.default.json({ limit: '5mb' }));
marcIOController.use(_sessionController.readSessionMiddleware);
marcIOController.set('etag', false);

marcIOController.options('/', (0, _cors2.default)(_utils.corsOptions));
marcIOController.options('/:id', (0, _cors2.default)(_utils.corsOptions));

marcIOController.get('/:id', (0, _cors2.default)(_utils.corsOptions), function (req, res) {

  var client = new MelindaClient(defaultConfig);

  _logger.logger.log('info', 'Loading record ' + req.params.id);
  (0, _melindaIoService.loadRecord)(client, req.params.id, { handle_deleted: 1, include_parent: 1 }).then(function (record) {
    _logger.logger.log('info', 'Record ' + req.params.id + ' loaded succesfully');
    res.send(record);
  }).catch(function (error) {
    if (error instanceof _melindaIoService.RecordIOError) {
      _logger.logger.log('info', 'RecordIOError loading record ' + req.params.id, error.message);
      res.status(error.status || _httpStatusCodes2.default.INTERNAL_SERVER_ERROR).send(error.message);
    } else {
      _logger.logger.log('error', 'Error loading record ' + req.params.id, error);
      res.sendStatus(_httpStatusCodes2.default.INTERNAL_SERVER_ERROR);
    }
  });
});

marcIOController.put('/:id', (0, _cors2.default)(_utils.corsOptions), _sessionController.requireSession, (0, _utils.requireBodyParams)('record'), function (req, res) {
  var _req$session = req.session,
      username = _req$session.username,
      password = _req$session.password;

  var recordId = req.params.id;
  var record = transformToMarcRecord(req.body.record);

  var clientConfig = _extends({}, defaultConfig, {
    user: username,
    password: password
  });

  var client = new MelindaClient(clientConfig);

  _logger.logger.log('info', 'Updating record ' + req.params.id);
  (0, _melindaIoService.updateAndReloadRecord)(client, recordId, record).then(function (result) {
    _logger.logger.log('info', 'Record ' + req.params.id + ' updated succesfully');
    res.send(result);
  }).catch(function (error) {
    if (error instanceof _melindaIoService.RecordIOError) {
      _logger.logger.log('info', 'Record update failed for ' + recordId, error.message);
      res.status(error.status || _httpStatusCodes2.default.INTERNAL_SERVER_ERROR).send(error.message);
    } else {
      _logger.logger.log('error', 'Record update failed for ' + recordId, error);
      res.sendStatus(_httpStatusCodes2.default.INTERNAL_SERVER_ERROR);
    }
  });
});

marcIOController.post('/', (0, _cors2.default)(_utils.corsOptions), _sessionController.requireSession, (0, _utils.requireBodyParams)('record'), function (req, res) {
  var _req$session2 = req.session,
      username = _req$session2.username,
      password = _req$session2.password;

  var record = transformToMarcRecord(req.body.record);

  var clientConfig = _extends({}, defaultConfig, {
    user: username,
    password: password
  });

  var client = new MelindaClient(clientConfig);

  _logger.logger.log('info', 'Creating a new record');
  (0, _melindaIoService.createAndReloadRecord)(client, record).then(function (result) {
    _logger.logger.log('info', 'Record ' + req.params.id + ' created succesfully');
    res.send(result);
  }).catch(function (error) {
    if (error instanceof _melindaIoService.RecordIOError) {
      _logger.logger.log('info', 'Record creation failed', error.message);
      res.status(error.status || _httpStatusCodes2.default.INTERNAL_SERVER_ERROR).send(error.message);
    } else {
      _logger.logger.log('error', 'Record creation failed', error);
      res.sendStatus(_httpStatusCodes2.default.INTERNAL_SERVER_ERROR);
    }
  });
});

function transformToMarcRecord(json) {
  return new _marcRecordJs2.default(json);
}
//# sourceMappingURL=marc-io-controller.js.map