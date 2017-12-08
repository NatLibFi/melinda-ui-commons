'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MarcEditor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _proptypes = require('proptypes');

var _proptypes2 = _interopRequireDefault(_proptypes);

require('../../styles/components/marc-record-editor');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _immutable = require('immutable');

var _marcRecordJs = require('marc-record-js');

var _marcRecordJs2 = _interopRequireDefault(_marcRecordJs);

var _draftJs = require('draft-js');

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


function fieldAsString(field) {
  if (field.subfields) {
    var subfields = field.subfields.map(function (sub) {
      return '\u2021' + sub.code + sub.value;
    }).join('');
    return field.tag + ' ' + field.ind1 + field.ind2 + ' ' + subfields;
  } else {
    return field.tag + '    ' + field.value;
  }
}

var MarcEditor = exports.MarcEditor = function (_React$Component) {
  _inherits(MarcEditor, _React$Component);

  function MarcEditor(props) {
    _classCallCheck(this, MarcEditor);

    var _this = _possibleConstructorReturn(this, (MarcEditor.__proto__ || Object.getPrototypeOf(MarcEditor)).call(this, props));

    if (props.record) {

      var contentState = _this.transformRecordToContentState(props.record);
      var editorState = _draftJs.EditorState.createWithContent(contentState);
      _this.state = { editorState: editorState };
    } else {

      var defaultContentState = _draftJs.ContentState.createFromText('');
      _this.state = { editorState: _draftJs.EditorState.createWithContent(defaultContentState) };
    }

    _this.onChange = function (editorState) {

      var startKey = editorState.getSelection().getStartKey();
      var selectedBlock = editorState.getCurrentContent().getBlockForKey(startKey);

      var nextContentState = editorState.getCurrentContent();

      if (_this.state.editorState.getCurrentContent() !== editorState.getCurrentContent()) {

        nextContentState = nextContentState.updateIn(['blockMap'], function (blockMap) {

          var chars = _this.applyStylesToFieldBlock(selectedBlock.getCharacterList(), selectedBlock.getText());
          var updatedBlock = selectedBlock.set('characterList', chars).updateIn(['data', 'field'], function (field) {
            return _lodash2.default.set(field, 'hasBeenEdited', true);
          });

          return blockMap.set(selectedBlock.getKey(), updatedBlock);
        });
      }

      var nextEditorState = _draftJs.EditorState.push(editorState, nextContentState);

      _this.setState({ editorState: nextEditorState });
      _this.debouncedRecordUpdate(nextEditorState);
    };

    _this.debouncedRecordUpdate = _lodash2.default.debounce(function (editorState) {

      var raw = (0, _draftJs.convertToRaw)(editorState.getCurrentContent());
      var recStr = raw.blocks.map(function (b) {
        return b.text;
      }).join('\n');

      if (_this._currentRecStr == recStr) {
        return;
      }

      _this._currentRecStr = recStr;

      var fieldsIncludingLeader = raw.blocks.map(_this.convertBlockToField);
      var leader = fieldsIncludingLeader.find(function (field) {
        return field.tag === 'LDR';
      });
      var fields = _lodash2.default.without(fieldsIncludingLeader, leader);

      var updatedRecord = new _marcRecordJs2.default({
        leader: leader.value,
        fields: fields
      });

      updatedRecord.fields.forEach(function (field) {
        return field.uuid = _nodeUuid2.default.v4();
      });
      _this._recordFromCurrentEditorContent = updatedRecord;
      _this.props.onRecordUpdate(_this._recordFromCurrentEditorContent);
    }, 250);
    return _this;
  }

  _createClass(MarcEditor, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.updateEditorState(nextProps.record);
    }
  }, {
    key: 'convertBlockToField',
    value: function convertBlockToField(block) {

      var fieldLine = block.text;

      var tag = fieldLine.substr(0, 3);
      var ind1 = fieldLine.substr(4, 1);
      var ind2 = fieldLine.substr(5, 1);
      var data = fieldLine.substr(7);

      if (tag == 'LDR') {
        return _lodash2.default.assign({}, block.data.field, { value: data });
      } else {

        if (data.substr(0, 1) !== '‡') {
          //controlfield

          return _lodash2.default.assign({}, block.data.field, { tag: tag, value: data });
        } else {

          var subfields = data.substr(1).split('‡').map(function (codeAndValue) {
            var code = codeAndValue.substr(0, 1);
            var value = codeAndValue.substr(1);
            return { code: code, value: value };
          });

          return _lodash2.default.assign({}, block.data.field, {
            tag: tag,
            ind1: ind1,
            ind2: ind2,
            subfields: subfields
          });
        }
      }
    }
  }, {
    key: 'applyStylesToFieldBlock',
    value: function applyStylesToFieldBlock(chars, text) {
      if (text.length < 8) return chars;

      chars = chars.set(0, _draftJs.CharacterMetadata.applyStyle(chars.get(0), 'tag')).set(1, _draftJs.CharacterMetadata.applyStyle(chars.get(1), 'tag')).set(2, _draftJs.CharacterMetadata.applyStyle(chars.get(2), 'tag')).set(4, _draftJs.CharacterMetadata.applyStyle(chars.get(4), 'ind')).set(5, _draftJs.CharacterMetadata.applyStyle(chars.get(5), 'ind'));

      var textArray = text.split('');

      textArray.forEach(function (char, index) {
        if (index < 6) return;

        var previousCharacter = index > 0 ? textArray[index - 1] : null;

        if (char === '‡') {
          chars = chars.set(index, _draftJs.CharacterMetadata.applyStyle(chars.get(index), 'sub'));
        } else if (previousCharacter === '‡') {
          chars = chars.set(index, _draftJs.CharacterMetadata.applyStyle(chars.get(index), 'sub'));
        } else {
          chars = chars.set(index, _draftJs.CharacterMetadata.EMPTY);
        }
      });
      return chars;
    }
  }, {
    key: 'updateEditorState',
    value: function updateEditorState(record) {

      if (record === this._recordFromCurrentEditorContent) {
        return;
      }

      if (record) {

        var contentState = this.transformRecordToContentState(record);
        var editorState = _draftJs.EditorState.push(this.state.editorState, contentState);

        this.setState({ editorState: editorState });
      }
    }
  }, {
    key: 'transformRecordToContentState',
    value: function transformRecordToContentState(record) {

      var LDR = {
        tag: 'LDR',
        value: record.leader
      };

      var fields = record.fields.slice();
      fields.unshift(LDR);

      var blocks = fields.map(this.transformFieldToBlock.bind(this));

      var contentState = _draftJs.ContentState.createFromBlockArray(blocks);

      return contentState;
    }
  }, {
    key: 'transformFieldToBlock',
    value: function transformFieldToBlock(field) {

      var text = fieldAsString(field);
      var chars = (0, _immutable.List)((0, _immutable.Repeat)(_draftJs.CharacterMetadata.EMPTY, text.length));
      chars = this.applyStylesToFieldBlock(chars, text);

      var fieldType = field.subfields !== undefined ? 'datafield' : 'controlfield';

      var contentBlock = new _draftJs.ContentBlock({
        key: (0, _draftJs.genKey)(),
        text: text,
        characterList: chars,
        type: 'field',
        data: (0, _immutable.Map)({ field: field, fieldType: fieldType })
      });

      return contentBlock;
    }
  }, {
    key: 'handleKeyCommand',
    value: function handleKeyCommand(command) {

      if (command === 'add-subfield-marker') {
        var editorState = this.state.editorState;


        var contentState = _draftJs.Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), '‡', editorState.getCurrentInlineStyle(), null);
        var newEditorState = _draftJs.EditorState.push(editorState, contentState, 'insert-characters');
        this.onChange(_draftJs.EditorState.forceSelection(newEditorState, contentState.getSelectionAfter()));

        return 'handled';
      }

      return 'not-handled';
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var blockRenderMap = (0, _immutable.Map)({
        'field': {
          element: 'div'
        }
      });

      var extendedBlockRenderMap = _draftJs.DefaultDraftBlockRenderMap.merge(blockRenderMap);
      var editorState = this.state.editorState;


      var colorStyleMap = {
        tag: {
          color: '#448aff'
        },
        ind: {
          color: '#448aff'
        },
        sub: {
          color: '#e57373'
        }
      };

      return _react2.default.createElement(
        'div',
        { className: 'marc-record-editor' },
        _react2.default.createElement(_draftJs.Editor, {
          editorState: editorState,
          onChange: this.onChange,
          handleKeyCommand: function handleKeyCommand(e) {
            return _this2.handleKeyCommand(e);
          },
          blockRendererFn: fieldBlockRenderer,
          blockRenderMap: extendedBlockRenderMap,
          customStyleMap: colorStyleMap,
          keyBindingFn: myKeyBindingFn
        })
      );
    }
  }]);

  return MarcEditor;
}(_react2.default.Component);

MarcEditor.propTypes = {
  record: _proptypes2.default.object,
  onFieldClick: _proptypes2.default.func,
  onRecordUpdate: _proptypes2.default.func.isRequired
};


function fieldBlockRenderer(contentBlock) {
  var type = contentBlock.getType();
  var content = contentBlock.getText();
  var key = contentBlock.getKey();

  if (type === 'field') {
    return {
      component: _draftJs.EditorBlock,
      editable: true,
      props: { content: content, key: key }
    };
  }
  return null;
}

var hasCommandModifier = _draftJs.KeyBindingUtil.hasCommandModifier;


function myKeyBindingFn(e) {

  if (e.keyCode === 118) {
    return 'add-subfield-marker';
  }

  if (e.keyCode === 81 && hasCommandModifier(e)) {
    return 'add-subfield-marker';
  }
  return (0, _draftJs.getDefaultKeyBinding)(e);
}
//# sourceMappingURL=marc-editor-panel.js.map