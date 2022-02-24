import React from 'react';
import Backspace from '../../../../assests/images/backspace.svg'
const DisplayToolbar= (props)=> {
    
    const onTextareaChanged=()=> {
        // Don't care
    }
    // const onTextareaChanged = onTextareaChanged.bind();

    return (
      <div className="display-toolbar">
        <form className="display">
          <textarea className="display-formula" onChange={onTextareaChanged} value={props.formula.join("")} ></textarea>
          <textarea className="display-input" id="display" rows="1" onChange={onTextareaChanged} value={props.input}></textarea>
        </form>
        <div className="toolbar">
          <div className="toolbar-item" id="view-history" onClick={props.onHistory}>{props.isShowHistory ? "Keypad" : "History"}</div>
          <div>
            <span className="toolbar-item" onClick={props.onBackspace} id="backspace"><img src={Backspace} alt='backspace'/></span>
          </div>
        </div>
      </div>
    )
  }
export default DisplayToolbar;