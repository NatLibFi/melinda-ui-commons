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
import { MarcRecordPanel } from './marc-record-panel';
import '../../styles/components/record-panel.scss';
import {MarcEditor} from './marc-editor-panel';
import { CardContent, CardHeader } from 'material-ui/Card';
import Tabs, { Tab } from 'material-ui/Tabs';
import { withStyles } from 'material-ui/styles';

const styles = (theme) => ({
  header: {
    textTransform: 'uppercase',
    fontSize: theme.typography.fontSize,
    lineHeight: '48px',
    marginTop: '-8px'
  },
  tabs: {
    minHeight: 1,
  },
  tab: {
    minWidth: 'auto',
    maxWidth: 'auto',
    width: '50%',
  },
  tabLabel: {
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  }
});

class RecordPanel extends React.Component {

  static propTypes = {
    record: PropTypes.object,
    error: PropTypes.object,
    showHeader: PropTypes.bool,
    title: PropTypes.string,
    editable: PropTypes.bool,
    children: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
    onRecordUpdate: PropTypes.func,
    onFieldClick: PropTypes.func,
    classes: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'PREVIEW'
    };
  }

  componentDidMount() {
    if (this.props.showHeader && this.props.editable) {
      // window.$(this._tabs).tabs();
    }
  }

  handleTabChange = (event, nextTab) => {
    event.preventDefault();
    if (this.tabsEnabled()) {
      this.setState({currentTab: nextTab});
    }
  }

  handleRecordUpdate(nextRecord) {
    if (this.props.onRecordUpdate) {
      this.props.onRecordUpdate(nextRecord);  
    }
  }

  tabsEnabled() {
    return this.props.record !== undefined;
  }

  renderRecord() {
    return (
      <div>

        {this.props.showHeader ? this.renderHeader() : null }
        {this.state.currentTab == 'EDIT' ? this.renderEditor(): this.renderPreview()  }

      </div>
    );
  }

  renderTabs() {
    const { classes } = this.props;

    return this.props.editable ? (
      <Tabs value={this.state.currentTab} onChange={this.handleTabChange} className={classes.tabs}>
        <Tab label='Esikatselu' value='PREVIEW' classes={{root: classes.tab}}/>
        <Tab label='Muokkaus' value='EDIT' classes={{root: classes.tab}}/>
      </Tabs>
    ) : null;
  }

  renderHeader() {
    const { classes } = this.props;

    return (
      <CardHeader 
        classes={{
          title: classes.header
        }}
        title={this.props.title || ''}
        action={this.renderTabs()}
      />
    );
  }

  renderPreview() {
    if (this.props.record !== undefined) {
      return (
        <React.Fragment>
          <CardContent>
            <MarcRecordPanel record={this.props.record} onFieldClick={this.props.onFieldClick} />
          </CardContent>
          {this.props.children}
        </React.Fragment>
      );
    } else {
      return this.props.children;
    }

  }

  renderEditor() {
    return (
      <CardContent>
        <MarcEditor 
          record={this.props.record} 
          onRecordUpdate={(record) => this.handleRecordUpdate(record)}
        />
      </CardContent>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.props.showHeader ? this.renderHeader() : null }
        {this.state.currentTab == 'EDIT' ? this.renderEditor(): this.renderPreview()  }
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(RecordPanel);
