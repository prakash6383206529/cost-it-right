import React, { useContext, useState } from 'react';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import PartCompoment from '../Part';

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
        <td><span className={`cr-prt-nm cr-prt-link ${item.level} ${IsOpen ? 'Open' : 'Close'}`}>{item.PartName}</span></td>
        <td>{item.Type}</td>
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