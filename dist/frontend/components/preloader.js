'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Preloader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _proptypes = require('proptypes');

var _proptypes2 = _interopRequireDefault(_proptypes);

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


var Preloader = exports.Preloader = function (_React$Component) {
  _inherits(Preloader, _React$Component);

  function Preloader() {
    _classCallCheck(this, Preloader);

    return _possibleConstructorReturn(this, (Preloader.__proto__ || Object.getPrototypeOf(Preloader)).apply(this, arguments));
  }

  _createClass(Preloader, [{
    key: 'render',
    value: function render() {
      var preloaderClasses = (0, _classnames2.default)('preloader-wrapper', 'active', this.props.size);

      return _react2.default.createElement(
        'div',
        { className: preloaderClasses },
        _react2.default.createElement(
          'div',
          { className: 'spinner-layer spinner-blue-only' },
          _react2.default.createElement(
            'div',
            { className: 'circle-clipper left' },
            _react2.default.createElement('div', { className: 'circle' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'gap-patch' },
            _react2.default.createElement('div', { className: 'circle' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'circle-clipper right' },
            _react2.default.createElement('div', { className: 'circle' })
          )
        )
      );
    }
  }]);

  return Preloader;
}(_react2.default.Component);

Preloader.propTypes = {
  size: _proptypes2.default.string
};
//# sourceMappingURL=preloader.js.map