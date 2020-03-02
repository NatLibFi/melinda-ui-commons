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
import classNames from 'classnames';
import {SubrecordActionTypes, ItemTypes} from '../../constants';
import {DropTargetEmptySubRecordPanel} from './droppable-subrecord-empty-panel';
import {DraggableSubRecordPanel} from './draggable-subrecord-panel';
import {SubRecordPanel} from './subrecord-panel';
import {SubrecordActionButton} from './subrecord-action-button';
import {DropTarget, DragSource} from 'react-dnd';
import {MergeValidationErrorMessagePanel} from '../merge-validation-error-message-panel';

import '../../../styles/components/subrecord-merge-panel-row.scss';

export class SubrecordMergePanelRow extends React.Component {

  static propTypes = {
    rowId: PropTypes.string.isRequired,
    sourceRecord: PropTypes.object,
    targetRecord: PropTypes.object,
    mergedRecord: PropTypes.object,
    selectedAction: PropTypes.string,
    rowIndex: PropTypes.number.isRequired,
    currentRow: PropTypes.number.isRequired,
    totalRows: PropTypes.number.isRequired,
    isExpanded: PropTypes.bool,
    actionsEnabled: PropTypes.bool,
    onRemoveRow: PropTypes.func.isRequired,
    onExpandRow: PropTypes.func.isRequired,
    onCompressRow: PropTypes.func.isRequired,
    onChangeRow: PropTypes.func.isRequired,
    onChangeSourceRow: PropTypes.func.isRequired,
    onChangeTargetRow: PropTypes.func.isRequired,
    onChangeAction: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    onSourceFieldClick: PropTypes.func,
    onMergedFieldClick: PropTypes.func,
    onSaveRecord: PropTypes.func.isRequired,
    onMergedRecordUpdate: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    mergeError: PropTypes.instanceOf(Error),
    saveRecordError: PropTypes.instanceOf(Error),
    recordState: PropTypes.string,
    saveButtonVisible: PropTypes.bool.isRequired,
    isCompacted: PropTypes.bool.isRequired,
    isMergeActionAvailable: PropTypes.bool.isRequired,
    isCopyActionAvailable: PropTypes.bool.isRequired,
    isSwapped: PropTypes.bool,
    swappingEnabled: PropTypes.bool,
    onSwapSubrecordRow: PropTypes.func
  };

  static defaultProps = {
    isSwapped: false,
    swappingEnabled: false
  };

  constructor() {
    super();
    this.state = {editMode: false};
  }

  isSwapped() {
    const {isSwapped, swappingEnabled} = this.props;

    return swappingEnabled && isSwapped;
  }

  handleEditModeChange(event) {
    event.preventDefault();
    this.setState({editMode: !this.state.editMode});
  }

  handleSourceFieldClick(field) {
    if (this.props.onSourceFieldClick) {
      this.props.onSourceFieldClick(this.props.rowId, field);
    }
  }

  handleMergedFieldClick(field) {
    if (this.props.onMergedFieldClick) {
      this.props.onMergedFieldClick(this.props.rowId, field);
    }
  }

  handleRecordUpdate(record) {
    this.props.onMergedRecordUpdate(this.props.rowId, record);
  }

  handleRecordSave(recordId, record) {
    this.props.onSaveRecord(this.props.rowId, recordId, record);
  }

  handleSwapRecords() {
    this.props.onSwapSubrecordRow(this.props.rowId);
  }

  renderSubrecordPanel(record, type, dragType, rowId, isExpanded, dragEnabled) {
    const {isCompacted, onChangeSourceRow, onChangeTargetRow} = this.props;

    if (record) {

      const recordHeader = (
        <div className="row title-row-card">
          <div className="title-wrapper col 11s">
            <ul>
              <li className="title">{type === ItemTypes.SOURCE_SUBRECORD ? 'Poistuva tietue' : 'Säilyvä tietue'}</li>
            </ul>
          </div>
        </div>
      );

      const fieldClickHandler = (type === ItemTypes.SOURCE_SUBRECORD) ? this.handleSourceFieldClick.bind(this) : undefined;
      return (
        <DraggableSubRecordPanel
          isCompacted={isCompacted}
          isExpanded={isExpanded}
          dragEnabled={dragEnabled}
          record={record}
          type={type}
          dragType={dragType}
          rowId={rowId}
          onFieldClick={fieldClickHandler}
          recordHeader={recordHeader}
          showHeader
        />
      );
    }

    return <DropTargetEmptySubRecordPanel
      type={type}
      dragType={dragType}
      rowId={rowId}
      onChangeSourceRow={onChangeSourceRow}
      onChangeTargetRow={onChangeTargetRow}
    />;
  }

  mergeHeader(record = null) {
    const editButtonClasses = classNames({
      disabled: !record,
      active: this.state.editMode
    });

    return (
      <div className="row title-row-card">
        <div className="title-wrapper col 11s">
          <ul ref={(c) => this._tabs = c}>
            <li className="title">Yhdistetty</li>
            <li className="button tooltip" title="Muokkaa"><a className={editButtonClasses} href="#" onClick={(e) => this.handleEditModeChange(e)}><i className="material-icons">edit</i></a></li>
          </ul>
        </div>
      </div>
    );
  }

