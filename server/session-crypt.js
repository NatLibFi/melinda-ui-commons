/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-ui-commons
*
* melinda-ui-commons program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
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
import crypto from 'crypto';
import { readEnvironmentVariable } from './utils';

const algorithm = 'aes-256-gcm';

// Using random key means that every time the app restarts all sessions will invalidate
const key = readEnvironmentVariable('SECRET_ENCRYPTION_KEY', crypto.randomBytes(32).toString('base64'), {hideDefaultValue: true});

function readKey() {
  return new Buffer(key, 'base64');
}

export function createSessionToken(username, password) {

  const iv = crypto.randomBytes(12);
  const key = readKey();

  const encryptionResult = encrypt(password, username, iv, key);

  return createToken(username, encryptionResult);
}

export function readSessionToken(sessionToken) {
  const key = readKey();
  const {username, iv, tag, encrypted} = parseToken(sessionToken);

  return {
    username,
    password: decrypt(encrypted, username, iv, tag, key)
  };
}

function createToken(username, encryptionResult) {
  const {encrypted, iv, tag} = encryptionResult;
  return [username, iv.toString('hex'), tag.toString('hex'), encrypted].join(':');
}

function parseToken(token) {
  const [username, iv, tag, encrypted] = token.split(':');
  return {
    username,
    encrypted, 
    iv: new Buffer(iv, 'hex'), 
    tag: new Buffer(tag, 'hex')
  };
}


function encrypt(text, aad, iv, key) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.setAAD(new Buffer(aad, 'utf8'));
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  
  return {
    encrypted: encrypted,
    tag: cipher.getAuthTag(),
    iv: iv
  };
}


function decrypt(encrypted, aad, iv, tag, key) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAAD(new Buffer(aad, 'utf8'));
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

