import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';
import { getCostingLabourDetails, getRMCCTabData, openCloseStatus, saveAssemblyBOPHandlingCharge, saveAssemblyPartRowCostingCalculation, saveCostingLabourDetails, setIsBreakupBoughtOutPartCostingFromAPI, setRMCCData } from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, loggedInUserId, showBopLabel, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import { CostingStatusContext, IsPartType, IsNFR, ViewCostingContext } from '../../CostingDetails';
import { ASSEMBLYNAME, EMPTY_GUID, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import _ from 'lodash'
import AddBOPHandling from '../../Drawers/AddBOPHandling';
import Toaster from '../../../../common/Toaster';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useEffect } from 'react';
import AddLabourCost from '../AdditionalOtherCost/AddLabourCost';
import { createToprowObjAndSave } from '../../../CostingUtil';
import AddAssemblyProcess from '../../Drawers/AddAssemblyProcess';

function AssemblyPart(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)
  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)
  const [isOpenLabourDrawer, setIsOpenLabourDrawer] = useState(false)
  const [labourTableData, setLabourTableData] = useState([])
  const [labourObj, setLabourObj] = useState(false)
  const [totalLabourCost, setTotalLabourCost] = useState(0)
  const [isBOPExists, setIsBOPExists] = useState(false)
  const [callSaveAssemblyApi, setCallSaveAssemblyApi] = useState(false)
  const [isProcessDrawerOpen, setIsProcessDrawerOpen] = useState(false)
  const { partNumberAssembly } = useSelector(state => state.costing)
  const costingApprovalStatus = useContext(CostingStatusContext);
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const CostingViewMode = useContext(ViewCostingContext);
  const costData = useContext(costingInfoContext);
  const isPartType = useContext(IsPartType);

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const netPOPrice = useContext(NetPOPriceContext);
  const { DiscountCostData, CostingEffectiveDate, bomLevel, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, getAssemBOPCharge, openAllTabs, currencySource,exchangeRateData } = useSelector(state => state.costing)
  const isNFR = useContext(IsNFR);
  const dispatch = useDispatch()
  const toggle = (BOMLevel, PartNumber) => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
    dispatch(openCloseStatus({ bopHandling: isBOPExists && !IsOpen, }))
    if (isNFR && !openAllTabs) {
      Toaster.warning("All Raw Material's price has not added in the Raw Material master against this vendor and plant.")
      return false;
    }
    if ((partNumberAssembly !== '' && partNumberAssembly !== PartNumber) ||
      (partNumberAssembly !== '' && partNumberAssembly === PartNumber && bomLevel !== BOMLevel)) {
      Toaster.warning('Close accordion first.')
      return false
    }

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        AssemCostingId: item.AssemblyCostingId,
        subAsmCostingId: props.subAssembId !== null ? props.subAssembId : EMPTY_GUID,
        EffectiveDate: CostingEffectiveDate
      }

      dispatch(getRMCCTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          dispatch(setIsBreakupBoughtOutPartCostingFromAPI(res?.data?.DataList[0]?.IsBreakupBoughtOutPart))
          if (Data?.CostingPartDetails?.IsApplyBOPHandlingCharges) {
            let obj = {
              IsApplyBOPHandlingCharges: Data?.CostingPartDetails?.IsApplyBOPHandlingCharges,
              BOPHandlingPercentage: Data?.CostingPartDetails?.BOPHandlingPercentage,
              BOPHandlingCharges: Data?.CostingPartDetails?.BOPHandlingCharges,
              BOPHandlingChargeApplicability: Data?.CostingPartDetails?.BOPHandlingChargeApplicability
            }
            dispatch(saveAssemblyBOPHandlingCharge(obj, () => {
            }))
          }
          // let tempArr = setArrayForCosting
          let array = [];
          let obj = JSON.parse(sessionStorage.getItem('costingArray'))?.filter(element => element.PartType === 'Assembly' && PartNumber === element?.PartNumber)

          if (obj?.length > 0) {
            array = [Data]
            Data.CostingChildPartDetails && Data.CostingChildPartDetails.map(item => {
              array.push(item)
              return null
            })
            sessionStorage.setItem('costingArray', JSON.stringify(array))
          } else {
            array = JSON.parse(sessionStorage.getItem('costingArray'))
            Data.CostingChildPartDetails && Data.CostingChildPartDetails.map(item => {
              array.push(item)
              return null
            })
            let uniqueArary = _.uniqBy(array, v => JSON.stringify([v.PartNumber, v.AssemblyPartNumber]))
            sessionStorage.setItem('costingArray', JSON.stringify(uniqueArary))
          }
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
    setIsOpenBOPDrawer(true)
  }

  const labourHandlingDrawer = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
    setIsOpenLabourDrawer(true)
  }

  const handleBOPCalculationAndClose = (e = '') => {
    setIsOpenBOPDrawer(false)
  }

  const closeLabourDrawer = (type, data = labourTableData) => {

    setIsOpenLabourDrawer(false)
    if (type === 'save') {
      setCallSaveAssemblyApi(true)
      let sum = data.reduce((acc, obj) => Number(acc) + Number(obj.LabourCost), 0);

      let obj = {}
      obj.CostingId = item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000"
      obj.LoggedInUserId = loggedInUserId()
      obj.IndirectLaborCost = data.length > 0 ? data[0].indirectLabourCost : 0
      obj.StaffCost = data.length > 0 ? data[0].staffCost : 0
      obj.StaffCostPercentage = data.length > 0 ? data[0].staffCostPercent : 0
      obj.IndirectLaborCostPercentage = data.length > 0 ? data[0].indirectLabourCostPercent : 0
      obj.NetLabourCost = Math.round(sum * 10) / 10
      obj.CostingLabourDetailList = data
      obj.NetLabourCRMHead = data.length > 0 ? data[0].NetLabourCRMHead : 0
      obj.IndirectLabourCRMHead = data.length > 0 ? data[0].IndirectLabourCRMHead : 0
      obj.StaffCRMHead = data.length > 0 ? data[0].StaffCRMHead : 0
      props.setAssemblyLabourCost(obj)
      setTotalLabourCost(Number(obj.NetLabourCost) + Number(obj.IndirectLaborCost) + Number(obj.StaffCost))
      let temp = []
      RMCCTabData && RMCCTabData.map((item, index) => {
        if (index === 0) {
          item.CostingPartDetails.totalLabourCost = Number(obj.NetLabourCost) + Number(obj.IndirectLaborCost) + Number(obj.StaffCost)
          let objNew = { ...item, ...obj }
          temp.push(objNew)
        } else {
          temp.push(item)
        }
      })

      dispatch(saveCostingLabourDetails(obj, (res) => {
        if (res) {
          Toaster.success('Labour details saved successfully.')
        }
      }))


    }
  }

  useEffect(() => {
    if (RMCCTabData && SurfaceTabData && callSaveAssemblyApi) {
      const tabData = RMCCTabData[0]
      tabData.AddLabourCost = true
      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData

      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, true, '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      setCallSaveAssemblyApi(false)
    }

  }, [RMCCTabData])


  const nestedPartComponent = children && children.map(el => {
    if (el.PartType === 'Part') {
      return <PartCompoment
        index={index}
        item={el}
        rmData={el?.CostingPartDetails?.CostingRawMaterialsCost}
        bopData={el?.CostingPartDetails !== null && el?.CostingPartDetails?.CostingBoughtOutPartCost}
        ccData={el?.CostingPartDetails !== null && el?.CostingPartDetails?.CostingConversionCost}
        setPartDetails={props.setPartDetails}
        setRMCost={props.setRMCost}
        setBOPCost={props.setBOPCost}
        setBOPHandlingCost={props.setBOPHandlingCost}
        setConversionCost={props.setConversionCost}
        setToolCost={props.setToolCost}
        subAssembId={item.CostingId}
      />
    }
    return null
  })

  useEffect(() => {
    let final = _.map(item && item?.CostingChildPartDetails, 'PartType')
    setIsBOPExists(final.includes('BOP'))
  }, [item])

  useEffect(() => {
    dispatch(getCostingLabourDetails(item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000", (res) => {

      setLabourTableData((res?.data?.Data?.CostingLabourDetailList) ? (res?.data?.Data?.CostingLabourDetailList) : [])
      setLabourObj(res?.data?.Data)
    }))

  }, [])

  /**
  * @method ProcessDrawerToggle
  * @description TOGGLE DRAWER
  */
  const ProcessDrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
    setIsProcessDrawerOpen(true)
  }

  /**
    * @method closeProcessDrawer
    * @description HIDE RM DRAWER
    */
  const closeProcessDrawer = (e = '', rowData = {}) => {
    setIsProcessDrawerOpen(false)
  }

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
        <div style={{ display: 'contents' }} >
          <td className='part-overflow' onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
            <span title={item && `Part Number: ${item.PartNumber}\nPart Name: ${item.PartName} \nRevision Number: ${item.RevisionNumber ?? '-'}`}
              className={`part-name ${item && item.PartType !== "Sub Assembly" && item.PartType !== "Assembly" && "L1"}`}>
              <div className={`${item?.CostingPartDetails?.IsOpen ? 'Open' : 'Close'}`}></div>{item && item.PartNumber}
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>
            {item?.CostingPartDetails?.TotalConversionCostWithQuantity ? checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalConversionCostWithQuantity), initialConfiguration?.NoOfDecimalForPrice) : 0}
            {
              (item?.CostingPartDetails?.TotalOperationCostPerAssembly || item?.CostingPartDetails?.TotalOperationCostSubAssembly || item?.CostingPartDetails?.TotalOperationCostComponent) ?
                <div class="tooltip-n ml-2 assembly-tooltip"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Conversion Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration?.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Sub Assembly's Conversion Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly, initialConfiguration?.NoOfDecimalForPrice)}`}
                    <br></br>
                    {/* {`Child Parts Conversion Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalConversionCost - item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration?.NoOfDecimalForPrice)}`} */}
                    {`Child Parts Conversion Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostComponent, initialConfiguration?.NoOfDecimalForPrice)}`}
                  </span >
                </div > : ''
            }
          </td >
          <td>{(item?.PartType === 'Assembly') ? 1 : (item?.CostingPartDetails?.Quantity ? checkForNull(item?.CostingPartDetails?.Quantity) : 1)}</td>
          {/* <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td> */}
          <td>{'-'}</td>
          {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>} */}
          {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>} */}
          <td>{(item?.PartType === 'Assembly' && (costingApprovalStatus === 'ApprovedByAssembly' || costingApprovalStatus === 'ApprovedByASMSimulation'))
            ? checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost), initialConfiguration?.NoOfDecimalForPrice) :
            checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity), initialConfiguration?.NoOfDecimalForPrice)}</td>

        </div >
        {/* 
        {
          costData.IsAssemblyPart && <td>
            {
            }
          </td>
        } */}
        < td width={"0"} >
          <div className='d-flex justify-content-end align-items-center'>
            <div className='d-flex'>
              {(initialConfiguration?.IsShowCostingLabour) && ((item.PartType === ASSEMBLYNAME) || (costData.CostingTypeId === WACTypeId)) && <><button
                type="button"
                className={'user-btn add-oprn-btn mr-1'}
                onClick={labourHandlingDrawer}>
                <div className={`${(CostingViewMode || IsLocked) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`LABOUR`}</button >
              </>}
              {
                isBOPExists && item?.CostingPartDetails?.IsOpen && <><button
                  type="button"
                  id='Add_BOP_Handling_Charge'
                  className={'user-btn add-oprn-btn mr-1'}
                  onClick={bopHandlingDrawer}>
                  <div className={`${(item?.CostingPartDetails?.IsApplyBOPHandlingCharges || CostingViewMode || IsLocked) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`${showBopLabel()} H`}</button>
                </>
              }
              {
                checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly) !== 0 ?
                  <button
                    id="assembly_addOperation"
                    type="button"
                    className={'user-btn add-oprn-btn'}
                    onClick={DrawerToggle}>
                    <div className={'fa fa-eye pr-1'}></div>OPER</button>
                  :
                  <button
                    type="button"
                    id="assembly_addOperation"
                    className={'user-btn add-oprn-btn'}
                    onClick={DrawerToggle}>
                    <div className={`${(CostingViewMode || IsLocked) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{'OPER'}</button>
              }
              {/* <button
                type="button"
                className={'user-btn '}
                onClick={ProcessDrawerToggle}
                title={'Add Process'}
              >
                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`PROC`}
              </button> */}
            </div >
            {/*WHEN COSTING OF THAT PART IS  APPROVED SO COSTING COMES AUTOMATICALLY FROM BACKEND AND THIS KEY WILL COME TRUE (WORK LIKE VIEW MODE)*/}
            < div /*  id="lock_icon" */ className={`${(item.IsLocked || item.IsPartLocked) ? 'lock_icon ml-3 tooltip-n' : ''}`}> {(item.IsLocked || item.IsPartLocked) && <span class="tooltiptext">{`${item.IsLocked ? "Child assemblies costing are coming from individual costing, please edit there if want to change costing" : "This sub-assembly is already present at multiple level in this BOM. Please go to the lowest level to enter the data."}`}</span>}</div >
          </div >
        </td >

        {/* <td className="text-right"></td> */}
      </tr >
      {item?.CostingPartDetails?.IsOpen && nestedPartComponent
      }
      {item?.CostingPartDetails?.IsOpen && nestedBOP}
      {item?.CostingPartDetails?.IsOpen && nestedAssembly}

      {
        IsDrawerOpen && <AddAssemblyOperation
          isOpen={IsDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
          item={item}
          CostingViewMode={CostingViewMode}
          setAssemblyOperationCost={props.setAssemblyOperationCost}
          setAssemblyToolCost={props.setAssemblyToolCost}
        />
      }
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
          isAssemblyTechnology={false}
        />
      }

      {
        isOpenLabourDrawer && <AddLabourCost
          isOpen={isOpenLabourDrawer}
          tableData={labourTableData}
          labourObj={labourObj}
          item={item}
          closeDrawer={closeLabourDrawer}
          anchor={'right'}
        />
      }
      {
        isProcessDrawerOpen && (
          <AddAssemblyProcess
            isOpen={isProcessDrawerOpen}
            closeDrawer={closeProcessDrawer}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
            // ccData={subAssemblyTechnologyArray[0]?.CostingPartDetails !== null && subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse}
            item={item}
            isAssemblyTechnology={true}
          />
        )
      }
    </ >
  );
}

export default AssemblyPart;