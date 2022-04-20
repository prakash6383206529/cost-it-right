import Calculator from "./component/Calculator";
import Draggable from 'react-draggable';
import React, { useState } from "react";
const CalculatorWrapper = () => {
  const [isShowCal, setIsShowCal] = useState(false)
  const showCalculator = () => {
    setIsShowCal(!isShowCal)
  }
  return (
    <>
      <button className="CalculatorIcon cr-cl-icon cal-btn" type="buton" title="Calculator" onClick={showCalculator}></button>
      {isShowCal && <div className="calculator-wrapper">
        <Draggable>
          <div>
            <Calculator showCal={showCalculator} />
          </div>
        </Draggable>
      </div>}
    </>
  )
}
export default CalculatorWrapper;