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
import { readEnvironmentVariable } from './utils';
import { logger } from './logger';
import uuid from 'node-uuid';
import { ISO2709 } from 'marc-record-serializers';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import promisify from 'es6-promisify';

const mkdir = promisify(fs.mkdirs);
const copy = promisify(fs.copy);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const execPromise = promisify(exec, {multiArgs: true});
const remove = promisify(fs.remove);
const access = promisify(fs.access);

const usemarcon = readEnvironmentVariable('USEMARCON_BIN');
const usemarconConfigPath = readEnvironmentVariable('USEMARCON_CONFIG_PATH');
const tmpDir = readEnvironmentVariable('TMP_DIR', '/tmp');

export function convertRecord(record, conversionId) {

  const jobId = uuid.v4();
  const log = createJobLogger(jobId);

  const jobDirectory = path.resolve(tmpDir, jobId);
  const inputFileName = path.resolve(jobDirectory, 'input.marc');
  const outputFileName = path.resolve(jobDirectory, 'output.marc');
  const errorFileName = path.resolve(jobDirectory, 'error.txt');
  const ini_file = path.resolve(jobDirectory, `${conversionId}.ini`);
  const conversionDefinitionPath = path.resolve(usemarconConfigPath, conversionId);

  log('debug', `Started conversion [${conversionId}] with jobId: ${jobId}`);

  log('debug', `Checking that ${conversionDefinitionPath} is ok.`);
  return access(conversionDefinitionPath)
    .catch((err) => {
      const message = `Conversion definition '${conversionId}' not found.`;
      log('error', message, err);
      err.message = message;
      throw err;
    })
    .then(() => {
      log('debug', `Creating directory ${jobDirectory}`);
      return mkdir(jobDirectory);
    })
    .then(() => {
      log('debug', `Copying conversion definitions from ${conversionDefinitionPath} to ${jobDirectory}`);
      return copy(conversionDefinitionPath, jobDirectory);
    })
    .then(() => {
      log('debug', `Updating ini file ${ini_file} with error file name = error.txt`);
      return readFile(ini_file, 'utf8')
        .then(contents => {
          return contents
            .split('\n')
            .map(line => line.startsWith('ErrorLogFile') ? 'ErrorLogFile=error.txt' : line)
            .join('\n');
        })
        .then(updatedContents => {
          return writeFile(ini_file, updatedContents);
        });

    })
    .then(() => {
      return remove(errorFileName);
    })
    .then(() => {

      const encoded = ISO2709.toISO2709(record);

      log('debug', `Writing input file to ${inputFileName}`);
      return writeFile(inputFileName, encoded);
    })
    .then(() => {

      const cmd = `${usemarcon} ${ini_file} ${inputFileName} ${outputFileName}`;

      log('debug', `Executing ${cmd}`);

      return execPromise(cmd);
    })
    .then(() => {

      log('debug', 'Reading errors from disk');
      return readFile(errorFileName, 'utf8').then(errors => {
        log('debug', 'Reading result from disk');
        return readFile(outputFileName, 'utf8').then(result => {
          log('debug', 'Converting result to marc-record-js');

          const convertedRecord = ISO2709.fromISO2709(result);

          log('debug', 'Done.');
          return {
            record: convertedRecord,
            errors: errors
          };

        });
      });

    }).then(result => {

      log('debug', `Removing ${inputFileName}`);
      return remove(jobDirectory).then(() => {
        return result;  
      });
      
    });

}

function createJobLogger(jobId) {

  return function(level, message, obj) {

    if (obj) {
      logger.log(level, `${jobId}]`, message, obj);
    } else {
      logger.log(level, `${jobId}]`, message);
    }
    
  };
}
