'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MarcRecordPanel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _proptypes = require('proptypes');

var _proptypes2 = _interopRequireDefault(_proptypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

require('../../styles/components/marc-record-panel');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
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


var MarcRecordPanel = exports.MarcRecordPanel = function (_React$Component) {
  _inherits(MarcRecordPanel, _React$Component);

  function MarcRecordPanel() {
    _classCallCheck(this, MarcRecordPanel);

    return _possibleConstructorReturn(this, (MarcRecordPanel.__proto__ || Object.getPrototypeOf(MarcRecordPanel)).apply(this, arguments));
  }

  _createClass(MarcRecordPanel, [{
    key: 'handleFieldClick',
    value: function handleFieldClick(field) {
      if (this.props.onFieldClick) {
        this.props.onFieldClick(field);
      }
    }
  }, {
    key: 'renderControlField',
    value: function renderControlField(field) {
      var _this2 = this;

      var classes = (0, _classnames2.default)('marc-field marc-field-controlfield', {
        'wasUsed': field.wasUsed,
        'from-preferred': field.fromPreferred,
        'from-other': field.fromOther,
        'has-changed': field.hasChanged,
        'from-postmerge': field.fromPostmerge,
        'has-been-edited': field.hasBeenEdited
      });

      var key = field.tag === 'LDR' ? 'LDR' : field.uuid;

      return _react2.default.createElement(
        'span',
        { key: key, className: classes, onClick: function onClick() {
            return _this2.handleFieldClick(field);
          } },
        _react2.default.createElement(
          'span',
          { className: 'tag' },
          field.tag
        ),
        _react2.default.createElement(
          'span',
          { className: 'pad' },
          '\xA0\xA0\xA0\xA0'
        ),
        _react2.default.createElement(
          'span',
          { className: 'value' },
          field.value
        ),
        '\n'
      );
    }
  }, {
    key: 'renderDataField',
    value: function renderDataField(field) {
      var _this3 = this;

      var subfieldNodes = field.subfields.map(function (subfield, subfieldIndex) {

        var classes = (0, _classnames2.default)('marc-subfield', {
          'is-selected': subfield.wasUsed,
          'from-preferred': subfield.fromPreferred,
          'from-other': subfield.fromOther,
          'has-changed': subfield.hasChanged,
          'from-postmerge': subfield.fromPostmerge,
          'has-been-edited': field.hasBeenEdited
        });

        var key = field.uuid + '-' + subfieldIndex;

        return _react2.default.createElement(
          'span',
          { key: key, className: classes },
          _react2.default.createElement(
            'span',
            { className: 'marker' },
            '\u2021'
          ),
          _react2.default.createElement(
            'span',
            { className: 'code' },
            subfield.code
          ),
          _react2.default.createElement(
            'span',
            { className: 'value' },
            subfield.value
          )
        );
      });
      var classes = (0, _classnames2.default)('marc-field marc-field-datafield', {
        'is-selected': field.wasUsed,
        'from-preferred': field.fromPreferred,
        'from-other': field.fromOther,
        'has-changed': field.hasChanged,
        'from-postmerge': field.fromPostmerge,
        'has-been-edited': field.hasBeenEdited
      });

      var i1 = field.ind1 || ' ';
      var i2 = field.ind2 || ' ';

      return _react2.default.createElement(
        'span',
        { key: field.uuid, className: classes, onClick: function onClick() {
            return _this3.handleFieldClick(field);
          } },
        _react2.default.createElement(
          'span',
          { className: 'tag' },
          field.tag
        ),
        _react2.default.createElement(
          'span',
          { className: 'pad' },
          '\xA0'
        ),
        _react2.default.createElement(
          'span',
          { className: 'ind1' },
          i1
        ),
        _react2.default.createElement(
          'span',
          { className: 'ind2' },
          i2
        ),
        _react2.default.createElement(
          'span',
          { className: 'pad' },
          '\xA0'
        ),
        subfieldNodes,
        '\n'
      );
    }
  }, {
    key: 'renderFields',
    value: function renderFields(record) {
      var _this4 = this;

      var fields = _lodash2.default.get(record, 'fields', []).slice();
      if (record.leader) {
        fields.unshift({
          tag: 'LDR',
          value: record.leader
        });
      }

      var fieldNodes = fields.map(function (field) {

        if (isControlField(field)) {
          return _this4.renderControlField(field);
        } else {
          return _this4.renderDataField(field);
        }
      });

      return _react2.default.createElement(
        'div',
        { className: 'fieldList' },
        fieldNodes
      );
    }
  }, {
    key: 'render',
    value: function render() {

      return _react2.default.createElement(
        'div',
        { className: 'marc-record-panel' },
        this.renderFields(this.props.record || {})
      );
    }
  }]);

  return MarcRecordPanel;
}(_react2.default.Component);

MarcRecordPanel.propTypes = {
  record: _proptypes2.default.object.isRequired,
  onFieldClick: _proptypes2.default.func
};


function isControlField(field) {
  return field.subfields === undefined;
}
//# sourceMappingURL=marc-record-panel.js.map