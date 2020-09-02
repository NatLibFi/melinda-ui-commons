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
  }

  renderHeader() {
    const tabClasses = classNames('tab col s2', {
      'tab-disabled': this.props.record === undefined
    });

    const previewTab = () => (<li className={tabClasses}><a href="#" onClick={(e) => this.handleTabChange(e, 'PREVIEW')}>Esikatselu</a></li>);
    const editTab = () => (<li className={tabClasses}><a href="#" onClick={(e) => this.handleTabChange(e, 'EDIT')}>Muokkaus</a></li>);

    return (
      <div className="row row-no-bottom-margin">
        <div className="col s7">
          <ul className="tabs" ref={(c) => this._tabs = c}>
            <li className="tab col s2 disabled title">{this.props.title || ''}</li>
            { this.props.editable ? previewTab() : null }
            { this.props.editable ? editTab() : null }
          </ul>
        </div>
      </div>
    );
  }

  handleRecordUpdate(nextRecord) {
    if (this.props.onRecordUpdate) {
      this.props.onRecordUpdate(nextRecord);
    }
  }

  renderRecord() {
    const header = this.props.recordHeader ? this.props.recordHeader : this.renderHeader();

    return (
      <div>
        {this.props.showHeader ? header : null}
        {this.props.editable ? this.renderEditor() : this.renderPreview()}
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
