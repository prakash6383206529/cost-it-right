import React, { useContext, useState } from 'react';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';

function AssemblyPart(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!IsOpen)
  }

  const costData = useContext(costingInfoContext);

  const nestedComments = (props.children || []).map(comment => {
    if (comment.Type !== 'Part') return false;
    return <PartCompoment
      index={index}
      item={comment}
      //children={comment.children}
      rmData={comment.CostingRawMaterialsCost}
      bopData={comment.CostingBoughtOutPartCost}
      ccData={comment.CostingConversionCost}
      type="child"
    />
  })

  const nestedAssembly = (props.children || []).map(comment => {
    if (comment.Type !== 'Sub Assembly') return false;
    return <AssemblyPart
      index={index}
      item={comment}
      children={comment.children}
    />
  })

  const nestedBOP = (props.children || []).map(comment => {
    if (comment.Type !== 'BOP') return false;
    return <BoughtOutPart
      index={index}
      item={comment}
      children={comment.children}
    />
  })

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={toggle}>
        <td><span className={`cr-prt-nm cr-prt-link ${item.level} ${IsOpen ? 'Open' : 'Close'}`}>{item.PartName}</span></td>
        <td>{item.Type}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
      </tr>

      {IsOpen && nestedComments}

      {IsOpen && nestedBOP}

      {IsOpen && nestedAssembly}

    </ >
  );
}

export default AssemblyPart;