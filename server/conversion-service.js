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
      return remove(errorFileName);
    })
    .then(() => {

      const encoded = ISO2709.toISO2709(record);

      log('debug', `Writing input file to ${inputFileName}`);
      writeFile(inputFileName, encoded);
    })
    .then(() => {

      const cmd = `${usemarcon} ${ini_file} ${inputFileName} ${outputFileName}`;

      log('debug', `Executing ${cmd}`);

      return execPromise(cmd);
    })
    .then(() => {

      const errors = fs.readFileSync(errorFileName, 'utf8');
      const result = fs.readFileSync(outputFileName, 'utf8');
      
      const convertedRecord = ISO2709.fromISO2709(result);

      return {
        record: convertedRecord,
        errors: errors
      };
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
