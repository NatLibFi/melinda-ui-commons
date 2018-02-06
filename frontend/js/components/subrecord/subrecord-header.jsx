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
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';

const styles = (theme) => ({
  root: {
    margin: (theme.spacing.unit * 2) + 'px ' + theme.spacing.unit + 'px'
  }
});

class SubrecordHeader extends React.Component {

  static propTypes = {
    setCompactSubrecordView: PropTypes.func.isRequired,
    compactSubrecordView: PropTypes.bool.isRequired,
    actionsEnabled: PropTypes.bool.isRequired,
    swappingEnabled: PropTypes.bool,
    onSwapEverySubrecordRow: PropTypes.func,
    classes: PropTypes.object.isRequired
  };
  
  static defaultProps = {
    swappingEnabled: false
  };

  toggleCompactView = (e) => {
    const isEnabled = e.target.checked;

    this.props.setCompactSubrecordView(isEnabled);    
  }

  swapEverySubrecordRow = () => {
    this.props.onSwapEverySubrecordRow();
  }

  render() {
    const { actionsEnabled, swappingEnabled, classes } = this.props;

    return (
      <div className={classNames('subrecord-header', classes.root)}>
        <Grid container>
          <Grid item xs={3}>
            <Typography variant="headline">
              Osakohteet
            </Typography>
          </Grid>

          {swappingEnabled ? (
            <Grid item xs={2} className="swap-all-button-container">
              <Button className={classNames('swap-all-button')} variant="fab" color="secondary" aria-label="swap" disabled={!actionsEnabled} onClick={this.swapEverySubrecordRow}>
                <Icon>swap_horiz</Icon>
              </Button>
            </Grid>
          ) : <Grid item xs={2} /> }

          <Grid item xs={3} />

          <Grid item xs={4}>
            <FormControlLabel
              control={
                <Checkbox
                  value="compact-subrecords-view"
                  checked={this.props.compactSubrecordView}
                  onChange={this.toggleCompactView}
                />
              }
              label="Pienennä käsitellyt osakohteet"
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(SubrecordHeader);