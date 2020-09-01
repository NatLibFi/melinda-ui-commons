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
import {logger} from './logger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status';
import {MarcRecord} from '@natlibfi/marc-record';
import {convertRecord} from './conversion-service';

// Lisätty
MarcRecord.setValidationOptions({fields: false, subfields: false, subfieldValues: false});

export const conversionController = express();

conversionController.use(cookieParser());
conversionController.use(bodyParser.json({limit: '5mb'}));
conversionController.set('etag', false);

conversionController.options('/:conversionId', cors(corsOptions));

conversionController.post('/:conversionId', cors(corsOptions), requireBodyParams('record'), (req, res) => {

  const conversionId = req.params.conversionId;
  const record = new MarcRecord(req.body.record, {subfieldValues: false});

  logger.log('info', `Converting record with conversion ${conversionId}`);

  convertRecord(record, conversionId).then(result => {
    logger.log('info', 'Record converted succesfully.');
    res.send(result);
  }).catch(error => {
    logger.log('error', 'Failed to convert record', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
  });

});