  renderMergedSubrecordPanel(mergedSubrecord, rowId, isExpanded, mergeError, opts) {

    const {isCompacted} = this.props;

    if (mergeError) {
      return (
        <div className="fill-height">
          <SubrecordActionButton onChangeAction={this.props.onChangeAction} rowId={rowId}  {...opts} />
          <MergeValidationErrorMessagePanel error={mergeError} />
        </div>
      );
    }
    if (mergedSubrecord) {
      return (
        <div className="fill-height">
          {isCompacted ? null : <SubrecordActionButton onChangeAction={this.props.onChangeAction} rowId={rowId} {...opts} />}
          <SubRecordPanel
            isExpanded={isExpanded}
            isCompacted={isCompacted}
            record={mergedSubrecord}
            type="MERGED"
            onFieldClick={this.handleMergedFieldClick.bind(this)}
            onRecordUpdate={this.handleRecordUpdate.bind(this)}
            onSaveRecord={this.handleRecordSave.bind(this)}
            error={mergeError}
            saveRecordError={this.props.saveRecordError}
            recordState={this.props.recordState}
            saveButtonVisible={this.props.saveButtonVisible}
            showHeader
            editable={this.state.editMode}
            recordHeader={this.mergeHeader(mergedSubrecord)}
          />
        </div>
      );
    }

    return (<SubrecordActionButton onChangeAction={this.props.onChangeAction} rowId={rowId} {...opts} />);
  }

  renderRemoveRowButton(rowId) {
    return (
      <button onClick={() => this.props.onRemoveRow(rowId)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">clear</i>
      </button>
    );
  }

  renderExpandToggleButton(rowId, isEmptyRow, isExpanded) {

    if (isEmptyRow) {
      return null;
    }

    return isExpanded ? this.renderCompressRowButton(rowId) : this.renderExpandRowButton(rowId);
  }

  renderExpandRowButton(rowId) {
    return (
      <button onClick={() => this.props.onExpandRow(rowId)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">expand_more</i>
      </button>
    );
  }

  renderCompressRowButton(rowId) {
    return (
      <button onClick={() => this.props.onCompressRow(rowId)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">expand_less</i>
      </button>
    );
  }

  renderSubrecordSwapButton() {
    const {actionsEnabled, isSwapped} = this.props;

    const containerClasses = classNames('subrecord-row-swap-button-container', {
      'fixed-action-btn': actionsEnabled,
      'horizontal': actionsEnabled
    });

    const iconClasses = classNames('btn-floating', 'btn-small', 'waves-light', 'subrecord-row-swap-button', 'blue', {
      'disabled': !actionsEnabled,
      'waves-effect': actionsEnabled,
      'active': isSwapped,
      'lighten-2': !isSwapped
    });

    return (
      <div className={containerClasses} >
        <a className={iconClasses} onClick={this.handleSwapRecords.bind(this)}>
          <i className="large material-icons">swap_horiz</i>
        </a>
      </div>
    );
  }

  render() {
    const {rowId, mergedRecord, sourceRecord, targetRecord, selectedAction, connectDragSource, connectDropTarget, isOver, isExpanded, mergeError, actionsEnabled, swappingEnabled, isCompacted, isMergeActionAvailable, isCopyActionAvailable, currentRow, totalRows} = this.props;

    const isEmptyRow = sourceRecord === undefined && targetRecord === undefined;

    const rowClasses = classNames({
      'to-merge': selectedAction === SubrecordActionTypes.MERGE,
      'to-result': selectedAction === SubrecordActionTypes.COPY && sourceRecord !== undefined,
      'to-remove-source': selectedAction === SubrecordActionTypes.BLOCK && sourceRecord !== undefined,
      'to-remove-target': selectedAction === SubrecordActionTypes.BLOCK && targetRecord !== undefined,
      'is-over': isOver,
      'is-compacted': isCompacted
    });

    const isSwapped = this.isSwapped();

    return connectDragSource(connectDropTarget(
      <tr className={rowClasses}>

        <td>
          <div className="row-indicator">
            {currentRow}/{totalRows}
          </div>
          {this.renderSubrecordPanel(isSwapped ? targetRecord : sourceRecord, ItemTypes.SOURCE_SUBRECORD, isSwapped ? ItemTypes.TARGET_SUBRECORD : ItemTypes.SOURCE_SUBRECORD, rowId, isExpanded, actionsEnabled)}
        </td>
        <td>
          {swappingEnabled ? this.renderSubrecordSwapButton() : null}

          {this.renderSubrecordPanel(isSwapped ? sourceRecord : targetRecord, ItemTypes.TARGET_SUBRECORD, isSwapped ? ItemTypes.SOURCE_SUBRECORD : ItemTypes.TARGET_SUBRECORD, rowId, isExpanded, actionsEnabled)}
        </td>
        <td>
          {isEmptyRow ? this.renderRemoveRowButton(rowId) : this.renderMergedSubrecordPanel(mergedRecord, rowId, isExpanded, mergeError, {isMergeActionAvailable, isCopyActionAvailable, selectedAction, actionsEnabled})}
          {isCompacted ? null : this.renderExpandToggleButton(rowId, isEmptyRow, isExpanded)}
        </td>
      </tr>
    ));

  }


}

const rowSource = {

  beginDrag(props) {
    const {rowIndex} = props;
    return {rowIndex};
  },
  canDrag(props) {
    if (props && props.isExpanded) {
      return false;
    }

    if (props && props.isCompacted) {
      return false;
    }

    if (props && props.actionsEnabled !== true) {
      return false;
    }

    return true;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

var rowTarget = {
  drop(props, monitor) {

    const item = monitor.getItem();
    const fromRow = item.rowIndex;
    const toRow = props.rowIndex;

    props.onChangeRow(fromRow, toRow);
  }
};

var collectTarget = function (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

const dragSourceComponent = DragSource(ItemTypes.SUBRECORD_ROW, rowSource, collect)(SubrecordMergePanelRow);

export const DragDropSubrecordMergePanelRow = DropTarget(ItemTypes.SUBRECORD_ROW, rowTarget, collectTarget)(dragSourceComponent);
