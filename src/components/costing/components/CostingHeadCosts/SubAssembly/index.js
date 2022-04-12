import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';
import { getRMCCTabData, saveAssemblyBOPHandlingCharge, setAllCostingInArray, } from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import { ViewCostingContext } from '../../CostingDetails';
import { EMPTY_GUID } from '../../../../../config/constants';
import _ from 'lodash'
import DayTime from '../../../../common/DayTimeWrapper';
import AddBOPHandling from '../../Drawers/AddBOPHandling';

function AssemblyPart(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)
  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)

  const CostingViewMode = useContext(ViewCostingContext);
  const costData = useContext(costingInfoContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, setArrayForCosting } = useSelector(state => state.costing)
  const dispatch = useDispatch()

  const toggle = (BOMLevel, PartNumber) => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        AssemCostingId: costData.CostingId,
        subAsmCostingId: props.subAssembId !== null ? props.subAssembId : EMPTY_GUID,
        EffectiveDate: CostingEffectiveDate
      }

      dispatch(getRMCCTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          if (Data.CostingPartDetails.IsApplyBOPHandlingCharges) {
            let obj = {
              IsApplyBOPHandlingCharges: Data.CostingPartDetails.IsApplyBOPHandlingCharges,
              BOPHandlingPercentage: Data.CostingPartDetails.BOPHandlingPercentage,
              BOPHandlingCharges: Data.CostingPartDetails.BOPHandlingCharges,
              BOPHandlingChargeApplicability: Data.CostingPartDetails.BOPHandlingChargeApplicability
            }
            dispatch(saveAssemblyBOPHandlingCharge(obj, () => {
            }))
          }
          // let tempArr = setArrayForCosting
          let array = [];
          array = JSON.parse(localStorage.getItem('costingArray'))
          Data.CostingChildPartDetails && Data.CostingChildPartDetails.map(item => {
            array.push(item)
          })
          let uniqueArary = _.uniqBy(array, v => JSON.stringify([v.PartNumber, v.AssemblyPartNumber]))
          localStorage.setItem('costingArray', JSON.stringify(uniqueArary));
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    setDrawerOpen(false)
  }

  //THSI IS FOR BOP HANDLING DRAWER

  const bopHandlingDrawer = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setIsOpenBOPDrawer(true)
  }

  const handleBOPCalculationAndClose = (e = '') => {
    setIsOpenBOPDrawer(false)
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
        setBOPHandlingCost={props.setBOPHandlingCost}
        setConversionCost={props.setConversionCost}
        setToolCost={props.setToolCost}
        subAssembId={item.CostingId}
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
      setBOPHandlingCost={props.setBOPHandlingCost}
      setConversionCost={props.setConversionCost}
      setToolCost={props.setToolCost}
      setAssemblyOperationCost={props.setAssemblyOperationCost}
      setAssemblyToolCost={props.setAssemblyToolCost}
      subAssembId={item.CostingId}
      setBOPCostWithAsssembly={props.setBOPCostWithAsssembly}

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
      <tr className="costing-highlight-row accordian-row" key={item.PartId}>
        <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
          <td >
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.PartType !== "Sub Assembly" && item.PartType !== "Assembly" && "L1"}`}>
              <div className={`${item.CostingPartDetails.IsOpen ? 'Open' : 'Close'}`}></div>{item && item.PartNumber}
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity ? checkForDecimalAndNull(item.CostingPartDetails.TotalRawMaterialsCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity ? checkForDecimalAndNull(item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>
            {item?.CostingPartDetails?.TotalConversionCostWithQuantity ? checkForDecimalAndNull(checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity), initialConfiguration.NoOfDecimalForPrice) : 0}
            {
              (item?.CostingPartDetails?.TotalOperationCostPerAssembly || item.CostingPartDetails?.TotalOperationCostSubAssembly) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Conversion Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Sub Assembly's Conversion Cost:- ${checkForDecimalAndNull(item.CostingPartDetails?.TotalOperationCostSubAssembly, initialConfiguration.NoOfDecimalForPrice)}`}
                    <br></br>
                    {/* {`Child Parts Conversion Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost - item.CostingPartDetails.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice)}`} */}
                    {`Child Parts Conversion Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TotalOperationCostComponent, initialConfiguration.NoOfDecimalForPrice)}`}
                  </span>
                </div> : ''
            }
          </td>
          <td>{item?.CostingPartDetails?.Quantity ? checkForNull(item.CostingPartDetails.Quantity) : 1}</td>
          {/* <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td> */}
          <td>{'-'}</td>
          {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>} */}
          {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>} */}
          {costData.IsAssemblyPart && <td>{checkForDecimalAndNull(checkForNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity), initialConfiguration.NoOfDecimalForPrice)}</td>}

        </div>
        {/* 
        {
          costData.IsAssemblyPart && <td>
            {
            }
          </td>
        } */}
        <td>
          <button
            type="button"
            className={'user-btn add-oprn-btn ml-1'}
            onClick={bopHandlingDrawer}>
            <div className={`${item?.CostingPartDetails?.IsApplyBOPHandlingCharges !== null && item?.CostingPartDetails?.IsApplyBOPHandlingCharges.IsApplyBOPHandlingCharges ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`Insert H`}</button>

          {checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly) !== 0 ?
            <button
              type="button"
              className={'user-btn add-oprn-btn'}
              onClick={DrawerToggle}>
              <div className={'fa fa-eye pr-1'}></div>OPER</button>
            :
            <button
              type="button"
              className={'user-btn add-oprn-btn'}
              onClick={DrawerToggle}>
              <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{'OPER'}</button>}
        </td>
      </tr>

      {item.CostingPartDetails.IsOpen && nestedPartComponent}

      {item.CostingPartDetails.IsOpen && nestedBOP}

      {item.CostingPartDetails.IsOpen && nestedAssembly}

      {IsDrawerOpen && <AddAssemblyOperation
        isOpen={IsDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        item={item}
        CostingViewMode={CostingViewMode}
        setAssemblyOperationCost={props.setAssemblyOperationCost}
        setAssemblyToolCost={props.setAssemblyToolCost}
      />}
      {
        isOpenBOPDrawer &&
        <AddBOPHandling
          isOpen={isOpenBOPDrawer}
          item={item}
          closeDrawer={handleBOPCalculationAndClose}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
          setBOPCostWithAsssembly={props.setBOPCostWithAsssembly}
        />
      }
    </ >
  );
}

export default AssemblyPart;