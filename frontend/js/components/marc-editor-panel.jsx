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
import '../../styles/components/marc-record-editor';
import _ from 'lodash';
import uuid from 'node-uuid';
import { Repeat, Map, List } from 'immutable';
import MarcRecord from 'marc-record-js';

// Until this has been merged, we are using custom version of draftjs: https://github.com/facebook/draft-js/pull/667
import {getDefaultKeyBinding, KeyBindingUtil, Modifier, convertToRaw, EditorBlock, genKey,
  DefaultDraftBlockRenderMap, Editor, EditorState, ContentState, ContentBlock, CharacterMetadata} from 'draft-js';


function fieldAsString(field) {
  if (field.subfields) {
    const subfields = field.subfields.map(sub => `‡${sub.code}${sub.value}`).join('');
    return `${field.tag} ${field.ind1}${field.ind2} ${subfields}`;
  } else {
    return `${field.tag}    ${field.value}`;
  }
}

export class MarcEditor extends React.Component {

  static propTypes = {
    record: PropTypes.object,
    onFieldClick: PropTypes.func,
    onRecordUpdate: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    if (props.record) {

      const contentState = this.transformRecordToContentState(props.record);
      const editorState = EditorState.createWithContent(contentState);
      this._currentRecStr = props.record.toString();
      this.state = {editorState};

    } else {

      const defaultContentState = ContentState.createFromText('');
      this.state = {editorState: EditorState.createWithContent(defaultContentState)};

    }

    this.onChange = (editorState) => {

      var startKey = editorState.getSelection().getStartKey();
      var selectedBlock = editorState
        .getCurrentContent()
        .getBlockForKey(startKey);

      let nextContentState = editorState.getCurrentContent();

      if (this.state.editorState.getCurrentContent() !== editorState.getCurrentContent()) {

        nextContentState = nextContentState.updateIn(['blockMap'], blockMap => {


          let chars = this.applyStylesToFieldBlock(selectedBlock.getCharacterList(), selectedBlock.getText());
          let updatedBlock = selectedBlock
            .set('characterList', chars)
            .updateIn(['data', 'field'], field => _.set(field, 'hasBeenEdited', true));

          return blockMap.set(selectedBlock.getKey(), updatedBlock);
        });
      }

      let nextEditorState = EditorState.push(editorState, nextContentState);

      this.setState({editorState: nextEditorState});
      this.debouncedRecordUpdate(nextEditorState);
    };

    this.debouncedRecordUpdate = _.debounce(editorState => {
      const raw = convertToRaw(editorState.getCurrentContent());
      const recStr = raw.blocks.map(b => b.text).join('\n');

      if (this._currentRecStr == recStr) {
        return;
      }

      this._currentRecStr = recStr;

      const fieldsIncludingLeader = raw.blocks.map((block) => {
        if (block.data.field && block.data.field.hasBeenEdited !== true) return block.data.field;

        const field = this.convertBlockToField(block);
        field.uuid = uuid.v4();

        return field;
      });
      const leader = fieldsIncludingLeader.find(field => field.tag === 'LDR');
      const fields = _.without(fieldsIncludingLeader, leader);

      const updatedRecord = new MarcRecord({
        leader: leader.value,
        fields: fields
      });

      this._recordFromCurrentEditorContent = updatedRecord;
      this.props.onRecordUpdate(this._recordFromCurrentEditorContent);

    }, 250);
  }

  componentWillReceiveProps(nextProps) {
    this.updateEditorState(nextProps.record);
  }

  convertBlockToField(block) {

    const fieldLine = block.text;

    var tag = fieldLine.substr(0,3);
    var ind1 = fieldLine.substr(4,1);
    var ind2 = fieldLine.substr(5,1);
    var data = fieldLine.substr(7);

    if (tag == 'LDR') {
      return _.assign({}, block.data.field, { value: data });
    } else {

      if (data.substr(0,1) !== '‡') {
        //controlfield

        return _.assign({}, block.data.field, { tag: tag, value: data });

      } else {

        const subfields = data.substr(1).split('‡').map(function(codeAndValue) {
          const code = codeAndValue.substr(0,1);
          const value = codeAndValue.substr(1);
          return {code, value};
        });

        return _.assign({}, block.data.field, {
          tag,
          ind1,
          ind2,
          subfields
        });

      }
    }
  }

