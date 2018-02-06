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
import React from 'react';
import PropTypes from 'prop-types';
import * as sessionActionCreators from '../action-creators/session-actions';
import {connect} from 'react-redux';
import Card, { CardActions, CardContent, CardHeader } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Icon from 'material-ui/Icon';
import Button from 'material-ui/Button';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';

import '../../styles/components/signin-form-panel.scss';

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit,
  }
});

export class SigninFormPanel extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    startSession: PropTypes.func.isRequired,
    createSessionErrorMessage: PropTypes.string,
    sessionState: PropTypes.string,
    classes: PropTypes.object.isRequired
  }
  constructor() {
    super();

    this.state = {
      username: '',
      password: ''
    };
  }

  updateUsername(event) {
    this.setState({username: event.target.value});
  }

  updatePassword(event) {
    this.setState({password: event.target.value});
  }

  executeSignin(event) {
    event.preventDefault();
    
    const {username, password} = this.state;
    this.props.startSession(username, password);

  }

  renderPreloader() {
    return (
      <LinearProgress />
    );
  }

  disableDuringSignin() {
    return this.props.sessionState === 'SIGNIN_ONGOING';
  }

  render() {
    const title = this.props.title;
    const usernameLabel = 'Käyttäjätunnus';
    const passwordLabel = 'Salasana';
    const signinButtonLabel = 'Kirjaudu';

    const {username, password} = this.state;
    const { classes } = this.props;
    return (

      <Card className='signin-panel'>
      
        <CardHeader title={title} color="primary"/>

        <CardContent>
         
          <form>
            <TextField
              id="username"
              label={usernameLabel}
              value={username}
              onChange={this.updateUsername.bind(this)}
            />

            <TextField
              id="password"
              type="password"
              label={passwordLabel}
              value={password}
              onChange={this.updatePassword.bind(this)}
            />

            <div className="spacer" />
            {this.props.sessionState === 'SIGNIN_ERROR' ? this.props.createSessionErrorMessage : <span>&nbsp;</span>}
            <div className="spacer" />

            <CardActions>
              <Button className={classes.button} variant="raised" color="primary" disabled={this.disableDuringSignin()} type="submit" name="action" onClick={this.executeSignin.bind(this)}>
                {signinButtonLabel}
                <Icon className={classes.rightIcon}>send</Icon>
              </Button>
            </CardActions>
          </form>
        
        </CardContent>

        {this.props.sessionState === 'SIGNIN_ONGOING' ? this.renderPreloader():''}
          
      </Card>

    );
  }
}

function mapStateToProps(state) {
  return {
    sessionState: state.getIn(['session' ,'state']),
    createSessionErrorMessage: state.getIn(['session', 'error'])
  };
}

export const SigninFormPanelContainer = connect(
  mapStateToProps,
  sessionActionCreators
)(withStyles(styles)(SigninFormPanel));
