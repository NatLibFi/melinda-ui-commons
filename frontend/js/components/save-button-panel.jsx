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
import '../../styles/components/save-button-panel.scss';
import { Preloader } from 'commons/components/preloader';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import { red, green } from 'material-ui/colors';

const styles = (theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    '& * + *': {
      marginLeft: theme.spacing.unit
    } 
  },
  error: {
    color: red[300]
  },
  success: {
    color: green[300]
  }
});

class SaveButtonPanel extends React.Component {

  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    error: PropTypes.object,
    status: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  handleClick(event) {
    event.preventDefault();
    const {enabled} = this.props;

    if (enabled) {
      this.props.onSubmit();  
    }
  }

  renderMessages() {
    const { error, status, classes } = this.props;

    if (error !== undefined) {
      return (<span className={classes.error}>{error.message}</span>);
    }
    if (status === 'UPDATE_SUCCESS') {
      return (<span className={classes.success}>Tietue on tallennettu</span>); 
    }
    return null;
  }

  render() {

    const { enabled, status, classes } = this.props;

    const showPreloader = status === 'UPDATE_ONGOING';

    return (
      <div className={classes.root}>
        <Button variant="raised" disabled={!enabled} onClick={(e) => this.handleClick(e)} color="primary">TALLENNA</Button>
        
        {showPreloader ? <Preloader size="small" /> : this.renderMessages()}     
        
      </div>
    );
  }
}

export default withStyles(styles)(SaveButtonPanel);
