import React, { useContext, useState } from 'react';
import { useDispatch, } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';
import { getRMCCTabData, saveCostingRMCCTab } from '../../../actions/Costing';

function AssemblyPart(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const costData = useContext(costingInfoContext);

  const dispatch = useDispatch()

  const toggle = (BOMLevel, PartName) => {
    setIsOpen(!IsOpen)
    if (Object.keys(costData).length > 0 && BOMLevel !== "L0") {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getRMCCTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0].CostingChildPartDetails;
          props.toggleAssembly(BOMLevel, PartName, Data)
        }
      }))
    } else {
      props.toggleAssembly(BOMLevel, PartName)
    }
  }

  const nestedPartComponent = children && children.map(el => {
    console.log('Part Component uppr', el)
    if (el.PartType === 'Part') {
      console.log('Part Component', el)
      return <PartCompoment
        index={index}
        item={el}
        rmData={el.CostingPartDetails.CostingRawMaterialsCost}
        bopData={el.CostingPartDetails !== null && el.CostingPartDetails.CostingBoughtOutPartCost}
        ccData={el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost}
        setPartDetails={props.setPartDetails}
        setRMCost={props.setRMCost}
        setBOPCost={props.setBOPCost}
        setProcessCost={props.setProcessCost}
        setOperationCost={props.setOperationCost}
        setToolCost={props.setToolCost}
      />
    }
  })

  const nestedAssembly = children && children.map(el => {
    if (el.PartType !== 'Sub Assembly') return false;
    return <AssemblyPart
      index={index}
      item={el}
      children={el.CostingChildPartDetails}
      setPartDetails={props.setPartDetails}
      toggleAssembly={props.toggleAssembly}
      setRMCost={props.setRMCost}
      setBOPCost={props.setBOPCost}
      setProcessCost={props.setProcessCost}
      setOperationCost={props.setOperationCost}
      setToolCost={props.setToolCost}
    />
  })

  const nestedBOP = children && children.map(el => {
    if (el.PartType !== 'BOP') return false;
    return <BoughtOutPart
      index={index}
      item={el}
      children={el.CostingChildPartDetails}
    />
  })

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={() => toggle(item.BOMLevel, item.PartName)}>
        <td >
          <span style={{ position: 'relative' }} className={`cr-prt-nm cr-prt-link ${item && item.BOMLevel}`}>
            {item && item.PartName}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
      </tr>

      {/* {IsOpen && nestedPartComponent} */}
      {item.IsOpen && nestedPartComponent}

      {/* {IsOpen && nestedBOP} */}
      {item.IsOpen && nestedBOP}

      {/* {IsOpen && nestedAssembly} */}
      {item.IsOpen && nestedAssembly}

    </ >
  );
}

export default AssemblyPart;