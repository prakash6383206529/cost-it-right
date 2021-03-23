import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';
import { getRMCCTabData, } from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';

function AssemblyPart(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const costData = useContext(costingInfoContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const dispatch = useDispatch()

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getRMCCTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          //let Data = res.data.DataList[0].CostingChildPartDetails;
          let Data = res.data.DataList[0];
          props.toggleAssembly(BOMLevel, PartNumber, Data)
        }
      }))
    } else {
      props.toggleAssembly(BOMLevel, PartNumber)
    }
  }

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    setDrawerOpen(false)
  }

  const nestedPartComponent = children && children.map(el => {
    if (el.PartType === 'Part') {
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
      setAssemblyOperationCost={props.setAssemblyOperationCost}
      setAssemblyToolCost={props.setAssemblyToolCost}
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
      <tr className="costing-highlight-row accordian-row">
        <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
          <td>
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
              <div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>{item && item.PartNumber}
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item.CostingPartDetails && item.CostingPartDetails.TotalRawMaterialsCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>{item.CostingPartDetails && item.CostingPartDetails.TotalBoughtOutPartCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>
            {item.CostingPartDetails && item.CostingPartDetails.TotalConversionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0}
            {
              item.CostingPartDetails && (item.CostingPartDetails.TotalOperationCostPerAssembly !== null) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Conversion Cost:- ${item.CostingPartDetails.TotalOperationCostPerAssembly}`}
                    <br></br>
                    {`Child Parts Conversion Cost:- ${item.CostingPartDetails.TotalConversionCost - item.CostingPartDetails.TotalOperationCostPerAssembly}`}
                  </span>
                </div> : ''
            }
          </td>
          <td>{item.CostingPartDetails && item.CostingPartDetails.Quantity !== undefined ? checkForNull(item.CostingPartDetails.Quantity) : 1}</td>
          {/* <td>{1}</td> */}
          <td>{item.CostingPartDetails && item.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>{item.CostingPartDetails && item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        </div>
        <td>
          <button
            type="button"
            className={'user-btn add-oprn-btn'}
            onClick={DrawerToggle}>
            <div className={'plus'}></div>Add Operation</button>
        </td>
      </tr>

      {/* {IsOpen && nestedPartComponent} */}
      {item.IsOpen && nestedPartComponent}

      {/* {IsOpen && nestedBOP} */}
      {item.IsOpen && nestedBOP}

      {/* {IsOpen && nestedAssembly} */}
      {item.IsOpen && nestedAssembly}

      {IsDrawerOpen && <AddAssemblyOperation
        isOpen={IsDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        item={item}
        setAssemblyOperationCost={props.setAssemblyOperationCost}
        setAssemblyToolCost={props.setAssemblyToolCost}
      />}
    </ >
  );
}

export default AssemblyPart;