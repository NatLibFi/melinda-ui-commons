import { logger } from './logger';
import _ from 'lodash';
import HttpStatus from 'http-status-codes';

export function loadRecord(client, recordId, opts) {

  return new Promise((resolve, reject) => {

    client.loadChildRecords(recordId, opts).then((records) => {
      const record = _.head(records);
      const subrecords = _.tail(records);

      if (record === undefined || record.fields.length === 0) {
        return reject(new RecordIOError(`Record ${recordId} appears to be empty record.`, HttpStatus.NOT_FOUND));
      }

      resolve({ record, subrecords });

    }).catch(error => {
      reject(error);
    }).done();
  });
}

function updateRecord(client, record) {
  return new Promise((resolve, reject) => {
    return client.updateRecord(record).then(function(updateResponse) {
      resolve(updateResponse);
    }).catch(error => {
      reject(error);
    }).done();
  });
  
}

export function updateAndReloadRecord(client, recordId, record) {

  const recordIdFromBody = _.get(_.head(record.get('001')), 'value');
  
  if (parseInt(recordIdFromBody) !== parseInt(recordId)) {
    const errorMessage = `recordId from url must match field 001 in supplied record: ${recordId} !== ${recordIdFromBody}`;
    return Promise.reject(new RecordIOError(errorMessage, HttpStatus.BAD_REQUEST));
  }

  return updateRecord(client, record).then(function(updateResponse) {
    logger.log('info', `Record updated ok for ${recordId}`, updateResponse.messages);

    const recordIdFromUpdate = updateResponse.recordId;

    return loadRecord(client, recordIdFromUpdate, { include_parent: 1}).then(record => {
      return record;
    }).catch(error => {
      logger.log('info', `Error loading record ${recordId}`, error);
      throw error;
    });

  }).catch(error => {
    logger.log('info', `Record update failed for ${recordId}`, error);
    throw error;
  });
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
