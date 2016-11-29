import React from 'react';
import { MarcRecordPanel } from './marc-record-panel';
import { Preloader } from './preloader';
import '../../styles/components/record-panel.scss';
import {MarcEditor} from './marc-editor-panel';

export class RecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.object,
    error: React.PropTypes.object,
    status: React.PropTypes.string,
    showHeader: React.PropTypes.bool,
    title: React.PropTypes.string,
    editable: React.PropTypes.bool,
    children: React.PropTypes.array,
    onRecordUpdate: React.PropTypes.func
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
    this.setState({currentTab: nextTab});
  }

  renderHeader() {
    
    const previewTab = () => (<li className="tab col s2"><a href="#" onClick={(e) => this.handleTabChange(e, 'PREVIEW')}>Esikatselu</a></li>);
    const editTab = () => (<li className="tab col s2"><a href="#" onClick={(e) => this.handleTabChange(e, 'EDIT')}>Muokkaus</a></li>);

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

  renderRecord() {
    return (
      <div>
        {this.props.showHeader ? this.renderHeader() : null }

        {this.state.currentTab == 'EDIT' ? this.renderEditor(): this.renderPreview()  }
      

      </div>
    );
  }

  renderPreview() {
    return (
      <div>
        <div className="card-content">
          <MarcRecordPanel record={this.props.record}/>
        </div>

        {this.props.children}
      </div>
      
    );
  }

  handleRecordUpdate(nextRecord) {
    if (this.props.onRecordUpdate) {
      this.props.onRecordUpdate(nextRecord);  
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

  renderError() {
    return (
      <div className="load-error red lighten-2">
        <div className="heading">Tietueen lataus epäonnistui</div>
        {this.props.error.message}
      </div>
    );
  }

  renderSpinner() {
    return (
      <div>
        {this.props.showHeader ? this.renderHeader() : null }
        <div className="card-content">
          <Preloader />
        </div>
      </div>
    );
  }
  renderEmpty() {
    return (
      <div>
        {this.props.showHeader ? this.renderHeader() : null }
      </div>
    ); 
  }
  
  renderContent() {

    switch(this.props.status) {
      case 'ERROR': return this.renderError();
      case 'COMPLETE': return this.renderRecord();
      case 'LOAD_ONGOING': return this.renderSpinner();
      case 'NOT_LOADED': return this.renderEmpty();
    }
    
    return null;
  }

  render() {
    return (
      <div className="marc-record-container card darken-1">
        {this.renderContent()}
      </div>
    );
  }
}
