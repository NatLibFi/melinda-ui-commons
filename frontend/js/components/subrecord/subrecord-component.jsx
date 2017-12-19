/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
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
import { SubrecordHeader } from './subrecord-header';
import { DraggableSubrecordMergePanelContainer } from './subrecord-merge-panel';
import PropTypes from 'prop-types';

export class SubrecordComponent extends React.Component {
  static propTypes = {
    setCompactSubrecordView: PropTypes.func.isRequired,
    compactSubrecordView: PropTypes.bool.isRequired,
    subrecords: PropTypes.array.isRequired,
    saveButtonVisible: PropTypes.bool.isRequired,
    actionsEnabled: PropTypes.bool.isRequired,
    onInsertSubrecordRow: PropTypes.func.isRequired,
    onRemoveSubrecordRow: PropTypes.func.isRequired,
    onChangeSubrecordAction: PropTypes.func.isRequired,
    onChangeSubrecordRow: PropTypes.func.isRequired,
    onChangeSourceSubrecordRow: PropTypes.func.isRequired,
    onChangeTargetSubrecordRow: PropTypes.func.isRequired,
    onExpandSubrecordRow: PropTypes.func.isRequired,
    onCompressSubrecordRow: PropTypes.func.isRequired,
    onToggleSourceSubrecordFieldSelection: PropTypes.func.isRequired,
    onEditMergedSubrecord: PropTypes.func.isRequired,
    onSaveSubrecord: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <SubrecordHeader
          setCompactSubrecordView={this.props.setCompactSubrecordView} 
          compactSubrecordView={this.props.compactSubrecordView}
        />
        <DraggableSubrecordMergePanelContainer 
          subrecords={this.props.subrecords}
          saveButtonVisible={this.props.saveButtonVisible}
          actionsEnabled={this.props.actionsEnabled}
          onInsertSubrecordRow={this.props.onInsertSubrecordRow}
          onRemoveSubrecordRow={this.props.onRemoveSubrecordRow}
          onChangeSubrecordAction={this.props.onChangeSubrecordAction}
          onChangeSubrecordRow={this.props.onChangeSubrecordRow}
          onChangeSourceSubrecordRow={this.props.onChangeSourceSubrecordRow}
          onChangeTargetSubrecordRow={this.props.onChangeTargetSubrecordRow}
          onExpandSubrecordRow={this.props.onExpandSubrecordRow}
          onCompressSubrecordRow={this.props.onCompressSubrecordRow}
          onToggleSourceSubrecordFieldSelection={this.props.onToggleSourceSubrecordFieldSelection}
          onEditMergedSubrecord={this.props.onEditMergedSubrecord}
          onSaveSubrecord={this.props.onSaveSubrecord}
        />
     </div>
    );
  }
}

