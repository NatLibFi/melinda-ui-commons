import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable, corsOptions } from './utils';
import { logger } from './logger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import { readSessionMiddleware } from './session-controller';
import _ from 'lodash';

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

marcIOController.get('/:id', cors(corsOptions), (req, res) => {

  const client = new MelindaClient(defaultConfig);

  logger.log('debug', `Loading record ${req.params.id}`);
  client.loadChildRecords(req.params.id, {handle_deleted: 1, include_parent: 1}).then((records) => {
    logger.log('debug', `Record ${req.params.id} with subrecords loaded`);
    const record = _.head(records);
    const subrecords = _.tail(records);

    if (record.fields.length === 0) {
      logger.log('debug', `Record ${req.params.id} appears to be empty record.`);
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    res.send({
      record, 
      subrecords
    });
  }).catch(error => {
    logger.log('error', `Error loading record ${req.params.id}`, error);
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }).done();

});
