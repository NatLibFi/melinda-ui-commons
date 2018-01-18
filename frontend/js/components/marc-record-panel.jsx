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
import classNames from 'classnames';
import '../../styles/components/marc-record-panel';
import _ from 'lodash';

export class MarcRecordPanel extends React.Component {

  static propTypes = {
    record: PropTypes.object.isRequired,
    onFieldClick: PropTypes.func,
  }

  handleFieldClick(field) {
    if (this.props.onFieldClick) {
      this.props.onFieldClick(field);
    }
  }

  renderControlField(field) {

    const classes = classNames('marc-field marc-field-controlfield', {
      'wasUsed': field.wasUsed,
      'from-preferred': field.fromPreferred,
      'from-other': field.fromOther,
      'has-changed': field.hasChanged,
      'from-postmerge': field.fromPostmerge,
      'has-been-edited': field.hasBeenEdited
    });

    const key = field.tag === 'LDR' ? 'LDR' : field.uuid;

    return (
      <span key={key} className={classes} onClick={() => this.handleFieldClick(field)}>
        <span className="tag">{field.tag}</span>
        <span className="pad">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span className="value">{field.value}</span>
        {'\n'}
      </span>
    );
  }

  renderDataField(field) {
    const subfieldNodes = field.subfields.map(function(subfield, subfieldIndex) {

      const classes = classNames('marc-subfield', {
        'is-selected': subfield.wasUsed,
        'from-preferred': subfield.fromPreferred,
        'from-other': subfield.fromOther,
        'has-changed': subfield.hasChanged,
        'from-postmerge': subfield.fromPostmerge,
        'has-been-edited': field.hasBeenEdited
      });
      
      const key = `${field.uuid}-${subfieldIndex}`;

      return (
        <span key={key} className={classes}>
          <span className="marker">‡</span>
          <span className="code">{subfield.code}</span>
          <span className="value">{subfield.value}</span>
        </span>
      );
    });
    const classes = classNames('marc-field marc-field-datafield', {
      'is-selected': field.wasUsed,
      'from-preferred': field.fromPreferred,
      'from-other': field.fromOther,
      'has-changed': field.hasChanged,
      'from-postmerge': field.fromPostmerge,
      'has-been-edited': field.hasBeenEdited
    });

    const i1 = field.ind1 || ' ';
    const i2 = field.ind2 || ' ';

    return (
      <span key={field.uuid} className={classes} onClick={() => this.handleFieldClick(field)}>
        <span className="tag">{field.tag}</span>
        <span className="pad">&nbsp;</span>
        <span className="ind1">{i1}</span>
        <span className="ind2">{i2}</span>
        <span className="pad">&nbsp;</span>
        {subfieldNodes}
        {'\n'}
      </span>
    );
  }

  renderFields(record) {

    const fields = _.get(record, 'fields', []).slice();
    if (record.leader) {
      fields.unshift({
        tag: 'LDR',
        value: record.leader
      });
    }

    const fieldNodes = fields.map((field) => {
      
      if (isControlField(field)) { 
        return this.renderControlField(field);
      } else {
        return this.renderDataField(field);
      } 
    });

    return (
      <div className="fieldList">
        {fieldNodes}
      </div>
    );

  }

  render() {

    return (
      <div className="marc-record-panel">{this.renderFields(this.props.record || {})}</div>
    );
  }
}

function isControlField(field) {
  return field.subfields === undefined;
}
