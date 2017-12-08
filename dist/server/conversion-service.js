'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertRecord = convertRecord;

var _utils = require('./utils');

var _logger = require('./logger');

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _marcRecordSerializers = require('marc-record-serializers');

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var mkdir = (0, _es6Promisify2.default)(_fsExtra2.default.mkdirs);
var copy = (0, _es6Promisify2.default)(_fsExtra2.default.copy);
var writeFile = (0, _es6Promisify2.default)(_fsExtra2.default.writeFile);
var readFile = (0, _es6Promisify2.default)(_fsExtra2.default.readFile);
var execPromise = (0, _es6Promisify2.default)(_child_process.exec, { multiArgs: true });
var remove = (0, _es6Promisify2.default)(_fsExtra2.default.remove);
var access = (0, _es6Promisify2.default)(_fsExtra2.default.access);

var usemarcon = (0, _utils.readEnvironmentVariable)('USEMARCON_BIN');
var usemarconConfigPath = (0, _utils.readEnvironmentVariable)('USEMARCON_CONFIG_PATH');
var tmpDir = (0, _utils.readEnvironmentVariable)('TMP_DIR', '/tmp');

function convertRecord(record, conversionId) {

  var jobId = _nodeUuid2.default.v4();
  var log = createJobLogger(jobId);

  var jobDirectory = _path2.default.resolve(tmpDir, jobId);
  var inputFileName = _path2.default.resolve(jobDirectory, 'input.marc');
  var outputFileName = _path2.default.resolve(jobDirectory, 'output.marc');
  var errorFileName = _path2.default.resolve(jobDirectory, 'error.txt');
  var ini_file = _path2.default.resolve(jobDirectory, conversionId + '.ini');
  var conversionDefinitionPath = _path2.default.resolve(usemarconConfigPath, conversionId);

  log('debug', 'Started conversion [' + conversionId + '] with jobId: ' + jobId);

  log('debug', 'Checking that ' + conversionDefinitionPath + ' is ok.');
  return access(conversionDefinitionPath).catch(function (err) {
    var message = 'Conversion definition \'' + conversionId + '\' not found.';
    log('error', message, err);
    err.message = message;
    throw err;
  }).then(function () {
    log('debug', 'Creating directory ' + jobDirectory);
    return mkdir(jobDirectory);
  }).then(function () {
    log('debug', 'Copying conversion definitions from ' + conversionDefinitionPath + ' to ' + jobDirectory);
    return copy(conversionDefinitionPath, jobDirectory);
  }).then(function () {
    log('debug', 'Updating ini file ' + ini_file + ' with error file name = error.txt');
    return readFile(ini_file, 'utf8').then(function (contents) {
      return contents.split('\n').map(function (line) {
        return line.startsWith('ErrorLogFile') ? 'ErrorLogFile=error.txt' : line;
      }).join('\n');
    }).then(function (updatedContents) {
      return writeFile(ini_file, updatedContents);
    });
  }).then(function () {
    return remove(errorFileName);
  }).then(function () {

    var encoded = _marcRecordSerializers.ISO2709.toISO2709(record);

    log('debug', 'Writing input file to ' + inputFileName);
    return writeFile(inputFileName, encoded);
  }).then(function () {

    var cmd = usemarcon + ' ' + ini_file + ' ' + inputFileName + ' ' + outputFileName;

    log('debug', 'Executing ' + cmd);

    return execPromise(cmd);
  }).then(function () {

    log('debug', 'Reading errors from disk');
    return readFile(errorFileName, 'utf8').then(function (errors) {
      log('debug', 'Reading result from disk');
      return readFile(outputFileName, 'utf8').then(function (result) {
        log('debug', 'Converting result to marc-record-js');

        var convertedRecord = _marcRecordSerializers.ISO2709.fromISO2709(result);

        log('debug', 'Done.');
        return {
          record: convertedRecord,
          errors: errors
        };
      });
    });
  }).then(function (result) {

    log('debug', 'Removing ' + inputFileName);
    return remove(jobDirectory).then(function () {
      return result;
    });
  });
}

function createJobLogger(jobId) {

  return function (level, message, obj) {

    if (obj) {
      _logger.logger.log(level, jobId + ']', message, obj);
    } else {
      _logger.logger.log(level, jobId + ']', message);
    }
  };
}
//# sourceMappingURL=conversion-service.js.map