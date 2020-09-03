/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
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
import _ from 'lodash';
import HttpStatus from 'http-status';
import {Error as RecordIOError, createSubrecordPicker} from '@natlibfi/melinda-commons';
import {createLogger, readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';

const logger = createLogger();
const sruUrl = readEnvironmentVariable('SRU_URL', {defaultValue: null});
logger.log('debug', sruUrl);
const subrecordPicker = createSubrecordPicker(sruUrl, true);

export function loadRecord(client, recordId) {
  return new Promise((resolve, reject) => {
    Promise.resolve(readRecord(client, recordId)).then(record => {
      Promise.resolve(readSubrecords(recordId)).then(subrecords => {
        resolve({record, subrecords});
      }).catch(error => {
        reject(error);
      });
    }).catch(error => {
      reject(error);
    });
  });
}

function readSubrecords(recordId) {
  return new Promise((resolve, reject) => {
    subrecordPicker.readAllSubrecords(recordId).then(subrecords => {
      logger.log('http', 'Subrecord reading success');
      logger.log('silly', `Subrecords: ${JSON.stringify(subrecords)}`);
      resolve(subrecords);
    }).catch(error => {
      logger.log('debug', 'Subrecord loading error');
      reject(error);
    });
  });
}

function readRecord(client, recordId) {
  return new Promise((resolve, reject) => {
    client.read(recordId).then(({record}) => {
      logger.log('http', 'Record reading success');
      logger.log('silly', `Record: ${JSON.stringify({record})}`);
      resolve(record);
    }).catch(error => {
      logger.log('debug', 'Record loading error');
      reject(error);
    });
  });
}

function updateRecord(client, record) {
  return new Promise((resolve, reject) => {
    const recordId = getRecordId(record);
    Promise.resolve(client.update(record, recordId, {noop: 0})).then(updateResponse => {
      logger.log('http', 'Record update success');
      return resolve(updateResponse);
    }).catch(error => {
      logger.log('debug', 'Record update error');
      return reject(error);
    }).done();
  });
}

function createRecord(client, record) {
  return new Promise((resolve, reject) => Promise.resolve(client.create(record, {noop: 0})).then(createResponse => {
    logger.log('http', 'Record creation success');
    return resolve(createResponse);
  }).catch(error => {
    logger.log('debug', 'Record create error');
    return reject(error);
  }).done());
}

export function updateAndReloadRecord(client, recordId, record) {
  const recordIdFromBody = getRecordId(record);

  if (parseInt(recordIdFromBody) !== parseInt(recordId)) {
    const errorMessage = `recordId from url must match field 001 in supplied record: ${recordId} !== ${recordIdFromBody}`;
    return Promise.reject(new RecordIOError(HttpStatus.BAD_REQUEST, errorMessage));
  }

  return updateRecord(client, record).then(updateResponse => {
    logger.log('info', `Record updated ok for ${recordId}`, updateResponse.messages);

    return loadRecord(client, recordId).then((record) => {
      return record;
    }).catch(error => {
      logger.log('error', `@updateAndReloadRecord -> Error loading record ${recordId}\n${JSON.stringify(error)}`);
      throw error;
    });
  }).catch(error => {
    logger.log('info', `Record update failed for ${recordId} `, error);
    if (looksLikeMelindaClientParseError(error)) {
      const reason = _.get(error, 'errors[0].message').substr('melinda-api-client unable to parse: '.length);
      throw new RecordIOError(HttpStatus.BAD_REQUEST, reason);
    }
    throw error;
  });
}

export function createAndReloadRecord(client, record) {
  return createRecord(client, record).then(function (updateResponse) {
    const recordId = updateResponse.recordId;

    logger.log('info', `Record created, id: ${recordId} `, updateResponse.messages);

    return loadRecord(client, recordId).then(result => {
      return _.assign({}, result, {recordId});

    }).catch(error => {
      logger.log('error', `@createAndReloadRecord -> Error loading record ${recordId}\n${JSON.stringify(error)}`);
      throw error;
    });

  }).catch(error => {
    logger.log('info', 'Record creation failed', error);
    if (looksLikeMelindaClientParseError(error)) {
      const reason = _.get(error, 'errors[0].message').substr('melinda-api-client unable to parse: '.length);

      throw new RecordIOError(HttpStatus.BAD_REQUEST, reason);
    }
    throw error;
  });
}

function looksLikeMelindaClientParseError(error) {
  return _.get(error, 'errors[0].code') === -1 && _.get(error, 'errors[0].message', '').startsWith('melinda-api-client unable to parse: ');
}

function getRecordId(record) {
  const [f001] = record.get(/^001$/);
  return f001.value;
}
