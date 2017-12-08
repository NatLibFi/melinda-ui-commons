'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SigninFormPanelContainer = exports.SigninFormPanel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _proptypes = require('proptypes');

var _proptypes2 = _interopRequireDefault(_proptypes);

var _sessionActions = require('../action-creators/session-actions');

var sessionActionCreators = _interopRequireWildcard(_sessionActions);

var _reactRedux = require('react-redux');

require('../../styles/components/signin-form-panel.scss');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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


var SigninFormPanel = exports.SigninFormPanel = function (_React$Component) {
  _inherits(SigninFormPanel, _React$Component);

  function SigninFormPanel() {
    _classCallCheck(this, SigninFormPanel);

    var _this = _possibleConstructorReturn(this, (SigninFormPanel.__proto__ || Object.getPrototypeOf(SigninFormPanel)).call(this));

    _this.state = {
      username: '',
      password: ''
    };
    return _this;
  }

  _createClass(SigninFormPanel, [{
    key: 'updateUsername',
    value: function updateUsername(event) {
      this.setState({ username: event.target.value });
    }
  }, {
    key: 'updatePassword',
    value: function updatePassword(event) {
      this.setState({ password: event.target.value });
    }
  }, {
    key: 'executeSignin',
    value: function executeSignin(event) {
      event.preventDefault();

      var _state = this.state,
          username = _state.username,
          password = _state.password;

      this.props.startSession(username, password);
    }
  }, {
    key: 'renderPreloader',
    value: function renderPreloader() {
      return _react2.default.createElement(
        'div',
        { className: 'progress' },
        _react2.default.createElement('div', { className: 'indeterminate' })
      );
    }
  }, {
    key: 'disableDuringSignin',
    value: function disableDuringSignin() {
      return this.props.sessionState === 'SIGNIN_ONGOING' ? 'disabled' : '';
    }
  }, {
    key: 'render',
    value: function render() {
      var title = this.props.title;
      var usernameLabel = 'Käyttäjätunnus';
      var passwordLabel = 'Salasana';
      var signinButtonLabel = 'Kirjaudu';

      var _state2 = this.state,
          username = _state2.username,
          password = _state2.password;


      return _react2.default.createElement(
        'div',
        { className: 'card signin-panel valign' },
        _react2.default.createElement(
          'div',
          { className: 'card-panel teal lighten-2' },
          _react2.default.createElement(
            'h4',
            null,
            title
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'card-content' },
          _react2.default.createElement(
            'form',
            null,
            _react2.default.createElement(
              'div',
              { className: 'col s2 offset-s1 input-field' },
              _react2.default.createElement('input', { id: 'username', type: 'text', className: 'validate', value: username, onChange: this.updateUsername.bind(this) }),
              _react2.default.createElement(
                'label',
                { htmlFor: 'username' },
                usernameLabel
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'col s2 offset-s1 input-field' },
              _react2.default.createElement('input', { id: 'password', type: 'password', className: 'validate', value: password, onChange: this.updatePassword.bind(this) }),
              _react2.default.createElement(
                'label',
                { htmlFor: 'password' },
                passwordLabel
              )
            ),
            _react2.default.createElement('div', { className: 'spacer' }),
            this.props.sessionState === 'SIGNIN_ERROR' ? this.props.createSessionErrorMessage : _react2.default.createElement(
              'span',
              null,
              '\xA0'
            ),
            _react2.default.createElement('div', { className: 'spacer' }),
            _react2.default.createElement(
              'div',
              { className: 'right-align' },
              _react2.default.createElement(
                'button',
                { className: 'btn waves-effect waves-light', disabled: this.disableDuringSignin(), type: 'submit', name: 'action', onClick: this.executeSignin.bind(this) },
                signinButtonLabel,
                _react2.default.createElement(
                  'i',
                  { className: 'material-icons right' },
                  'send'
                )
              )
            )
          )
        ),
        this.props.sessionState === 'SIGNIN_ONGOING' ? this.renderPreloader() : ''
      );
    }
  }]);

  return SigninFormPanel;
}(_react2.default.Component);

SigninFormPanel.propTypes = {
  title: _proptypes2.default.string.isRequired,
  startSession: _proptypes2.default.func.isRequired,
  createSessionErrorMessage: _proptypes2.default.string,
  sessionState: _proptypes2.default.string
};


function mapStateToProps(state) {
  return {
    sessionState: state.getIn(['session', 'state']),
    createSessionErrorMessage: state.getIn(['session', 'error'])
  };
}

var SigninFormPanelContainer = exports.SigninFormPanelContainer = (0, _reactRedux.connect)(mapStateToProps, sessionActionCreators)(SigninFormPanel);
//# sourceMappingURL=signin-form-panel.js.map