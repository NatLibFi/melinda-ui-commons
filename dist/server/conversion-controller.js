'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.conversionController = undefined;

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

var _marcRecordJs = require('marc-record-js');

var _marcRecordJs2 = _interopRequireDefault(_marcRecordJs);

var _conversionService = require('./conversion-service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var conversionController = exports.conversionController = (0, _express2.default)(); /**
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


conversionController.use((0, _cookieParser2.default)());
conversionController.use(_bodyParser2.default.json({ limit: '5mb' }));
conversionController.set('etag', false);

conversionController.options('/:conversionId', (0, _cors2.default)(_utils.corsOptions));

conversionController.post('/:conversionId', (0, _cors2.default)(_utils.corsOptions), (0, _utils.requireBodyParams)('record'), function (req, res) {

  var conversionId = req.params.conversionId;
  var record = new _marcRecordJs2.default(req.body.record);

  _logger.logger.log('info', 'Converting record with conversion ' + conversionId);

  (0, _conversionService.convertRecord)(record, conversionId).then(function (result) {
    _logger.logger.log('info', 'Record converted succesfully.');
    res.send(result);
  }).catch(function (error) {
    _logger.logger.log('error', 'Failed to convert record', error);
    res.status(_httpStatusCodes2.default.INTERNAL_SERVER_ERROR).send(error.message);
  });
});
//# sourceMappingURL=conversion-controller.js.map