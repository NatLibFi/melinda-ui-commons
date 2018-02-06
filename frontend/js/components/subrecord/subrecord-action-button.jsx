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

import PropTypes from 'prop-types';

import React from 'react';
import { SubrecordActionTypes } from '../../constants';
import classNames from 'classnames';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import { red, green, blue, yellow } from 'material-ui/colors';
import { withStyles } from 'material-ui/styles';

const styles = (theme) => ({
  actionButtonSelector: {
    '& > *': {
      marginLeft: theme.spacing.unit
    }
  },
  red: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[600]
    }
  },
  green: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[600]
    }
  },
  blue: {
    backgroundColor: blue[500],
    '&:hover': {
      backgroundColor: blue[600]
    }
  },
  yellow: {
    backgroundColor: yellow[500],
    '&:hover': {
      backgroundColor: yellow[600]
    }
  }
});

class SubrecordActionButton extends React.Component {
  static propTypes = {
    rowId: PropTypes.string.isRequired,
    onChangeAction: PropTypes.func.isRequired,
    selectedAction: PropTypes.string,
    isMergeActionAvailable: PropTypes.bool,
    isCopyActionAvailable: PropTypes.bool,
    actionsEnabled: PropTypes.bool,
    classes: PropTypes.object.isRequired
  } 

  constructor() {
    super();

    this.state = {
      open: false
    };
  }

  selectAction(type) {
    const { rowId, onChangeAction } = this.props;

    return () => {
      if (this.props.actionsEnabled) {
        onChangeAction(rowId, type);

        this.setState(() => ({
          open: false
        }));
      }
    };
  }

  getIcon(actionType) {
    if (actionType === SubrecordActionTypes.BLOCK) return 'block';
    if (actionType === SubrecordActionTypes.MERGE) return 'queue';
    if (actionType === SubrecordActionTypes.COPY) return 'forward';
    return 'more_vert';
  }

  getColor(actionType) {
    if (actionType === SubrecordActionTypes.BLOCK) return 'red';
    if (actionType === SubrecordActionTypes.MERGE) return 'green';
    if (actionType === SubrecordActionTypes.COPY) return 'blue';
    return 'yellow'; 
  }

  renderButton(color, icon, onClickFn) {
    const buttonClasses = classNames('btn-floating', color);

    return (
      <a className={buttonClasses}
        onClick={onClickFn} >

        <i className="material-icons">{icon}</i>
      </a>
    );
  }

  renderActionButton(actionType) {
    const color = this.getColor(actionType);
    const icon = this.getIcon(actionType);

    return this.renderButton(color, icon, this.selectAction(actionType));
  }

  isActionAvailable(actionType) {
    const {isMergeActionAvailable, isCopyActionAvailable} = this.props;
    if (actionType === SubrecordActionTypes.COPY) return isCopyActionAvailable;
    if (actionType === SubrecordActionTypes.MERGE) return isMergeActionAvailable;
    return true;
  }

  handleToggle = () => {
    this.setState((state) => ({
      open: !state.open
    }));
  }

  render() {

    const { selectedAction, actionsEnabled, classes } = this.props;

    const { UNSET, BLOCK, MERGE, COPY } = SubrecordActionTypes;

    const buttons = [BLOCK, MERGE, COPY]
      .filter(actionType => this.isActionAvailable(actionType))
      .map(actionType => actionType === selectedAction ? UNSET : actionType);

    return (
      <div className="action-button-container">
        <Button className={classNames('action-button', classes[this.getColor(selectedAction)])} variant="fab" aria-label="swap" disabled={!actionsEnabled} onClick={this.handleToggle}>
          <Icon>{this.getIcon(selectedAction)}</Icon>
        </Button>

        <div className={classNames('action-button-selector', classes.actionButtonSelector, {open: this.state.open})}>
          {buttons.map((actionType) => (
            <Button key={actionType} className={classNames('action-button', classes[this.getColor(actionType)])} variant="fab" aria-label="swap" disabled={!actionsEnabled} onClick={this.selectAction(actionType)}>
              <Icon>{this.getIcon(actionType)}</Icon>
            </Button>
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SubrecordActionButton);
