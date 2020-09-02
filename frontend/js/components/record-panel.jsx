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
import {MarcRecordPanel} from './marc-record-panel';
import '../../styles/components/record-panel.scss';
import {MarcEditor} from './marc-editor-panel';
import classNames from 'classnames';

export class RecordPanel extends React.Component {

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    editable: PropTypes.bool,
    error: PropTypes.object,
    onFieldClick: PropTypes.func,
    onRecordUpdate: PropTypes.func,
    record: PropTypes.object,
    recordHeader: PropTypes.element,
    showHeader: PropTypes.bool,
    title: PropTypes.string
  };

  constructor() {
    super();
    this.state = {
      editMode: false
    };
  }

  handleEditModeChange(event) {
    event.preventDefault();
    this.setState({
      editMode: !this.state.editMode
    });
  }

  handleRecordUpdate(nextRecord) {
    if (this.props.onRecordUpdate) {
      this.props.onRecordUpdate(nextRecord);
    }
  }

  renderHeader() {
    const editButtonClasses = classNames({
      disabled: !this.props.record,
      active: this.state.editMode
    });

    return (
      <div className="row row-no-bottom-margin">
        <div className="col s12">
          <ul className="tabs" ref={(c) => this._tabs = c}>
            <li className="tab col s2 disabled title">{this.props.title || ''}</li>
            {this.props.editable ? <li className="button tooltip" title="Muokkaa"><a className={editButtonClasses} href="#" onClick={(e) => this.handleEditModeChange(e)}><i className="material-icons">edit</i></a></li> : null}
          </ul>
        </div>
      </div>
    );
  }

  renderRecord() {
    const header = this.props.recordHeader ? this.props.recordHeader : this.renderHeader();

    return (
      <div>
        {this.props.showHeader ? header : null}
        {this.state.editMode ? this.renderEditor() : this.renderPreview()}
      </div>
    );
  }

  renderPreview() {
    if (this.props.record !== undefined) {
      return (
        <div className="card-content">
          <div>
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
