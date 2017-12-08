'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combinedRootReducer = undefined;
exports.default = reducer;

var _immutable = require('immutable');

var _reduxImmutable = require('redux-immutable');

var _uiActions = require('./action-creators/ui-actions');

var _sessionReducer = require('./reducers/session-reducer');

var _sessionReducer2 = _interopRequireDefault(_sessionReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _immutable.Map)();
  var action = arguments[1];

  if (action.type === _uiActions.RESET_STATE) {
    return combinedRootReducer((0, _immutable.Map)(), action);
  }
  return combinedRootReducer(state, action);
}

var combinedRootReducer = exports.combinedRootReducer = (0, _reduxImmutable.combineReducers)({
  session: _sessionReducer2.default
});
//# sourceMappingURL=root-reducer.js.map