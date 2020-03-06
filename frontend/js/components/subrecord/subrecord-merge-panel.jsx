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

import _ from 'lodash';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {ItemTypes} from '../../constants';
import {SubrecordActionButtonContainer} from './subrecord-action-button';
import {DragDropSubrecordMergePanelRow} from './subrecord-merge-panel-row';
import {SubrecordMergePanelNewRow} from './subrecord-merge-panel-new-row';

import '../../../styles/components/subrecord-merge-panel.scss';

export class SubrecordMergePanel extends React.Component {

  static propTypes = {
    subrecords: PropTypes.array.isRequired,
    onInsertSubrecordRow: PropTypes.func.isRequired,
    onRemoveSubrecordRow: PropTypes.func.isRequired,
    onChangeSubrecordAction: PropTypes.func.isRequired,
    onChangeSubrecordRow: PropTypes.func.isRequired,
    onChangeSourceSubrecordRow: PropTypes.func.isRequired,
    onChangeTargetSubrecordRow: PropTypes.func.isRequired,
    onExpandSubrecordRow: PropTypes.func.isRequired,
    onCompressSubrecordRow: PropTypes.func.isRequired,
    onEditMergedSubrecord: PropTypes.func.isRequired,
    onToggleSourceSubrecordFieldSelection: PropTypes.func.isRequired,
    onSaveSubrecord: PropTypes.func.isRequired,
    saveButtonVisible: PropTypes.bool.isRequired,
    actionsEnabled: PropTypes.bool.isRequired,
    swappingEnabled: PropTypes.bool,
    onSwapSubrecordRow: PropTypes.func
  };

  static defaultProps = {
    swappingEnabled: false
  };

  constructor(props) {
    super(props);

    this.onChangeRow = this.onChangeRow.bind(this);
    this.onExpandRow = this.onExpandRow.bind(this);
    this.onCompressRow = this.onCompressRow.bind(this);
    this.onRemoveRow = this.onRemoveRow.bind(this);
  }

  renderSubrecordList() {

    const {subrecords} = this.props;

    const totalRows = subrecords.length;
    const items = subrecords.map((subrecord, i) => {

      const {rowId, sourceRecord, targetRecord, mergedRecord, selectedAction, isExpanded, mergeError, saveStatus, saveRecordError, isCompacted, isMergeActionAvailable, isCopyActionAvailable, isSwapped} = subrecord;

      return (<DragDropSubrecordMergePanelRow
        key={rowId}
        rowIndex={i}
        rowId={rowId}
        currentRow={i + 1}
        totalRows={totalRows}
        isExpanded={isExpanded}
        actionsEnabled={this.props.actionsEnabled}
        swappingEnabled={this.props.swappingEnabled}
        selectedAction={selectedAction}
        sourceRecord={sourceRecord}
        targetRecord={targetRecord}
        mergedRecord={mergedRecord}
        onChangeAction={this.props.onChangeSubrecordAction}
        onSwapSubrecordRow={this.props.onSwapSubrecordRow}
        onChangeRow={this.onChangeRow}
        onChangeSourceRow={this.props.onChangeSourceSubrecordRow}
        onChangeTargetRow={this.props.onChangeTargetSubrecordRow}
        onExpandRow={this.onExpandRow}
        onCompressRow={this.onCompressRow}
        onRemoveRow={this.onRemoveRow}
        onSourceFieldClick={this.handleFieldClick.bind(this)}
        onMergedFieldClick={this.handleMergedFieldClick.bind(this)}
        onMergedRecordUpdate={this.props.onEditMergedSubrecord}
        saveButtonVisible={this.props.saveButtonVisible}
        onSaveRecord={this.props.onSaveSubrecord}
        recordState={saveStatus}
        saveRecordError={saveRecordError}
        mergeError={mergeError}
        isCompacted={isCompacted}
        isSwapped={isSwapped}
        isMergeActionAvailable={isMergeActionAvailable}
        isCopyActionAvailable={isCopyActionAvailable}
      />);
    });

    return items.reduce((acc, item, i) => {

      return _.concat(acc, item, this.renderAddNewRowElement(i + 1));

    }, [this.renderAddNewRowElement(0)]);

  }

  renderMergeActionButton(rowIndex, mergedRecord) {
    return (
      <div>
        <SubrecordActionButtonContainer rowIndex={rowIndex} />
        {this.renderSubrecordPanel(mergedRecord, ItemTypes.MERGED_SUBRECORD, rowIndex)}
      </div>);
  }

  renderAddNewRowElement(key) {
    return <SubrecordMergePanelNewRow key={key} onClick={this.onAddRow(key)} enabled={this.props.actionsEnabled} />;
  }

  onAddRow(rowIndex) {
    return function () {
      if (this.props.actionsEnabled) {
        this.props.onInsertSubrecordRow(rowIndex);
      }
    }.bind(this);
  }

  isControlField(field) {
    return field.subfields === undefined;
  }

  handleFieldClick(rowId, field) {
    if (!this.isControlField(field)) {
      this.props.onToggleSourceSubrecordFieldSelection(rowId, field);
    }
  }

  handleMergedFieldClick(rowId, field) {
    if (field.fromOther && !this.isControlField(field)) {
      this.props.onToggleSourceSubrecordFieldSelection(rowId, field);
    }
  }

  onRemoveRow(rowId) {
    this.props.onRemoveSubrecordRow(rowId);
  }

  onExpandRow(rowId) {
    this.props.onExpandSubrecordRow(rowId);
  }

  onCompressRow(rowId) {
    this.props.onCompressSubrecordRow(rowId);
  }

  onChangeRow(fromIndex, toIndex) {
    this.props.onChangeSubrecordRow(fromIndex, toIndex);
  }

  render() {
    const otherSubrecordCount = this.props.subrecords.filter((row) => row.sourceRecord).length;
    const preferredSubrecordCount = this.props.subrecords.filter((row) => row.targetRecord).length;
    return (

      <table className="bordered subrecord-merge-panel">
        <thead>
          <tr>
            <td>{otherSubrecordCount} osakohdetta</td>
            <td>{preferredSubrecordCount} osakohdetta</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {this.renderSubrecordList()}
        </tbody>
      </table>

    );
  }
}

export const DraggableSubrecordMergePanelContainer = DragDropContext(HTML5Backend)(SubrecordMergePanel);
