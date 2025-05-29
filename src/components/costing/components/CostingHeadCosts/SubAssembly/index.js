import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext, IsNFRContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';
import { getCostingBopAndBopHandlingDetails, getCostingLabourDetails, getRMCCTabData, openCloseStatus, saveAssemblyBOPHandlingCharge, saveAssemblyPartRowCostingCalculation, saveCostingLabourDetails, setIsBreakupBoughtOutPartCostingFromAPI, setRMCCData, setBopRemark } from '../../../actions/Costing';
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
import ViewBOP from '../../Drawers/ViewBOP';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { useForm } from 'react-hook-form';
import { REMARKMAXLENGTH } from '../../../../../config/masterData';

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
  const [itemInState, setItemInState] = useState({})
  const [viewBopDrawer, setViewBopDrawer] = useState(false)
  const [counter, setCounter] = useState(0)
  const [bopAndBopHandlingDetails, setBopAndBopHandlingDetails] = useState([])
  const [singleBopRemark, setSingleBopRemark] = useState(false)
  const [remarkAccept, setRemarkAccept] = useState(false);
  const [remark, setRemark] = useState("");

  const [activeRemark, setActiveRemark] = useState(null)
  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  });
  const { partNumberAssembly } = useSelector(state => state.costing)
  const costingApprovalStatus = useContext(CostingStatusContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext)
  const costData = useContext(costingInfoContext);
  const isPartType = useContext(IsPartType);

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const netPOPrice = useContext(NetPOPriceContext);
  const { DiscountCostData, CostingEffectiveDate, bomLevel, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, getAssemBOPCharge, openAllTabs, currencySource, exchangeRateData, remark: reduxRemark, bopCostingId: reduxBopCostingId } = useSelector(state => state.costing)
  const isNFR = useContext(IsNFR);
  const dispatch = useDispatch()
  const toggle = (BOMLevel, PartNumber, AssemblyPartNumber) => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    dispatch(openCloseStatus({ bopHandling: isBOPExists && !IsOpen, }))
    if (isNFR && !openAllTabs && false) {
      Toaster.warning("All Raw Material's price has not added in the Raw Material master against this vendor and plant.")
      return false;
    }
    if ((partNumberAssembly !== '' && partNumberAssembly !== PartNumber) ||
      (partNumberAssembly !== '' && partNumberAssembly === PartNumber && bomLevel !== BOMLevel)) {
      Toaster.warning('Close Accordian first.')
      return false
    }

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item?.CostingId !== null ? item?.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item?.PartId,
        AssemCostingId: item?.AssemblyCostingId,
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

          if (/* obj?.length === 0 && */ PartNumber === costData?.PartNumber && counter === 0) {
            array = [Data]
            Data.CostingChildPartDetails && Data.CostingChildPartDetails.map(item => {
              array.push(item)
              return null
            })
            setCounter(counter + 1)
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
          props.toggleAssembly(BOMLevel, PartNumber, Data, AssemblyPartNumber)

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
  const DrawerToggle = (tempItem) => {
    setItemInState({ PartNumber: tempItem?.PartNumber, AssemblyPartNumber: tempItem?.AssemblyPartNumber, BOMLevel: tempItem?.BOMLevel })
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    setDrawerOpen(true)
    if (!item?.CostingPartDetails?.IsOpen) {
      toggle(item.BOMLevel, item.PartNumber, item?.AssemblyPartNumber)
    }
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    setIsOpenBOPDrawer(true)
  }

  const labourHandlingDrawer = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
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
      obj.NetLabourCost = checkForDecimalAndNull(sum, initialConfiguration?.NoOfDecimalForPrice)
      obj.CostingLabourDetailList = data
      obj.NetLabourCRMHead = data.length > 0 ? data[0].NetLabourCRMHead : 0
      obj.IndirectLabourCRMHead = data.length > 0 ? data[0].IndirectLabourCRMHead : 0
      obj.StaffCRMHead = data.length > 0 ? data[0].StaffCRMHead : 0
      props.setAssemblyLabourCost(obj)
      setTotalLabourCost(checkForDecimalAndNull(obj?.NetLabourCost) + checkForDecimalAndNull(obj?.IndirectLaborCost) + checkForDecimalAndNull(obj?.StaffCost))
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
      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, true, '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost, reduxRemark, reduxBopCostingId
      )
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => {
        dispatch(setBopRemark('', ''));
      }));

      setCallSaveAssemblyApi(false)
    }
  }, [RMCCTabData, callSaveAssemblyApi])

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
  const ProcessDrawerToggle = (tempItem) => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    setItemInState({ PartNumber: tempItem?.PartNumber, AssemblyPartNumber: tempItem?.AssemblyPartNumber, BOMLevel: tempItem?.BOMLevel })
    setIsProcessDrawerOpen(true)
    if (!item?.CostingPartDetails?.IsOpen) {
      toggle(item.BOMLevel, item.PartNumber, item?.AssemblyPartNumber)
    }
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
      setAssemblyOperationCost={props.setAssemblyOperationCost}
      subAssembId={item.CostingId}
      setBOPCostWithAsssembly={props.setBOPCostWithAsssembly}
      setAssemblyProcessCost={props.setAssemblyProcessCost}
    />
  })
  const popupInputData = (data) => {
    setRemark(data);
  };

  /**
    * @method openRemarkPopup
    * @description Open the remark popup for a specific BOP item and get remark from session storage
    */
  const openRemarkPopup = (bopItem) => {
    // Reset states to prevent data leakage between different BOPs
    setRemark("");
    setRemarkAccept(false);
    setActiveRemark(null);
    const costingArray = JSON.parse(sessionStorage.getItem('costingArray')) || [];
    const bopObject = costingArray.find(item => item?.AssemblyPartNumber === bopItem?.AssemblyPartNumber && item?.PartNumber === bopItem?.PartNumber && item?.PartType === 'BOP');
    const bopCostingId = bopItem?.CostingId || "00000000-0000-0000-0000-000000000000";
    // Store both part number and assembly part number to identify this BOP uniquely
    setActiveRemark({ partNumber: bopItem?.PartNumber, assemblyPartNumber: bopItem?.AssemblyPartNumber });
    const storedRemark = bopObject?.Remark || '';
    setRemark(storedRemark);

    // Open the popup
    setRemarkAccept(true);
  }

  /**
   * @method closePopUp
   * @description Close the remark popup
   */
  const closePopUp = () => {
    setRemarkAccept(false);
    setActiveRemark(null);
    setRemark("");
  }

  /**
   * @method handleRemarkPopupConfirm
   * @description Handle remark popup confirm and save remark to session storage
   */
  const handleRemarkPopupConfirm = () => {
    if (!activeRemark || !activeRemark?.partNumber || !activeRemark?.assemblyPartNumber) {
      closePopUp();
      return;
    }
    // Find the BOP item that matches the activeRemark part number and assembly part number
    const bopItem = children?.find(child => child?.PartType === 'BOP' && child?.PartNumber === activeRemark?.partNumber && child.AssemblyPartNumber === activeRemark.assemblyPartNumber);
    if (bopItem) {
      const costingArray = JSON.parse(sessionStorage.getItem('costingArray')) || [];
      const bopIndex = costingArray.findIndex(item =>
        item.AssemblyPartNumber === activeRemark?.assemblyPartNumber && item?.PartNumber === activeRemark?.partNumber && item.PartType === 'BOP');

      if (bopIndex !== -1) {
        // Update the remark directly on the BOP object
        costingArray[bopIndex].Remark = remark;
        sessionStorage.setItem('costingArray', JSON.stringify(costingArray));
        const bopCostingId = bopItem?.CostingId || "00000000-0000-0000-0000-000000000000";

        // Save remark and costingId to Redux state for API call
        dispatch(setBopRemark(remark, bopCostingId));

        // Update the remark in RMCCTabData as well
        if (RMCCTabData && RMCCTabData.length > 0) {
          const updatedRMCCTabData = JSON.parse(JSON.stringify(RMCCTabData));

          // Search through all items in RMCCTabData to find matching BOP
          updatedRMCCTabData.forEach(rmccItem => {
            if (rmccItem?.CostingChildPartDetails && rmccItem?.CostingChildPartDetails?.length > 0) {
              // Find the BOP within CostingChildPartDetails that matches the PartNumber and AssemblyPartNumber
              const childBopIndex = rmccItem?.CostingChildPartDetails?.findIndex(
                childPart => childPart?.PartType === 'BOP' &&
                  childPart?.PartNumber === activeRemark?.partNumber &&
                  childPart?.AssemblyPartNumber === activeRemark?.assemblyPartNumber
              );

              if (childBopIndex !== -1) {
                // Update the remark for the matching BOP
                rmccItem.CostingChildPartDetails[childBopIndex].Remark = remark;
              }
            }
          });

          // Dispatch updated RMCCTabData to the Redux store
          dispatch(setRMCCData(updatedRMCCTabData, () => { }));
        }

        setCallSaveAssemblyApi(true);
        Toaster.success('Remark saved successfully');
      }
    }

    // Close the popup
    closePopUp();
  }

  const nestedBOP = children && children.map((el, idx) => {
    if (el.PartType !== 'BOP') return false;

    // Check if this is the active BOP for remarks
    const isActive = remarkAccept && activeRemark?.partNumber === el?.PartNumber && activeRemark?.assemblyPartNumber === el?.AssemblyPartNumber;

    // Create the remark button that will be passed to the BoughtOutPart component
    const remarkButton = isActive && (
      <PopupMsgWrapper
        setInputData={popupInputData}
        isOpen={remarkAccept}
        closePopUp={closePopUp}
        confirmPopup={handleRemarkPopupConfirm}
        header={"Remark"}
        isInputField={true}
        isDisabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
        defaultValue={remark}
        maxLength={REMARKMAXLENGTH}
      />
    );

    // Get the remark specific to this BOP item from session storage
    const costingArray = JSON.parse(sessionStorage.getItem('costingArray')) || [];
    const bopObject = costingArray.find(item => item.AssemblyPartNumber === el?.AssemblyPartNumber && item?.PartNumber === el?.PartNumber && item?.PartType === 'BOP');

    const specificRemark = bopObject?.Remark || el?.Remark || '';

    return <BoughtOutPart
      key={`bop-${idx}`}
      index={idx}
      item={el}
      children={el.CostingChildPartDetails}
      remarkButton={remarkButton}
      onRemarkButtonClick={() => openRemarkPopup(el)}
      remark={isActive ? remark : specificRemark}
    />
  })

  let IsLocked = ''
  if (item?.PartType === 'Sub Assembly') {
    IsLocked = (item.IsLocked ? item.IsLocked : false)
  }
  else {
    IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  }

  const handleViewBopClick = () => {
    if (item.PartType !== 'Assembly' || item.BOMLevel !== 'L0') {
      return;
    }

    const apiParams = {
      costingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
      subAssemblyCostingId: item.SubAssemblyCostingId ? item.SubAssemblyCostingId : (item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000"),
      assemblyCostingId: item.AssemblyCostingId !== null ? item.AssemblyCostingId : "00000000-0000-0000-0000-000000000000",
      loggedInUserId: loggedInUserId()
    };

    dispatch(getCostingBopAndBopHandlingDetails(apiParams, (res) => {
      if (res?.data?.Data) {
        // Separate assembly and child parts BOP handling charges
        const assemblyBOPHandling = res?.data?.Data?.CostingBoughtOutPartHandlingCharge?.find(item => !item?.IsChildPart) || {};
        const childPartsBOPHandling = res?.data?.Data?.CostingBoughtOutPartHandlingCharge?.filter(item => item?.IsChildPart) || [];

        // Process the data to match the expected format for ViewBOP component
        const processedData = {
          BOPData: res?.data?.Data?.CostingBoughtOutPartCost || [],

          // Assembly BOP handling charges
          bopPHandlingCharges: assemblyBOPHandling?.BOPHandlingCharges || 0,
          bopHandlingPercentage: assemblyBOPHandling?.BOPHandlingPercentage || 0,
          bopHandlingChargeType: assemblyBOPHandling?.BOPHandlingChargeType || '',

          // Child parts BOP handling charges
          childPartBOPHandlingCharges: childPartsBOPHandling,
          IsAssemblyCosting: true,
        };
        setBopAndBopHandlingDetails(processedData);
        setViewBopDrawer(true);
      }
    }))
  }



  /**
   * @method onRemarkPopUpClose
   * @description Handle remark popup close
   */
  const onRemarkPopUpClose = (index, bopItem) => {
    // Close the popup
    const popupElement = document.getElementById(`bop_popUpTrigger_${index}`);
    if (popupElement) {
      popupElement.click();
    }

    // Reset errors
    if (errors && errors[`bop_remark_${index}`]) {
      setSingleBopRemark(false);
    }
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (

    <>

      <tr className="costing-highlight-row accordian-row" key={item?.PartId}>
        <div style={{ display: 'contents' }} >
          <td className='part-overflow' onClick={() => toggle(item.BOMLevel, item.PartNumber, item?.AssemblyPartNumber)}>
            <span title={item && `Part Number: ${item.PartNumber}\nPart Name: ${item.PartName} \nRevision Number: ${item.RevisionNumber ?? '-'}`}
              className={`part-name ${item && item.PartType !== "Sub Assembly" && item.PartType !== "Assembly" && "L1"}`}>
              <div className={`${item?.CostingPartDetails?.IsOpen ? 'Open' : 'Close'}`}></div>{item && item.PartNumber}
            </span>
          </td>
          <td>{item && item?.BOMLevel}</td>
          <td>{item && item?.PartType}</td>
          <td>{item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>
            {item?.PartType === 'Assembly' && item?.BOMLevel === 'L0' ? (
              <span className='link' onClick={handleViewBopClick} title={`View ${showBopLabel()} Cost`}>
                {item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}
              </span>
            ) : (
              <span>
                {item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}
              </span>
            )}
          </td>
          <td>
            {item?.CostingPartDetails?.TotalConversionCostWithQuantity ? checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalConversionCostWithQuantity), initialConfiguration.NoOfDecimalForPrice) : 0}
            {(item?.CostingPartDetails?.TotalOperationCostPerAssembly || item?.CostingPartDetails?.TotalProcessCostPerAssembly ||
              item?.CostingPartDetails?.TotalOperationCostSubAssembly || item?.CostingPartDetails?.TotalProcessCostSubAssembly ||
              item?.CostingPartDetails?.TotalOperationCostComponent || item?.CostingPartDetails?.TotalProcessCostComponent || item?.CostingPartDetails?.TotalWeldingCostComponent ||
              item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly || item?.CostingPartDetails?.TotalOtherOperationCostComponent) ?
              <div class="tooltip-n ml-2 assembly-tooltip"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                <span class="tooltiptext">
                  {`Total Labour Cost:- ${checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.NetLabourCost) + checkForNull(item?.CostingPartDetails?.StaffCost) + checkForNull(item?.CostingPartDetails?.IndirectLaborCost), initialConfiguration.NoOfDecimalForPrice)}`}
                  <br></br>
                  {`Assembly's Conversion Cost:- ${checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly), initialConfiguration.NoOfDecimalForPrice)}`}
                  <br></br>
                  {`Sub Assembly's Conversion Cost:- ${checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly), initialConfiguration.NoOfDecimalForPrice)}`}
                  <br></br>
                  {/* {`Child Parts Conversion Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.NetConversionCost - item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice)}`} */}
                  {`Child Parts Conversion Cost:- ${checkForDecimalAndNull((checkForNull(item?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(item?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent)), initialConfiguration.NoOfDecimalForPrice)}`}
                </span >
              </div > : ''
            }
          </td >
          <td>{(item?.PartType === 'Assembly') ? 1 : (item?.CostingPartDetails?.Quantity ? checkForNull(item?.CostingPartDetails?.Quantity) : 1)}</td>
          {/* <td>{item?.CostingPartDetails?.NetTotalRMBOPCC ? checkForDecimalAndNull(item?.CostingPartDetails?.NetTotalRMBOPCC, initialConfiguration.NoOfDecimalForPrice) : 0}</td> */}
          <td>{'-'}</td>
          {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>} */}
          {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>} */}
          <td>{(item?.PartType === 'Assembly' && (costingApprovalStatus === 'ApprovedByAssembly' || costingApprovalStatus === 'ApprovedByASMSimulation'))
            ? checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.NetTotalRMBOPCC), initialConfiguration.NoOfDecimalForPrice) :
            checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity), initialConfiguration.NoOfDecimalForPrice)}</td>

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
                <div className={`${(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`LABOUR`}</button >
              </>}
              {
                isBOPExists && item?.CostingPartDetails?.IsOpen && <><button
                  type="button"
                  id='Add_BOP_Handling_Charge'
                  className={'user-btn add-oprn-btn mr-1'}
                  onClick={bopHandlingDrawer}>
                  <div className={`${(item?.CostingPartDetails?.IsApplyBOPHandlingCharges || CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`${showBopLabel()} H`}</button>
                </>
              }
              {
                checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly) !== 0 ?
                  <button
                    id="assembly_addOperation"
                    type="button"
                    className={'user-btn add-oprn-btn mr-1'}
                    onClick={() => DrawerToggle(item)}>
                    <div className={'fa fa-eye pr-1'}></div>OPER</button>
                  :
                  <button
                    type="button"
                    id="assembly_addOperation"
                    className={'user-btn add-oprn-btn mr-1'}
                    onClick={() => DrawerToggle(item)}>
                    <div className={`${(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{'OPER'}</button>
              }
              <button
                type="button"
                className={'user-btn mr-1'}
                onClick={() => ProcessDrawerToggle(item)}
                title={'Add Process'}
              >
                <div className={`${(CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ || checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly) !== 0) ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`PROC`}
              </button>
            </div >
            {/*WHEN COSTING OF THAT PART IS  APPROVED SO COSTING COMES AUTOMATICALLY FROM BACKEND AND THIS KEY WILL COME TRUE (WORK LIKE VIEW MODE)*/}
            {/* 26/03/2024 REMOVED IsPartLocked KEY AS DISCUSS WITH TR SAME SUBASSEMBLY CAN HAVE DIFFERENT OPERATION/PROCESS AT MULTIPLE LEVEL OF BOM */}
            < div /*  id="lock_icon" */ className={`${(item.IsLocked) ? 'lock_icon ml-3 tooltip-n' : ''}`}> {(item.IsLocked) && <span class="tooltiptext">{`Child assemblies costing are coming from individual costing, please edit there if want to change costing`}</span>}</div >
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
          CostingViewMode={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
          setAssemblyOperationCost={props.setAssemblyOperationCost}
          itemInState={itemInState}
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
            isAssemblyTechnology={false}
            setAssemblyProcessCost={props?.setAssemblyProcessCost}
            itemInState={itemInState}
          />
        )
      }
      {
        viewBopDrawer && <ViewBOP
          isOpen={viewBopDrawer}
          viewBOPData={bopAndBopHandlingDetails}
          closeDrawer={() => setViewBopDrawer(false)}
          anchor={'right'}
        />
      }
    </ >
  );
}

export default AssemblyPart;
