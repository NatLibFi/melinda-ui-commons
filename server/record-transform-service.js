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
import {MarcRecord} from '@natlibfi/marc-record';
import {removeLocalReference} from './record-transformations/remove-local-reference';

export function transformRecord(action, recordParam, opts) {

  if (!looksLikeRecord(recordParam)) {
    throw new Error('Invalid record');
  }

  const record = new MarcRecord(recordParam, {subfieldValues: false});

  switch (action) {
    case 'REMOVE-LOCAL-REFERENCE': return removeLocalReference(record, opts);
  }

  throw new Error(`Unknown action ${action}`);
}

function looksLikeRecord(maybeRecord) {
  return maybeRecord && maybeRecord.fields && maybeRecord.fields.constructor === Array;
}
