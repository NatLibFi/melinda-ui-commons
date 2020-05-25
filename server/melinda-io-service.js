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
import {Utils} from '@natlibfi/melinda-commons';

const {createLogger} = Utils;
const logger = createLogger();
const defaultParams = {
  subrecords: 0
};

export function loadRecord(client, recordId, params = defaultParams) {
  return new Promise((resolve, reject) => {
    client.getRecord(recordId, params).then(({record, subrecords}) => {
      if (record === undefined || record.fields.length === 0) {
        reject(new RecordIOError(`Record ${recordId} appears to be empty record.`, HttpStatus.NOT_FOUND));
      }
      resolve({record, subrecords});
    });
  });
}

function updateRecord(client, record) {
  return new Promise((resolve, reject) => {
    const recordId = getRecordId(record);
    client.postPrio({params: {noop: 0}, body: JSON.stringify(record.toObject())}, recordId).then(updateResponse => {
      resolve(updateResponse);
    }).catch(error => {
      reject(error);
    }).done();
  });
}

function createRecord(client, record) {
  return new Promise((resolve, reject) => client.postPrio({params: {noop: 0}, body: JSON.stringify(record.toObject())}).then(createResponse => {
    resolve(createResponse);
  }).catch(error => {
    reject(error);
  }).done());
}

export function updateAndReloadRecord(client, recordId, record) {
  const recordIdFromBody = getRecordId(record);

  if (parseInt(recordIdFromBody) !== parseInt(recordId)) {
    const errorMessage = `recordId from url must match field 001 in supplied record: ${recordId} !== ${recordIdFromBody}`;
    return Promise.reject(new RecordIOError(errorMessage, HttpStatus.BAD_REQUEST));
  }

  return updateRecord(client, record).then(updateResponse => {
    logger.log('debug', JSON.stringify(updateResponse));
    logger.log('info', `Record updated ok for ${recordId}`, updateResponse.messages);

    return loadRecord(client, recordId).then((record) => {
      return record;
    }).catch(error => {
      logger.log('info', `Error loading record ${recordId} `, error);
      throw error;
    });
  }).catch(error => {
    logger.log('info', `Record update failed for ${recordId} `, error);
    if (looksLikeMelindaClientParseError(error)) {
      const reason = _.get(error, 'errors[0].message').substr('melinda-api-client unable to parse: '.length);
      throw new RecordIOError(reason, HttpStatus.BAD_REQUEST);
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
      logger.log('info', `Error loading record ${recordId} `, error);
      throw error;
    });

  }).catch(error => {
    logger.log('info', 'Record creation failed', error);
    if (looksLikeMelindaClientParseError(error)) {

      const reason = _.get(error, 'errors[0].message').substr('melinda-api-client unable to parse: '.length);

      throw new RecordIOError(reason, HttpStatus.BAD_REQUEST);
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

export function RecordIOError(message, statusCode) {
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