  applyStylesToFieldBlock(chars, text) {
    if (text.length < 8) return chars;

    chars = chars
      .set(0, CharacterMetadata.applyStyle(chars.get(0), 'tag'))
      .set(1, CharacterMetadata.applyStyle(chars.get(1), 'tag'))
      .set(2, CharacterMetadata.applyStyle(chars.get(2), 'tag'))
      .set(4, CharacterMetadata.applyStyle(chars.get(4), 'ind'))
      .set(5, CharacterMetadata.applyStyle(chars.get(5), 'ind'));

    const textArray = text.split('');

    textArray.forEach((char, index) => {
      if (index < 6) return;

      const previousCharacter = index > 0 ? textArray[index-1] : null;

      if (char === '‡') {
        chars = chars.set(index, CharacterMetadata.applyStyle(chars.get(index), 'sub'));
      } else if (previousCharacter === '‡') {
        chars = chars.set(index, CharacterMetadata.applyStyle(chars.get(index), 'sub'));
      } else {
        chars = chars.set(index, CharacterMetadata.EMPTY);
      }
    });
    return chars;
  }

  updateEditorState(record) {

    if (record === this._recordFromCurrentEditorContent) {
      return;
    }

    if (record) {

      const contentState = this.transformRecordToContentState(record);
      const editorState = EditorState.push(this.state.editorState, contentState);

      this.setState({editorState});
    }
  }

  transformRecordToContentState(record) {

    const LDR = {
      tag: 'LDR',
      value: record.leader
    };

    const fields = record.fields.slice();
    fields.unshift(LDR);

    const blocks = fields.map(this.transformFieldToBlock.bind(this));

    const contentState = ContentState.createFromBlockArray(blocks);

    return contentState;
  }

  transformFieldToBlock(field) {

    const text = fieldAsString(field);
    let chars = List(Repeat(CharacterMetadata.EMPTY, text.length));
    chars = this.applyStylesToFieldBlock(chars, text);

    const fieldType = field.subfields !== undefined ? 'datafield' : 'controlfield';

    const contentBlock = new ContentBlock({
      key: genKey(),
      text,
      characterList: chars,
      type: 'field',
      data: Map({ field, fieldType })
    });

    return contentBlock;
  }

  handleKeyCommand(command) {

    if (command === 'add-subfield-marker') {

      const {editorState} = this.state;

      var contentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), '‡', editorState.getCurrentInlineStyle(), null);
      var newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
      this.onChange(EditorState.forceSelection(newEditorState, contentState.getSelectionAfter()));

      return 'handled';
    }

    return 'not-handled';
  }

  render() {
    const blockRenderMap = Map({
      'field': {
        element: 'div'
      }
    });

    const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
    const {editorState} = this.state;

    const colorStyleMap = {
      tag: {
        color: '#448aff',
      },
      ind: {
        color: '#448aff',
      },
      sub: {
        color: '#e57373',
      }
    };

    return (<div className="marc-record-editor">
      <Editor
        editorState={editorState}
        onChange={this.onChange}
        handleKeyCommand={(e) => this.handleKeyCommand(e)}
        blockRendererFn={fieldBlockRenderer}
        blockRenderMap={extendedBlockRenderMap}
        customStyleMap={colorStyleMap}
        keyBindingFn={myKeyBindingFn}
        />
      </div>
    );
  }
}

function fieldBlockRenderer(contentBlock) {
  const type = contentBlock.getType();
  const content = contentBlock.getText();
  const key = contentBlock.getKey();

  if (type === 'field') {
    return {
      component: EditorBlock,
      editable: true,
      props: { content, key }
    };
  }
  return null;
}

const {hasCommandModifier} = KeyBindingUtil;

function myKeyBindingFn(e) {

  if (e.keyCode === 118) {
    return 'add-subfield-marker';
  }

  if (e.keyCode === 81 && hasCommandModifier(e)) {
    return 'add-subfield-marker';
  }
  return getDefaultKeyBinding(e);
}
