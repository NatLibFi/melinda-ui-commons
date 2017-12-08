'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RecordPanel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _proptypes = require('proptypes');

var _proptypes2 = _interopRequireDefault(_proptypes);

var _marcRecordPanel = require('./marc-record-panel');

require('../../styles/components/record-panel.scss');

var _marcEditorPanel = require('./marc-editor-panel');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

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


var RecordPanel = exports.RecordPanel = function (_React$Component) {
  _inherits(RecordPanel, _React$Component);

  function RecordPanel(props) {
    _classCallCheck(this, RecordPanel);

    var _this = _possibleConstructorReturn(this, (RecordPanel.__proto__ || Object.getPrototypeOf(RecordPanel)).call(this, props));

    _this.state = {
      currentTab: 'PREVIEW'
    };
    return _this;
  }

  _createClass(RecordPanel, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.showHeader && this.props.editable) {
        window.$(this._tabs).tabs();
      }
    }
  }, {
    key: 'handleTabChange',
    value: function handleTabChange(event, nextTab) {
      event.preventDefault();
      if (this.tabsEnabled()) {
        this.setState({ currentTab: nextTab });
      }
    }
  }, {
    key: 'handleRecordUpdate',
    value: function handleRecordUpdate(nextRecord) {
      if (this.props.onRecordUpdate) {
        this.props.onRecordUpdate(nextRecord);
      }
    }
  }, {
    key: 'tabsEnabled',
    value: function tabsEnabled() {
      return this.props.record !== undefined;
    }
  }, {
    key: 'renderRecord',
    value: function renderRecord() {
      return _react2.default.createElement(
        'div',
        null,
        this.props.showHeader ? this.renderHeader() : null,
        this.state.currentTab == 'EDIT' ? this.renderEditor() : this.renderPreview()
      );
    }
  }, {
    key: 'renderHeader',
    value: function renderHeader() {
      var _this2 = this;

      var tabClasses = (0, _classnames2.default)('tab col s2', {
        'tab-disabled': !this.tabsEnabled()
      });

      var previewTab = function previewTab() {
        return _react2.default.createElement(
          'li',
          { className: tabClasses },
          _react2.default.createElement(
            'a',
            { href: '#', onClick: function onClick(e) {
                return _this2.handleTabChange(e, 'PREVIEW');
              } },
            'Esikatselu'
          )
        );
      };
      var editTab = function editTab() {
        return _react2.default.createElement(
          'li',
          { className: tabClasses },
          _react2.default.createElement(
            'a',
            { href: '#', onClick: function onClick(e) {
                return _this2.handleTabChange(e, 'EDIT');
              } },
            'Muokkaus'
          )
        );
      };

      return _react2.default.createElement(
        'div',
        { className: 'row row-no-bottom-margin' },
        _react2.default.createElement(
          'div',
          { className: 'col s7' },
          _react2.default.createElement(
            'ul',
            { className: 'tabs', ref: function ref(c) {
                return _this2._tabs = c;
              } },
            _react2.default.createElement(
              'li',
              { className: 'tab col s2 disabled title' },
              this.props.title || ''
            ),
            this.props.editable ? previewTab() : null,
            this.props.editable ? editTab() : null
          )
        )
      );
    }
  }, {
    key: 'renderPreview',
    value: function renderPreview() {

      if (this.props.record !== undefined) {

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'card-content' },
            _react2.default.createElement(_marcRecordPanel.MarcRecordPanel, { record: this.props.record, onFieldClick: this.props.onFieldClick })
          ),
          this.props.children
        );
      } else {
        return _react2.default.createElement(
          'div',
          null,
          this.props.children
        );
      }
    }
  }, {
    key: 'renderEditor',
    value: function renderEditor() {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        { className: 'card-content' },
        _react2.default.createElement(_marcEditorPanel.MarcEditor, {
          record: this.props.record,
          onRecordUpdate: function onRecordUpdate(record) {
            return _this3.handleRecordUpdate(record);
          }
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'marc-record-container' },
        this.renderRecord()
      );
    }
  }]);

  return RecordPanel;
}(_react2.default.Component);

RecordPanel.propTypes = {
  record: _proptypes2.default.object,
  error: _proptypes2.default.object,
  showHeader: _proptypes2.default.bool,
  title: _proptypes2.default.string,
  editable: _proptypes2.default.bool,
  children: _proptypes2.default.oneOfType([_proptypes2.default.object, _proptypes2.default.array]),
  onRecordUpdate: _proptypes2.default.func,
  onFieldClick: _proptypes2.default.func
};
//# sourceMappingURL=record-panel.js.map