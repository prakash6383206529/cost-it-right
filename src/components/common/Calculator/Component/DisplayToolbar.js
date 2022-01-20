import React from 'react';
import './DisplayToolbar.scss';
import Backspace from '../../../../assests/images/backspace.svg';

export default class DisplayToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.onTextareaChanged = this.onTextareaChanged.bind(this);
  }

  onTextareaChanged() {
    // Don't care
  }

  render() {
    return (
      <div className="display-toolbar">
        <form className="display">
          <textarea className="display-formula" onChange={this.onTextareaChanged} value={this.props.formula.join("")} ></textarea>
          <textarea className="display-input" id="display" rows="1" onChange={this.onTextareaChanged} value={this.props.input}></textarea>
        </form>
        <div className="toolbar">
          <div className="toolbar-item" id="view-history" onClick={this.props.onHistory}>{this.props.isShowHistory ? "Keypad" : "History"}</div>
          <div>
            <span className="toolbar-item" onClick={this.props.onBackspace} id="backspace"><div className='backspace'></div></span>
          </div>
        </div>
      </div>
    )
  }
}