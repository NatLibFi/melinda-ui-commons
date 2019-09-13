/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-merge-ui is distributed in the hope that it will be useful,
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


import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessagePanel } from './error-message-panel';

export class MergeValidationErrorMessagePanel extends React.Component {

  static propTypes = {
    error: PropTypes.instanceOf(Error),
    warning: PropTypes.bool,
    onDismiss: PropTypes.func,
    recordHeader: PropTypes.element,
    typePanel: PropTypes.bool
  }

  static defaultProps = {
    warning: false
  }

  render() {
    const { onDismiss, warning, recordHeader, typePanel } = this.props;
    const title = this.props.error.message;
    const messageList = this.props.error.failureMessages;

    return <ErrorMessagePanel typePanel={typePanel} recordHeader={recordHeader} title={title} messageList={messageList} onDismiss={onDismiss} warning={warning} />;
  }
}
