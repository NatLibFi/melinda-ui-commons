import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable, corsOptions, requireBodyParams } from './utils';
import { logger } from './logger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import { readSessionMiddleware, requireSession } from './session-controller';
import MarcRecord from 'marc-record-js';
import { loadRecord, updateAndReloadRecord, createAndReloadRecord, RecordIOError } from './melinda-io-service';

const MelindaClient = require('melinda-api-client');
const alephUrl = readEnvironmentVariable('ALEPH_URL');
const apiVersion = readEnvironmentVariable('MELINDA_API_VERSION', null);
const apiPath = apiVersion !== null ? `/${apiVersion}` : '';

const defaultConfig = {
  endpoint: `${alephUrl}/API${apiPath}`,
  user: '',
  password: ''
};

logger.log('info', `marc-io-controller endpoint: ${defaultConfig.endpoint}`);

export const marcIOController = express();

marcIOController.use(cookieParser());
marcIOController.use(bodyParser.json({limit: '5mb'}));
marcIOController.use(readSessionMiddleware);
marcIOController.set('etag', false);

marcIOController.options('/', cors(corsOptions));
marcIOController.options('/:id', cors(corsOptions));

marcIOController.get('/:id', cors(corsOptions), (req, res) => {

  const client = new MelindaClient(defaultConfig);

  logger.log('info', `Loading record ${req.params.id}`);
  loadRecord(client, req.params.id, {handle_deleted: 1, include_parent: 1}).then(record => {
    logger.log('info', `Record ${req.params.id} loaded succesfully`);
    res.send(record);
  }).catch(error => {
    if (error instanceof RecordIOError) {
      logger.log('info', `RecordIOError loading record ${req.params.id}`, error.message);
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    } else {
      logger.log('error', `Error loading record ${req.params.id}`, error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);  
    }
  });
});

marcIOController.put('/:id', cors(corsOptions), requireSession, requireBodyParams('record'), (req, res) => {
  
  const {username, password} = req.session;
  const recordId = req.params.id;
  const record = transformToMarcRecord(req.body.record);

  const clientConfig = { 
    ...defaultConfig,
    user: username,
    password: password
  };

  const client = new MelindaClient(clientConfig);

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
    ...defaultConfig,
    user: username,
    password: password
  };

  const client = new MelindaClient(clientConfig);

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
