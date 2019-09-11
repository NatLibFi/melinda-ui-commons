/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
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
import classNames from 'classnames';

export class RecordPanel extends React.Component {

  static propTypes = {
    children: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
    editable: PropTypes.bool,
    error: PropTypes.object,
    mergeable: PropTypes.bool,
    mergeButtonEnabled: PropTypes.bool,
    mergeFunc: PropTypes.func,
    onFieldClick: PropTypes.func,
    onRecordUpdate: PropTypes.func,
    record: PropTypes.object,
    recordInputField: PropTypes.element,
    showHeader: PropTypes.bool,
    showInput: PropTypes.bool,
    title: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      editMode: false
    };
  }

  componentDidMount() {
  }

  handleEditModeChange(event) {
    event.preventDefault();
    if (this.editButtonEnabled()) {
      this.setState({editMode: !this.state.editMode});
    }
  }

  handleRecordUpdate(nextRecord) {
    if (this.props.onRecordUpdate) {
      this.props.onRecordUpdate(nextRecord);  
    }
  }

  editButtonEnabled() {
    return this.props.record !== undefined;
  }

  renderRecord() {
    return (
      <div>
        {this.props.showHeader ? this.renderHeader() : null }
        {this.props.showInput ? this.props.recordInputField : null}
        {this.state.editMode ? this.renderEditor(): this.renderPreview()  }
      </div>
    );
  }

  renderHeader() {
    let editButtonClasses = classNames({ 
      'disabled': !this.editButtonEnabled(),
      'active': this.state.editMode
    });

    const mergeButtonClasses = classNames({
      'disabled': !this.props.mergeButtonEnabled
    });

    const mergeButton = () => (<li className="button"><a className={mergeButtonClasses} href="#" onClick={this.props.mergeFunc} ><i className="material-icons">call_merge</i></a></li>);
    const editButton = () => (<li className="button"><a className={editButtonClasses} href="#" onClick={(e) => this.handleEditModeChange(e)}><i className="material-icons">edit</i></a></li>);

    return (
      <div className="row row-no-bottom-margin">
        <div className="col s12">
          <ul className="title-row-list" ref={(c) => this._tabs = c}>
            <li className="disabled title">{this.props.title || ''}</li>
            { this.props.mergeable ? mergeButton() : null }
            { this.props.editable ? editButton() : null }
          </ul>
        </div>
      </div>
    );
  }
  renderPreview() {

    if (this.props.record !== undefined) {

      return (
        <div>
          <div className="card-content">
            <MarcRecordPanel record={this.props.record} onFieldClick={this.props.onFieldClick} />
          </div>
          {this.props.children}
        </div>
      );      
      
    } else {
      return (<div>{this.props.children}</div>);
    }

  }

  renderEditor() {
    return (
      <div className="card-content">
        <MarcEditor 
          record={this.props.record} 
          onRecordUpdate={(record) => this.handleRecordUpdate(record)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="marc-record-container">
        {this.renderRecord()}
      </div>
    );
  }
}
