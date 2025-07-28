import React from 'react';

 const Buttons =(props)=> {
    return (
      <div className="buttons">
        <button id="clear" onClick={props?.onClear}>AC</button>
        <button id="parenthesis-open" onClick={props?.onParenthesis}>(</button>
        <button id="parenthesis-close" onClick={props?.onParenthesis}>)</button>
        <button id="modulo" onClick={props?.onOperator}>%</button>

        <button id="seven" onClick={props?.onDigit}>7</button>
        <button id="eight" onClick={props?.onDigit}>8</button>
        <button id="nine" onClick={props?.onDigit}>9</button>
        <button id="divide" onClick={props?.onOperator}>/</button>

        <button id="four" onClick={props?.onDigit}>4</button>
        <button id="five" onClick={props?.onDigit}>5</button>
        <button id="six" onClick={props?.onDigit}>6</button>
        <button id="multiply" onClick={props?.onOperator}>*</button>

        <button id="one" onClick={props?.onDigit}>1</button>
        <button id="two" onClick={props?.onDigit}>2</button>
        <button id="three" onClick={props?.onDigit}>3</button>
        <button id="subtract" onClick={props?.onOperator}>-</button>

        <button id="zero" onClick={props?.onDigit}>0</button>
        <button id="decimal" onClick={props?.onDecimal}>.</button>
        <button id="equals" onClick={props?.onEqual}>=</button>
        <button id="add" onClick={props?.onOperator}>+</button>
      </div>
    )
  }
export default Buttons;