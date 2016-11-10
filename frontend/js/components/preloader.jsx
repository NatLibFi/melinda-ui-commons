import React from 'react';
import classNames from 'classnames';

export class Preloader extends React.Component {

  static propTypes = {
    size: React.PropTypes.string,
  }
  

  render() {
    const preloaderClasses = classNames('preloader-wrapper', 'active', this.props.size);

    return (
      <div className={preloaderClasses}>
        <div className="spinner-layer spinner-blue-only">
          <div className="circle-clipper left">
            <div className="circle" />
          </div><div className="gap-patch">
            <div className="circle" />
          </div><div className="circle-clipper right">
            <div className="circle" />
          </div>
        </div>
      </div>

    );
  }
}
