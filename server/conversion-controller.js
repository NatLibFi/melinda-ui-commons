import express from 'express';
import cors from 'cors';
import { corsOptions, requireBodyParams } from './utils';
import { logger } from './logger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import MarcRecord from 'marc-record-js';
import { convertRecord } from './conversion-service';

export const conversionController = express();

conversionController.use(cookieParser());
conversionController.use(bodyParser.json({limit: '5mb'}));
conversionController.set('etag', false);

conversionController.options('/:conversionId', cors(corsOptions));

conversionController.post('/:conversionId', cors(corsOptions), requireBodyParams('record'), (req, res) => {
  
  const conversionId = req.params.conversionId;
  const record = new MarcRecord(req.body.record);

  logger.log('info', `Converting record with conversion ${conversionId}`);

  convertRecord(record, conversionId).then(result => {
    logger.log('info', 'Record converted succesfully.');
    res.send(result);
  }).catch(error => {
    logger.log('error', 'Failed to convert record', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  });

});
