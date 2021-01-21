import React, { useContext, useState } from 'react';
import { costingInfoContext } from '../../CostingDetailStepTwo';

function BoughtOutPart(props) {
  const { children, item } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!IsOpen)
  }

  const costData = useContext(costingInfoContext);

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}
            {/* <div className={`${IsOpen ? 'Open' : 'Close'}`}></div> */}
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{''}</td>
        <td>{0}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{0}</td>
      </tr>
    </ >
  );
}

export default BoughtOutPart;