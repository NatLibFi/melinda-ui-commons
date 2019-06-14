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
import { Map } from 'immutable';
import {CREATE_SESSION_START, CREATE_SESSION_ERROR, CREATE_SESSION_SUCCESS, VALIDATE_SESSION_START} from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  state: 'NO_SESSION',
  userinfo: undefined,
  error: undefined
});

export default function session(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CREATE_SESSION_START:
      return createSessionStart(state);
    case CREATE_SESSION_ERROR:
      return createSessionError(state, action.error);
    case CREATE_SESSION_SUCCESS:
      return createSessionSuccess(state, action.userinfo);
    case VALIDATE_SESSION_START:
      return validateSessionStart(state);
  }
  return state;
}

export function createSessionStart(state) {
  return state.set('state', 'SIGNIN_ONGOING');
}

export function createSessionError(state, error) {
  return state
    .set('state', 'SIGNIN_ERROR')
    .set('error', error);
}

export function createSessionSuccess(state, userinfo) {
  return state
    .set('state', 'SIGNIN_OK')
    .set('userinfo', userinfo);
}

export function validateSessionStart(state) {
  return state
    .set('state', 'VALIDATION_ONGOING');
}
