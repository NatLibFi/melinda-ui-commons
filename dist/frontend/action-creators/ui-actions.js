'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RESET_STATE = undefined;
exports.resetState = resetState;
exports.resetWorkspace = resetWorkspace;

var _actionTypeConstants = require('../constants/action-type-constants');

var RESET_STATE = exports.RESET_STATE = 'RESET_STATE'; /**
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
function resetState() {
  return {
    type: RESET_STATE
  };
}

function resetWorkspace() {
  return {
    type: _actionTypeConstants.RESET_WORKSPACE
  };
}
//# sourceMappingURL=ui-actions.js.map