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
import fetch from 'isomorphic-fetch';
import { readEnvironmentVariable } from './utils';
import xml2js from 'xml2js';
import _ from 'lodash';
import promisify from 'es6-promisify';

const parseXMLStringToJSON = promisify(xml2js.parseString);

const alephUrl = readEnvironmentVariable('ALEPH_URL');
const alephUserLibrary = readEnvironmentVariable('ALEPH_USER_LIBRARY');
const superUserLowTags = readEnvironmentVariable('SUPERUSER_LOWTAGS', '').split(',').map(s => s.toUpperCase());
const lowTagMapping = JSON.parse(readEnvironmentVariable('LOW_TAG_MAPPING', '{}'));

export const authProvider = {
  validateCredentials: function(username, password) {

    const requestUrl = `${alephUrl}/X?op=user-auth&library=${alephUserLibrary}&staff_user=${username}&staff_pass=${password}`;

    return new Promise((resolve, reject) => {

      fetch(requestUrl)
        .then(response => response.text())
        .then(parseXMLStringToJSON)
        .then((json) => {

          const credentialsValid = _.get(json, 'user-auth.reply[0]') === 'ok';
          if (credentialsValid) {
            const userinfo = credentialsValid ? parseUserInfo(json) : undefined;
            resolve({
              credentialsValid,
              userinfo: { 
                ...userinfo, 
                lowtags: createAllowedLowTagList(userinfo)
              }
            });
          } else {
            resolve({credentialsValid});
          }

        }).catch(reject);

    });
  }
};

function parseUserInfo(json) {
  const userLibrary = _.get(json, 'user-auth.z66[0].z66-user-library[0]');
  const name = _.get(json, 'user-auth.z66[0].z66-name[0]');
  const department = getDepartment();
  const email = _.get(json, 'user-auth.z66[0].z66-email[0]');

  return {userLibrary, name, department, email};

  function getDepartment() {
    const department =  _.get(json, 'user-auth.z66[0].z66-department[0]');
    return department in lowTagMapping ? lowTagMapping[department] : department;
  }
}

function createAllowedLowTagList(userinfo) {
  const department = _.get(userinfo, 'department', '').toUpperCase();

  if (department === 'KVP') {
    return superUserLowTags;
  } else {
    return [department];
  }
}
