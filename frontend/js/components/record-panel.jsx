import React from 'react';
import { MarcRecordPanel } from './marc-record-panel';
import '../../styles/components/record-panel.scss';
import {MarcEditor} from './marc-editor-panel';
import classNames from 'classnames';

export class RecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.object,
    error: React.PropTypes.object,
    showHeader: React.PropTypes.bool,
    title: React.PropTypes.string,
    editable: React.PropTypes.bool,
    children: React.PropTypes.oneOfType([ React.PropTypes.object, React.PropTypes.array ]),
    onRecordUpdate: React.PropTypes.func,
    onFieldClick: React.PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'PREVIEW'
    };
  }

  componentDidMount() {
    if (this.props.showHeader && this.props.editable) {
      window.$(this._tabs).tabs();
    }
  }

  handleTabChange(event, nextTab) {
    event.preventDefault();
    if (this.tabsEnabled()) {
      this.setState({currentTab: nextTab});
    }
  }

  handleRecordUpdate(nextRecord) {
    if (this.props.onRecordUpdate) {
      this.props.onRecordUpdate(nextRecord);  
    }
  }

  tabsEnabled() {
    return this.props.record !== undefined;
  }

  renderRecord() {
    return (
      <div>

        {this.props.showHeader ? this.renderHeader() : null }
        {this.state.currentTab == 'EDIT' ? this.renderEditor(): this.renderPreview()  }

      </div>
    );
  }

  renderHeader() {
    const tabClasses = classNames('tab col s2', {
      'tab-disabled': !this.tabsEnabled()
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

        {this.props.children}
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
