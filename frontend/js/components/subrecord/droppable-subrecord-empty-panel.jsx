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
import { ItemTypes } from '../../constants';
import { DropTarget } from 'react-dnd';
import { EmptySubRecordPanel } from './subrecord-empty-panel';

export class DroppableEmptySubRecordPanel extends React.Component {

  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired,
    onChangeSourceRow: PropTypes.func.isRequired,
    onChangeTargetRow: PropTypes.func.isRequired
  }

  render() {
    const { connectDropTarget } = this.props;

    return connectDropTarget(<div><EmptySubRecordPanel {...this.props} /></div>);
  }
}

const emptySlotTarget = {
  drop(props, monitor, component) {

    const { rowId } = props;
    const item = monitor.getItem();
    
    const fromRowId = item.rowId;
    const dragType = item.dragType;
    const toRowId = rowId;

    if (dragType == ItemTypes.SOURCE_SUBRECORD) {
      component.props.onChangeSourceRow(fromRowId, toRowId);
    }
    if (dragType == ItemTypes.TARGET_SUBRECORD) {
      component.props.onChangeTargetRow(fromRowId, toRowId);
    }

  },

  canDrop(props, monitor) {
    const item = monitor.getItem();

    return (props.dragType == item.dragType);
  }

};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
 
  };
}

export const DropTargetEmptySubRecordPanel = DropTarget(ItemTypes.SUBRECORD, emptySlotTarget, collect)(DroppableEmptySubRecordPanel);
