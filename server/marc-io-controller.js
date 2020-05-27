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
import express from 'express';
import cors from 'cors';
import {corsOptions, requireBodyParams} from './utils';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status';
import {readSessionMiddleware, requireSession} from './session-controller';
import {MarcRecord} from '@natlibfi/marc-record';
import {loadRecord, updateAndReloadRecord, createAndReloadRecord, RecordIOError} from './melinda-io-service';
import {Utils, createApiClient} from '@natlibfi/melinda-commons';
MarcRecord.setValidationOptions({fields: false, subfields: false, subfieldValues: false});

const {createLogger, readEnvironmentVariable} = Utils;
const logger = createLogger();

const apiUrl = readEnvironmentVariable('REST_API_URL', {defaultValue: null});

logger.log('info', `marc-io-controller endpoint: ${apiUrl}`);

export const marcIOController = express();

marcIOController.use(cookieParser());
marcIOController.use(bodyParser.json({limit: '5mb'}));
marcIOController.use(readSessionMiddleware);
marcIOController.set('etag', false);

marcIOController.options('/', cors(corsOptions));
marcIOController.options('/:id', cors(corsOptions));

marcIOController.get('/:id', cors(corsOptions), (req, res) => {
  const {username, password} = req.session;

  const clientConfig = {
    restApiUrl: apiUrl || '',
    restApiUsername: username || '',
    restApiPassword: password || ''
  };

  const client = createApiClient(clientConfig);

  logger.log('info', `Loading record ${req.params.id}`);
  loadRecord(client, req.params.id).then(record => {
    logger.log('info', `Record ${req.params.id} loaded succesfully`);
    return res.send(record);
  }).catch(error => {
    if (error instanceof RecordIOError) {
      logger.log('info', `RecordIOError loading record ${req.params.id}`, error.message);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    }

    logger.log('error', `Error loading record ${req.params.id} `, error);
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

marcIOController.put('/:id', cors(corsOptions), requireSession, requireBodyParams('record'), (req, res) => {

  const {username, password} = req.session;
  const recordId = req.params.id;
  const record = transformToMarcRecord(req.body.record);

  const clientConfig = {
    restApiUrl: apiUrl,
    restApiUsername: username || '',
    restApiPassword: password || ''
  };

  const client = createApiClient(clientConfig);

  logger.log('info', `Updating record ${req.params.id}`);
  updateAndReloadRecord(client, recordId, record).then(result => {
    logger.log('info', `Record ${req.params.id} updated succesfully`);
    res.send(result);
  }).catch(error => {
    if (error instanceof RecordIOError) {
      logger.log('info', `Record update failed for ${recordId}`, error.message);
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    } else {
      logger.log('error', `Record update failed for ${recordId}`, error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});

marcIOController.post('/', cors(corsOptions), requireSession, requireBodyParams('record'), (req, res) => {

  const {username, password} = req.session;
  const record = transformToMarcRecord(req.body.record);

  const clientConfig = {
    restApiUrl: apiUrl,
    restApiUsername: username || '',
    restApiPassword: password || ''
  };

  const client = createApiClient(clientConfig);

  logger.log('info', 'Creating a new record');
  createAndReloadRecord(client, record).then(result => {
    logger.log('info', `Record ${req.params.id} created succesfully`);
    res.send(result);
  }).catch(error => {
    if (error instanceof RecordIOError) {
      logger.log('info', 'Record creation failed', error.message);
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    } else {
      logger.log('error', 'Record creation failed', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});

function transformToMarcRecord(json) {
  return new MarcRecord(json);
}
