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
import Card, { CardHeader, CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';
import { red, yellow } from 'material-ui/colors';
import Button from 'material-ui/Button';

import '../../styles/components/error-message-panel.scss';

const styles = () => ({
  warning: {
    backgroundColor: yellow[300]
  },
  error: {
    backgroundColor: red[300]
  }
});

class ErrorMessagePanel extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    messageList: PropTypes.array,
    warning: PropTypes.bool,
    onDismiss: PropTypes.func,
    classes: PropTypes.object.isRequired
  }

  render() {
    const { classes } = this.props;

    return (
      <Card elevation={0} square className={classNames({[classes.error]: !this.props.warning, [classes.warning]: this.props.warning})}>
        {this.props.title && <CardHeader title={this.props.title} />}

        <CardContent>
          {this.props.message}

          {this.props.messageList && <pre>{this.props.messageList.join('\n')}</pre>}

          {this.props.warning && <Button variant="raised" color="primary" onClick={this.props.onDismiss} name="dismiss">Hylkää</Button>}
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(ErrorMessagePanel);