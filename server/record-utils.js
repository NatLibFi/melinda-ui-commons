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
import _ from 'lodash';

export function recordIsUnused(record) {
  // record is considered unused if it does not have any of the following fields: 
  return record.fields.filter(field => ['850','852','866','LOW'].some(tag => tag === field.tag)).length === 0;
}

export function markRecordAsDeleted(record) {
  record.leader = Array.from(record.leader).map((c, i) => i == 5 ? 'd' : c).join('');
  record.insertField(['STA','','','a','DELETED']);
}

export function isDataField(field) {
  return field.subfields !== undefined && field.subfields.constructor === Array;
}

export function isComponentRecord(record) {

  const bibliographicLevel = _.get(record, 'leader[7]', undefined);
  
  return ['a','b','d']
    .some(level => bibliographicLevel === level);
}